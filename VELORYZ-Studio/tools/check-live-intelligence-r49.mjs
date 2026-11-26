import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const origin='https://veloryz.online';
const fetchLive=(path,options={})=>fetch(origin+path,{...options,cache:'no-store',redirect:'error',signal:options.signal||AbortSignal.timeout(65000)});
const denied=await fetchLive('/api/client-portal/ai-archive');
assert.equal(denied.status,401,'Private archive must deny unauthenticated access');
console.log('PASS: unauthenticated archive returns HTTP 401');
const agents=await fetchLive('/api/knowledge-ai/agents');assert(agents.ok,'Public agent configuration service unavailable');
const {profiles}=await agents.json();
assert(Array.isArray(profiles)&&['help','support','client','creator'].every(id=>profiles.some(p=>p.id===id)));
assert(!profiles.some(p=>p.key_ciphertext||p.key_iv||p.apiKey),'Public agent response exposes credential fields');
const src=fs.readFileSync(new URL('../public/support-chat.js',import.meta.url),'utf8');
const ctx={window:{},TextEncoder,TextDecoder,fetch:async(path,opts)=>fetchLive(path,{...opts,headers:{...opts.headers,Origin:origin,'Sec-Fetch-Site':'same-origin'},signal:AbortSignal.timeout(65000)})};
vm.runInNewContext(src.slice(0,src.indexOf('/* VELORYZ Support Rooms')),ctx);
const questions={help:'Where can I find Studio documentation?',support:'How can I contact the Studio team?',client:'Is a project reference a portal invitation?',creator:'How can I plan a small first release?'};
const checks=await Promise.allSettled(Object.entries(questions).map(async([id,question])=>{
 const p=profiles.find(x=>x.id===id);if(!p.enabled)return {id,mode:'disabled',required:false};
 let deltas=0;const result=await ctx.window.VeloryzAiTransport.send(id,[{role:'user',content:question}],null,()=>deltas++);
 assert(result.answer.trim().length>0);assert(['ai','guide'].includes(result.mode));
 return {id,mode:result.mode,providerStatus:result.providerStatus||'not-reported',providerRoute:result.providerRoute||'not-reported',deltas,required:p.provider!=='guide'};
}));
let failed=false;for(const item of checks){if(item.status==='rejected'){console.error('AI probe failed:',item.reason?.message||'Unknown error');failed=true;continue}const x=item.value;console.log('R49 AI result:',JSON.stringify(x));if(x.required&&x.mode!=='ai')failed=true;}
assert(!failed,'One or more enabled live-model assistants did not produce actual inference. Check safe provider diagnostics.');
console.log('PASS: four assistant routes obey configuration and live-model verification.');
