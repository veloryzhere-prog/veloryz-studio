// R52.2 staged adapter. Never enable without configured bot protection, trusted Worker routing and staging verification.
import {readSubmissionEnvelope,calculateQuote,fingerprint,invalid} from './creator-registration-r52.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function digest(v){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
function summary(s,q){
 const b=s.brief,lines=['PROJECT CREATOR V4','Project: '+b.category,'Template: '+(b.template||b.external||'Custom'),'Visual style: '+b.style,'Pages / screens: '+b.pages,'Features: '+b.features.join(', '),'Materials: '+b.assets.join(', '),'Budget preference: INR '+b.budgetPreference,'Indicative range: INR '+q.lowPaise/100+' - '+q.highPaise/100,'Timeline: '+b.timeline,'Priority: '+b.priority,'Goal: '+b.goal,'Structured original brief retained. Pending review; no payment due.'];
 return lines.join('\n').slice(0,2000);
}
export async function verifyCreatorChallenge(token,env,network,requestId){
 const secret=env.CREATOR_TURNSTILE_SECRET;
 const hostname=env.CREATOR_TURNSTILE_HOSTNAME;
 if(!secret||typeof hostname!=='string'||!hostname)invalid('Registration verification is unavailable.',503);
 if(!token)invalid('Complete the security verification and try again.',400);
 let result;
 try{
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,response:token,remoteip:network,idempotency_key:requestId}),signal:AbortSignal.timeout(10000),redirect:'error'});
  if(!response.ok)throw Error('Challenge unavailable');
  result=await response.json();
 }catch{invalid('Security verification is temporarily unavailable.',503);}
 if(result?.success!==true||result.hostname!==hostname||result.action!=='project_registration')invalid('Security verification expired or failed. Complete a new challenge.',400);
}
export async function registerCreator(request,env,getPublished){
 if(env.CREATOR_REGISTRATION_V1!=='enabled')return json({error:'Structured registration is not enabled.'},503);
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 try{
  const {submission,challengeToken}=await readSubmissionEnvelope(request);
  const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),secret=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!secret)invalid('Registration service is unavailable.',503);
  // Only enable on the trusted Cloudflare Worker. The host must guarantee this header.
  const network=request.headers.get('cf-connecting-ip');
  if(!network||network.length>45||!/^[0-9a-f:.]+$/i.test(network))invalid('Registration service is unavailable.',503);
  const fp=await fingerprint(submission),keys={p_submission:submission,p_fingerprint:fp,p_rate_key:await digest(submission.contact.email),p_network_key:await digest(network)};
  const rpc=async(q)=>{
   const res=await fetch(base+'/rest/v1/rpc/veloryz_register_creator_v1',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({...keys,p_quote:q,p_summary:q?summary(submission,q):null}),signal:AbortSignal.timeout(18000),redirect:'error'});
   if(!res.ok)invalid('Registration could not be confirmed. Retry with the same reference.',503);
   return await res.json();
  };
  const receipt=(out)=>{
   if(out?.result==='conflict')invalid('This registration identifier was already used for different details.',409);
   if(out?.result==='price-changed')invalid('Published pricing changed. Review the estimate and retry.',409);
   if(out?.result==='rate-limited')invalid('Too many requests. Try again in an hour.',429);
   const expected='VZ-SUB-'+submission.requestId.replaceAll('-','').toUpperCase(),q=out?.estimate;
   if(!['created','replayed'].includes(out?.result)||out.reference!==expected||q?.currency!=='INR'||q.kind!=='indicative-estimate'||q.amountDuePaise!==0||!Number.isSafeInteger(q.lowPaise)||!Number.isSafeInteger(q.highPaise)||q.lowPaise<0||q.highPaise<q.lowPaise)invalid('Registration could not be confirmed. Retry safely.',503);
   // Return only commercial summary, never contact fields or the full stored record.
   return json({ok:true,reference:out.reference,status:'pending-review',estimate:{currency:q.currency,kind:q.kind,lowPaise:q.lowPaise,highPaise:q.highPaise,amountDuePaise:0,publishedRevision:q.publishedRevision}},out.result==='created'?201:200);
  };
  // A verified retry needs neither a new CAPTCHA nor a fresh price. The full normalized request fingerprint must match.
  const previous=await rpc(null);
  if(previous?.result!=='not-found'){
   if(previous?.result==='created')invalid('Unexpected registration response.',503);
   return receipt(previous);
  }
  await verifyCreatorChallenge(challengeToken,env,network,submission.requestId);
  const q=calculateQuote(submission,await getPublished());
  return receipt(await rpc(q));
 }catch(error){const status=[400,409,413,415,429,503].includes(error?.status)?error.status:503;return json({error:status<500?error.message:'Registration is temporarily unavailable. Retry safely.'},status);}
}
