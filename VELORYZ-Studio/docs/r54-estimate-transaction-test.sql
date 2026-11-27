begin;
set local statement_timeout='15s';
create temp table studio_creator_submissions(request_id text primary key,reference text,created_at timestamptz default now(),brief jsonb,quote jsonb);
create temp table studio_client_identities(id uuid primary key,client_code text,name_at_registration text,email_at_registration text);
create temp table studio_pending_workspaces(id uuid primary key,request_id text,client_id uuid,project_code text);
create temp table pg_temp.studio_estimate_documents (
 id uuid primary key default gen_random_uuid(),
 document_code text generated always as ('VZ-EST-'||upper(replace(id::text,'-',''))) stored unique,
 workspace_id uuid not null unique references pg_temp.studio_pending_workspaces(id) on delete restrict,
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 renderer_version text not null default 'r54-estimate-v1' check(renderer_version='r54-estimate-v1'),
 created_at timestamptz not null default now()
);

create function pg_temp.veloryz_estimate_prepare_v1(p_workspace uuid)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare d pg_temp.studio_estimate_documents%rowtype; s jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended('vz-estimate-v1:'||p_workspace::text,0));
 select * into d from pg_temp.studio_estimate_documents where workspace_id=p_workspace;
 if found then return jsonb_build_object('result','ready','document',to_jsonb(d));end if;
 select jsonb_build_object('reference',r.reference,'registered_at',r.created_at,'client_code',i.client_code,'project_code',w.project_code,
 'contact',jsonb_build_object('name',i.name_at_registration,'email',i.email_at_registration,'company',r.brief->'contact'->>'company'),
 'project',jsonb_build_object('category',r.brief->'brief'->>'category','goal',r.brief->'brief'->>'goal','pages',r.brief->'brief'->'pages','timeline',r.brief->'brief'->>'timeline'),
 'quote',r.quote)
 into s
 from pg_temp.studio_pending_workspaces w join pg_temp.studio_client_identities i on i.id=w.client_id
 join pg_temp.studio_creator_submissions r on r.request_id=w.request_id
 where w.id=p_workspace;
 if s is null then return jsonb_build_object('result','not-found');end if;
 if s->'quote'->>'currency' is distinct from 'INR' or s->'quote'->>'kind' is distinct from 'indicative-estimate'
 or s->'quote'->>'amountDuePaise' is distinct from '0' or jsonb_typeof(s->'quote'->'lines') is distinct from 'array'
 then return jsonb_build_object('result','invalid');end if;
 insert into pg_temp.studio_estimate_documents(workspace_id,snapshot) values(p_workspace,s) returning * into d;
 return jsonb_build_object('result','ready','document',to_jsonb(d));
end;$$;

create function pg_temp.prepare_estimate_document_v1()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare r jsonb;
begin
 r:=pg_temp.veloryz_estimate_prepare_v1(new.id);
 if r->>'result' is distinct from 'ready' then raise exception 'Estimate document preparation failed' using errcode='23514';end if;
 return new;
end;$$;

create trigger test_estimate after insert on pg_temp.studio_pending_workspaces for each row execute function pg_temp.prepare_estimate_document_v1();
do $t$ declare c uuid:=gen_random_uuid();w uuid:=gen_random_uuid();r jsonb; first_code text;begin
 insert into pg_temp.studio_client_identities values(c,'VZ-CL-TEST','Sample','sample@example.test');
 insert into pg_temp.studio_creator_submissions(request_id,reference,brief,quote) values('test1','VZ-SUB-TEST','{"brief":{"category":"Business","goal":"Example project","pages":4},"contact":{"company":"Example"}}','{"currency":"INR","kind":"indicative-estimate","amountDuePaise":0,"lowPaise":10000,"highPaise":15000,"lines":[{"label":"Base","amountPaise":10000}]}');
 insert into pg_temp.studio_pending_workspaces values(w,'test1',c,'VZ-PR-TEST');
 r:=pg_temp.veloryz_estimate_prepare_v1(w);if r->>'result'<>'ready' then raise exception 'prepare';end if;
 first_code:=r->'document'->>'document_code';
 update pg_temp.studio_creator_submissions set quote=quote||'{"lowPaise":99999}' where request_id='test1';
 r:=pg_temp.veloryz_estimate_prepare_v1(w);
 if r->'document'->>'document_code'<>first_code or r->'document'->'snapshot'->'quote'->>'lowPaise'<>'10000' then raise exception 'snapshot changed';end if;
 if (select count(*) from pg_temp.studio_estimate_documents)<>1 then raise exception 'duplicate';end if;
 r:=pg_temp.veloryz_estimate_prepare_v1(gen_random_uuid());if r->>'result'<>'not-found' then raise exception 'unknown workspace';end if;
 insert into pg_temp.studio_creator_submissions(request_id,reference,brief,quote) values('test2','VZ-SUB-BAD','{}','{"currency":"USD"}');
 begin
 insert into pg_temp.studio_pending_workspaces values(gen_random_uuid(),'test2',c,'BAD');
 raise exception 'expected failure';
 exception when check_violation then null;end;
 if exists(select 1 from pg_temp.studio_pending_workspaces where request_id='test2') then raise exception 'partial workspace';end if;
end;$t$;
select 'passed' as synthetic_estimate_transaction;
rollback;