import {enhanceGuide} from './hosted-adviser.mjs';
import {studioEnvironment} from './supabase-backend.mjs';
import {auditStudioContent} from './content-audit.mjs';
import defaults from './defaults.json' with { type: 'json' };
import { passwordSession,unlockAdmin,lockAdmin,adviserChat,paymentApi,aiConnection,checkAiConnection } from './studio-platform.mjs';
import {aiSettingsMetadata,saveAiSettings} from './ai-settings.mjs';
import {boundedBody,rateLimit} from './studio-platform.mjs';
import { submitEnquiry,enquiryAdmin } from './enquiries.mjs';

const safeHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const now=()=>new Date().toISOString();
const json=(data,status=200)=>Response.json(data,{status,headers:safeHeaders});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:fail('Invalid document.');
function text(value,max=500,required=false){const s=String(value??'').trim();if(s.length>max||/[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s))fail('Use plain text within the field limits.');if(required&&!s)fail('A required field is empty.');return s;}
function url(value,media=false){const s=text(value,2000);if(!s)return '';if(media&&/^\/(?:media|assets)\/[a-zA-Z0-9_./-]+$/.test(s)&&!s.includes('..'))return s;if(!media&&s.startsWith('/')&&!s.startsWith('//')&&!s.includes('\\'))return s;let parsed;try{parsed=new URL(s);}catch{fail('Enter a valid https:// URL or choose an uploaded file.');}if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password)fail('Only HTTP and HTTPS links are supported.');return parsed.href;}
const list=(value,max)=>{if(!Array.isArray(value)||value.length>max)fail('The list is too large or invalid.');return value;};
const slug=value=>{const s=text(value,90,true);if(!/^[a-z0-9][a-z0-9-]*$/.test(s))fail('Use lowercase letters, numbers and hyphens for identifiers.');return s;};
const date=value=>{if(!value)return '';if(!Number.isFinite(Date.parse(value)))fail('Choose a valid date.');return new Date(value).toISOString();};
function unique(items){if(new Set(items.map(x=>x.id)).size!==items.length)fail('Every item needs a unique identifier.');return items;}
export function validateState(value){
 const input=object(value),s=object(input.site),b=object(input.branding);const site={};
 const fields={name:60,tagline:100,heroEyebrow:160,headline:120,headlineAccent:120,description:1500,studioTitle:400,studioDescription:4000,founderName:100,founderRole:160,founderBio:7000,location:180,email:180,phone:20,ctaHeadline:400,ctaDescription:1500,mailboxTitle:160,mailboxMessage:5000,designTitle:400,designDescription:2500,bookingDescription:2500,paymentNote:2000,apiDescription:3000};
 for(const [key,max]of Object.entries(fields))site[key]=text(s[key]??defaults.site[key],max,['name','headline','email','phone','founderName'].includes(key));
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email))fail('Enter a valid contact email.');
 if(!/^\d{8,15}$/.test(site.phone))fail('WhatsApp number must include the country code and digits only.');
 site.productUrl=url(s.productUrl);site.accent=/^#[0-9a-f]{6}$/i.test(s.accent)?s.accent:fail('Use a six-digit hex accent colour.');
 site.consultationEnabled=!!s.consultationEnabled;site.consultationDelay=Math.max(6,Math.min(60,Number(s.consultationDelay)||11));
 site.mailboxEnabled=s.mailboxEnabled!==false;
 for(const key of ['showWork','showScarf','showManifesto','showStudies','showJourney','showFounder','showFilm'])site[key]=s[key]!==false;
 for(const agent of ['happy','nikhil','milky','ritik','aryan'])site[agent+'Brief']=text(s[agent+'Brief'],500);
 site.showcaseTitle=text(s.showcaseTitle??defaults.site.showcaseTitle,120,true);
 site.adInterval=Math.min(30,Math.max(4,Number(s.adInterval)||8));
 const branding={};for(const key of ['headerLogo','footerLogo','favicon','productLogo','heroLogo','showreel'])branding[key]=url(b[key],true);
 const projects=unique(list(input.projects,100).map((p,i)=>({id:slug(p.id),name:text(p.name,120,true),category:text(p.category,100),type:['product','web','brand','motion'].includes(p.type)?p.type:'web',status:text(p.status,100),year:text(p.year,100),description:text(p.description,7000),scope:list(p.scope||[],30).map(x=>text(x,250)),approach:text(p.approach,7000),note:text(p.note,2000),published:!!p.published,featured:!!p.featured,order:Number.isFinite(Number(p.order))?Number(p.order):i,cover:url(p.cover,true),video:url(p.video,true),website:url(p.website)})));
 const services=list(input.services,20).map(p=>({name:text(p.name,120,true),short:text(p.short,500),description:text(p.description,4000),tags:list(p.tags||[],25).map(x=>text(x,100)),deliverables:text(p.deliverables,2500)}));
 const team=unique(list(input.team,30).map(p=>({id:slug(p.slug||p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')),name:text(p.name,120,true),initials:text(p.initials,8),role:text(p.role,180),description:text(p.description,1800),slug:slug(p.slug||p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')),specialties:list(p.specialties||[],20).map(x=>text(x,120)),experience:list(p.experience||[],20).map(x=>text(x,1000)),experienceIsSample:p.experienceIsSample!==false,avatar:url(p.avatar,true),projects:list(p.projects||[],30).map(x=>slug(x))})));
 const offers=unique(list(input.offers,30).map(o=>{const startAt=date(o.startAt),endAt=date(o.endAt);if(startAt&&endAt&&startAt>=endAt)fail('An offer must end after it starts.');return {id:slug(o.id),title:text(o.title,160,true),eyebrow:text(o.eyebrow,100),body:text(o.body,2500),kind:['offer','ad','announcement'].includes(o.kind)?o.kind:'offer',media:url(o.media,true),mediaType:['image','video'].includes(o.mediaType)?o.mediaType:'none',buttonLabel:text(o.buttonLabel,70),buttonUrl:url(o.buttonUrl),enabled:!!o.enabled,startAt,endAt,priority:Math.min(100,Math.max(0,Number(o.priority)||0)),entrance:['rise','slide','unfold','fade'].includes(o.entrance)?o.entrance:'rise',pace:['quick','standard','slow'].includes(o.pace)?o.pace:'standard',placement:['popup','inline','pinned','slider'].includes(o.placement)?o.placement:'popup',logo:url(o.logo,true),logoLink:url(o.logoLink),theme:['ivory','dark','gold'].includes(o.theme)?o.theme:'ivory',animation:['orbit','ribbon','pulse'].includes(o.animation)?o.animation:'orbit',frequency:['refresh','session','day'].includes(o.frequency)?o.frequency:'refresh',delay:Math.max(1,Math.min(5,Number(o.delay)||4.7)),ribbon:o.ribbon!==false,dismissible:o.dismissible!==false,secondaryLabel:text(o.secondaryLabel,70),secondaryUrl:url(o.secondaryUrl)};}));
 for(const o of offers){if(!!o.buttonLabel!==!!o.buttonUrl)fail('Add both the primary button label and its destination, or leave both empty.');if(!!o.secondaryLabel!==!!o.secondaryUrl)fail('Add both the secondary link label and its destination, or leave both empty.');}
 const catalogue=unique(list(input.catalogue||defaults.catalogue,40).map(p=>({id:slug(p.id),name:text(p.name,160,true),category:text(p.category,80,true),description:text(p.description,3000),image:url(p.image,true),source:url(p.source),demo:url(p.demo),author:text(p.author,120),license:text(p.license,1500),price:Math.round(Math.max(0,Math.min(10000000,Number(p.price)||0))),timeline:text(p.timeline,120),scope:list(p.scope||[],20).map(x=>text(x,250)),enabled:p.enabled!==false})));
 for(const d of catalogue)if(d.enabled&&(!d.image||d.price<1))fail('Visible design directions need a preview image and a starting price of at least ₹1.');
 return {site,branding,projects,services,team,offers,catalogue};
}
export function activeOffers(state,time=Date.now()){return state.offers.filter(o=>o.enabled&&(!o.startAt||Date.parse(o.startAt)<=time)&&(!o.endAt||Date.parse(o.endAt)>time)).sort((a,b)=>b.priority-a.priority);}
function upgrade(state){return {...state,site:{...defaults.site,...state.site},catalogue:state.catalogue||structuredClone(defaults.catalogue)};}
const hostedBackend = 'https://vgxdfjlqstpbtezxmxtq.supabase.co/functions/v1/veloryz-studio-api';
function usesHostedBackend(env, url) {
 return !env.DB && !env.SUPABASE_SERVICE_ROLE_KEY && url && new URL(url).origin === 'https://veloryz.online';
}
async function forwardStudioRequest(request) {
 const url = new URL(request.url);
 const headers = new Headers();
 for (const name of ['content-type','range','origin','sec-fetch-site','user-agent']) {
  const value = request.headers.get(name);
  if (value) headers.set(name,value);
 }
 const session = request.headers.get('cookie')?.match(/(?:^|;\s*)(vz_admin=[^;]+)/)?.[1];
 if (session) headers.set('cookie',session);
 const response = await fetch(hostedBackend + url.pathname + url.search,{
  method:request.method, headers, body:request.body, redirect:'manual'
 });
 const outgoing = new Headers();
 for (const name of ['content-type','cache-control','x-content-type-options','content-range','accept-ranges','etag']) {
  const value=response.headers.get(name);
  if(value) outgoing.set(name,value);
 }
 for(const cookie of response.headers.getSetCookie()) {
  if(cookie.startsWith('vz_admin=')) outgoing.append('set-cookie',cookie);
 }
 return new Response(response.body,{status:response.status,headers:outgoing});
}
export async function getPublished(env, requestUrl){
 if (usesHostedBackend(env,requestUrl)) {
  const response=await fetch(hostedBackend+'/api/site');
  if(response.ok){const {state,version}=await response.json();return {state,version};}
 }
 env=studioEnvironment(env);
 if(!env.DB)return {state:structuredClone(defaults),version:0};
 const row=await env.DB.prepare('SELECT published,published_version FROM cms_state WHERE id=1').first();
 return row?{state:upgrade(JSON.parse(row.published)),version:row.published_version}:{state:structuredClone(defaults),version:0};
}
async function ensureState(env){
 await env.DB.prepare('INSERT OR IGNORE INTO cms_state (id,published,draft,published_version,draft_version,updated_at) VALUES (1,?,?,0,0,?)').bind(JSON.stringify(defaults),JSON.stringify(defaults),now()).run();
 await env.DB.prepare("INSERT OR IGNORE INTO cms_history (id,revision,payload,summary,actor,created_at) SELECT 'initial-version',0,published,'Initial studio content','system',? FROM cms_state WHERE id=1 AND published_version=0").bind(now()).run();
}
async function authorize(request,env,defaultLoginMode){
 // Dedicated owner-password mode for hosts without trusted ChatGPT identity headers.
 // This NEVER authorizes a request by itself: every admin API route still checks
 // passwordSession() after authorize(), with a signed, HttpOnly session cookie.
 // Requiring both private runtime settings prevents accidental open access.
 if((env.ADMIN_LOGIN_MODE || defaultLoginMode)==='password'){
  if(!env.DB)fail('Connect the studio database in the Worker runtime settings before signing in.',503);
  if(!env.ADMIN_PASSWORD_HASH||!env.ADMIN_SESSION_SECRET)fail('Configure the Worker secrets ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET before signing in.',503);
  return {id:'studio-owner',name:'Studio owner'};
 }
 const userId=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!userId||!email)fail('Sign in with the studio owner’s ChatGPT account.',401);
 if(!env.DB)fail('The studio database is not available.',503);
 const existing=await env.DB.prepare('SELECT user_id FROM cms_admins WHERE user_id=?').bind(userId).first();
 if(!existing){
  if(!env.ADMIN_EMAIL||email.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase())fail('This account does not have studio admin access.',403);
  await env.DB.prepare('INSERT OR IGNORE INTO cms_admins (user_id,email,created_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM cms_admins)').bind(userId,email,now()).run();
  if(!await env.DB.prepare('SELECT user_id FROM cms_admins WHERE user_id=?').bind(userId).first())fail('This account does not have studio admin access.',403);
 }
 return {id:userId,name:'Aryan Raj Singh'};
}
async function body(request){if(!request.headers.get('content-type')?.includes('application/json'))fail('Send a JSON document.',415);const value=await request.text();if(value.length>900000)fail('The document is too large.',413);try{return JSON.parse(value);}catch{fail('The document could not be read.');}}
async function stateResponse(env,user){await ensureState(env);const row=await env.DB.prepare('SELECT * FROM cms_state WHERE id=1').first();return {state:upgrade(JSON.parse(row.draft)),draftVersion:row.draft_version,publishedVersion:row.published_version,hasDraft:row.draft!==row.published,updatedAt:row.updated_at,user};}
function mutationOrigin(request){if(['GET','HEAD'].includes(request.method))return;const origin=request.headers.get('origin');if((origin&&origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')fail('This request must come from the studio website.',403);}
async function saveDraft(env,state,expected){
 const result=await env.DB.prepare('UPDATE cms_state SET draft=?,draft_version=draft_version+1,updated_at=? WHERE id=1 AND draft_version=? RETURNING draft_version').bind(JSON.stringify(state),now(),expected).first();
 if(!result)fail('Another tab changed this draft. Reload the workspace before saving again.',409);return result.draft_version;
}
const imageTypes=new Set(['image/png','image/jpeg','image/webp','image/gif','image/avif']);
const videoTypes=new Set(['video/mp4','video/webm']);
function fileSignature(bytes,type){const x=new Uint8Array(bytes),ascii=(a,b)=>String.fromCharCode(...x.slice(a,b));if(type==='image/png')return ascii(1,4)==='PNG';if(type==='image/jpeg')return x[0]===255&&x[1]===216&&x[2]===255;if(type==='image/gif')return ascii(0,4)==='GIF8';if(type==='image/webp')return ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';if(type==='image/avif')return ascii(4,8)==='ftyp'&&/avif|avis/.test(ascii(8,32));if(type==='video/mp4')return ascii(4,8)==='ftyp';if(type==='video/webm')return x[0]===0x1a&&x[1]===0x45&&x[2]===0xdf&&x[3]===0xa3;return false;}
export async function handleApi(request,env,defaultLoginMode='chatgpt'){
 try{
  if(usesHostedBackend(env,request.url)){
   if(env.AI && request.method==='POST' && new URL(request.url).pathname==='/api/adviser'){
    mutationOrigin(request);
    const data=await boundedBody(request.clone(),110000);
    return enhanceGuide(await forwardStudioRequest(request),data,env.AI,()=>getPublished(env,request.url));
   }
   return await forwardStudioRequest(request);
  }
  env=studioEnvironment(env);
  const path=new URL(request.url).pathname.replace(/\/$/,'');
  if(path==='/api/site'&&request.method==='GET'){const data=await getPublished(env);return json({...data,activeOffers:activeOffers(data.state)});}
  if(path==='/api/enquiries'&&request.method==='POST'){mutationOrigin(request);return await submitEnquiry(request,env,(await getPublished(env)).state);}
  if(path==='/api/platform'&&request.method==='GET'){const ai=await aiConnection(env);return json({aiConfigured:ai.configured,aiAvailable:ai.status==='live',aiProviderLabel:'VELORYZ Studio AI',guideAvailable:false,paymentMode:'studio-discussion'});}
  if(path==='/api/adviser'&&request.method==='POST'){mutationOrigin(request);return await adviserChat(request,env,(await getPublished(env)).state);}
  if(path==='/api/payment-request'&&request.method==='GET')return await paymentApi(request,env,path);
  if(path==='/api/health'&&request.method==='GET'){if(!env.DB||!env.BUCKET)fail('The studio service is temporarily unavailable.',503);try{await env.DB.prepare('SELECT id FROM studio_enquiries LIMIT 1').first();await env.DB.prepare('SELECT id FROM studio_limits LIMIT 1').first();await env.DB.prepare('SELECT id FROM studio_payments LIMIT 1').first();await env.DB.prepare('SELECT id FROM studio_ai_settings LIMIT 1').first();}catch{fail('The studio database is temporarily unavailable.',503);}return json({ok:true});}
  if(!path.startsWith('/api/admin/'))return json({error:'Not found.'},404);
  mutationOrigin(request);const user=await authorize(request,env,defaultLoginMode);
  if(path==='/api/admin/unlock'&&request.method==='POST')return await unlockAdmin(request,env,user);
  if(path==='/api/admin/lock'&&request.method==='POST')return lockAdmin();
  if(!await passwordSession(request,env,user))return json({error:'Enter the studio password to unlock your workspace.',passwordRequired:true},401);
  await ensureState(env);
  if(path==='/api/admin/quality'&&request.method==='GET'){const state=await stateResponse(env,user);return json(auditStudioContent(state.state));}
  if(path==='/api/admin/connections'&&request.method==='GET')return json({database:env.STUDIO_DATABASE==='supabase'?'Supabase / isolated studio schema':'Cloudflare D1',storage:env.STUDIO_STORAGE_BUCKET?'Supabase Storage':'Cloudflare R2',ai:await aiConnection(env),password:!!env.ADMIN_PASSWORD_HASH,payments:'provider-links'});
  if(path==='/api/admin/ai/settings'&&request.method==='GET')return json(await aiSettingsMetadata(env));
  if(path==='/api/admin/ai/settings'&&request.method==='PUT'){await rateLimit(env,'ai-settings:'+user.id,12,3600);return json(await saveAiSettings(await boundedBody(request,4000),env,user));}
  if(path==='/api/admin/ai/check'&&request.method==='POST')return await checkAiConnection(request,env);
  if(path==='/api/admin/payments')return await paymentApi(request,env,path);
  if(path==='/api/admin/enquiries'||path.startsWith('/api/admin/enquiries/'))return await enquiryAdmin(request,env,path);
  if(path==='/api/admin/state'&&request.method==='GET')return json(await stateResponse(env,user));
  if(path==='/api/admin/draft'&&request.method==='PUT'){const input=await body(request);const state=validateState(input.state);const revision=await saveDraft(env,state,input.draftVersion);return json({ok:true,draftVersion:revision,updatedAt:now()});}
  if(path==='/api/admin/publish'&&request.method==='POST'){
   const input=await body(request);
   const time=now();
   const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO cms_history (id,revision,payload,summary,actor,created_at) SELECT ?,published_version+1,draft,?,?,? FROM cms_state WHERE id=1 AND draft_version=? AND published_version=?').bind(crypto.randomUUID(),text(input.summary||'Studio content published',200),user.id,time,input.draftVersion,input.publishedVersion),
    env.DB.prepare('UPDATE cms_state SET published=draft,published_version=published_version+1,updated_at=? WHERE id=1 AND draft_version=? AND published_version=? RETURNING published,published_version,updated_at').bind(time,input.draftVersion,input.publishedVersion),
   ]);
   const row=result[1].results?.[0];
   if(!row)fail('The workspace changed in another tab. Reload before publishing.',409);
   return json({ok:true,publishedVersion:row.published_version,updatedAt:row.updated_at});
  }
  if(path==='/api/admin/discard'&&request.method==='POST'){
   const input=await body(request);const row=await env.DB.prepare('UPDATE cms_state SET draft=published,draft_version=draft_version+1,updated_at=? WHERE id=1 AND draft_version=? RETURNING draft_version').bind(now(),input.draftVersion).first();
   if(!row)fail('The draft changed. Reload before discarding it.',409);return json(await stateResponse(env,user));
  }
  if(path==='/api/admin/history'&&request.method==='GET'){const result=await env.DB.prepare('SELECT id,revision,summary,created_at FROM cms_history ORDER BY revision DESC LIMIT 50').all();return json({items:result.results});}
  if(path==='/api/admin/restore'&&request.method==='POST'){
   const input=await body(request);const row=await env.DB.prepare('SELECT payload FROM cms_history WHERE id=?').bind(input.id).first();if(!row)fail('That version could not be found.',404);
   const revision=await saveDraft(env,validateState(JSON.parse(row.payload)),input.draftVersion);return json({...await stateResponse(env,user),draftVersion:revision});
  }
  if(path==='/api/admin/media'&&request.method==='GET'){const result=await env.DB.prepare('SELECT id,filename,mime,size,created_at FROM cms_media WHERE archived=0 ORDER BY created_at DESC LIMIT 200').all();return json({items:result.results.map(item=>({...item,url:'/media/'+item.id}))});}
  if(path==='/api/admin/media'&&request.method==='POST'){
   if(!env.BUCKET)fail('Media storage is not available.',503);
   if(Number(request.headers.get('content-length')||0)>27*1024*1024)fail('Keep videos under 25 MB and images under 8 MB.',413);
   const form=await request.formData(),file=form.get('file');if(!file||typeof file==='string')fail('Choose a file to upload.');
   const isImage=imageTypes.has(file.type),isVideo=videoTypes.has(file.type);if(!isImage&&!isVideo)fail('Use PNG, JPG, WebP, GIF, AVIF, MP4 or WebM.');
   if(!file.size||file.size>(isVideo?25:8)*1024*1024)fail('Keep videos under 25 MB and images under 8 MB.',413);
   const bytes=await file.arrayBuffer();if(!fileSignature(bytes,file.type))fail('The file contents do not match its file type.');
   const id=crypto.randomUUID(),key='studio/'+id;
   await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:file.type}});
   try{await env.DB.prepare('INSERT INTO cms_media (id,storage_key,filename,mime,size,archived,actor,created_at) VALUES (?,?,?,?,?,0,?,?)').bind(id,key,text(file.name,250),file.type,file.size,user.id,now()).run();}catch(error){await env.BUCKET.delete(key);throw error;}
   return json({id,url:'/media/'+id,filename:file.name,mime:file.type,size:file.size},201);
  }
  if(path.startsWith('/api/admin/media/')&&request.method==='DELETE'){const id=path.split('/').pop();await env.DB.prepare('UPDATE cms_media SET archived=1 WHERE id=?').bind(id).run();return json({ok:true});}
  return json({error:'Not found.'},404);
 }catch(error){return json({error:error.status?error.message:'The studio service could not complete this request. Please try again.'},error.status||500);}
}
export async function mediaResponse(request,env,id){
 if(usesHostedBackend(env,request.url)) return forwardStudioRequest(request);
 env=studioEnvironment(env);
 if(!/^[0-9a-f-]{36}$/.test(id)||!env.DB||!env.BUCKET)return new Response('Not found',{status:404});
 const row=await env.DB.prepare('SELECT storage_key,mime FROM cms_media WHERE id=?').bind(id).first();if(!row)return new Response('Not found',{status:404});
 const item=await env.BUCKET.get(row.storage_key,{range:request.headers});if(!item)return new Response('Not found',{status:404});
 const headers=new Headers({'Content-Type':row.mime,'X-Content-Type-Options':'nosniff','Cache-Control':'public,max-age=31536000,immutable','Accept-Ranges':'bytes'});item.writeHttpMetadata(headers);headers.set('ETag',item.httpEtag);
 let status=200;if(item.range&&'offset'in item.range){status=206;headers.set('Content-Range',`bytes ${item.range.offset}-${item.range.offset+item.range.length-1}/${item.size}`);headers.set('Content-Length',String(item.range.length));}else headers.set('Content-Length',String(item.size));
 return new Response(request.method==='HEAD'?null:item.body,{status,headers});
}
