// Provider credentials are separate from public CMS documents and revisions.
// AES-GCM authentication binds ciphertext to this purpose; plaintext never returns to the browser.
const encoder=new TextEncoder(),decoder=new TextDecoder();
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const hex=b=>[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');
const bytes=h=>{if(typeof h!=='string'||h.length%2||!/^[a-f0-9]+$/.test(h))throw Error('Invalid credential');return Uint8Array.from(h.match(/../g),n=>parseInt(n,16));};
const purpose=encoder.encode('VELORYZ/provider/gemini/v1');
export const DEFAULT_GEMINI_MODEL='gemini-3.5-flash-lite';
export const modelFor=(provider,value)=>{
 const model=String(value|| (provider==='openai'?'gpt-4.1-mini':DEFAULT_GEMINI_MODEL)).trim();
 if(model.length>100||!(provider==='openai'?/^gpt-[a-z0-9.-]+$/:/^gemini-[a-z0-9.-]+$/).test(model))fail('Choose a valid model identifier.');
 return model;
};
async function encryptionKey(env){
 if(!env.ADMIN_SESSION_SECRET||env.ADMIN_SESSION_SECRET.length<24)fail('Secure provider storage is unavailable. Configure the server session secret first.',503);
 const master=await crypto.subtle.importKey('raw',encoder.encode(env.ADMIN_SESSION_SECRET),'HKDF',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:encoder.encode('veloryz.ai.credentials'),info:purpose},master,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function sealGeminiKey(value,env){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:purpose},await encryptionKey(env),encoder.encode(value));
 return {ciphertext:hex(encrypted),iv:hex(iv)};
}
async function openGeminiKey(row,env){
 return decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(row.key_iv),additionalData:purpose},await encryptionKey(env),bytes(row.key_ciphertext)));
}
async function settingsRow(env){return env.DB?await env.DB.prepare('SELECT * FROM studio_ai_settings WHERE id=1').first():null;}
export async function resolveAiSettings(env,{withKey=true}={}){
 const row=await settingsRow(env);
 const provider=row?.provider||(['gemini','openai','guide'].includes(env.AI_PROVIDER)?env.AI_PROVIDER:'gemini');
 const model=provider==='guide'?'':modelFor(provider,row?.model||(provider==='gemini'?env.GEMINI_MODEL:env.OPENAI_MODEL));
 let key=provider==='openai'?env.OPENAI_API_KEY||'':provider==='gemini'?(env.GEMINI_API_KEY||env.GOOGLE_API_KEY||''):'';
 let source=key?'runtime-secret':'none',storageError=false;
 if(provider==='gemini'&&row?.key_ciphertext){
  source='encrypted-owner-setting';
  if(withKey){try{key=await openGeminiKey(row,env);}catch{key='';storageError=true;}}
  else key='configured';
 }
 return {provider,model,key,configured:!!key,source,version:row?.version??-1,storageError};
}
export async function aiSettingsMetadata(env){
 const s=await resolveAiSettings(env,{withKey:false});return {provider:s.provider,model:s.model,configured:s.configured,source:s.source,version:s.version,secureStorageReady:!!env.ADMIN_SESSION_SECRET&&env.ADMIN_SESSION_SECRET.length>=24};
}
export async function saveAiSettings(data,env,user){
 if(!env.DB)fail('The studio database is unavailable.',503);
 if(!['gemini','openai','guide'].includes(data.provider))fail('Choose Gemini, OpenAI or Studio guide.');
 if(!Number.isInteger(data.version)||data.version< -1)fail('Reload the connection settings and try again.');
 const row=await settingsRow(env);if((row?.version??-1)!==data.version)fail('Another tab changed this connection. Reload it before saving.',409);
 const model=data.provider==='guide'?'':modelFor(data.provider,data.model);
 let ciphertext=row?.key_ciphertext||'',iv=row?.key_iv||'';
 const supplied=String(data.apiKey||'').trim();
 if(supplied){
  if(data.provider!=='gemini')fail('This key field is for Gemini. OpenAI uses its existing runtime secret.');
  if(!/^[A-Za-z0-9_.-]{20,512}$/.test(supplied))fail('Enter the Gemini API key only, without spaces or extra text.');
  const sealed=await sealGeminiKey(supplied,env);ciphertext=sealed.ciphertext;iv=sealed.iv;
 }
 if(data.provider==='gemini'&&!ciphertext&&!env.GEMINI_API_KEY&&!env.GOOGLE_API_KEY)fail('Enter your Gemini key to connect this provider.');
 if(data.provider==='openai'&&!env.OPENAI_API_KEY)fail('An OpenAI runtime key is not configured.');
 const now=new Date().toISOString();let saved;
 if(row)saved=await env.DB.prepare('UPDATE studio_ai_settings SET provider=?,model=?,key_ciphertext=?,key_iv=?,version=version+1,updated_at=?,updated_by=? WHERE id=1 AND version=? RETURNING version').bind(data.provider,model,ciphertext,iv,now,user.id,data.version).first();
 else saved=await env.DB.prepare('INSERT OR IGNORE INTO studio_ai_settings (id,provider,model,key_ciphertext,key_iv,version,updated_at,updated_by) VALUES (1,?,?,?,?,0,?,?) RETURNING version').bind(data.provider,model,ciphertext,iv,now,user.id).first();
 if(!saved)fail('Another tab changed this connection. Reload it before saving.',409);
 return {ok:true,...await aiSettingsMetadata(env)};
}
