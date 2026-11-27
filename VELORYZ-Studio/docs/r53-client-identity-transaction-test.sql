begin;
set local statement_timeout='15s';
create temp table studio_creator_submissions(request_id text primary key,brief jsonb not null) on commit drop;
create temp table pg_temp.studio_client_identities (
 id uuid primary key default gen_random_uuid(),
 client_code text generated always as ('VZ-CL-'||upper(replace(id::text,'-',''))) stored unique,
 email_at_registration text not null check(length(email_at_registration) between 3 and 180),
 name_at_registration text not null check(length(name_at_registration) between 1 and 100),
 identity_status text not null default 'unverified' check(identity_status in ('unverified','verified')),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 check((identity_status='verified')=(verified_at is not null))
);
-- Deliberately NOT unique on email. No unverified automatic identity merging.
create temp table pg_temp.studio_pending_workspaces (
 id uuid primary key default gen_random_uuid(),
 project_code text generated always as ('VZ-PR-'||upper(replace(id::text,'-',''))) stored unique,
 request_id text not null unique references pg_temp.studio_creator_submissions(request_id) on delete restrict,
 client_id uuid not null references pg_temp.studio_client_identities(id) on delete restrict,
 state text not null default 'pending-review' check(state in ('pending-review','closed')),
 created_at timestamptz not null default now()
);
create index studio_pending_workspaces_client_idx on pg_temp.studio_pending_workspaces(client_id);
create temp table pg_temp.studio_onboarding_events (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references pg_temp.studio_pending_workspaces(id) on delete restrict,
 kind text not null check(kind='registration-prepared-v1'),
 state text not null default 'blocked' check(state='blocked'),
 reason text not null default 'recipient-verification-and-delivery-engine-required',
 created_at timestamptz not null default now(),
 unique(workspace_id,kind)
);

create function pg_temp.prepare_creator_onboarding_v1()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare
 cid uuid;
 wid uuid;
 contact jsonb := new.brief->'contact';
begin
 if jsonb_typeof(contact) is distinct from 'object'
 or nullif(btrim(contact->>'email'),'') is null
 or nullif(btrim(contact->>'name'),'') is null then
  raise exception 'Registration contact snapshot missing' using errcode='23514';
 end if;
 insert into pg_temp.studio_client_identities(email_at_registration,name_at_registration)
 values(lower(btrim(contact->>'email')),btrim(contact->>'name')) returning id into cid;
 insert into pg_temp.studio_pending_workspaces(request_id,client_id)
 values(new.request_id,cid) returning id into wid;
 insert into pg_temp.studio_onboarding_events(workspace_id,kind)
 values(wid,'registration-prepared-v1');
 return new;
end;
$$;

create trigger studio_creator_prepare_onboarding_v1 after insert on pg_temp.studio_creator_submissions for each row execute function pg_temp.prepare_creator_onboarding_v1();
do $t$
declare cid uuid; wid uuid; n integer;
begin
 insert into pg_temp.studio_creator_submissions values('synthetic-1','{"contact":{"name":"Example client","email":"SAMPLE@example.test"}}');
 select client_id,id into cid,wid from pg_temp.studio_pending_workspaces where request_id='synthetic-1';
 if cid is null or wid is null then raise exception 'missing identity/workspace'; end if;
 if not exists(select 1 from pg_temp.studio_client_identities where id=cid and email_at_registration='sample@example.test' and identity_status='unverified' and verified_at is null and client_code like 'VZ-CL-%') then raise exception 'identity invalid';end if;
 if not exists(select 1 from pg_temp.studio_pending_workspaces where id=wid and state='pending-review' and project_code like 'VZ-PR-%') then raise exception 'workspace invalid';end if;
 if not exists(select 1 from pg_temp.studio_onboarding_events where workspace_id=wid and state='blocked') then raise exception 'event not blocked';end if;
 insert into pg_temp.studio_creator_submissions values('synthetic-1','{"contact":{"name":"Example client","email":"SAMPLE@example.test"}}') on conflict do nothing;
 if (select count(*) from pg_temp.studio_client_identities)<>1 then raise exception 'duplicate identity';end if;
 insert into pg_temp.studio_creator_submissions values('synthetic-2','{"contact":{"name":"Other client","email":"sample@example.test"}}');
 if (select count(distinct client_id) from pg_temp.studio_pending_workspaces)<>2 then raise exception 'unverified email incorrectly merged';end if;
 begin
  insert into pg_temp.studio_creator_submissions values('synthetic-bad','{"contact":{"name":"Invalid"}}');
  raise exception 'expected missing contact failure';
 exception when check_violation then null;
 end;
 if exists(select 1 from pg_temp.studio_creator_submissions where request_id='synthetic-bad') then raise exception 'partial registration';end if;
 alter table pg_temp.studio_onboarding_events add constraint synthetic_fail check(false) not valid;
 begin
  insert into pg_temp.studio_creator_submissions values('synthetic-fail','{"contact":{"name":"Failure fixture","email":"failure@example.test"}}');
  raise exception 'expected event failure';
 exception when check_violation then null;
 end;
 if exists(select 1 from pg_temp.studio_creator_submissions where request_id='synthetic-fail') or exists(select 1 from pg_temp.studio_client_identities where email_at_registration='failure@example.test') then raise exception 'partial onboarding';end if;
 if (select count(*) from pg_temp.studio_pending_workspaces)<>2 or (select count(*) from pg_temp.studio_onboarding_events)<>2 then raise exception 'unexpected count';end if;
end;$t$;
select 'passed' as synthetic_identity_transaction;
rollback;