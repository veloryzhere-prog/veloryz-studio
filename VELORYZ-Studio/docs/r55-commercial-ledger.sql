-- R52.5.3 commercial ledger. Not GST invoice issuance or gateway reconciliation.
begin;
create table veloryz_studio.studio_commercial_quotes(
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null unique references veloryz_studio.studio_pending_workspaces(id) on delete restrict,
 project_id text not null unique,
 quote_code text generated always as ('VZ-QT-'||upper(replace(id::text,'-',''))) stored unique,
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 amount_paise bigint not null check(amount_paise between 1 and 100000000000),
 agreement_reference text not null check(length(agreement_reference) between 3 and 250),
 created_at timestamptz not null default now()
);
create table veloryz_studio.studio_commercial_invoices(
 id uuid primary key default gen_random_uuid(),
 quote_id uuid not null unique references veloryz_studio.studio_commercial_quotes(id) on delete restrict,
 invoice_code text generated always as ('VZ-BIL-'||upper(replace(id::text,'-',''))) stored unique,
 due_date date not null,
 created_at timestamptz not null default now()
);
create table veloryz_studio.studio_commercial_receipts(
 id uuid primary key,
 invoice_id uuid not null references veloryz_studio.studio_commercial_invoices(id) on delete restrict,
 amount_paise bigint not null check(amount_paise between 1 and 100000000000),
 receipt_reference text not null unique check(length(receipt_reference) between 3 and 160),
 created_at timestamptz not null default now()
);
alter table veloryz_studio.studio_commercial_quotes enable row level security;
alter table veloryz_studio.studio_commercial_invoices enable row level security;
alter table veloryz_studio.studio_commercial_receipts enable row level security;
revoke all on table veloryz_studio.studio_commercial_quotes,veloryz_studio.studio_commercial_invoices,veloryz_studio.studio_commercial_receipts from public,anon,authenticated,service_role;
grant select,insert on table veloryz_studio.studio_commercial_quotes,veloryz_studio.studio_commercial_invoices,veloryz_studio.studio_commercial_receipts to service_role;
-- No mutable balance: receipt sums are authoritative. External evidence explicitly attested by owner.
create function public.veloryz_commercial_read_v1(p_workspace uuid)
returns jsonb language sql stable security invoker set search_path=pg_catalog as $$
select jsonb_build_object('source','commercial-v1','quote',to_jsonb(q),'invoice',to_jsonb(b),
 'paid_paise',coalesce((select sum(r.amount_paise) from veloryz_studio.studio_commercial_receipts r where r.invoice_id=b.id),0),
 'balance_paise',case when b.id is null then null else q.amount_paise-coalesce((select sum(r.amount_paise) from veloryz_studio.studio_commercial_receipts r where r.invoice_id=b.id),0) end,
 'receipt_count',(select count(*) from veloryz_studio.studio_commercial_receipts r where r.invoice_id=b.id),
 'receipts',coalesce((select jsonb_agg(to_jsonb(rr) order by rr.created_at desc,rr.id) from (select id,amount_paise,receipt_reference,created_at from veloryz_studio.studio_commercial_receipts where invoice_id=b.id order by created_at desc,id limit 50) rr),'[]'::jsonb))
from veloryz_studio.studio_pending_workspaces w left join veloryz_studio.studio_commercial_quotes q on q.workspace_id=w.id
left join veloryz_studio.studio_commercial_invoices b on b.quote_id=q.id where w.id=p_workspace
$$;
create function public.veloryz_commercial_approve_v1(p_workspace uuid,p_amount bigint,p_agreement text,p_scope text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare rec record; oldq veloryz_studio.studio_commercial_quotes%rowtype;
begin
 if p_workspace is null or p_amount is null or p_amount not between 1 and 100000000000 or length(btrim(coalesce(p_agreement,''))) not between 3 and 250 or length(btrim(coalesce(p_scope,''))) not between 10 and 2000 then return jsonb_build_object('result','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-commercial:'||p_workspace::text,0));
 select * into oldq from veloryz_studio.studio_commercial_quotes where workspace_id=p_workspace;
 if found then
 if oldq.amount_paise=p_amount and oldq.agreement_reference=btrim(p_agreement) and oldq.snapshot->>'scope'=btrim(p_scope) then return jsonb_build_object('result','ready');end if;
 return jsonb_build_object('result','conflict');end if;
 select w.project_code,i.client_code,i.name_at_registration,i.email_at_registration,e.reference,p.id as pid,p.title into rec
 from veloryz_studio.studio_pending_workspaces w join veloryz_studio.studio_client_identities i on i.id=w.client_id
 join veloryz_studio.studio_enquiries e on e.id=w.request_id join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference
 where w.id=p_workspace and w.state='pending-review' and i.identity_status='verified' and i.verified_at is not null and e.status<>'closed' and e.acceptance_status='accepted' and p.client_email=i.email_at_registration;
 if not found then return jsonb_build_object('result','ineligible');end if;
 -- Do not double bill projects with existing payment requests in the legacy ledger.
 if exists(select 1 from veloryz_studio.studio_payments where reference=rec.reference) then return jsonb_build_object('result','legacy-payment-review');end if;
 insert into veloryz_studio.studio_commercial_quotes(workspace_id,project_id,amount_paise,agreement_reference,snapshot)
 values(p_workspace,rec.pid,p_amount,btrim(p_agreement),jsonb_build_object('client_code',rec.client_code,'project_code',rec.project_code,'reference',rec.reference,'name',rec.name_at_registration,'email',rec.email_at_registration,'title',rec.title,'scope',btrim(p_scope),'currency','INR'));
 return jsonb_build_object('result','ready');
end;$$;
create function public.veloryz_commercial_issue_v1(p_workspace uuid,p_due date)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare q veloryz_studio.studio_commercial_quotes%rowtype; b veloryz_studio.studio_commercial_invoices%rowtype;
begin
 if p_workspace is null or p_due is null then return jsonb_build_object('result','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-commercial:'||p_workspace::text,0));
 select * into q from veloryz_studio.studio_commercial_quotes where workspace_id=p_workspace;
 if not found then return jsonb_build_object('result','ineligible');end if;
 select * into b from veloryz_studio.studio_commercial_invoices where quote_id=q.id;
 if found then return jsonb_build_object('result',case when b.due_date=p_due then 'ready' else 'conflict' end);end if;
 if p_due<(now() at time zone 'Asia/Kolkata')::date or p_due>(now() at time zone 'Asia/Kolkata')::date+365 then return jsonb_build_object('result','invalid');end if;
 if not exists(select 1 from veloryz_studio.studio_pending_workspaces w join veloryz_studio.studio_client_identities i on i.id=w.client_id join veloryz_studio.studio_enquiries e on e.id=w.request_id join veloryz_studio.studio_client_projects p on p.id=e.accepted_project_id and p.enquiry_id=e.id and p.request_reference=e.reference where w.id=p_workspace and p.id=q.project_id and w.state='pending-review' and e.status<>'closed' and e.acceptance_status='accepted' and i.identity_status='verified' and i.email_at_registration=p.client_email and p.client_email=q.snapshot->>'email') then return jsonb_build_object('result','ineligible');end if;
 if exists(select 1 from veloryz_studio.studio_payments where reference=q.snapshot->>'reference') then return jsonb_build_object('result','legacy-payment-review');end if;
 insert into veloryz_studio.studio_commercial_invoices(quote_id,due_date) values(q.id,p_due);
 return jsonb_build_object('result','ready');
end;$$;
create function public.veloryz_commercial_record_v1(p_workspace uuid,p_id uuid,p_amount bigint,p_reference text)
returns jsonb language plpgsql security invoker set search_path=pg_catalog as $$
declare q veloryz_studio.studio_commercial_quotes%rowtype; b veloryz_studio.studio_commercial_invoices%rowtype; prev veloryz_studio.studio_commercial_receipts%rowtype; paid bigint; ref text:=lower(btrim(coalesce(p_reference,'')));
begin
 if p_workspace is null or p_id is null or p_amount is null or p_amount<1 or length(ref) not between 3 and 160 then return jsonb_build_object('result','invalid');end if;
 perform pg_advisory_xact_lock(hashtextextended('vz-commercial:'||p_workspace::text,0));
 select * into q from veloryz_studio.studio_commercial_quotes where workspace_id=p_workspace;
 select * into b from veloryz_studio.studio_commercial_invoices where quote_id=q.id;
 if b.id is null then return jsonb_build_object('result','ineligible');end if;
 select * into prev from veloryz_studio.studio_commercial_receipts where id=p_id or receipt_reference=ref limit 1;
 if found then return jsonb_build_object('result',case when prev.invoice_id=b.id and prev.amount_paise=p_amount and prev.receipt_reference=ref and prev.id=p_id then 'ready' else 'conflict' end);end if;
 select coalesce(sum(amount_paise),0) into paid from veloryz_studio.studio_commercial_receipts where invoice_id=b.id;
 if p_amount>q.amount_paise-paid then return jsonb_build_object('result','overpayment');end if;
 if exists(select 1 from veloryz_studio.studio_payments where reference=q.snapshot->>'reference' or lower(btrim(receipt_reference))=ref) then return jsonb_build_object('result','legacy-payment-review');end if;
 insert into veloryz_studio.studio_commercial_receipts(id,invoice_id,amount_paise,receipt_reference) values(p_id,b.id,p_amount,ref) on conflict do nothing;
 if not found then return jsonb_build_object('result','conflict');end if;
 return jsonb_build_object('result','ready');
end;$$;
revoke all on function public.veloryz_commercial_read_v1(uuid),public.veloryz_commercial_approve_v1(uuid,bigint,text,text),public.veloryz_commercial_issue_v1(uuid,date),public.veloryz_commercial_record_v1(uuid,uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.veloryz_commercial_read_v1(uuid),public.veloryz_commercial_approve_v1(uuid,bigint,text,text),public.veloryz_commercial_issue_v1(uuid,date),public.veloryz_commercial_record_v1(uuid,uuid,bigint,text) to service_role;
commit;
