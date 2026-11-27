begin;
set local statement_timeout='15s';
create temp table studio_creator_submissions(request_id text primary key,brief jsonb not null) on commit drop;
create temp table studio_enquiries(id text primary key,reference text,status text,acceptance_status text,accepted_project_id text) on commit drop;
create temp table studio_client_projects(id text primary key,enquiry_id text,request_reference text,title text,status text) on commit drop;
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

create temp table pg_temp.studio_identity_challenges (
 id uuid primary key default gen_random_uuid(),
 client_id uuid not null references pg_temp.studio_client_identities(id) on delete restrict,
 token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 consumed_at timestamptz,
 revoked_at timestamptz,
 check(expires_at>created_at)
);
create index studio_identity_challenges_client_idx on pg_temp.studio_identity_challenges(client_id,created_at desc);
create temp table pg_temp.studio_identity_groups (
 member_id uuid primary key references pg_temp.studio_client_identities(id) on delete restrict,
 primary_id uuid not null references pg_temp.studio_client_identities(id) on delete restrict,
 linked_at timestamptz not null default now(),
 check(member_id<>primary_id)
);
create index studio_identity_groups_primary_idx on pg_temp.studio_identity_groups(primary_id);

create function pg_temp.veloryz_identity_issue_v1(p_client uuid,p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare i pg_temp.studio_client_identities%rowtype; t timestamptz:=clock_timestamp();
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid'); end if;
 select * into i from pg_temp.studio_client_identities where id=p_client for update;
 if not found or i.identity_status<>'unverified' then return jsonb_build_object('result','unavailable');end if;
 if exists(select 1 from pg_temp.studio_identity_challenges where client_id=p_client and created_at>t-interval '5 minutes')
 or (select count(*) from pg_temp.studio_identity_challenges where client_id=p_client and created_at>t-interval '24 hours')>=5 then return jsonb_build_object('result','rate-limited');end if;
 update pg_temp.studio_identity_challenges set revoked_at=t where client_id=p_client and consumed_at is null and revoked_at is null;
 insert into pg_temp.studio_identity_challenges(client_id,token_hash,created_at,expires_at) values(p_client,p_hash,t,t+interval '30 minutes');
 return jsonb_build_object('result','issued','email',i.email_at_registration,'expires_at',t+interval '30 minutes');
end;$$;
-- Same lock order as issuance: identity, then challenge. Only exact token possession.
create function pg_temp.veloryz_identity_redeem_v1(p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare cid uuid; i pg_temp.studio_client_identities%rowtype; t timestamptz:=clock_timestamp(); changed uuid;
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid');end if;
 select client_id into cid from pg_temp.studio_identity_challenges where token_hash=p_hash;
 if not found then return jsonb_build_object('result','invalid');end if;
 select * into i from pg_temp.studio_client_identities where id=cid for update;
 if not found or i.identity_status<>'unverified' then return jsonb_build_object('result','invalid');end if;
 update pg_temp.studio_identity_challenges set consumed_at=t where token_hash=p_hash and client_id=cid and consumed_at is null and revoked_at is null and expires_at>clock_timestamp() returning id into changed;
 if changed is null then return jsonb_build_object('result','invalid');end if;
 update pg_temp.studio_client_identities set identity_status='verified',verified_at=t where id=cid;
 update pg_temp.studio_identity_challenges set revoked_at=t where client_id=cid and consumed_at is null and revoked_at is null;
 return jsonb_build_object('result','verified');
end;$$;
-- Owner-confirmed grouping only. Both addresses individually verified and equal.
-- Preserve both immutable client IDs; no project or session reassignment.
create function pg_temp.veloryz_identity_group_v1(p_member uuid,p_primary uuid)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare a pg_temp.studio_client_identities%rowtype; b pg_temp.studio_client_identities%rowtype;
begin
 if p_member is null or p_primary is null or p_member=p_primary then return jsonb_build_object('result','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('veloryz-identity-group-v1',0));
 select * into a from pg_temp.studio_client_identities where id=p_member;
 select * into b from pg_temp.studio_client_identities where id=p_primary;
 if a.id is null or b.id is null or a.identity_status<>'verified' or b.identity_status<>'verified' or a.email_at_registration<>b.email_at_registration then return jsonb_build_object('result','not-eligible');end if;
 if exists(select 1 from pg_temp.studio_identity_groups where member_id=p_member and primary_id=p_primary) then return jsonb_build_object('result','linked');end if;
 if exists(select 1 from pg_temp.studio_identity_groups where member_id in (p_member,p_primary) or primary_id=p_member) then return jsonb_build_object('result','conflict');end if;
 insert into pg_temp.studio_identity_groups(member_id,primary_id) values(p_member,p_primary);
 return jsonb_build_object('result','linked');
end;$$;
-- Workspace lifecycle is reconciled from the authoritative CRM, not a second mutable acceptance flag.
create function pg_temp.veloryz_identity_directory_v1(p_query text,p_page integer,p_client uuid default null,p_project_page integer default 0)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
 with matches as (
 select i.id,i.client_code,i.name_at_registration,i.email_at_registration,i.identity_status,i.verified_at,i.created_at,
 coalesce(g.primary_id,i.id) as primary_id
 from pg_temp.studio_client_identities i left join pg_temp.studio_identity_groups g on g.member_id=i.id
 where p_page between 0 and 10000 and length(coalesce(p_query,''))<=120
 and (coalesce(p_query,'')='' or strpos(lower(concat_ws(' ',i.client_code,i.name_at_registration,i.email_at_registration)),lower(p_query))>0)
 ), page_rows as (select * from matches order by created_at desc,id desc limit 25 offset greatest(0,least(10000,coalesce(p_page,0)))*25),
 root as (select coalesce(g.primary_id,i.id) as id from pg_temp.studio_client_identities i left join pg_temp.studio_identity_groups g on g.member_id=i.id where i.id=p_client),
 members as (select i.id,i.client_code,i.name_at_registration,i.identity_status from pg_temp.studio_client_identities i where i.id=(select id from root) or exists(select 1 from pg_temp.studio_identity_groups g where g.primary_id=(select id from root) and g.member_id=i.id)),
 projects as (
 select w.id,w.project_code,w.request_id,w.client_id,e.reference,e.accepted_project_id,
 case when p.id is not null and e.acceptance_status='accepted' then 'accepted'
 when e.status='closed' then 'closed' when e.acceptance_status='accepted' or coalesce(e.accepted_project_id,'')<>'' then 'link-review'
 else 'pending-review' end as lifecycle,
 p.id as delivery_project_id,p.title,p.status as delivery_status,w.created_at
 from pg_temp.studio_pending_workspaces w join members m on m.id=w.client_id
 join pg_temp.studio_enquiries e on e.id=w.request_id
 left join pg_temp.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference
 ), project_rows as (select * from projects order by created_at desc,id desc limit 25 offset greatest(0,least(10000,coalesce(p_project_page,0)))*25)
 select jsonb_build_object('source','identity-v1','total',(select count(*) from matches),'items',coalesce((select jsonb_agg(to_jsonb(page_rows) order by created_at desc,id desc) from page_rows),'[]'::jsonb),'detail',
 case when exists(select 1 from root) then jsonb_build_object('primary_id',(select id from root),'member_count',(select count(*) from members),'project_total',(select count(*) from projects),'projects',coalesce((select jsonb_agg(to_jsonb(project_rows) order by created_at desc,id desc) from project_rows),'[]'::jsonb)) else null end)
$$;

do $test$ declare a uuid;b uuid;c uuid;d uuid;r jsonb;n integer;begin
 insert into pg_temp.studio_client_identities(email_at_registration,name_at_registration) values('same@example.test','A') returning id into a;
 insert into pg_temp.studio_client_identities(email_at_registration,name_at_registration) values('same@example.test','B') returning id into b;
 insert into pg_temp.studio_client_identities(email_at_registration,name_at_registration) values('other@example.test','C') returning id into c;
 insert into pg_temp.studio_client_identities(email_at_registration,name_at_registration) values('same@example.test','D') returning id into d;
 r:=pg_temp.veloryz_identity_group_v1(b,a);if r->>'result'<>'not-eligible' then raise exception 'unverified grouping';end if;
 r:=pg_temp.veloryz_identity_issue_v1(a,repeat('a',64));if r->>'result'<>'issued' or r->>'email'<>'same@example.test' then raise exception 'issue';end if;
 r:=pg_temp.veloryz_identity_issue_v1(a,repeat('b',64));if r->>'result'<>'rate-limited' then raise exception 'rate';end if;
 r:=pg_temp.veloryz_identity_redeem_v1(repeat('a',64));if r->>'result'<>'verified' then raise exception 'redeem';end if;
 r:=pg_temp.veloryz_identity_redeem_v1(repeat('a',64));if r->>'result'<>'invalid' then raise exception 'reuse';end if;
 r:=pg_temp.veloryz_identity_issue_v1(b,repeat('b',64));r:=pg_temp.veloryz_identity_redeem_v1(repeat('b',64));if r->>'result'<>'verified' then raise exception 'second redeem';end if;
 r:=pg_temp.veloryz_identity_issue_v1(c,repeat('c',64));r:=pg_temp.veloryz_identity_redeem_v1(repeat('c',64));
 r:=pg_temp.veloryz_identity_group_v1(c,a);if r->>'result'<>'not-eligible' then raise exception 'different email grouping';end if;
 r:=pg_temp.veloryz_identity_group_v1(b,a);if r->>'result'<>'linked' then raise exception 'group';end if;
 r:=pg_temp.veloryz_identity_group_v1(b,a);if r->>'result'<>'linked' then raise exception 'group replay';end if;
 r:=pg_temp.veloryz_identity_group_v1(a,b);if r->>'result'<>'conflict' then raise exception 'group cycle';end if;
 insert into pg_temp.studio_identity_challenges(client_id,token_hash,created_at,expires_at) values(d,repeat('d',64),now()-interval '2 hours',now()-interval '1 hour');
 r:=pg_temp.veloryz_identity_redeem_v1(repeat('d',64));if r->>'result'<>'invalid' then raise exception 'expired token';end if;
 insert into pg_temp.studio_creator_submissions values('test1','{}'),('test2','{}'),('test3','{}');
 insert into pg_temp.studio_pending_workspaces(request_id,client_id) values('test1',a),('test2',b),('test3',b);
 insert into pg_temp.studio_enquiries values('test1','VZ-1','new','pending',''),('test2','VZ-2','confirmed','accepted','p2'),('test3','VZ-3','confirmed','accepted','p3');
 insert into pg_temp.studio_client_projects values('p2','test2','VZ-2','Example','planning'),('p3','test3','WRONG','Wrong','planning');
 r:=pg_temp.veloryz_identity_directory_v1('same@example.test',0,b,0);
 if r->>'total'<>'3' or r->'detail'->>'member_count'<>'2' or r->'detail'->>'project_total'<>'3' then raise exception 'directory group %',r;end if;
 if not exists(select 1 from jsonb_array_elements(r->'detail'->'projects') x where x->>'lifecycle'='accepted' and x->>'delivery_project_id'='p2') then raise exception 'accepted';end if;
 if not exists(select 1 from jsonb_array_elements(r->'detail'->'projects') x where x->>'lifecycle'='link-review' and x->>'reference'='VZ-3') then raise exception 'mismatch';end if;
 if not exists(select 1 from jsonb_array_elements(r->'detail'->'projects') x where x->>'lifecycle'='pending-review') then raise exception 'pending';end if;
end;$test$;
select 'passed' as synthetic_identity_lifecycle;
rollback;