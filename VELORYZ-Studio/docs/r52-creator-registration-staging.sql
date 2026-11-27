-- R52.2.4 review candidate, NOT applied. Existing generic enquiries remain unchanged.
-- Deploy to isolated staging first. This is not a generated Supabase migration history entry.
begin;
create table veloryz_studio.studio_creator_submissions (
 request_id text primary key references veloryz_studio.studio_enquiries(id) on delete restrict,
 reference text not null unique,
 fingerprint text not null check(fingerprint ~ '^[0-9a-f]{64}$'),
 contract_version integer not null check(contract_version=1),
 brief jsonb not null check(jsonb_typeof(brief)='object'),
 quote jsonb not null check(jsonb_typeof(quote)='object'),
 published_revision integer not null check(published_revision>=0),
 created_at timestamptz not null default now()
);
alter table veloryz_studio.studio_creator_submissions enable row level security;
revoke all on table veloryz_studio.studio_creator_submissions from public, anon, authenticated, service_role;
grant select,insert on table veloryz_studio.studio_creator_submissions to service_role;
-- No update/delete for service role. Lifecycle remains on the linked enquiry.
create function public.veloryz_register_creator_v1(p_submission jsonb,p_quote jsonb,p_fingerprint text,p_rate_key text,p_network_key text,p_summary text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare
 rid text := p_submission->>'requestId';
 ref text;
 prior veloryz_studio.studio_creator_submissions%rowtype;
 current_revision integer;
 stamp text;
 since_stamp text;
 contact jsonb := p_submission->'contact';
 b jsonb := p_submission->'brief';
begin
 if rid is null or rid !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
 or p_fingerprint is null or p_fingerprint !~ '^[0-9a-f]{64}$'
 or p_rate_key is null or p_rate_key !~ '^[0-9a-f]{64}$'
 or p_network_key is null or p_network_key !~ '^[0-9a-f]{64}$'
 or p_submission->>'contractVersion' is distinct from '1'
 or p_submission->>'intent' is distinct from 'create-project'
 or p_submission->>'consent' is distinct from 'true'
 or jsonb_typeof(b) is distinct from 'object'
 or jsonb_typeof(contact) is distinct from 'object'
 or coalesce(contact->>'email','')='' or coalesce(contact->>'name','')=''
 or octet_length(p_submission::text)>65536
 then return jsonb_build_object('result','invalid'); end if;
 -- Serialize repeats and rate checks on this endpoint only. All calls acquire locks in same order.
 perform pg_advisory_xact_lock(hashtextextended('vz-creator-id:'||rid,0));
 select * into prior from veloryz_studio.studio_creator_submissions where request_id=rid;
 if found then
  if prior.fingerprint<>p_fingerprint then return jsonb_build_object('result','conflict'); end if;
  return jsonb_build_object('result','replayed','reference',prior.reference,'status','pending-review','estimate',prior.quote);
 end if;
 if exists(select 1 from veloryz_studio.studio_enquiries where id=rid) then return jsonb_build_object('result','conflict'); end if;
 -- Replay-only probe uses a null quote. It cannot insert an enquiry.
 if p_quote is null then return jsonb_build_object('result','not-found'); end if;
 if p_summary is null or length(p_summary)>2000 or length(p_summary)<10
 or p_quote->>'currency' is distinct from 'INR'
 or p_quote->>'status' is distinct from 'pending-review'
 or p_quote->>'kind' is distinct from 'indicative-estimate'
 or p_quote->>'amountDuePaise' is distinct from '0'
 or octet_length(p_quote::text)>65536
 then return jsonb_build_object('result','invalid'); end if;
 select published_version into current_revision from veloryz_studio.cms_state where id=1 for share;
 if current_revision is null or current_revision::text is distinct from p_quote->>'publishedRevision' then return jsonb_build_object('result','price-changed'); end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-creator-email:'||p_rate_key,0));
 perform pg_advisory_xact_lock(hashtextextended('vz-creator-network:'||p_network_key,0));
 stamp:=to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 since_stamp:=to_char((clock_timestamp()-interval '1 hour') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 if (select count(*) from veloryz_studio.studio_enquiries where rate_key=p_rate_key and created_at>since_stamp)>=3
 or (select count(*) from veloryz_studio.studio_enquiries where network_key=p_network_key and created_at>since_stamp)>=30
 then return jsonb_build_object('result','rate-limited'); end if;
 ref:='VZ-SUB-'||upper(replace(rid,'-',''));
 insert into veloryz_studio.studio_enquiries(id,reference,name,email,phone,service,budget,preferred_date,preferred_time,company,message,status,notes,version,fingerprint,rate_key,network_key,created_at,updated_at)
 values(rid,ref,contact->>'name',contact->>'email',coalesce(contact->>'phone',''),'Custom project',coalesce(b->>'budgetPreference','')||' INR preferred','','',coalesce(contact->>'company',''),p_summary,'new','',0,p_fingerprint,p_rate_key,p_network_key,stamp,stamp)
 on conflict(id) do nothing;
 if not found then return jsonb_build_object('result','conflict'); end if;
 insert into veloryz_studio.studio_creator_submissions(request_id,reference,fingerprint,contract_version,brief,quote,published_revision)
 values(rid,ref,p_fingerprint,1,p_submission,p_quote,current_revision);
 return jsonb_build_object('result','created','reference',ref,'status','pending-review','estimate',p_quote);
end;
$$;
revoke all on function public.veloryz_register_creator_v1(jsonb,jsonb,text,text,text,text) from public, anon, authenticated;
grant execute on function public.veloryz_register_creator_v1(jsonb,jsonb,text,text,text,text) to service_role;
commit;
