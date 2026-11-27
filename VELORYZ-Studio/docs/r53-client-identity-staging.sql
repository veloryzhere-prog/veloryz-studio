-- R52.3.1 staged foundation. Apply ONLY after R52.2 registration in isolated staging.
-- New registrations atomically create a provisional identity, pending workspace and blocked event.
-- No existing portal row, invitation, session, invoice or email is created by this trigger.
begin;
create table veloryz_studio.studio_client_identities (
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
create table veloryz_studio.studio_pending_workspaces (
 id uuid primary key default gen_random_uuid(),
 project_code text generated always as ('VZ-PR-'||upper(replace(id::text,'-',''))) stored unique,
 request_id text not null unique references veloryz_studio.studio_creator_submissions(request_id) on delete restrict,
 client_id uuid not null references veloryz_studio.studio_client_identities(id) on delete restrict,
 state text not null default 'pending-review' check(state in ('pending-review','closed')),
 created_at timestamptz not null default now()
);
create index studio_pending_workspaces_client_idx on veloryz_studio.studio_pending_workspaces(client_id);
create table veloryz_studio.studio_onboarding_events (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references veloryz_studio.studio_pending_workspaces(id) on delete restrict,
 kind text not null check(kind='registration-prepared-v1'),
 state text not null default 'blocked' check(state='blocked'),
 reason text not null default 'recipient-verification-and-delivery-engine-required',
 created_at timestamptz not null default now(),
 unique(workspace_id,kind)
);
alter table veloryz_studio.studio_client_identities enable row level security;
alter table veloryz_studio.studio_pending_workspaces enable row level security;
alter table veloryz_studio.studio_onboarding_events enable row level security;
revoke all on table veloryz_studio.studio_client_identities,veloryz_studio.studio_pending_workspaces,veloryz_studio.studio_onboarding_events from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_client_identities,veloryz_studio.studio_pending_workspaces,veloryz_studio.studio_onboarding_events to service_role;
-- Invoker trigger inherits the registration transaction and server role.
create function veloryz_studio.prepare_creator_onboarding_v1()
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
 insert into veloryz_studio.studio_client_identities(email_at_registration,name_at_registration)
 values(lower(btrim(contact->>'email')),btrim(contact->>'name')) returning id into cid;
 insert into veloryz_studio.studio_pending_workspaces(request_id,client_id)
 values(new.request_id,cid) returning id into wid;
 insert into veloryz_studio.studio_onboarding_events(workspace_id,kind)
 values(wid,'registration-prepared-v1');
 return new;
end;
$$;
revoke all on function veloryz_studio.prepare_creator_onboarding_v1() from public,anon,authenticated;
grant execute on function veloryz_studio.prepare_creator_onboarding_v1() to service_role;
create trigger studio_creator_prepare_onboarding_v1
after insert on veloryz_studio.studio_creator_submissions
for each row execute function veloryz_studio.prepare_creator_onboarding_v1();
-- Existing registrations are intentionally not backfilled automatically.
-- Owner-only reads can join the existing accepted workspace by exact enquiry ID AND reference.
commit;
