/* Knowledge AI release verification — all checks run without real provider secrets. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=x=>readFileSync(resolve(root,x),'utf8');
const has=(path,pattern)=>assert.ok(read(path).includes(pattern),path+' missing '+pattern);
const scripts=['public/support-chat.js','public/creator-ai.js','public/client-portal.js','public/knowledge-v4.js','public/admin-knowledge-ai.js','public/admin.js','public/app.js'];
for(const path of scripts)assert.doesNotThrow(()=>new Function(read(path)),'Invalid browser JS: '+path);
const backend=read('supabase/functions/veloryz-knowledge-ai/index.ts'),route=read('lib/cms-api.mjs'),app=read('public/app.js');
const migration=read('supabase/migrations/20261121193500_veloryz_knowledge_ai_profiles.sql');
for(const id of ['help','support','client','creator']){
 assert.ok(migration.includes("('"+id+"'"),'Missing seeded agent '+id);
 assert.ok(backend.includes(id),'Backend does not support '+id);
 assert.ok(app.includes(id==='help'?'/help/assistant/':id==='support'?'/support/':id==='client'?'/client/':'/create/'),'Missing agent navigation '+id);
}
for(const path of ['public/support-chat.js','public/support-chat.css','public/admin-knowledge-ai.js','public/admin-knowledge-ai.css', 'supabase/functions/veloryz-knowledge-ai/index.ts','supabase/migrations/20261121193500_veloryz_knowledge_ai_profiles.sql'])assert.ok(existsSync(resolve(root,path)),'Missing release file '+path);
assert.ok(backend.includes('AES-GCM')&&backend.includes('HKDF'),'Per-agent secrets must be encrypted');
assert.ok(!backend.includes('console.log('),'Backend must not log transcripts');
assert.ok(backend.includes('store:false'),'OpenAI calls must explicitly disable response storage');
assert.ok(backend.includes('max_output_tokens:550'),'Bound external response size');
assert.ok(backend.includes('raw.length>18'),'Bound input conversation length');
assert.ok(backend.includes('deeperEvidence('),'Use public article excerpts as grounding');
assert.ok(backend.includes('mode:\'guide\''),'Preserve clear non-AI fallback');
assert.ok(backend.includes('veloryz_knowledge_ai_rate'),'Enforce distributed rate limiting');
assert.ok(backend.includes('veloryz_knowledge_ai_usage'),'Maintain aggregate usage reporting');
assert.ok(backend.includes("provider!==a.provider"),'Prevent previous provider keys being reused for a different API');
assert.ok(migration.includes('enable row level security'),'Private profile RLS must exist');
assert.ok(migration.includes('revoke all')&&migration.includes('from public,anon,authenticated'),'Public roles must not access assistant profiles');
assert.ok(backend.includes("admin/ai/settings"),'Owner authorization must use verified existing session');
assert.ok(route.includes('forwardKnowledgeAi(request)'),'Cloudflare proxy to Supabase AI missing');
assert.ok(route.includes("adminAllowed")&&route.includes("publicAllowed"),'Proxy method allowlists are required');
has('lib/site-shell.ts','support-chat.js?v=20261121-multi-agent-v3');
has('lib/site-shell.ts','creator-ai.js?v=20261121-multi-agent-v3');
has('lib/client-portal-shell.ts','support-chat.js?v=20261121-multi-agent-v3');
has('lib/admin-shell.ts','admin-knowledge-ai.js?v=20261121-multi-agent-v1');
has('public/admin.js',"'knowledge-ai':knowledgeAiAdmin");
has('public/client-portal.js','["ai","AI Guide","chat"]');
has('public/creator-ai.js',"agent:'creator'");
has('public/knowledge-v4.js','/help/assistant/');
has('public/knowledge-v4.js','/support/');
assert.ok(app.includes('vz-footer-help'),'Need Help card must be available sitewide');
assert.ok(app.includes('consultationSuppressed()'),'Consultation auto-popup preference must be respected');
assert.ok(app.includes("localStorage.setItem('veloryz.consultation.no-auto'"),'Opt-out must persist on device');
assert.ok(app.includes("!consultationSuppressed()&&!modalOpen"),'Already scheduled popup must respect user opt-out');
const listeners={},fakeDocument={addEventListener:(name,fn)=>{listeners[name]=fn},querySelector:()=>null,querySelectorAll:()=>[]};
const fakeWindow={},fakeLocation={pathname:'/help/assistant/',search:'',href:'https://veloryz.online/help/assistant/'},fakeSession={getItem:()=>null,setItem:()=>{}};
new Function('window','document','location','sessionStorage','fetch',read('public/support-chat.js'))(
 fakeWindow,fakeDocument,fakeLocation,fakeSession,async()=>({ok:false})
);
for(const agent of ['help','support','client','creator']){
 const html=fakeWindow.VeloryzSupportChat.render(agent,{embed:agent==='client'});
 assert.ok(html.includes('data-vz-chat="'+agent+'"'),'Agent chat shell missing '+agent);
 assert.ok(html.includes('data-vz-form'),'Chat composer missing');
 assert.ok(html.includes('Main-Dark-Ink-Transparent.webp'),'Official logo missing');
 assert.ok(html.includes('data-vz-reset'),'New-chat action missing');
 assert.ok(!html.includes('modal-backdrop'),'Assistant must not be a popup');
}
assert.ok(fakeWindow.VeloryzSupportChat.render('client',{embed:true}).includes('is-embedded'),'Client assistant must be portal integrated');
assert.ok(read('public/support-chat.css').includes('prefers-reduced-motion'),'Respect reduced-motion needs');
console.log('Knowledge AI source checks passed: isolated profiles, secrets, real chat, fallback, admin, portal and consultation preference.');
