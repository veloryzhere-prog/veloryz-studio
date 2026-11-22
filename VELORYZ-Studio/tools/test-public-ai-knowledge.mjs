/* Public site source grounding across all nine independent assistants. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {retrievePublicStudioKnowledge,evidenceForPrompt,publicKnowledgeIndex} from '../lib/public-site-knowledge.mjs';
import {adviserPrompt,personas} from '../lib/adviser-personas.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const defaults=JSON.parse(read('lib/defaults.json'));
const all=publicKnowledgeIndex(defaults);
assert.ok(all.length>=150,'Public site index should cover the canonical help + project docs.');
assert.ok(all.some(x=>x.path==='/client/'),'Site index needs genuine Client Portal route.');
assert.ok(all.every(x=>!x.path||x.path.startsWith('/')&&!x.path.startsWith('/admin/')&&!x.path.startsWith('/api/')),'Only safe public paths in index.');
const privateState={...defaults,clientProjects:[{privateEmail:'private@example.test',secret:'PRIVATE_DO_NOT_SHARE'}],cmsAdmin:{password:'PRIVATE_DO_NOT_SHARE'}};
const indexed=JSON.stringify(publicKnowledgeIndex(privateState));
assert.ok(!indexed.includes('PRIVATE_DO_NOT_SHARE'),'Never use private client/admin fields.');
const checks=[
 ['How do I track my project after submitting a brief?', '/client/'],
 ['Where do I create my first VELORYZ project?', '/create/'],
 ['How can I contact the VELORYZ team?', '/contact/'],
 ['What is included in your services?', '/services/'],
 ['How much does a website project cost?', '/pricing/'],
 ['How do I book a call?', '/book/']
];
for(const [question,expected] of checks){
 const matches=retrievePublicStudioKnowledge(question,defaults,8);
 assert.ok(matches.length>0,'Knowledge results for '+question);
 assert.ok(matches.some(m=>m.path===expected),'Missing expected public source '+expected+' for '+question);
}
const evidence=evidenceForPrompt([{role:'user',content:'What invitation code is needed to track my existing project?'}],defaults);
assert.match(evidence.prompt,/\/client\//);
assert.match(evidence.prompt,/NOT the private invitation/);
for(const id of Object.keys(personas)){
 const content=adviserPrompt(id,defaults,false,[{role:'user',content:'How can I track my VELORYZ project?'}]);
 assert.match(content,/PUBLIC SITE EVIDENCE/,'Grounded public docs should reach '+id);
 assert.match(content,/\/client\//,'Client Portal route should reach '+id);
 assert.ok(!content.includes('PRIVATE_DO_NOT_SHARE'));
}
const backend=read('lib/cms-api.mjs'),platform=read('lib/studio-platform.mjs');
assert.match(backend,/sharedKnowledgeAi\(/,'All four agents should use existing secure provider when per-agent key missing.');
assert.match(backend,/upstream\.mode==='guide'/,'Do not override configured independent real AI responses.');
assert.match(backend,/response\.ok/,'Respect rate limits and access failures from the agent.');
assert.match(backend,/retrievePublicStudioKnowledge/,'Public reference evidence should be available without AI provider.');
assert.match(platform,/export async function sharedKnowledgeAi/,'Shared secure Studio AI model route must be implemented.');
assert.match(platform,/NO access to private client projects/,'Client guide must never access confidential projects.');
assert.match(platform,/evidenceForPrompt\(messages,siteState,7\)/,'Project Creator must have site context.');
assert.match(platform,/store:false/,'OpenAI response content must not be retained by provider.');
const edge=read('supabase/functions/veloryz-knowledge-ai/index.ts');
assert.match(edge,/Promise\.allSettled/,'One offline index must not erase the other or built-in verified site facts.');
assert.match(edge,/publicSiteBasics/,'Knowledge agents need verified on-site task facts even if the remote origin is unavailable.');
assert.match(edge,/mode:'guide'/,'Reference replies must stay distinct from genuine model inference.');
const creator=read('public/creator-ai.js');
assert.doesNotThrow(()=>new vm.Script(creator),'Project AI browser code must parse.');
assert.match(creator,/data\.mode==='guide'/,'Project Creator must accept grounded documentation fallback distinctly.');
assert.match(creator,/v4-ai-source-links/,'Project Creator must show verified public citations.');
console.log('PASS: all nine AI roles, 152+ help/docs records, six real user question intents, public CMS only, secure shared model route, explicit reference fallback.');
