-- R52.2.6: staged read contract, run only after R52.2.4 table migration.
begin;
create function public.veloryz_list_creator_v1(p_status text,p_query text,p_page integer)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
 with matching as (
  select e.id,e.reference,e.name,e.email,e.phone,e.company,e.status,e.budget,e.created_at,
   e.service,e.message,s.brief,s.quote,s.brief->'brief'->>'category' as category,
   e.acceptance_status,e.accepted_project_id
  from veloryz_studio.studio_creator_submissions s
  join veloryz_studio.studio_enquiries e on e.id=s.request_id
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
revoke all on function public.veloryz_list_creator_v1(text,text,integer) from public,anon,authenticated;
grant execute on function public.veloryz_list_creator_v1(text,text,integer) to service_role;
commit;
