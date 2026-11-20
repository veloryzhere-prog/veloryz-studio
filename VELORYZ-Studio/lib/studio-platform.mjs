import {addressFor} from './adviser-address.mjs';
import {studioGuide} from './adviser-guide.mjs';
import {personas,adviserPrompt} from './adviser-personas.mjs';
import {resolveAiSettings} from './ai-settings.mjs';
import {adviserNavigation} from './adviser-navigation.mjs';
export {personas} from './adviser-personas.mjs';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export const reply=(data,status=200,extra={})=>Response.json(data,{status,headers:{...headers,...extra}});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const encoder=new TextEncoder();
export async function boundedBody(request,max=14000){
 if(!request.headers.get('content-type')?.includes('application/json'))fail('Send a JSON request.',415);
 const reader=request.body?.getReader();if(!reader)fail('The request is empty.');let size=0,parts=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('The request is too large.',413);}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
 try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')fail('Invalid request.');return data;}catch(e){if(e.status)throw e;fail('Invalid request.');}
}
export const plain=(v,max,required=false)=>{const s=String(v??'').trim();if((required&&!s)||s.length>max||/[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s))fail('Please check the field contents.');return s;};
const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
export async function digest(s){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));}
async function sign(s,secret){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(s)));}
function equal(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export async function passwordHash(password,salt,iterations=100000){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations,hash:'SHA-256'},key,256));}
export async function rateLimit(env,key,limit,seconds){
 const bucket=Math.floor(Date.now()/1000/seconds),id=await digest(key+':'+bucket);
 const row=await env.DB.prepare('INSERT INTO studio_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id,Math.ceil(Date.now()/1000)+seconds).first();
 if(row.count>limit)fail('Please wait a little before trying again.',429);
 if(Math.random()<.02)await env.DB.prepare('DELETE FROM studio_limits WHERE expires_at<?').bind(Math.floor(Date.now()/1000)).run();
}
export async function passwordSession(request,env,user){
 if(!env.ADMIN_PASSWORD_HASH)return true;
 const token=request.headers.get('cookie')?.match(/(?:^|;\s*)vz_admin=([^;]+)/)?.[1]||'';
 const [expires,signature]=token.split('.');if(!/^\d{13}$/.test(expires)||Number(expires)<Date.now()||Number(expires)>Date.now()+8*3600000||!signature||!env.ADMIN_SESSION_SECRET)return false;
 return equal(signature,await sign(user.id+':'+expires+':'+env.ADMIN_PASSWORD_HASH,env.ADMIN_SESSION_SECRET));
}
export async function unlockAdmin(request,env,user){
 if(!env.ADMIN_PASSWORD_HASH||!env.ADMIN_SESSION_SECRET)fail('Password unlock has not been configured.',503);
 await rateLimit(env,'unlock:'+user.id,5,900);
 const data=await boundedBody(request,1000),password=String(data.password??'');if(password.length>128)fail('The password is incorrect.',401);
 const [iterations,salt,expected]=env.ADMIN_PASSWORD_HASH.split(':');
 const actual=await passwordHash(password,salt,Number(iterations));if(!equal(actual,expected))fail('The password is incorrect.',401);
 const expires=String(Date.now()+8*3600000),token=expires+'.'+await sign(user.id+':'+expires+':'+env.ADMIN_PASSWORD_HASH,env.ADMIN_SESSION_SECRET);
 return reply({ok:true},200,{'Set-Cookie':`vz_admin=${token}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`});
}
export const lockAdmin=()=>reply({ok:true},200,{'Set-Cookie':'vz_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'});
const providerHealth=new Map();
const healthId=c=>[c.provider,c.model,c.version].join(':');
const providerName=c=>c.provider==='gemini'?'Gemini':c.provider==='openai'?'OpenAI':'Studio guide';
function recordHealth(config,status){providerHealth.set(healthId(config),{status,checkedAt:new Date().toISOString(),retryAt:status==='live'?0:Date.now()+(['rate_limit','quota'].includes(status)?30000:120000)});if(providerHealth.size>32)providerHealth.delete(providerHealth.keys().next().value);}
function providerMessage(config,status){
 const name=providerName(config);
 return {billing:`${name} billing is inactive or its credit balance is exhausted. Review that provider account.`,quota:`${name} quota or rate limit has been reached. Review the model limits for the key's project, or try again after the limit resets.`,auth:`${name} rejected the API key. Check that it is valid and restricted to the correct API.`,access:`The ${name} model or project is not accessible to this key. Check the model, project permissions and key restrictions.`,rate_limit:`${name} is rate limiting replies. Wait and try again.`,network:`The ${name} connection timed out or could not be reached.`,configuration:`${name} rejected the request configuration. Check the selected model.`,credential:'The saved Gemini key could not be decrypted. Re-enter it in the protected connection form.',provider:`${name} could not complete the reply.`,live:`A real ${name} response succeeded.`,not_checked:`A live ${name} response has not been tested in this runtime.`,not_configured:config.provider==='guide'?'Studio guide is selected. No live model will be called.':`No ${name} API key is configured.`}[status]||'The provider is temporarily unavailable.';
}
export async function aiConnection(env,provided){
 const config=provided||await resolveAiSettings(env),health=providerHealth.get(healthId(config));
 const status=config.storageError?'credential':config.configured?health?.status||'not_checked':'not_configured';
 return {configured:config.configured,provider:config.provider,providerLabel:providerName(config),model:config.model,status,checkedAt:health?.checkedAt||null,message:providerMessage(config,status),guideAvailable:false};
}
async function requestAi(config,input,instructions,maxOutput=640){
 if(!config.configured||config.provider==='guide')return {ok:false,status:'not_configured'};
 let response;
 const gemini=config.provider==='gemini';
 const endpoint=gemini?'https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(config.model)+':generateContent':'https://api.openai.com/v1/responses';
 const body=gemini?{systemInstruction:{parts:[{text:instructions}]},contents:input.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:Math.max(1024,maxOutput*2),temperature:.65}}:{model:config.model,store:false,max_output_tokens:maxOutput,instructions,input};
 try{response=await fetch(endpoint,{method:'POST',headers:gemini?{'x-goog-api-key':config.key,'Content-Type':'application/json'}:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(26000)});}catch{recordHealth(config,'network');return {ok:false,status:'network'};}
 let result;try{result=await response.json();}catch{result={};}
 if(!response.ok){
  const error=result.error||{},code=String(error.code||error.type||error.status||''),reasons=(error.details||[]).map(d=>d.reason||'').join(' ');
  const status=gemini?(/API_KEY_INVALID|API_KEY_EXPIRED|API_KEY_SERVICE_BLOCKED/.test(reasons)||response.status===401?'auth':response.status===429?'quota':[403,404].includes(response.status)?'access':response.status===400?'configuration':'provider'):(/quota|credit|billing/.test(code)?'billing':response.status===401?'auth':response.status===403||code==='model_not_found'?'access':response.status===429?'rate_limit':'provider');
  recordHealth(config,status);return {ok:false,status};
 }
 const answer=(gemini?(result.candidates?.[0]?.content?.parts||[]).filter(p=>typeof p.text==='string'&&!p.thought).map(p=>p.text):(result.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text)).join('\n').trim().slice(0,4500);
 if(!answer){recordHealth(config,'provider');return {ok:false,status:'provider'};}
 recordHealth(config,'live');return {ok:true,answer};
}
export async function checkAiConnection(request,env){
 await rateLimit(env,'ai-connection-check',12,3600);
 const config=await resolveAiSettings(env);
 if(config.configured)await requestAi(config,[{role:'user',content:'Reply with: VELORYZ connected.'}],'You are a connection test. Return only the requested confirmation.',40);
 return reply(await aiConnection(env,config));
}
const chatContent=(v,max)=>{if(typeof v!=='string')fail('Send a text message.');const s=v.trim();if(!s||s.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s))fail('Please check the message contents.');return s;};
export async function adviserChat(request,env,state){
 const data=await boundedBody(request,110000),agent=personas[data.agent];if(!agent)fail('Choose a studio adviser.');
 if(!Array.isArray(data.messages)||data.messages.length<1||data.messages.length>31)fail('This conversation is too long. Start a new chat to continue.');
 const messages=data.messages.map((m,i)=>{if(!m||!['user','assistant'].includes(m.role)||m.role!==(i%2?'assistant':'user'))fail('Invalid conversation.');return {role:m.role,content:chatContent(m.content,m.role==='user'?1200:4800)};});
 if(messages.at(-1).role!=='user')fail('Send a question to continue.');
 await rateLimit(env,'chat:'+(request.headers.get('cf-connecting-ip')||request.headers.get('user-agent')||'anonymous'),45,3600);
 const handoff=/not (?:help|work|resolv)|still (?:broken|unresolved)|unresolved|human|real person|refund|payment failed|security breach/i.test(messages.at(-1).content);
 const extras=adviserNavigation(messages.at(-1).content,data.page,data.agent);
 const profile=addressFor(data.firstName,data.agent);
 const firstNamed=data.firstNamed===true;
 const greeting=profile?(profile.mirror&&firstNamed?'Talking to your AI double! How does it feel? ':profile.title+', '):'';
 const roast=/\b(motherchod|madarchod|behenchod|bhenchod|kutta|sala|saala)\b/i.test(messages.at(-1).content);
 const voice=profile?' Address this visitor as '+JSON.stringify(profile.title)+'. Tone: '+profile.style+'.':'';
 const guide=()=>{
  const result=studioGuide({...agent,id:data.agent},messages,state);
  if(profile&&firstNamed&&messages.at(-1).content.startsWith('My first name is ')){
   const answer=profile.mirror?'Hey, how does it feel talking to your AI double? What should we work on next?':profile.title+', '+(profile.style.includes('respect')?'ji, aap bataiye. What would you like to work on next?':profile.style.includes('friends')?'arre, apna banda! Bata, project ka kya scene hai?':'good to meet you. Where should we pick up?');
   return reply({...result,answer,extras,canUseStudioModel:false});
  }
  const banter=roast&&!profile?.style.includes('respect')?'Itni bakchodi se brief nahi banega. Actual problem bata, phir kaam ki baat karte hain. ':'';
  return reply({...result,answer:greeting+banter+result.answer,extras:{...extras,links:result.links?.length?result.links:extras.links},canUseStudioModel:config.provider!=='guide'});
 };
 const config=await resolveAiSettings(env),health=providerHealth.get(healthId(config));
 if(!config.configured||config.provider==='guide'){
  if(data.allowGuide===true)return guide();
  return reply({error:'The live AI is not configured.',code:'AI_NOT_CONFIGURED',agent:agent.name,mode:'unavailable',available:false,extras},503);
 }
 if(health?.retryAt>Date.now()&&data.allowGuide===true)return guide();
 if(health?.retryAt>Date.now())return reply({error:'The studio AI connection is temporarily unavailable. Please retry shortly.',code:'AI_TEMPORARILY_UNAVAILABLE',agent:agent.name,available:false,mode:'unavailable',notice:'Studio AI temporarily unavailable.',extras},503);
 const maxOutput=['nikhil','aryan'].includes(data.agent)?1600:data.agent==='ritik'?1200:950;
 const result=await requestAi(config,messages,adviserPrompt(data.agent,state,handoff,messages,extras.page)+voice+" If insulted, respond with a sharp situational roast, then help with the actual project. Respect family tones.",maxOutput);
 if(!result.ok&&data.allowGuide===true)return guide();
 if(!result.ok)return reply({error:'The VELORYZ AI engine could not respond. Please retry or contact the studio.',code:'AI_PROVIDER_'+result.status.toUpperCase(),agent:agent.name,available:false,mode:'unavailable',notice:'Studio AI reply failed · No simulated response was substituted.',extras},503);
 return reply({answer:profile&&!result.answer.toLowerCase().includes(profile.title.toLowerCase())?greeting+result.answer:result.answer,agent:agent.name,handoff,available:true,mode:'ai',notice:'VELORYZ Studio AI · Responses may contain mistakes.',extras});
}

export function checkoutLink(value){
 if(!value)return '';let u;try{u=new URL(value);}catch{fail('Enter a secure payment-provider URL.');}
 if(u.protocol!=='https:'||u.username||u.password||!['buy.stripe.com','checkout.stripe.com','rzp.io','rzp.pay','pages.razorpay.com','razorpay.me','www.paypal.com','paypal.me'].includes(u.hostname))fail('Use a hosted Stripe, Razorpay or PayPal payment link.');return u.href;
}
export async function paymentApi(request,env,path){
 const query=new URL(request.url).searchParams;
 if(path==='/api/payment-request'&&request.method==='GET'){
  const token=query.get('token')||'';if(!/^[a-f0-9]{64}$/.test(token))return reply({error:'This payment request could not be found.'},404);
  const item=await env.DB.prepare('SELECT reference,title,amount_paise,status,checkout_url,created_at FROM studio_payments WHERE token=?').bind(token).first();if(!item)return reply({error:'This payment request could not be found.'},404);
  return reply({item:{...item,checkout_url:'https://wa.me/919955326740',mode:'studio-discussion'}});
 }
 if(request.method==='GET'){const items=await env.DB.prepare('SELECT id,reference,title,amount_paise,status,checkout_url,created_at,version,token FROM studio_payments ORDER BY created_at DESC LIMIT 100').all();return reply({items:items.results});}
 const data=await boundedBody(request,4000);
 if(request.method==='POST'){
  if(data.checkoutUrl)checkoutLink(data.checkoutUrl);
  const reference=plain(data.reference,30,true).toUpperCase(),title=plain(data.title,160,true),amount=Number(data.amount),url='https://wa.me/919955326740';
  if(!Number.isFinite(amount)||amount<1||amount>10000000||Math.abs(amount*100-Math.round(amount*100))>.001)fail('Enter a valid INR amount with up to two decimal places.');
  if(!await env.DB.prepare('SELECT id FROM studio_enquiries WHERE reference=?').bind(reference).first())fail('Use a reference from the enquiry inbox.');
  const id=plain(data.requestId,36,true);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))fail('Reload the payment form and try again.');
  const existing=await env.DB.prepare('SELECT * FROM studio_payments WHERE id=?').bind(id).first();if(existing){if(existing.reference!==reference||existing.title!==title||existing.amount_paise!==Math.round(amount*100)||existing.checkout_url!==url)fail('This request was already created with different details.',409);return reply({ok:true,id,url:'/payments/?request='+existing.token});}
  const token=hex(crypto.getRandomValues(new Uint8Array(32))),time=new Date().toISOString();
  await env.DB.prepare("INSERT OR IGNORE INTO studio_payments (id,reference,title,amount_paise,status,checkout_url,token,version,created_at) VALUES (?,?,?,?,'requested',?,?,0,?)").bind(id,reference,title,Math.round(amount*100),url,token,time).run();const saved=await env.DB.prepare('SELECT * FROM studio_payments WHERE id=?').bind(id).first();if(!saved||saved.reference!==reference||saved.title!==title||saved.amount_paise!==Math.round(amount*100)||saved.checkout_url!==url)fail('This request was already created with different details.',409);return reply({ok:true,id,url:'/payments/?request='+saved.token},201);
 }
 if(request.method==='PUT'){
  if(data.status==='verified'&&data.verified!==true)fail('Confirm receipt with your provider before marking verified.');
  if(!['requested','verified','cancelled'].includes(data.status)||!Number.isInteger(data.version))fail('Choose a valid status.');
  const item=await env.DB.prepare('UPDATE studio_payments SET status=?,version=version+1 WHERE id=? AND version=? RETURNING id').bind(data.status,plain(data.id,36,true),data.version).first();if(!item)fail('This payment request changed. Refresh and try again.',409);return reply({ok:true});
 }
 return reply({error:'Not found.'},404);
}
