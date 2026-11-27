-- Explicit owner request for verified non-tax billing statement delivery.
begin;
create table veloryz_studio.studio_commercial_mail_jobs(
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null unique references veloryz_studio.studio_commercial_invoices(id) on delete restrict,
 state text not null default 'pending' check(state in ('pending','sending','sent','uncertain','held')),
 created_at timestamptz not null default now(), claimed_at timestamptz, finished_at timestamptz, provider_message_id text
);
alter table veloryz_studio.studio_commercial_mail_jobs enable row level security;
revoke all on table veloryz_studio.studio_commercial_mail_jobs from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_commercial_mail_jobs to service_role;
grant update(state,claimed_at,finished_at,provider_message_id) on table veloryz_studio.studio_commercial_mail_jobs to service_role;
create function public.veloryz_commercial_mail_request_v1(p_workspace uuid)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare bid uuid;
begin
 select b.id into bid from veloryz_studio.studio_commercial_invoices b join veloryz_studio.studio_commercial_quotes q on q.id=b.quote_id
 join veloryz_studio.studio_pending_workspaces w on w.id=q.workspace_id join veloryz_studio.studio_client_identities i on i.id=w.client_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference
 where w.id=p_workspace and p.id=q.project_id and w.state='pending-review' and e.status<>'closed' and e.acceptance_status='accepted' and i.identity_status='verified' and i.verified_at is not null and p.client_email=i.email_at_registration and p.client_email=q.snapshot->>'email';
 if bid is null then return jsonb_build_object('result','ineligible');end if;
 insert into veloryz_studio.studio_commercial_mail_jobs(invoice_id) values(bid) on conflict do nothing;
 return jsonb_build_object('result','ready');
end;$$;
create function public.veloryz_commercial_mail_status_v1(p_workspace uuid)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
select jsonb_build_object('state',case when j.state='sending' and j.claimed_at<now()-interval '15 minutes' then 'stalled-review' else j.state end,'created_at',j.created_at,'finished_at',j.finished_at)
from veloryz_studio.studio_commercial_mail_jobs j join veloryz_studio.studio_commercial_invoices b on b.id=j.invoice_id join veloryz_studio.studio_commercial_quotes q on q.id=b.quote_id where q.workspace_id=p_workspace
$$;
create function public.veloryz_commercial_mail_claim_v1()
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare j record; d jsonb;
begin
 select m.id,q.workspace_id,q.project_id,q.snapshot->>'email' as recipient into j
 from veloryz_studio.studio_commercial_mail_jobs m join veloryz_studio.studio_commercial_invoices b on b.id=m.invoice_id join veloryz_studio.studio_commercial_quotes q on q.id=b.quote_id
 where m.state='pending' order by m.created_at,m.id limit 1 for update of m skip locked;
 if not found then return jsonb_build_object('result','empty');end if;
 if not exists(select 1 from veloryz_studio.studio_pending_workspaces w join veloryz_studio.studio_client_identities i on i.id=w.client_id join veloryz_studio.studio_enquiries e on e.id=w.request_id join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference where w.id=j.workspace_id and p.id=j.project_id and w.state='pending-review' and e.status<>'closed' and e.acceptance_status='accepted' and i.identity_status='verified' and i.verified_at is not null and p.client_email=i.email_at_registration and p.client_email=j.recipient) then
 update veloryz_studio.studio_commercial_mail_jobs set state='held',finished_at=clock_timestamp() where id=j.id;
 return jsonb_build_object('result','held');end if;
 d:=public.veloryz_commercial_read_v1(j.workspace_id);
 if d is null or d->'invoice' is null or d->'invoice'='null'::jsonb then return jsonb_build_object('result','blocked');end if;
 update veloryz_studio.studio_commercial_mail_jobs set state='sending',claimed_at=clock_timestamp() where id=j.id;
 return jsonb_build_object('result','claimed','id',j.id,'recipient',j.recipient,'document',d);
end;$$;
create function public.veloryz_commercial_mail_finish_v1(p_job uuid,p_state text,p_message text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if p_state is null or p_state not in ('sent','uncertain') or length(coalesce(p_message,''))>180 then return jsonb_build_object('result','invalid');end if;
 update veloryz_studio.studio_commercial_mail_jobs set state=p_state,finished_at=clock_timestamp(),provider_message_id=case when p_state='sent' then p_message else null end where id=p_job and state='sending';
 return jsonb_build_object('result',case when found then 'recorded' else 'not-found' end);
end;$$;
revoke all on function public.veloryz_commercial_mail_request_v1(uuid),public.veloryz_commercial_mail_status_v1(uuid),public.veloryz_commercial_mail_claim_v1(),public.veloryz_commercial_mail_finish_v1(uuid,text,text) from public,anon,authenticated;
grant execute on function public.veloryz_commercial_mail_request_v1(uuid),public.veloryz_commercial_mail_status_v1(uuid),public.veloryz_commercial_mail_claim_v1(),public.veloryz_commercial_mail_finish_v1(uuid,text,text) to service_role;
commit;
