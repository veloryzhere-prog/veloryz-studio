-- R52.5.1 — delivery observability. No send, retry, or status mutation.
begin;
create function public.veloryz_onboarding_status_v1(p_workspace uuid default null)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
with counts as (
 select count(*) filter(where m.state='pending' and w.state='pending-review' and e.status<>'closed') as pending,
 count(*) filter(where m.state='pending' and (w.state<>'pending-review' or e.status='closed')) as held,
 count(*) filter(where m.state='sending' and m.claimed_at>=now()-interval '15 minutes') as sending,
 count(*) filter(where m.state='sending' and (m.claimed_at is null or m.claimed_at<now()-interval '15 minutes')) as stalled,
 count(*) filter(where m.state='sent') as sent,
 count(*) filter(where m.state='uncertain') as uncertain,
 count(*) filter(where m.state='cancelled') as cancelled
 from veloryz_studio.studio_onboarding_mail_jobs m
 join veloryz_studio.studio_pending_workspaces w on w.id=m.workspace_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id
 where p_workspace is null or m.workspace_id=p_workspace
), jobs as (
 select m.kind,m.state,m.created_at,m.claimed_at,m.finished_at,
 case when m.state='sending' and (m.claimed_at is null or m.claimed_at<now()-interval '15 minutes') then 'stalled-review'
 when m.state='pending' and (w.state<>'pending-review' or e.status='closed') then 'held'
 else m.state end as display_state
 from veloryz_studio.studio_onboarding_mail_jobs m
 join veloryz_studio.studio_pending_workspaces w on w.id=m.workspace_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id
 where p_workspace is not null and m.workspace_id=p_workspace
)
select jsonb_build_object('source','onboarding-status-v1','counts',(select to_jsonb(counts) from counts),'jobs',coalesce((select jsonb_agg(to_jsonb(jobs) order by created_at,kind) from jobs),'[]'::jsonb))
$$;
revoke all on function public.veloryz_onboarding_status_v1(uuid) from public,anon,authenticated;
grant execute on function public.veloryz_onboarding_status_v1(uuid) to service_role;
commit;
