-- R52.5.2: access delivery status, no raw tokens.
create function public.veloryz_access_status_v1()
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
select jsonb_build_object(
'eligible',(select count(*) from veloryz_studio.studio_pending_workspaces w join veloryz_studio.studio_client_identities i on i.id=w.client_id join veloryz_studio.studio_enquiries e on e.id=w.request_id join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference where w.state='pending-review' and i.identity_status='verified' and i.verified_at is not null and e.acceptance_status='accepted' and e.status<>'closed' and p.client_email=i.email_at_registration and not exists(select 1 from veloryz_studio.studio_access_delivery_jobs j where j.workspace_id=w.id or j.project_id=p.id) and not exists(select 1 from veloryz_studio.studio_client_invites j where j.project_id=p.id) and not exists(select 1 from veloryz_studio.studio_client_sessions s where s.project_id=p.id)),
'sending',(select count(*) from veloryz_studio.studio_access_delivery_jobs where state='sending' and created_at>=now()-interval '15 minutes'),
'stalled',(select count(*) from veloryz_studio.studio_access_delivery_jobs where state='sending' and created_at<now()-interval '15 minutes'),
'sent',(select count(*) from veloryz_studio.studio_access_delivery_jobs where state='sent'),
'uncertain',(select count(*) from veloryz_studio.studio_access_delivery_jobs where state='uncertain'))
$$;
revoke all on function public.veloryz_access_status_v1() from public,anon,authenticated;
grant execute on function public.veloryz_access_status_v1() to service_role;
notify pgrst,'reload schema';