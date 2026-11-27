// R52.3: service-only identity RPC adapter. Owner routes must pass existing authorization first.
import {kickOnboarding} from './onboarding-mail-kick-r55.mjs';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
async function hash(token){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))));}
async function rpc(env,name,args){
 const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(env.CLIENT_IDENTITY_V1!=='enabled'||env.CREATOR_REGISTRATION_V1!=='enabled'||!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)fail('Identity service is not enabled.',503);
 const r=await fetch(base+'/rest/v1/rpc/veloryz_identity_'+name+'_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!r.ok)fail('Identity service temporarily unavailable.',503);
 return await r.json();
}
async function body(req){
 if(req.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')fail('Send JSON.',415);
 const reader=req.body?.getReader();if(!reader)fail('Invalid request.');let size=0,parts=[];
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>2048){try{await reader.cancel();}catch{}fail('Request too large.',413);}parts.push(value);}}finally{reader.releaseLock();}
 const all=new Uint8Array(size);let at=0;for(const b of parts){all.set(b,at);at+=b.length;}
 let x;try{x=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(all));}catch{fail('Invalid request.');}if(!x||typeof x!=='object'||Array.isArray(x))fail('Invalid request.');return x;
}
const error=e=>{const s=[400,409,413,415,429,503].includes(e?.status)?e.status:503;return json({error:s===503?'Identity service temporarily unavailable.':e.message},s);};
export async function identityOwner(request,env){
 try{
  if(request.method==='GET'){
   const p=new URL(request.url).searchParams,q=(p.get('q')||'').trim(),page=Number(p.get('page')||0),client=p.get('client')||null,projectPage=Number(p.get('projectPage')||0);
   if(q.length>120||client&&!uuid.test(client)||![page,projectPage].every(n=>Number.isInteger(n)&&n>=0&&n<=10000))fail('Invalid directory query.');
   const d=await rpc(env,'directory',{p_query:q,p_page:page,p_client:client,p_project_page:projectPage});
   if(d?.source!=='identity-v1'||!Array.isArray(d.items)||d.items.length>25||!Number.isSafeInteger(d.total)||d.total<0)fail('Directory unavailable.',503);
   return json(d);
  }
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const x=await body(request);
  if(x.action==='issue'&&typeof x.client==='string'&&uuid.test(x.client)){
   // Owner-controlled verification-only delivery; no brief, invoice or workspace access.
   const raw=hex(crypto.getRandomValues(new Uint8Array(32)));
   const d=await rpc(env,'issue',{p_client:x.client,p_hash:await hash(raw)});
   if(d?.result==='rate-limited')fail('Wait before issuing another verification link.',429);
   if(d?.result!=='issued'||typeof d.email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))fail('Identity cannot be verified in its current state.',409);
   // Fragment keeps bearer token out of request URL and referrer. Owner must send ONLY to returned address.
   return json({ok:true,recipient:d.email,expires_at:d.expires_at,url:new URL('/verify-client.html#token='+raw,request.url).href});
  }
  if(x.action==='group'&&x.confirm===true&&typeof x.member==='string'&&typeof x.primary==='string'&&uuid.test(x.member)&&uuid.test(x.primary)){
   const d=await rpc(env,'group',{p_member:x.member,p_primary:x.primary});
   if(d?.result!=='linked')fail('Both identities must be independently verified with the same email and eligible for grouping.',409);
   return json({ok:true});
  }
  fail('Invalid identity action.');
 }catch(e){return error(e);}
}
export async function identityVerify(request,env){
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 try{const x=await body(request);if(typeof x.token!=='string'||!/^[0-9a-f]{64}$/.test(x.token))fail('The verification link is invalid or expired.');
  const d=await rpc(env,'redeem',{p_hash:await hash(x.token)});
  if(d?.result!=='verified')fail('The verification link is invalid or expired.');
  await kickOnboarding(env);return json({ok:true,status:'verified'});
 }catch(e){return error(e);}
}
