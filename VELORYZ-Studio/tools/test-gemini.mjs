import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {handleApi} from '../lib/cms-api.mjs';
import {passwordHash} from '../lib/studio-platform.mjs';
import {personas,adviserPrompt} from '../lib/adviser-personas.mjs';
import defaults from '../lib/defaults.json' with {type:'json'};
const sqlite=new DatabaseSync(':memory:');
for(const file of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}};}};}};
const password=crypto.randomUUID(),salt='f'.repeat(32),key='synthetic-gemini-test-key-'+crypto.randomUUID();
const env={DB,BUCKET:{},ADMIN_EMAIL:'owner@example.test',ADMIN_SESSION_SECRET:crypto.randomUUID(),ADMIN_PASSWORD_HASH:'100000:'+salt+':'+await passwordHash(password,salt)};
const owner={'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'};
async function call(path,body,headers={},method=body?'POST':'GET'){
 const response=await handleApi(new Request('https://studio.test'+path,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}),env);
 return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')};
}
const settings='/api/admin/ai/settings';
assert.equal((await call(settings)).status,401);
assert.equal((await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite',apiKey:key,version:-1},{},'PUT')).status,401);
const unlock=await call('/api/admin/unlock',{password},owner);assert.equal(unlock.status,200);
const admin={...owner,cookie:unlock.cookie.split(';')[0]};
const metadata=await call(settings,null,admin);assert.equal(metadata.data.provider,'gemini');assert.equal(metadata.data.version,-1);assert.equal(metadata.data.configured,false);
assert.equal((await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite',apiKey:key,version:-1},{...admin,origin:'https://evil.test'},'PUT')).status,403);
assert.equal((await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite/../../evil',apiKey:key,version:-1},admin,'PUT')).status,400);
assert.equal((await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite',apiKey:'short',version:-1},admin,'PUT')).status,400);
const save=await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite',apiKey:key,version:-1},admin,'PUT');assert.equal(save.status,200);assert.equal(save.data.version,0);assert.equal(save.data.configured,true);assert.equal(save.data.source,'encrypted-owner-setting');assert(!JSON.stringify(save).includes(key));
const stored=sqlite.prepare('SELECT * FROM studio_ai_settings').get();assert(!stored.key_ciphertext.includes(key));assert.equal(stored.key_iv.length,24);assert(stored.key_ciphertext.length>64);
for(const table of ['cms_state','cms_history'])assert(!JSON.stringify(sqlite.prepare('SELECT * FROM '+table).all()).includes(key),'provider secret stays outside CMS documents/history');
assert.equal((await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite',version:-1},admin,'PUT')).status,409);
const originalFetch=globalThis.fetch;let request;
try{
 globalThis.fetch=async (url,options)=>{
  assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');assert(!url.includes(key));assert.equal(options.headers['x-goog-api-key'],key);assert.equal(options.headers.Authorization,undefined);
  request=JSON.parse(options.body);assert(request.generationConfig.maxOutputTokens>=1024);
  return Response.json({candidates:[{content:{parts:[{text:'Hidden internal reasoning',thought:true},{text:'I’d start with your product pages, checkout and admin flow. How many products are you planning to launch with?'}]},finishReason:'STOP'}]});
 };
 const chat=await call('/api/adviser',{agent:'ritik',messages:[{role:'user',content:'I want an online store.'}]});
 assert.equal(chat.status,200);assert.equal(chat.data.mode,'ai');assert.equal(chat.data.provider,undefined,'public replies must not reveal the internal engine');assert.equal(chat.data.agent,'Ritik');assert.match(chat.data.answer,/checkout and admin flow/);assert(!chat.data.answer.includes('Hidden internal reasoning'));assert(!JSON.stringify(chat).includes(key));
 assert.match(request.systemInstruction.parts[0].text,/You are Ritik/);assert.match(request.systemInstruction.parts[0].text,/Technically careful/i);assert.match(request.systemInstruction.parts[0].text,/Do not pretend to be a real human/);assert.match(request.systemInstruction.parts[0].text,/greetings get greetings/);
 assert.equal(request.contents[0].role,'user');
 await call('/api/adviser',{agent:'ritik',messages:[{role:'user',content:'I want a store.'},{role:'assistant',content:'How many products?'},{role:'user',content:'About twenty.'}]});
 assert.deepEqual(request.contents.map(m=>m.role),['user','model','user']);assert.equal(request.contents[2].parts[0].text,'About twenty.');
 await call('/api/adviser',{agent:'milky',messages:[{role:'user',content:'I want a premium design.'}]});assert.match(request.systemInstruction.parts[0].text,/You are Milky/);assert.match(request.systemInstruction.parts[0].text,/creative|design/i);
 const publicState=(await call('/api/platform')).data;assert.equal(publicState.aiAvailable,true);assert.equal(publicState.aiProvider,undefined,'public status must not reveal the internal engine');assert(!JSON.stringify(publicState).includes(key));
 globalThis.fetch=async()=>Response.json({error:{code:429,status:'RESOURCE_EXHAUSTED',message:'Quota exceeded '+key}},{status:429});
 const limited=await call('/api/admin/ai/check',{},admin);assert.equal(limited.data.status,'quota');assert(!JSON.stringify(limited).includes(key));
 const fallback=await call('/api/adviser',{agent:'nikhil',messages:[{role:'user',content:'What does a portfolio cost?'}]});assert.equal(fallback.status,503);assert.equal(fallback.data.mode,'unavailable');assert.equal(fallback.data.answer,undefined);assert.equal((await call('/api/platform')).data.aiAvailable,false);
 const oldCipher=stored.key_ciphertext;
 assert.equal((await call(settings,{provider:'gemini',model:'gemini-3.5-flash-lite',apiKey:key,version:0},admin,'PUT')).data.version,1);
 const rotated=sqlite.prepare('SELECT * FROM studio_ai_settings').get();assert.notEqual(rotated.key_ciphertext,oldCipher,'new random IV protects repeated saves');
 globalThis.fetch=async()=>Response.json({candidates:[{content:{parts:[{text:'VELORYZ connected.'}]}}]});
 assert.equal((await call('/api/admin/ai/check',{},admin)).data.status,'live','saved key version resets provider failure backoff');
 // Authenticated encryption rejects corruption without exposing the saved value.
 sqlite.prepare('UPDATE studio_ai_settings SET key_ciphertext=?').run('00'+rotated.key_ciphertext.slice(2));
 assert.equal((await call('/api/admin/connections',null,admin)).data.ai.status,'credential');
 sqlite.prepare('UPDATE studio_ai_settings SET key_ciphertext=?').run(rotated.key_ciphertext);
 assert.equal((await call(settings,{provider:'guide',model:'',version:1},admin,'PUT')).status,200);
 globalThis.fetch=async()=>{throw Error('Guide mode must not call a provider');};
 const guide=await call('/api/adviser',{agent:'happy',messages:[{role:'user',content:'Hello'}]});assert.equal(guide.status,503);assert.equal(guide.data.mode,'unavailable');
}finally{globalThis.fetch=originalFetch;}
assert.notEqual(personas.aryan.greeting,personas.happy.greeting);assert.deepEqual(Object.keys(personas),['happy','nikhil','milky','ritik','aryan']);
for(const id of Object.keys(personas)){
 const prompt=adviserPrompt(id,defaults,true);assert(prompt.includes(personas[id].focus));assert(prompt.includes('Offer human studio handoff'));assert(prompt.includes('Do not pretend to be a real human'));assert(prompt.includes('Hindi in Devanagari'));
}
const source=fs.readFileSync(new URL('../public/admin-ai.js',import.meta.url),'utf8');
const context={document:{addEventListener(){}},aiSettings:{provider:'gemini',model:'gemini-3.5-flash-lite',configured:true,source:'encrypted-owner-setting',version:1},E:s=>String(s??'')};
const markup=vm.runInNewContext(source+'\naiSettingsForm();',context);assert.match(markup,/type="password"/);assert.match(markup,/autocomplete="new-password"/);assert(!markup.includes(key));assert.match(markup,/Save connection & test reply/);
console.log('PASS: Gemini REST contract, server-owned provider/model, history role mapping, thought exclusion, distinct grounded personas, encrypted key storage, protected no-echo settings, CSRF/concurrency, corruption rejection, explicit provider failures and recovery.');
sqlite.close();
