-- R52.5.2: automatic access queue, compatible with existing portal code hashes.
begin;
create table veloryz_studio.studio_access_delivery_jobs(
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null unique references veloryz_studio.studio_pending_workspaces(id) on delete restrict,
 project_id text not null unique references veloryz_studio.studio_client_projects(id) on delete restrict,
 invite_id text not null unique references veloryz_studio.studio_client_invites(id) on delete restrict,
 state text not null default 'sending' check(state in ('sending','sent','uncertain')),
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 provider_message_id text
);
alter table veloryz_studio.studio_access_delivery_jobs enable row level security;
revoke all on table veloryz_studio.studio_access_delivery_jobs from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_access_delivery_jobs to service_role;
grant update(state,finished_at,provider_message_id) on table veloryz_studio.studio_access_delivery_jobs to service_role;
-- Serialize every new invitation with automatic claim, including legacy manual inserts.
create function veloryz_studio.lock_client_invitation_v1()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
 perform pg_advisory_xact_lock(hashtextextended('vz-access:'||new.project_id,0));
 -- If a manual replacement arrives after an automatic invitation, retire that code.
 -- Does not revoke existing sessions; legacy replacement manages its own session policy.
 update veloryz_studio.studio_client_invites i set revoked_at=new.created_at
 where i.project_id=new.project_id and i.revoked_at=''
 and exists(select 1 from veloryz_studio.studio_access_delivery_jobs j where j.invite_id=i.id);
 return new;
end;$$;
revoke all on function veloryz_studio.lock_client_invitation_v1() from public,anon,authenticated;
grant execute on function veloryz_studio.lock_client_invitation_v1() to service_role;
create trigger studio_lock_client_invitation_v1 before insert on veloryz_studio.studio_client_invites for each row execute function veloryz_studio.lock_client_invitation_v1();
-- Reconcile from authoritative records on each wakeup, avoiding a lost acceptance/verification trigger race.
create function public.veloryz_access_claim_v1(p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare candidate record; j uuid; inv text:=gen_random_uuid()::text; stamp text; expires text; t timestamptz:=clock_timestamp();
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid');end if;
 select w.id as wid,p.id as pid,p.client_email as email,p.title,p.client_name
 into candidate
 from veloryz_studio.studio_pending_workspaces w
 join veloryz_studio.studio_client_identities i on i.id=w.client_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id
 join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference
 where w.state='pending-review' and i.identity_status='verified' and i.verified_at is not null
 and e.acceptance_status='accepted' and e.status<>'closed' and lower(btrim(p.client_email))=i.email_at_registration and p.client_email=i.email_at_registration
 and not exists(select 1 from veloryz_studio.studio_access_delivery_jobs x where x.workspace_id=w.id or x.project_id=p.id)
 and not exists(select 1 from veloryz_studio.studio_client_invites x where x.project_id=p.id)
 and not exists(select 1 from veloryz_studio.studio_client_sessions x where x.project_id=p.id)
 order by w.created_at,w.id limit 1 for update of p skip locked;
 if not found then return jsonb_build_object('result','empty');end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-access:'||candidate.pid,0));
 if exists(select 1 from veloryz_studio.studio_client_invites where project_id=candidate.pid)
 or exists(select 1 from veloryz_studio.studio_client_sessions where project_id=candidate.pid)
 or exists(select 1 from veloryz_studio.studio_access_delivery_jobs where project_id=candidate.pid) then return jsonb_build_object('result','skipped');end if;
 stamp:=to_char(t at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 expires:=to_char((t+interval '14 days') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 insert into veloryz_studio.studio_client_invites(id,project_id,token_hash,expires_at,revoked_at,created_at)
 values(inv,candidate.pid,p_hash,expires,'',stamp);
 insert into veloryz_studio.studio_access_delivery_jobs(workspace_id,project_id,invite_id)
 values(candidate.wid,candidate.pid,inv) returning id into j;
 return jsonb_build_object('result','claimed','id',j,'recipient',candidate.email,'project',jsonb_build_object('id',candidate.pid,'title',candidate.title,'client_name',candidate.client_name,'client_email',candidate.email),'expires_at',expires);
end;$$;
create function public.veloryz_access_finish_v1(p_job uuid,p_state text,p_message text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if p_state is null or p_state not in ('sent','uncertain') or length(coalesce(p_message,''))>180 then return jsonb_build_object('result','invalid');end if;
 update veloryz_studio.studio_access_delivery_jobs set state=p_state,finished_at=clock_timestamp(),provider_message_id=case when p_state='sent' then p_message else null end where id=p_job and state='sending';
 return jsonb_build_object('result',case when found then 'recorded' else 'not-found' end);
end;$$;
-- Atomically consume invite and create existing session. For automatically issued invites,
-- recheck original verified recipient and exact accepted room at redemption.
create function public.veloryz_access_redeem_v1(p_hash text,p_session_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare v veloryz_studio.studio_client_invites%rowtype; p veloryz_studio.studio_client_projects%rowtype; stamp text; expires text;
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' or p_session_hash is null or p_session_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid');end if;
 select * into v from veloryz_studio.studio_client_invites where token_hash=p_hash;
 if not found then return jsonb_build_object('result','invalid');end if;
 select * into p from veloryz_studio.studio_client_projects where id=v.project_id for update;
 if not found then return jsonb_build_object('result','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-access:'||v.project_id,0));
 stamp:=to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 expires:=to_char((clock_timestamp()+interval '7 days') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 if exists(select 1 from veloryz_studio.studio_access_delivery_jobs where invite_id=v.id) and not exists(
 select 1 from veloryz_studio.studio_access_delivery_jobs j join veloryz_studio.studio_pending_workspaces w on w.id=j.workspace_id
 join veloryz_studio.studio_client_identities i on i.id=w.client_id join veloryz_studio.studio_enquiries e on e.id=w.request_id
 where j.invite_id=v.id and j.project_id=p.id and i.identity_status='verified' and i.email_at_registration=p.client_email
 and w.state='pending-review' and e.status<>'closed' and e.acceptance_status='accepted' and e.accepted_project_id=p.id and p.enquiry_id=e.id and p.request_reference=e.reference
 ) then return jsonb_build_object('result','invalid');end if;
 update veloryz_studio.studio_client_invites set revoked_at=stamp where id=v.id and token_hash=p_hash and revoked_at='' and expires_at>stamp;
 if not found then return jsonb_build_object('result','invalid');end if;
 insert into veloryz_studio.studio_client_sessions(id,project_id,token_hash,expires_at,revoked_at,created_at) values(gen_random_uuid()::text,v.project_id,p_session_hash,expires,'',stamp);
 return jsonb_build_object('result','activated');
end;$$;
revoke all on function public.veloryz_access_claim_v1(text),public.veloryz_access_finish_v1(uuid,text,text),public.veloryz_access_redeem_v1(text,text) from public,anon,authenticated;
grant execute on function public.veloryz_access_claim_v1(text),public.veloryz_access_finish_v1(uuid,text,text),public.veloryz_access_redeem_v1(text,text) to service_role;
commit;
