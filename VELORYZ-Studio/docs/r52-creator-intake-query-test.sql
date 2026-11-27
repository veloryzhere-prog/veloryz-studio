
begin;
set local statement_timeout='12s';
create temp table studio_enquiries(id text primary key,reference text,name text,email text,phone text,company text,status text,budget text,created_at text,service text,message text,acceptance_status text,accepted_project_id text) on commit drop;
create temp table studio_creator_submissions(request_id text primary key,brief jsonb,quote jsonb) on commit drop;
insert into pg_temp.studio_enquiries(id,reference,name,email,status,created_at,service) select 'fake-'||i,'VZ-TEST-'||i,'Synthetic '||i,'sample@example.test',case when i%2=0 then 'new' else 'closed' end, '2026-11-27','Custom project' from generate_series(1,28) i;
insert into pg_temp.studio_creator_submissions select 'fake-'||i,'{"brief":{"category":"Business"},"consent":true}'::jsonb,'{"currency":"INR","lowPaise":10000}'::jsonb from generate_series(1,27) i;
create function pg_temp.veloryz_list_creator_v1(p_status text,p_query text,p_page integer)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
 with matching as (
  select e.id,e.reference,e.name,e.email,e.phone,e.company,e.status,e.budget,e.created_at,
   e.service,e.message,s.brief,s.quote,s.brief->'brief'->>'category' as category,
   e.acceptance_status,e.accepted_project_id
  from pg_temp.studio_creator_submissions s
  join pg_temp.studio_enquiries e on e.id=s.request_id
  where p_status in ('all','new','contacted','confirmed','closed')
    and (p_status='all' or e.status=p_status)
    and p_page between 0 and 10000
    and length(coalesce(p_query,''))<=120
    and (coalesce(p_query,'')='' or strpos(lower(concat_ws(' ',e.reference,e.name,e.email,e.company,e.service,s.brief->'brief'->>'category')),lower(p_query))>0)
 ), page_rows as (
  select * from matching order by created_at desc,id desc limit 25 offset (greatest(0,least(10000,coalesce(p_page,0)))*25)
 )
 select jsonb_build_object('source','structured-v1','total',(select count(*) from matching),
 'items',coalesce((select jsonb_agg(to_jsonb(page_rows) order by created_at desc,id desc) from page_rows),'[]'::jsonb))
$$;

do $t$ declare r jsonb; begin
 r:=pg_temp.veloryz_list_creator_v1('all','',0);
 if r->>'total'<>'27' or jsonb_array_length(r->'items')<>25 then raise exception 'page 1'; end if;
 r:=pg_temp.veloryz_list_creator_v1('all','',1);
 if r->>'total'<>'27' or jsonb_array_length(r->'items')<>2 then raise exception 'page 2';end if;
 r:=pg_temp.veloryz_list_creator_v1('new','Business',0);
 if r->>'total'<>'13' then raise exception 'status search';end if;
 r:=pg_temp.veloryz_list_creator_v1('all','VZ-TEST-28',0);
 if r->>'total'<>'0' then raise exception 'legacy exclusion';end if;
 r:=pg_temp.veloryz_list_creator_v1('all','%',0);
 if r->>'total'<>'0' then raise exception 'literal search';end if;
 r:=pg_temp.veloryz_list_creator_v1('all','sample@example.test',0);
 if r->>'total'<>'27' then raise exception 'email search';end if;
 end;$t$;
select 'passed' as synthetic_intake_query;
rollback;