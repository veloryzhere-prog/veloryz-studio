-- VELORYZ Knowledge AI: dedicated per-role encrypted provider settings and privacy-safe usage counters.
-- All records live in the isolated Studio schema; no public Data API table grants.
create table if not exists veloryz_studio.studio_ai_agents (
 id text primary key check (id in ('help','support','client','creator')),
 name text not null,
 enabled boolean not null default true,
 provider text not null default 'gemini' check (provider in ('gemini','openai','guide')),
 model text not null default 'gemini-2.5-flash',
 instructions text not null default '',
 welcome text not null default '',
 suggestions jsonb not null default '[]'::jsonb,
 key_ciphertext text not null default '',
 key_iv text not null default '',
 version integer not null default 0,
 updated_at timestamptz not null default now()
);
create table if not exists veloryz_studio.studio_ai_limits (
 fingerprint text not null,
 agent text not null,
 bucket timestamptz not null,
 used integer not null default 1,
 primary key (fingerprint,agent,bucket)
);
create table if not exists veloryz_studio.studio_ai_usage (
 day date not null default current_date,
 agent text not null,
 result text not null,
 total integer not null default 0,
 primary key (day,agent,result)
);
alter table veloryz_studio.studio_ai_agents enable row level security;
alter table veloryz_studio.studio_ai_limits enable row level security;
alter table veloryz_studio.studio_ai_usage enable row level security;
revoke all on veloryz_studio.studio_ai_agents,veloryz_studio.studio_ai_limits,veloryz_studio.studio_ai_usage from public,anon,authenticated;
insert into veloryz_studio.studio_ai_agents (id,name,provider,model,instructions,welcome,suggestions) values
('help','VELORYZ Help Assistant','gemini','gemini-2.5-flash','Answer product and documentation questions accurately. Cite only supplied VELORYZ documentation links.','Hello! I’m the VELORYZ Help Assistant. What can I help you find today?', '["How do I start a project?","How does the client portal work?","Help me troubleshoot a problem"]'::jsonb),
('support','VELORYZ Contact Support','gemini','gemini-2.5-flash','Help users with contact, project support and escalation. Never claim a ticket or appointment was created.','Welcome to VELORYZ Support. Tell me what you need help with.', '["I need to contact the team","My project needs attention","How do I request a consultation?"]'::jsonb),
('client','VELORYZ Client Guide','gemini','gemini-2.5-flash','Help clients navigate their workspace and project lifecycle without reading or revealing private records.','Hi! I can guide you around your client workspace.', '["How do approvals work?","Where are my project files?","How can I message the studio team?"]'::jsonb),
('creator','VELORYZ Project Planner','gemini','gemini-2.5-flash','Help visitors define project requirements and trade-offs; never promise a quote, delivery date or acceptance.','Let’s shape your idea. What would you like to build?', '["Help me scope my website","What should I include in my brief?","How can I prioritize features?"]'::jsonb)
on conflict (id) do nothing;

-- Server only: Edge Function calls as service_role. Explicit EXECUTE privileges protect private configuration.
create or replace function public.veloryz_knowledge_ai_list()
returns jsonb language sql security definer set search_path = pg_catalog as $$
 select coalesce(jsonb_agg(to_jsonb(p) order by p.id),'[]'::jsonb)
 from veloryz_studio.studio_ai_agents p;
$$;
revoke all on function public.veloryz_knowledge_ai_list() from public,anon,authenticated;
grant execute on function public.veloryz_knowledge_ai_list() to service_role;

create or replace function public.veloryz_knowledge_ai_save(p_agent text,p_config jsonb,p_version integer)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v veloryz_studio.studio_ai_agents%rowtype;
begin
 if p_agent not in ('help','support','client','creator') or p_version < 0 then
   raise exception 'Invalid profile or revision';
 end if;
 update veloryz_studio.studio_ai_agents set
  name=coalesce(p_config->>'name',name),
  enabled=coalesce((p_config->>'enabled')::boolean,enabled),
  provider=coalesce(p_config->>'provider',provider),
  model=coalesce(p_config->>'model',model),
  instructions=coalesce(p_config->>'instructions',instructions),
  welcome=coalesce(p_config->>'welcome',welcome),
  suggestions=coalesce(p_config->'suggestions',suggestions),
  key_ciphertext=case when p_config?'key_ciphertext' then p_config->>'key_ciphertext' else key_ciphertext end,
  key_iv=case when p_config?'key_iv' then p_config->>'key_iv' else key_iv end,
  version=version+1,updated_at=now()
 where id=p_agent and version=p_version returning * into v;
 if not found then raise exception 'Profile changed in another tab or is missing'; end if;
 return to_jsonb(v);
end $$;
revoke all on function public.veloryz_knowledge_ai_save(text,jsonb,integer) from public,anon,authenticated;
grant execute on function public.veloryz_knowledge_ai_save(text,jsonb,integer) to service_role;

create or replace function public.veloryz_knowledge_ai_rate(p_fingerprint text,p_agent text)
returns integer language plpgsql security definer set search_path=pg_catalog as $$
declare n integer;
begin
 if length(p_fingerprint)<>64 or p_agent not in ('help','support','client','creator') then raise exception 'Invalid rate limit identity'; end if;
 insert into veloryz_studio.studio_ai_limits(fingerprint,agent,bucket,used)
 values (p_fingerprint,p_agent,date_trunc('hour',now()),1)
 on conflict (fingerprint,agent,bucket) do update set used=veloryz_studio.studio_ai_limits.used+1
 returning used into n;
 return n;
end $$;
revoke all on function public.veloryz_knowledge_ai_rate(text,text) from public,anon,authenticated;
grant execute on function public.veloryz_knowledge_ai_rate(text,text) to service_role;

create or replace function public.veloryz_knowledge_ai_usage(p_agent text,p_result text)
returns void language plpgsql security definer set search_path=pg_catalog as $$
begin
 if p_agent not in ('help','support','client','creator') or p_result not in ('success','unavailable','error','limited') then return; end if;
 insert into veloryz_studio.studio_ai_usage(day,agent,result,total) values(current_date,p_agent,p_result,1)
 on conflict(day,agent,result) do update set total=veloryz_studio.studio_ai_usage.total+1;
end $$;
revoke all on function public.veloryz_knowledge_ai_usage(text,text) from public,anon,authenticated;
grant execute on function public.veloryz_knowledge_ai_usage(text,text) to service_role;

create or replace function public.veloryz_knowledge_ai_report()
returns jsonb language sql security definer set search_path=pg_catalog as $$
select coalesce(jsonb_agg(to_jsonb(u) order by u.day desc,u.agent,u.result),'[]'::jsonb)
from (select day,agent,result,total from veloryz_studio.studio_ai_usage where day>=current_date-30) u;
$$;
revoke all on function public.veloryz_knowledge_ai_report() from public,anon,authenticated;
grant execute on function public.veloryz_knowledge_ai_report() to service_role;
