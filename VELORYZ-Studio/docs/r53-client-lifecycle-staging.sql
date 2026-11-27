-- R52.3.2–4 staged, apply after r53-client-identity-staging.sql in isolated staging.
begin;
create table veloryz_studio.studio_identity_challenges (
 id uuid primary key default gen_random_uuid(),
 client_id uuid not null references veloryz_studio.studio_client_identities(id) on delete restrict,
 token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 consumed_at timestamptz,
 revoked_at timestamptz,
 check(expires_at>created_at)
);
create index studio_identity_challenges_client_idx on veloryz_studio.studio_identity_challenges(client_id,created_at desc);
create table veloryz_studio.studio_identity_groups (
 member_id uuid primary key references veloryz_studio.studio_client_identities(id) on delete restrict,
 primary_id uuid not null references veloryz_studio.studio_client_identities(id) on delete restrict,
 linked_at timestamptz not null default now(),
 check(member_id<>primary_id)
);
create index studio_identity_groups_primary_idx on veloryz_studio.studio_identity_groups(primary_id);
alter table veloryz_studio.studio_identity_challenges enable row level security;
alter table veloryz_studio.studio_identity_groups enable row level security;
revoke all on table veloryz_studio.studio_identity_challenges,veloryz_studio.studio_identity_groups from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_identity_challenges,veloryz_studio.studio_identity_groups to service_role;
grant update(consumed_at,revoked_at) on veloryz_studio.studio_identity_challenges to service_role;
grant update(identity_status,verified_at) on veloryz_studio.studio_client_identities to service_role;
-- Trusted owner/transport only: never return the hash, never change recipient.
create function public.veloryz_identity_issue_v1(p_client uuid,p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare i veloryz_studio.studio_client_identities%rowtype; t timestamptz:=clock_timestamp();
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid'); end if;
 select * into i from veloryz_studio.studio_client_identities where id=p_client for update;
 if not found or i.identity_status<>'unverified' then return jsonb_build_object('result','unavailable');end if;
 if exists(select 1 from veloryz_studio.studio_identity_challenges where client_id=p_client and created_at>t-interval '5 minutes')
 or (select count(*) from veloryz_studio.studio_identity_challenges where client_id=p_client and created_at>t-interval '24 hours')>=5 then return jsonb_build_object('result','rate-limited');end if;
 update veloryz_studio.studio_identity_challenges set revoked_at=t where client_id=p_client and consumed_at is null and revoked_at is null;
 insert into veloryz_studio.studio_identity_challenges(client_id,token_hash,created_at,expires_at) values(p_client,p_hash,t,t+interval '30 minutes');
 return jsonb_build_object('result','issued','email',i.email_at_registration,'expires_at',t+interval '30 minutes');
end;$$;
-- Same lock order as issuance: identity, then challenge. Only exact token possession.
create function public.veloryz_identity_redeem_v1(p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare cid uuid; i veloryz_studio.studio_client_identities%rowtype; t timestamptz:=clock_timestamp(); changed uuid;
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid');end if;
 select client_id into cid from veloryz_studio.studio_identity_challenges where token_hash=p_hash;
 if not found then return jsonb_build_object('result','invalid');end if;
 select * into i from veloryz_studio.studio_client_identities where id=cid for update;
 if not found or i.identity_status<>'unverified' then return jsonb_build_object('result','invalid');end if;
 update veloryz_studio.studio_identity_challenges set consumed_at=t where token_hash=p_hash and client_id=cid and consumed_at is null and revoked_at is null and expires_at>clock_timestamp() returning id into changed;
 if changed is null then return jsonb_build_object('result','invalid');end if;
 update veloryz_studio.studio_client_identities set identity_status='verified',verified_at=t where id=cid;
 update veloryz_studio.studio_identity_challenges set revoked_at=t where client_id=cid and consumed_at is null and revoked_at is null;
 return jsonb_build_object('result','verified');
end;$$;
-- Owner-confirmed grouping only. Both addresses individually verified and equal.
-- Preserve both immutable client IDs; no project or session reassignment.
create function public.veloryz_identity_group_v1(p_member uuid,p_primary uuid)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare a veloryz_studio.studio_client_identities%rowtype; b veloryz_studio.studio_client_identities%rowtype;
begin
 if p_member is null or p_primary is null or p_member=p_primary then return jsonb_build_object('result','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('veloryz-identity-group-v1',0));
 select * into a from veloryz_studio.studio_client_identities where id=p_member;
 select * into b from veloryz_studio.studio_client_identities where id=p_primary;
 if a.id is null or b.id is null or a.identity_status<>'verified' or b.identity_status<>'verified' or a.email_at_registration<>b.email_at_registration then return jsonb_build_object('result','not-eligible');end if;
 if exists(select 1 from veloryz_studio.studio_identity_groups where member_id=p_member and primary_id=p_primary) then return jsonb_build_object('result','linked');end if;
 if exists(select 1 from veloryz_studio.studio_identity_groups where member_id in (p_member,p_primary) or primary_id=p_member) then return jsonb_build_object('result','conflict');end if;
 insert into veloryz_studio.studio_identity_groups(member_id,primary_id) values(p_member,p_primary);
 return jsonb_build_object('result','linked');
end;$$;
-- Workspace lifecycle is reconciled from the authoritative CRM, not a second mutable acceptance flag.
create function public.veloryz_identity_directory_v1(p_query text,p_page integer,p_client uuid default null,p_project_page integer default 0)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
 with matches as (
 select i.id,i.client_code,i.name_at_registration,i.email_at_registration,i.identity_status,i.verified_at,i.created_at,
 coalesce(g.primary_id,i.id) as primary_id
 from veloryz_studio.studio_client_identities i left join veloryz_studio.studio_identity_groups g on g.member_id=i.id
 where p_page between 0 and 10000 and length(coalesce(p_query,''))<=120
 and (coalesce(p_query,'')='' or strpos(lower(concat_ws(' ',i.client_code,i.name_at_registration,i.email_at_registration)),lower(p_query))>0)
 ), page_rows as (select * from matches order by created_at desc,id desc limit 25 offset greatest(0,least(10000,coalesce(p_page,0)))*25),
 root as (select coalesce(g.primary_id,i.id) as id from veloryz_studio.studio_client_identities i left join veloryz_studio.studio_identity_groups g on g.member_id=i.id where i.id=p_client),
 members as (select i.id,i.client_code,i.name_at_registration,i.identity_status from veloryz_studio.studio_client_identities i where i.id=(select id from root) or exists(select 1 from veloryz_studio.studio_identity_groups g where g.primary_id=(select id from root) and g.member_id=i.id)),
 projects as (
 select w.id,w.project_code,w.request_id,w.client_id,e.reference,e.accepted_project_id,
 case when p.id is not null and e.acceptance_status='accepted' then 'accepted'
 when e.status='closed' then 'closed' when e.acceptance_status='accepted' or coalesce(e.accepted_project_id,'')<>'' then 'link-review'
 else 'pending-review' end as lifecycle,
 p.id as delivery_project_id,p.title,p.status as delivery_status,w.created_at
 from veloryz_studio.studio_pending_workspaces w join members m on m.id=w.client_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id
 left join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference
 ), project_rows as (select * from projects order by created_at desc,id desc limit 25 offset greatest(0,least(10000,coalesce(p_project_page,0)))*25)
 select jsonb_build_object('source','identity-v1','total',(select count(*) from matches),'items',coalesce((select jsonb_agg(to_jsonb(page_rows) order by created_at desc,id desc) from page_rows),'[]'::jsonb),'detail',
 case when exists(select 1 from root) then jsonb_build_object('primary_id',(select id from root),'member_count',(select count(*) from members),'project_total',(select count(*) from projects),'projects',coalesce((select jsonb_agg(to_jsonb(project_rows) order by created_at desc,id desc) from project_rows),'[]'::jsonb)) else null end)
$$;
revoke all on function public.veloryz_identity_issue_v1(uuid,text),public.veloryz_identity_redeem_v1(text),public.veloryz_identity_group_v1(uuid,uuid),public.veloryz_identity_directory_v1(text,integer,uuid,integer) from public,anon,authenticated;
grant execute on function public.veloryz_identity_issue_v1(uuid,text),public.veloryz_identity_redeem_v1(text),public.veloryz_identity_group_v1(uuid,uuid),public.veloryz_identity_directory_v1(text,integer,uuid,integer) to service_role;
commit;
