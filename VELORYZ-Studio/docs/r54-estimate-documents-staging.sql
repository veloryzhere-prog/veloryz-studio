-- R52.4.1: immutable estimate document records, NOT tax invoices. Apply after R52.3 in staging.
begin;
create table veloryz_studio.studio_estimate_documents (
 id uuid primary key default gen_random_uuid(),
 document_code text generated always as ('VZ-EST-'||upper(replace(id::text,'-',''))) stored unique,
 workspace_id uuid not null unique references veloryz_studio.studio_pending_workspaces(id) on delete restrict,
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 renderer_version text not null default 'r54-estimate-v1' check(renderer_version='r54-estimate-v1'),
 created_at timestamptz not null default now()
);
alter table veloryz_studio.studio_estimate_documents enable row level security;
revoke all on table veloryz_studio.studio_estimate_documents from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_estimate_documents to service_role;
-- Idempotent preparation using only trusted stored registration data.
create function public.veloryz_estimate_prepare_v1(p_workspace uuid)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare d veloryz_studio.studio_estimate_documents%rowtype; s jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended('vz-estimate-v1:'||p_workspace::text,0));
 select * into d from veloryz_studio.studio_estimate_documents where workspace_id=p_workspace;
 if found then return jsonb_build_object('result','ready','document',to_jsonb(d));end if;
 select jsonb_build_object('reference',r.reference,'registered_at',r.created_at,'client_code',i.client_code,'project_code',w.project_code,
 'contact',jsonb_build_object('name',i.name_at_registration,'email',i.email_at_registration,'company',r.brief->'contact'->>'company'),
 'project',jsonb_build_object('category',r.brief->'brief'->>'category','goal',r.brief->'brief'->>'goal','pages',r.brief->'brief'->'pages','timeline',r.brief->'brief'->>'timeline'),
 'quote',r.quote)
 into s
 from veloryz_studio.studio_pending_workspaces w join veloryz_studio.studio_client_identities i on i.id=w.client_id
 join veloryz_studio.studio_creator_submissions r on r.request_id=w.request_id
 where w.id=p_workspace;
 if s is null then return jsonb_build_object('result','not-found');end if;
 if s->'quote'->>'currency' is distinct from 'INR' or s->'quote'->>'kind' is distinct from 'indicative-estimate'
 or s->'quote'->>'amountDuePaise' is distinct from '0' or jsonb_typeof(s->'quote'->'lines') is distinct from 'array'
 then return jsonb_build_object('result','invalid');end if;
 insert into veloryz_studio.studio_estimate_documents(workspace_id,snapshot) values(p_workspace,s) returning * into d;
 return jsonb_build_object('result','ready','document',to_jsonb(d));
end;$$;
revoke all on function public.veloryz_estimate_prepare_v1(uuid) from public,anon,authenticated;
grant execute on function public.veloryz_estimate_prepare_v1(uuid) to service_role;
-- Prepare the document record in the same transaction as newly registered onboarding workspaces.
create function veloryz_studio.prepare_estimate_document_v1()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare r jsonb;
begin
 r:=public.veloryz_estimate_prepare_v1(new.id);
 if r->>'result' is distinct from 'ready' then raise exception 'Estimate document preparation failed' using errcode='23514';end if;
 return new;
end;$$;
revoke all on function veloryz_studio.prepare_estimate_document_v1() from public,anon,authenticated;
grant execute on function veloryz_studio.prepare_estimate_document_v1() to service_role;
create trigger studio_workspace_prepare_estimate_v1 after insert on veloryz_studio.studio_pending_workspaces for each row execute function veloryz_studio.prepare_estimate_document_v1();
commit;
