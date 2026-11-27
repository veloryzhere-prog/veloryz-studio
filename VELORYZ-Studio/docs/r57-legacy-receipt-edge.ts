import {sendGmailMail,mailIsConfigured,brandEmail} from './gmail-lifecycle.ts';
const hex=(b:Uint8Array)=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
const hash=async(s:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
const base=(Deno.env.get('SUPABASE_URL')||'').replace(/\/$/,''),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const json=(x:unknown,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const e=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const refPattern=/^VZ-[A-F0-9]{12}$/;
async function rpc(name:string,args:unknown){const r=await fetch(base+'/rest/v1/rpc/veloryz_legacy_receipt_'+name+'_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(12000),redirect:'error'});if(!r.ok)throw Error('Receipt service unavailable');return await r.json();}
export async function sendLegacyReceipt(reference:string,kind='receipt'){
 if(!mailIsConfigured()||!refPattern.test(reference))return;
 const raw=hex(crypto.getRandomValues(new Uint8Array(32))),j=await rpc('claim',{p_reference:reference,p_kind:kind,p_hash:await hash(raw)});
 if(j?.result!=='claimed')return;
 let state='uncertain';
 try{
  const to=j.recipient;if(typeof to!=='string'||to.length>180||!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(to))throw Error('Invalid recipient');
  let result;
  if(kind==='receipt'){
   const link='https://veloryz.online/verify-client.html#legacy='+raw;
   result=await sendGmailMail({to,subject:'VELORYZ — Project registration received',text:'Your project registration has been received by VELORYZ Studio.\nReference: '+reference+'\nStatus: Pending review. No payment is due.\nVerify your email to receive your submitted project details: '+link+'\nIf you did not submit this request, ignore this email.',html:brandEmail('PROJECT REGISTRATION','Your project is registered.','<p>We received your project request.</p><p><strong>Registration reference</strong><br>'+e(reference)+'</p><p>Pending studio review. No payment is due.</p><p>Verify your email to receive your submitted project details. If you did not request this, ignore this message.</p>',{text:'Verify email',url:link})});
  }else{
   const s=j.snapshot;if(s?.email!==to)throw Error('Recipient mismatch');
   const fields=[['Registration reference',reference],['Client name',s.name],['Email',s.email],['Company',s.company],['Phone',s.phone],['Project service',s.service],['Budget preference',s.budget],['Submitted project brief',s.brief],['Registered at',s.registered_at]];
   const text=fields.filter(([,v])=>v).map(([k,v])=>k+': '+v).join('\n\n');
   const detail=fields.filter(([,v])=>v).map(([k,v])=>'<p><strong>'+e(k)+'</strong><br>'+e(v).replace(/\r?\n/g,'<br>')+'</p>').join('');
   result=await sendGmailMail({to,subject:'VELORYZ — Your submitted project details',text:text+'\n\nPending review. This is not an invoice or payment request.',html:brandEmail('VERIFIED REGISTRATION','Your project brief.',detail+'<p>Pending studio review. This is not an invoice or payment request.</p>',{text:'Studio support',url:'https://veloryz.online/support/'})});
  }
  if(result?.status==='sent')state='sent';else if(result?.status==='not-configured')state='pending';
 }catch{}
 try{await rpc('finish',{p_reference:reference,p_kind:kind,p_state:state});}catch{}
}
export async function legacyReceiptRoute(req:Request,path:string){
 if(path==='/api/registration-receipt/status'&&req.method==='GET')return json({configured:mailIsConfigured(),receipt:'automatic-on-new-legacy-project'});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(path==='/api/registration-receipt/kick'){
  if(!key||req.headers.get('authorization')!=='Bearer '+key)return json({error:'Unauthorized'},401);
  const ref=new URL(req.url).searchParams.get('reference')||'';if(!refPattern.test(ref))return json({error:'Invalid reference'},400);
  EdgeRuntime.waitUntil(sendLegacyReceipt(ref).catch(()=>{}));return json({ok:true},202);
 }
 if(path!=='/api/registration-receipt/verify')return json({error:'Not found'},404);
 if(req.headers.get('origin')!=='https://veloryz.online'||req.headers.get('sec-fetch-site')==='cross-site')return json({error:'Invalid origin'},403);
 if(req.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json({error:'JSON required'},415);
 try{
  const reader=req.body?.getReader();if(!reader)return json({error:'Invalid request'},400);let parts:Uint8Array[]=[],size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>512){try{await reader.cancel()}catch{}return json({error:'Invalid request'},413)}parts.push(value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let pos=0;for(const x of parts){bytes.set(x,pos);pos+=x.length}
  const x=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(typeof x?.token!=='string'||!/^[0-9a-f]{64}$/.test(x.token))return json({error:'Invalid or expired link'},400);
  const d=await rpc('verify',{p_hash:await hash(x.token)});if(d?.result!=='verified'||!refPattern.test(d.reference))return json({error:'Invalid or expired link'},400);
  EdgeRuntime.waitUntil(sendLegacyReceipt(d.reference,'detail').catch(()=>{}));return json({ok:true,status:'verified'});
 }catch{return json({error:'Verification unavailable. Please retry.'},503);}
}
