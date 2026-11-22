/* Moderated VELORYZ reviews. Fixed, service-role-only SQL contracts; no anonymous table grants. */
const BASE=(Deno.env.get('SUPABASE_URL')||'').replace(/\/$/,'');
const KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const OWNER=BASE+'/functions/v1/veloryz-studio-api/api/admin/state';
const SQL={
 approved:"SELECT id,display_name,rating,body,created_at FROM veloryz_studio.studio_reviews WHERE status='approved' ORDER BY created_at DESC LIMIT 36",
 stats:"SELECT count(*)::integer AS total,COALESCE(round(avg(rating)::numeric,1),0)::numeric AS average FROM veloryz_studio.studio_reviews WHERE status='approved'",
 submit:"INSERT INTO veloryz_studio.studio_reviews (id,display_name,rating,body,status,created_at) VALUES (?,?,?,?,'pending',now()) RETURNING id",
 all:"SELECT id,display_name,rating,body,status,created_at,moderated_at FROM veloryz_studio.studio_reviews ORDER BY created_at DESC LIMIT 100",
 moderate:"UPDATE veloryz_studio.studio_reviews SET status=?,moderated_at=now() WHERE id=? RETURNING id,status",
 throttle:"INSERT INTO veloryz_studio.studio_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=studio_limits.count+1 RETURNING count"
};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Type':'application/json; charset=utf-8'};
const reply=(value,status=200)=>Response.json(value,{status,headers});
const fail=(msg,status=400)=>{throw Object.assign(new Error(msg),{status});};
const encoder=new TextEncoder();
async function digest(input){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(input)));return Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');}
async function db(sql,...params){
 if(!BASE||!KEY)fail('Review service is temporarily unavailable.',503);
 const r=await fetch(BASE+'/rest/v1/rpc/veloryz_studio_query',{method:'POST',
 headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
 body:JSON.stringify({p_statements:[{key:await digest(sql),params}]}),signal:AbortSignal.timeout(12000)});
 if(!r.ok){console.error('Review database status:',r.status);fail('Review service is temporarily unavailable.',503);}
 const out=await r.json();if(!out?.[0]?.success||!Array.isArray(out[0].results))fail('Review database response unavailable.',503);
 return out[0].results;
}
function mutation(req){
 if(req.headers.get('origin')!=='https://veloryz.online'||req.headers.get('sec-fetch-site')==='cross-site')fail('Use the VELORYZ website to submit reviews.',403);
}
async function payload(req){
 if(!(req.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))fail('Send JSON.',415);
 if(Number(req.headers.get('content-length')||0)>1800)fail('Review too long.',413);
 const raw=await req.text();if(raw.length>1800)fail('Review too long.',413);
 let value;try{value=JSON.parse(raw)}catch{fail('Invalid review data.');}
 if(!value||Array.isArray(value)||typeof value!=='object')fail('Invalid review data.');return value;
}
async function throttle(req,action,limit,seconds){
 const raw=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'').trim();
 const client=/^[0-9a-f:.]{3,64}$/i.test(raw)?raw:'unidentified';
 const bucket=Math.floor(Date.now()/(1000*seconds));
 // Only keyed hashes are sent to persistent rate-limit storage.
 const key=await digest('review:'+action+':'+client+':'+bucket+':'+KEY);
 const rows=await db(SQL.throttle,key,Math.ceil(Date.now()/1000)+seconds*2);
 if(!rows.length||!Number.isFinite(Number(rows[0].count)))fail('Review protection unavailable.',503);
 if(Number(rows[0].count)>limit)fail('Too many requests. Try later.',429);
}
async function admin(req){
 const cookie=(req.headers.get('cookie')||'').match(/(?:^|;\s*)(vz_admin=[^;]{15,300})/);
 if(!cookie)return false;
 try{const r=await fetch(OWNER,{headers:{cookie:cookie[1]},cache:'no-store',signal:AbortSignal.timeout(10000)});return r.ok;}catch{return false;}
}
Deno.serve(async req=>{
 try{
  const path=new URL(req.url).pathname.replace(/^.*?\/veloryz-reviews-api(?=\/)/,'').replace(/\/+$/,'')||'/';
  if(!path.startsWith('/api/reviews'))return reply({error:'Not found.'},404);
  if(!['GET','POST'].includes(req.method))return reply({error:'Method not allowed.'},405);
  if(req.method==='POST')mutation(req);
  if(path==='/api/reviews'&&req.method==='GET'){
   const [reviews,counts]=await Promise.all([db(SQL.approved),db(SQL.stats)]);
   return reply({reviews,summary:{count:counts[0]?.total||0,average:Number(counts[0]?.average||0)},moderated:true});
  }
  if(path==='/api/reviews'&&req.method==='POST'){
   await throttle(req,'global',60,3600);
   await throttle(req,'submit',3,86400);
   const data=await payload(req);
   if(data.website||data.company_url||data.phone)fail('Automated submission rejected.');
   if(data.confirm!==true)fail('Confirm that this is your real experience.');
   const name=typeof data.name==='string'?data.name.trim().replace(/\s+/g,' '):'';
   const review=typeof data.review==='string'?data.review.trim().replace(/\s+/g,' '):'';
   if(name.length<2||name.length>60||/[\x00-\x1f<>]/.test(name))fail('Enter a name of 2–60 characters.');
   if(!Number.isInteger(data.rating)||data.rating<1||data.rating>5)fail('Choose a rating from 1 to 5.');
   if(review.length<25||review.length>800||/[\x00-\x1f<>]/.test(review))fail('Write 25–800 plain-text characters.');
   if(/https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(review))fail('Remove links and contact details.');
   const rows=await db(SQL.submit,crypto.randomUUID(),name,data.rating,review);
   if(rows.length!==1)fail('Review could not be saved.',503);
   return reply({ok:true,moderation:'pending',message:'Thank you. Your review awaits human moderation and is not yet public.'},201);
  }
  if(path==='/api/reviews/admin'&&req.method==='GET'){
   if(!await admin(req))return reply({error:'Administrator session required.'},401);
   return reply({reviews:await db(SQL.all)});
  }
  if(path==='/api/reviews/admin/moderate'&&req.method==='POST'){
   if(!await admin(req))return reply({error:'Administrator session required.'},401);
   await throttle(req,'moderate',120,3600);
   const value=await payload(req);
   if(!/^[a-f0-9]{8}-[a-f0-9-]{27,36}$/i.test(String(value.id||'')))fail('Invalid review identifier.');
   if(!['approved','rejected'].includes(value.status))fail('Invalid moderation decision.');
   const rows=await db(SQL.moderate,value.status,value.id);
   if(rows.length!==1)fail('Review not found.',404);
   return reply({ok:true,id:rows[0].id,status:rows[0].status});
  }
  return reply({error:'Not found.'},404);
 }catch(err){return reply({error:err?.status?err.message:'Reviews service could not complete this request.'},err?.status||500);}
});