/* VELORYZ first-party privacy receipts.
   Anonymous, pseudonymous, minimal data: no IP, user agent, email or project details.
   This endpoint is only a receipt; it never grants tracking permissions to the backend.
   No analytics trackers or vendor advertising tools are loaded here. */
const BASE=(Deno.env.get('SUPABASE_URL')||'').replace(/\/$/,'');
const KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const SQL="INSERT INTO veloryz_studio.studio_privacy_receipts (id,receipt_id,policy_version,preferences,analytics,marketing,decision,client_at,recorded_at) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM veloryz_studio.studio_privacy_receipts WHERE receipt_id=? AND recorded_at >= ?)<20 ON CONFLICT (receipt_id,client_at) DO NOTHING RETURNING id";
const LIMIT_SQL="INSERT INTO veloryz_studio.studio_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=studio_limits.count+1 RETURNING count";
const enc=new TextEncoder();
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hdr={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const respond=(payload:unknown,status=200)=>new Response(JSON.stringify(payload),{status,headers:hdr});
async function checksum(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s))),x=>x.toString(16).padStart(2,'0')).join('')}
async function throttle(req:Request){
 // Never persist raw IP addresses. The HMAC-like salted hash is scoped to a 60-second bucket.
 const raw=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'').trim();
 const client=/^[0-9a-f:.]{3,64}$/i.test(raw)?raw:'unidentified';
 const bucket=Math.floor(Date.now()/60000);
 const id=await checksum('consent-receipt:'+client+':'+bucket+':'+KEY);
 const rsp=await fetch(BASE+'/rest/v1/rpc/veloryz_studio_query',{
  method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
  body:JSON.stringify({p_statements:[{key:await checksum(LIMIT_SQL),params:[id,Math.ceil(Date.now()/1000)+120]}]}),
  signal:AbortSignal.timeout(8500)
 });
 if(!rsp.ok)throw Error('Consent rate limit unavailable');
 const count=Number((await rsp.json())?.[0]?.results?.[0]?.count);
 if(!Number.isFinite(count))throw Error('Consent rate limit unavailable');
 return count<=20;
}
Deno.serve(async req=>{
 const u=new URL(req.url);let path=u.pathname.replace(/^.*?\/veloryz-privacy-api(?=\/)/,'').replace(/\/$/,'');
 if(path!=='/api/privacy/consent'||req.method!=='POST')return respond({error:'Not found.'},404);
 const origin=req.headers.get('origin'),site=req.headers.get('sec-fetch-site');
 if(origin!=='https://veloryz.online'&&!/^http:\/\/localhost:\d+$/.test(origin||''))return respond({error:'Origin not allowed.'},403);
 if(site==='cross-site')return respond({error:'Cross-site requests are disabled.'},403);
 if(!BASE||!KEY)return respond({saved:false,message:'Consent receipt database unavailable.'},503);
 if(!(req.headers.get('content-type')||'').includes('application/json'))return respond({error:'Expected JSON.'},415);
 if(Number(req.headers.get('content-length')||0)>1300)return respond({error:'Invalid receipt.'},413);
 let body:any;
 try{const text=await req.text();if(text.length>1300)return respond({error:'Invalid receipt.'},413);body=JSON.parse(text)}catch{return respond({error:'Invalid receipt.'},400)}
 const at=String(body?.at||''),when=Date.parse(at),now=Date.now(),receipt=String(body?.receipt||'');
 const version=String(body?.version||''),source=String(body?.source||'');
 if(!uuid.test(receipt)||version!=='2026-11-22.1'||!['accept','reject','custom'].includes(source)||
 typeof body.preferences!=='boolean'||typeof body.analytics!=='boolean'||body.marketing!==false||
 body.necessary!==true||!Number.isFinite(when)||Math.abs(when-now)>86400000)return respond({error:'Invalid consent record.'},400);
 if(source==='reject'&&(body.preferences||body.analytics)||source==='accept'&&!body.preferences)return respond({error:'Invalid consent state.'},400);
 try{if(!await throttle(req))return respond({saved:false,error:'Too many receipt requests. Try later.'},429)}catch{return respond({saved:false,message:'Consent receipt temporarily unavailable.'},503)}
 const recorded=new Date().toISOString(),start=new Date(now-86400000).toISOString();
 const params=[crypto.randomUUID(),receipt,version,body.preferences,body.analytics,false,source,at,recorded,receipt,start];
 try{
  const rsp=await fetch(BASE+'/rest/v1/rpc/veloryz_studio_query',{
   method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
   body:JSON.stringify({p_statements:[{key:await checksum(SQL),params}]}),
   signal:AbortSignal.timeout(8500)
  });
  if(!rsp.ok){console.error('Consent receipt persistence status',rsp.status);return respond({saved:false,message:'Consent receipt could not be recorded.'},503)}
  const result=await rsp.json();const ok=Boolean(result?.[0]?.results?.length);
  return respond({saved:ok,storedAt:ok?recorded:null,version,receipt:receipt.slice(0,8)+'…'});
 }catch{return respond({saved:false,message:'Consent receipt service temporarily unavailable.'},503)}
});
