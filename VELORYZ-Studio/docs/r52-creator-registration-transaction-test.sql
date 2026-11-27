begin;
set local statement_timeout='12s';
create temp table studio_enquiries (like veloryz_studio.studio_enquiries including defaults including constraints including indexes) on commit drop;
create temp table cms_state (id integer primary key,published_version integer not null) on commit drop;
insert into pg_temp.cms_state values(1,12);
create temp table pg_temp.studio_creator_submissions (
 request_id text primary key references pg_temp.studio_enquiries(id) on delete restrict,
 reference text not null unique,
 fingerprint text not null check(fingerprint ~ '^[0-9a-f]{64}$'),
 contract_version integer not null check(contract_version=1),
 brief jsonb not null check(jsonb_typeof(brief)='object'),
 quote jsonb not null check(jsonb_typeof(quote)='object'),
 published_revision integer not null check(published_revision>=0),
 created_at timestamptz not null default now()
);

create function pg_temp.veloryz_register_creator_v1(p_submission jsonb,p_quote jsonb,p_fingerprint text,p_rate_key text,p_network_key text,p_summary text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare
 rid text := p_submission->>'requestId';
 ref text;
 prior pg_temp.studio_creator_submissions%rowtype;
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
 select * into prior from pg_temp.studio_creator_submissions where request_id=rid;
 if found then
  if prior.fingerprint<>p_fingerprint then return jsonb_build_object('result','conflict'); end if;
  return jsonb_build_object('result','replayed','reference',prior.reference,'status','pending-review','estimate',prior.quote);
 end if;
 if exists(select 1 from pg_temp.studio_enquiries where id=rid) then return jsonb_build_object('result','conflict'); end if;
 -- Replay-only probe uses a null quote. It cannot insert an enquiry.
 if p_quote is null then return jsonb_build_object('result','not-found'); end if;
 if p_summary is null or length(p_summary)>2000 or length(p_summary)<10
 or p_quote->>'currency' is distinct from 'INR'
 or p_quote->>'status' is distinct from 'pending-review'
 or p_quote->>'kind' is distinct from 'indicative-estimate'
 or p_quote->>'amountDuePaise' is distinct from '0'
 or octet_length(p_quote::text)>65536
 then return jsonb_build_object('result','invalid'); end if;
 select published_version into current_revision from pg_temp.cms_state where id=1 for share;
 if current_revision is null or current_revision::text is distinct from p_quote->>'publishedRevision' then return jsonb_build_object('result','price-changed'); end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-creator-email:'||p_rate_key,0));
 perform pg_advisory_xact_lock(hashtextextended('vz-creator-network:'||p_network_key,0));
 stamp:=to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 since_stamp:=to_char((clock_timestamp()-interval '1 hour') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 if (select count(*) from pg_temp.studio_enquiries where rate_key=p_rate_key and created_at>since_stamp)>=3
 or (select count(*) from pg_temp.studio_enquiries where network_key=p_network_key and created_at>since_stamp)>=30
 then return jsonb_build_object('result','rate-limited'); end if;
 ref:='VZ-SUB-'||upper(replace(rid,'-',''));
 insert into pg_temp.studio_enquiries(id,reference,name,email,phone,service,budget,preferred_date,preferred_time,company,message,status,notes,version,fingerprint,rate_key,network_key,created_at,updated_at)
 values(rid,ref,contact->>'name',contact->>'email',coalesce(contact->>'phone',''),'Custom project',coalesce(b->>'budgetPreference','')||' INR preferred','','',coalesce(contact->>'company',''),p_summary,'new','',0,p_fingerprint,p_rate_key,p_network_key,stamp,stamp)
 on conflict(id) do nothing;
 if not found then return jsonb_build_object('result','conflict'); end if;
 insert into pg_temp.studio_creator_submissions(request_id,reference,fingerprint,contract_version,brief,quote,published_revision)
 values(rid,ref,p_fingerprint,1,p_submission,p_quote,current_revision);
 return jsonb_build_object('result','created','reference',ref,'status','pending-review','estimate',p_quote);
end;
$$;
do $test$
declare s jsonb:='{"contractVersion":1,"intent":"create-project","requestId":"c162bb72-2d79-44da-bc7f-7bf073b62930","consent":true,"contact":{"name":"Synthetic test","email":"synthetic@example.test"},"brief":{"budgetPreference":6000}}';
q jsonb:='{"currency":"INR","status":"pending-review","kind":"indicative-estimate","amountDuePaise":0,"publishedRevision":12,"lowPaise":1000000}';
r jsonb; n integer; i integer;
begin
r:=pg_temp.veloryz_register_creator_v1(s,null,repeat('a',64),repeat('b',64),repeat('c',64),null);
if r->>'result' is distinct from 'not-found' then raise exception 'probe should not insert';end if;
if exists(select 1 from pg_temp.studio_enquiries) then raise exception 'probe wrote an enquiry';end if;
r:=pg_temp.veloryz_register_creator_v1(s,q,repeat('a',64),repeat('b',64),repeat('c',64),'Synthetic test only');
if r->>'result' is distinct from 'created' then raise exception 'creation failed %',r;end if;
r:=pg_temp.veloryz_register_creator_v1(s,null,repeat('a',64),repeat('b',64),repeat('c',64),null);
if r->>'result' is distinct from 'replayed' or r->'estimate'->>'lowPaise' is distinct from '1000000' then raise exception 'replay failed %',r;end if;
r:=pg_temp.veloryz_register_creator_v1(s,q,repeat('d',64),repeat('b',64),repeat('c',64),'Synthetic test only');
if r->>'result' is distinct from 'conflict' then raise exception 'conflict failed';end if;
for i in 1..3 loop
s:=jsonb_set(s,'{requestId}',to_jsonb('c162bb72-2d79-44da-bc7f-7bf073b6293'||i::text));
r:=pg_temp.veloryz_register_creator_v1(s,q,repeat('a',64),repeat('b',64),repeat('c',64),'Synthetic test only');
if i<3 and r->>'result' is distinct from 'created' then raise exception 'rate setup failed %',r;end if;
if i=3 and r->>'result' is distinct from 'rate-limited' then raise exception 'rate limit failed %',r;end if;
end loop;
s:=jsonb_set(s,'{requestId}','"c162bb72-2d79-44da-bc7f-7bf073b62938"');
r:=pg_temp.veloryz_register_creator_v1(s,q||'{"publishedRevision":99}',repeat('a',64),repeat('e',64),repeat('f',64),'Synthetic test only');
if r->>'result' is distinct from 'price-changed' then raise exception 'price revision failed';end if;
r:=pg_temp.veloryz_register_creator_v1(s||'{"consent":false}',q,repeat('a',64),repeat('e',64),repeat('f',64),'Synthetic test only');
if r->>'result' is distinct from 'invalid' then raise exception 'consent failed';end if;
-- Force a failure in the second insert and verify subtransaction rollback.
s:=jsonb_set(s,'{requestId}','"c162bb72-2d79-44da-bc7f-7bf073b62939"');
alter table pg_temp.studio_creator_submissions add constraint synthetic_failure check(request_id<>'c162bb72-2d79-44da-bc7f-7bf073b62939');
begin
 perform pg_temp.veloryz_register_creator_v1(s,q,repeat('a',64),repeat('e',64),repeat('f',64),'Synthetic test only');
 raise exception 'expected snapshot failure';
exception when check_violation then null;
end;
if exists(select 1 from pg_temp.studio_enquiries where id=s->>'requestId') then raise exception 'partial enquiry survived';end if;
select count(*) into n from pg_temp.studio_enquiries;if n<>3 then raise exception 'enquiry count %',n;end if;
select count(*) into n from pg_temp.studio_creator_submissions;if n<>3 then raise exception 'snapshot count %',n;end if;
end;$test$;
select 'passed' as synthetic_transaction_test;
rollback;