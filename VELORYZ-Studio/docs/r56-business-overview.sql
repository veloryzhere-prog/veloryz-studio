-- R52.6.1: owner-only operational overview. No customer PII or credential material.
create function public.veloryz_business_overview_v1()
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
with registration as (
 select count(*) as total,count(*) filter(where e.status<>'closed' and e.acceptance_status<>'accepted') as pending,
 count(*) filter(where e.acceptance_status='accepted' and e.status<>'closed') as accepted,
 count(*) filter(where e.status='closed') as closed
 from veloryz_studio.studio_creator_submissions r join veloryz_studio.studio_enquiries e on e.id=r.request_id
), identities as (
 select count(*) as total,count(*) filter(where identity_status='verified') as verified from veloryz_studio.studio_client_identities
), rooms as (
 select count(*) as total,count(*) filter(where status in ('planning','in-progress','in-review','on-hold')) as active from veloryz_studio.studio_client_projects
), bills as (
 select b.id,b.due_date,q.amount_paise,q.snapshot->>'reference' as reference,
 coalesce((select sum(r.amount_paise) from veloryz_studio.studio_commercial_receipts r where r.invoice_id=b.id),0) as paid
 from veloryz_studio.studio_commercial_invoices b join veloryz_studio.studio_commercial_quotes q on q.id=b.quote_id
), finance as (
 select (select count(*) from veloryz_studio.studio_commercial_quotes) as quotes,count(*) as bills,
 coalesce(sum(amount_paise),0) as billed_paise,coalesce(sum(paid),0) as recorded_paise,
 coalesce(sum(amount_paise-paid),0) as outstanding_paise,
 count(*) filter(where due_date<(now() at time zone 'Asia/Kolkata')::date and amount_paise>paid) as overdue,
 count(*) filter(where exists(select 1 from veloryz_studio.studio_payments p where p.reference=bills.reference)) as overlap
 from bills
), legacy as (
 select count(*) as requests,count(*) filter(where status='paid') as paid_marked from veloryz_studio.studio_payments
), billing_mail as (
 select count(*) filter(where state='pending') as pending,count(*) filter(where state='sending' and claimed_at>=now()-interval '15 minutes') as sending,
 count(*) filter(where state='sending' and (claimed_at is null or claimed_at<now()-interval '15 minutes')) as stalled,
 count(*) filter(where state='uncertain') as uncertain,count(*) filter(where state='held') as held,count(*) filter(where state='sent') as sent
 from veloryz_studio.studio_commercial_mail_jobs
)
select jsonb_build_object('source','business-overview-v1','observed_at',now(),'registration',(select to_jsonb(registration) from registration),'identities',(select to_jsonb(identities) from identities),'rooms',(select to_jsonb(rooms) from rooms),'finance',(select to_jsonb(finance) from finance),'legacy',(select to_jsonb(legacy) from legacy),'onboarding',public.veloryz_onboarding_status_v1(null)->'counts','access',public.veloryz_access_status_v1(),'billing_mail',(select to_jsonb(billing_mail) from billing_mail))
$$;
revoke all on function public.veloryz_business_overview_v1() from public,anon,authenticated;
grant execute on function public.veloryz_business_overview_v1() to service_role;
notify pgrst,'reload schema';