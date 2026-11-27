import {makeCommercialPdf} from './commercial-pdf-r55.mjs';
import {sendGmailMail,mailIsConfigured} from './gmail-lifecycle.ts';
import {makeEstimatePdf} from './estimate-pdf-r54.mjs';
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const eq=(a:string,b:string)=>{if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const base=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
async function rpc(name:string,args:unknown){
 const r=await fetch(base+'/rest/v1/rpc/veloryz_onboarding_'+name+'_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!r.ok)throw Error('Queue unavailable');return await r.json();
}
const e=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function html(title:string,body:string){return '<!doctype html><html lang="en"><body style="margin:0;background:#f3f5fa;font:16px Arial,sans-serif;color:#161b2a"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px"><table role="presentation" width="100%" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden"><tr><td style="background:#080b23;color:white;padding:24px"><strong style="font-size:24px">VELORYZ</strong><div style="font-size:12px;margin-top:8px">STUDIO / CLIENT ONBOARDING</div></td></tr><tr><td style="padding:28px"><h1 style="font-size:26px">'+e(title)+'</h1>'+body+'<p style="margin-top:28px;font-size:12px;color:#536075">Need assistance? <a href="https://veloryz.online/support/">Studio support</a></p></td></tr></table></td></tr></table></body></html>'}
async function processOne(){
 const raw=hex(crypto.getRandomValues(new Uint8Array(32))),hash=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))));
 const j=await rpc('claim',{p_hash:hash});
 if(j?.result!=='claimed')return;
 let state='uncertain',id='';
 try{
  const to=j.recipient;
  if(typeof to!=='string'||!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(to)||to.length>180)throw Error('Invalid recipient');
  let outcome;
  if(j.kind==='verify-recipient'){
   const url='https://veloryz.online/verify-client.html#token='+raw;
   outcome=await sendGmailMail({to,subject:'VELORYZ - verify your email',text:'Verify the email address for your recent VELORYZ registration: '+url+'\n\nIf you did not request this, ignore this message. No project details or access credentials are included.',html:html('Confirm your email','<p>Verify your email address to continue onboarding.</p><p><a style="background:#3349a6;color:#fff;padding:12px 18px;display:inline-block;text-decoration:none;border-radius:6px" href="'+e(url)+'">Verify email</a></p><p>If you did not request this, ignore this message. No account access is issued by this link.</p>')});
  }else if(j.kind==='registration-estimate'){
   const d=j.document,s=d?.snapshot;
   if(s?.contact?.email!==to||!/^VZ-EST-[A-F0-9]{32}$/.test(d?.document_code||''))throw Error('Invalid document');
   const bytes=makeEstimatePdf(d);
   outcome=await sendGmailMail({to,subject:'VELORYZ - registration estimate',text:'Your email is verified. Your registration estimate is attached. Client ID: '+s.client_code+'\nProject ID: '+s.project_code+'\nThe estimate is indicative; no payment is due and no private delivery room access has been issued.',html:html('Your registration estimate','<p>Your email address is verified. Your initial project estimate is attached.</p><p><strong>Client ID</strong><br>'+e(s.client_code)+'</p><p><strong>Project ID</strong><br>'+e(s.project_code)+'</p><p>Pending studio review. No payment is due. This is not a tax invoice or an access invitation.</p>'),attachments:[{filename:d.document_code+'.pdf',bytes,contentType:'application/pdf'}]});
  }
  if(outcome?.status==='sent'){state='sent';id=String(outcome.provider_message_id||'').slice(0,180);}
 }catch{/* no PII or secrets in logs */}
 try{await rpc('finish',{p_job:j.id,p_state:state,p_message:id});}catch{/* sending remains visibly unresolved; never blindly resend */}
}
async function processAccess(){
 const raw=hex(crypto.getRandomValues(new Uint8Array(16))),hash=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))));
 const accessRpc=async(name:string,args:unknown)=>{
  const r=await fetch(base+'/rest/v1/rpc/veloryz_access_'+name+'_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!r.ok)throw Error('Access service unavailable');return await r.json();
 };
 const j=await accessRpc('claim',{p_hash:hash});if(j?.result!=='claimed')return;
 let state='uncertain',message='';
 try{
  const to=j.recipient;if(typeof to!=='string'||!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(to)||to.length>180||j.project?.client_email!==to)throw Error('Invalid recipient');
  const code='VZ-'+raw.toUpperCase().match(/.{4}/g)!.join('-');
  const url='https://veloryz.online/client/#invite='+encodeURIComponent(code);
  const outcome=await sendGmailMail({to,subject:'VELORYZ - your private client room invitation',text:'Your verified and accepted project is ready for access. Open '+url+'\n\nOne-time invitation code: '+code+'\nExpires: '+j.expires_at+'\nDo not share this code.',html:html('Your private Client Room','<p>Your verified project has been accepted by the studio. You can now open your private workspace.</p><p><a href="'+e(url)+'" style="background:#3349a6;color:white;padding:12px 18px;display:inline-block;border-radius:6px;text-decoration:none">Activate Client Room</a></p><p>One-time code: <strong>'+e(code)+'</strong></p><p>Expires: '+e(j.expires_at)+'. Do not forward or share this code.</p>')});
  if(outcome?.status==='sent'){state='sent';message=String(outcome.provider_message_id||'').slice(0,180);}
 }catch{}
 try{await accessRpc('finish',{p_job:j.id,p_state:state,p_message:message});}catch{}
}
async function processCommercial(){
 const call=async(name:string,args:unknown)=>{
  const r=await fetch(base+'/rest/v1/rpc/veloryz_commercial_mail_'+name+'_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!r.ok)throw Error('Commercial delivery unavailable');return await r.json();
 };
 const j=await call('claim',{});if(j?.result!=='claimed')return;
 let state='uncertain',message='';
 try{
  const d=j.document,to=j.recipient;
  if(typeof to!=='string'||!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(to)||to.length>180||d?.quote?.snapshot?.email!==to)throw Error('Invalid recipient');
  const bytes=makeCommercialPdf(d);
  const outcome=await sendGmailMail({to,subject:'VELORYZ - approved project billing statement',text:'Your studio-approved commercial billing statement is attached. It reflects recorded receipts at generation. Please contact the studio to confirm payment instructions. This is not a tax invoice or gateway receipt.',html:html('Your project billing statement','<p>Your approved billing statement is attached as a private PDF.</p><p>Reference: '+e(d.invoice.invoice_code)+'</p><p>Please contact the studio to confirm payment instructions. The statement is not a tax invoice or gateway receipt.</p>'),attachments:[{filename:d.invoice.invoice_code+'.pdf',bytes,contentType:'application/pdf'}]});
  if(outcome?.status==='sent'){state='sent';message=String(outcome.provider_message_id||'').slice(0,180);}
 }catch{}
 try{await call('finish',{p_job:j.id,p_state:state,p_message:message});}catch{}
}
Deno.serve((request)=>{
 if(!key||!eq(request.headers.get('authorization')||'','Bearer '+key))return json({error:'Unauthorized'},401);
 if(request.method==='GET')return json({ok:true,configured:mailIsConfigured()});
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(!mailIsConfigured())return json({error:'Mail transport not configured'},503);
 if(request.headers.get('x-veloryz-commercial')==='enabled'){EdgeRuntime.waitUntil(processCommercial().catch(()=>{}));return json({ok:true,status:'queued-for-processing'},202);}
 EdgeRuntime.waitUntil(processOne().catch(()=>{}));
 if(request.headers.get('x-veloryz-access')==='enabled')EdgeRuntime.waitUntil(processAccess().catch(()=>{}));
 return json({ok:true,status:'queued-for-processing'},202);
});