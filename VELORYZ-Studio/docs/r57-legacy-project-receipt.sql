-- Immediate receipt for new legacy Creator projects; no historical backfill.
begin;
create table veloryz_studio.studio_legacy_receipt_jobs(
 request_id text primary key references veloryz_studio.studio_enquiries(id) on delete cascade,
 reference text not null unique,
 recipient text not null,
 snapshot jsonb not null,
 receipt_state text not null default 'pending' check(receipt_state in ('pending','sending','sent','uncertain')),
 detail_state text not null default 'blocked' check(detail_state in ('blocked','pending','sending','sent','uncertain')),
 token_hash text unique check(token_hash ~ '^[0-9a-f]{64}$'),
 expires_at timestamptz, verified_at timestamptz,
 created_at timestamptz not null default now()
);
alter table veloryz_studio.studio_legacy_receipt_jobs enable row level security;
revoke all on table veloryz_studio.studio_legacy_receipt_jobs from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_legacy_receipt_jobs to service_role;
grant update(receipt_state,detail_state,token_hash,expires_at,verified_at) on table veloryz_studio.studio_legacy_receipt_jobs to service_role;
create function veloryz_studio.queue_legacy_project_receipt_v1() returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if new.reference ~ '^VZ-[A-F0-9]{12}$' and (new.service='Custom project' or new.service like 'Design request:%') then
 insert into veloryz_studio.studio_legacy_receipt_jobs(request_id,reference,recipient,snapshot)
 values(new.id,new.reference,new.email,jsonb_build_object('name',new.name,'email',new.email,'company',new.company,'phone',new.phone,'service',new.service,'budget',new.budget,'brief',new.message,'registered_at',new.created_at))
 on conflict do nothing;end if;
 return new;
end;$$;
revoke all on function veloryz_studio.queue_legacy_project_receipt_v1() from public,anon,authenticated;
grant execute on function veloryz_studio.queue_legacy_project_receipt_v1() to service_role;
create trigger studio_legacy_receipt_queue after insert on veloryz_studio.studio_enquiries for each row execute function veloryz_studio.queue_legacy_project_receipt_v1();
create function public.veloryz_legacy_receipt_claim_v1(p_reference text,p_kind text,p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare j veloryz_studio.studio_legacy_receipt_jobs%rowtype;
begin
 if p_reference is null or p_reference !~ '^VZ-[A-F0-9]{12}$' or p_kind is null or p_kind not in ('receipt','detail') then return jsonb_build_object('result','invalid');end if;
 select * into j from veloryz_studio.studio_legacy_receipt_jobs where reference=p_reference for update;
 if not found then return jsonb_build_object('result','empty');end if;
 if p_kind='receipt' then
 if j.receipt_state<>'pending' or p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','empty');end if;
 update veloryz_studio.studio_legacy_receipt_jobs set receipt_state='sending',token_hash=p_hash,expires_at=clock_timestamp()+interval '24 hours' where request_id=j.request_id;
 return jsonb_build_object('result','claimed','reference',j.reference,'recipient',j.recipient);
 end if;
 if j.detail_state<>'pending' or j.verified_at is null then return jsonb_build_object('result','empty');end if;
 update veloryz_studio.studio_legacy_receipt_jobs set detail_state='sending' where request_id=j.request_id;
 return jsonb_build_object('result','claimed','reference',j.reference,'recipient',j.recipient,'snapshot',j.snapshot);
end;$$;
create function public.veloryz_legacy_receipt_verify_v1(p_hash text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare j veloryz_studio.studio_legacy_receipt_jobs%rowtype;
begin
 if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('result','invalid');end if;
 select * into j from veloryz_studio.studio_legacy_receipt_jobs where token_hash=p_hash and expires_at>clock_timestamp() for update;
 if not found then return jsonb_build_object('result','invalid');end if;
 if j.verified_at is null then update veloryz_studio.studio_legacy_receipt_jobs set verified_at=clock_timestamp(),detail_state='pending' where request_id=j.request_id;end if;
 return jsonb_build_object('result','verified','reference',j.reference);
end;$$;
create function public.veloryz_legacy_receipt_finish_v1(p_reference text,p_kind text,p_state text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if p_state is null or p_state not in ('sent','uncertain','pending') then return jsonb_build_object('result','invalid');end if;
 if p_kind='receipt' then update veloryz_studio.studio_legacy_receipt_jobs set receipt_state=p_state,token_hash=case when p_state='pending' then null else token_hash end,expires_at=case when p_state='pending' then null else expires_at end where reference=p_reference and receipt_state='sending' and (p_state<>'pending' or verified_at is null);
 elsif p_kind='detail' then update veloryz_studio.studio_legacy_receipt_jobs set detail_state=p_state where reference=p_reference and detail_state='sending';
 else return jsonb_build_object('result','invalid');end if;
 return jsonb_build_object('result',case when found then 'recorded' else 'not-found' end);
end;$$;
revoke all on function public.veloryz_legacy_receipt_claim_v1(text,text,text),public.veloryz_legacy_receipt_verify_v1(text),public.veloryz_legacy_receipt_finish_v1(text,text,text) from public,anon,authenticated;
grant execute on function public.veloryz_legacy_receipt_claim_v1(text,text,text),public.veloryz_legacy_receipt_verify_v1(text),public.veloryz_legacy_receipt_finish_v1(text,text,text) to service_role;
commit;
