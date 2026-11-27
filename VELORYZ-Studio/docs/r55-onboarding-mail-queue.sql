-- R52.5: durable transactional onboarding mail queue.
-- Existing manual acceptance, mail and invitation workflows remain untouched.
begin;
create table veloryz_studio.studio_onboarding_mail_jobs(
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references veloryz_studio.studio_pending_workspaces(id) on delete restrict,
 kind text not null check(kind in ('verify-recipient','registration-estimate')),
 state text not null default 'pending' check(state in ('pending','sending','sent','uncertain','cancelled')),
 created_at timestamptz not null default now(),
 claimed_at timestamptz,
 finished_at timestamptz,
 provider_message_id text,
 unique(workspace_id,kind)
);
alter table veloryz_studio.studio_onboarding_mail_jobs enable row level security;
revoke all on table veloryz_studio.studio_onboarding_mail_jobs from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_onboarding_mail_jobs to service_role;
grant update(state,claimed_at,finished_at,provider_message_id) on table veloryz_studio.studio_onboarding_mail_jobs to service_role;
create index studio_onboarding_mail_pending_idx on veloryz_studio.studio_onboarding_mail_jobs(created_at,id) where state='pending';
create function veloryz_studio.queue_onboarding_verification_v1() returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
 insert into veloryz_studio.studio_onboarding_mail_jobs(workspace_id,kind) values(new.id,'verify-recipient') on conflict do nothing;
 return new;
end;$$;
create function veloryz_studio.queue_verified_estimate_v1() returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if old.identity_status='unverified' and new.identity_status='verified' then
 insert into veloryz_studio.studio_onboarding_mail_jobs(workspace_id,kind)
 select id,'registration-estimate' from veloryz_studio.studio_pending_workspaces where client_id=new.id and state='pending-review'
 on conflict do nothing;
 end if;return new;
end;$$;
revoke all on function veloryz_studio.queue_onboarding_verification_v1(),veloryz_studio.queue_verified_estimate_v1() from public,anon,authenticated;
grant execute on function veloryz_studio.queue_onboarding_verification_v1(),veloryz_studio.queue_verified_estimate_v1() to service_role;
create trigger studio_queue_verification after insert on veloryz_studio.studio_pending_workspaces for each row execute function veloryz_studio.queue_onboarding_verification_v1();
create trigger studio_queue_estimate after update of identity_status on veloryz_studio.studio_client_identities for each row execute function veloryz_studio.queue_verified_estimate_v1();
-- Claim one job with exact recipient and current status; do not automatically retry ambiguous SMTP.
create function public.veloryz_onboarding_claim_v1(p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare j veloryz_studio.studio_onboarding_mail_jobs%rowtype; i veloryz_studio.studio_client_identities%rowtype; d jsonb; issued jsonb; cid uuid;
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid');end if;
 select m.* into j from veloryz_studio.studio_onboarding_mail_jobs m
 join veloryz_studio.studio_pending_workspaces w on w.id=m.workspace_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id
 where m.state='pending' and w.state='pending-review' and e.status<>'closed'
 order by m.created_at,m.id limit 1 for update of m skip locked;
 if not found then return jsonb_build_object('result','empty');end if;
 select client_id into cid from veloryz_studio.studio_pending_workspaces where id=j.workspace_id;
 select * into i from veloryz_studio.studio_client_identities where id=cid for update;
 if j.kind='verify-recipient' then
  if i.identity_status<>'unverified' then
   update veloryz_studio.studio_onboarding_mail_jobs set state='cancelled',finished_at=clock_timestamp() where id=j.id;
   return jsonb_build_object('result','skipped');
  end if;
  issued:=public.veloryz_identity_issue_v1(cid,p_hash);
  if issued->>'result' is distinct from 'issued' then
   update veloryz_studio.studio_onboarding_mail_jobs set state='cancelled',finished_at=clock_timestamp() where id=j.id;
   return jsonb_build_object('result','skipped');
  end if;
 else
  if i.identity_status<>'verified' then return jsonb_build_object('result','blocked');end if;
  d:=public.veloryz_estimate_prepare_v1(j.workspace_id);
  if d->>'result' is distinct from 'ready' or d->'document'->'snapshot'->'contact'->>'email' is distinct from i.email_at_registration then return jsonb_build_object('result','blocked');end if;
 end if;
 update veloryz_studio.studio_onboarding_mail_jobs set state='sending',claimed_at=clock_timestamp() where id=j.id;
 return jsonb_build_object('result','claimed','id',j.id,'kind',j.kind,'recipient',i.email_at_registration,'document',d->'document');
end;$$;
create function public.veloryz_onboarding_finish_v1(p_job uuid,p_state text,p_message text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if p_state not in ('sent','uncertain') or length(coalesce(p_message,''))>180 then return jsonb_build_object('result','invalid');end if;
 update veloryz_studio.studio_onboarding_mail_jobs set state=p_state,finished_at=clock_timestamp(),provider_message_id=case when p_state='sent' then p_message else null end where id=p_job and state='sending';
 return jsonb_build_object('result',case when found then 'recorded' else 'not-found' end);
end;$$;
revoke all on function public.veloryz_onboarding_claim_v1(text),public.veloryz_onboarding_finish_v1(uuid,text,text) from public,anon,authenticated;
grant execute on function public.veloryz_onboarding_claim_v1(text),public.veloryz_onboarding_finish_v1(uuid,text,text) to service_role;
commit;
