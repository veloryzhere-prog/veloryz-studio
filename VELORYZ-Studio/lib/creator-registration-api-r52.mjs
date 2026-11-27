// R52.2 staged server adapter. Activate only after the private SQL and deployment tests.
import {readSubmission,calculateQuote,fingerprint,invalid} from './creator-registration-r52.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function digest(v){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
function summary(s,q){
 const b=s.brief,lines=['PROJECT CREATOR V4','Project: '+b.category,'Template: '+(b.template||b.external||'Custom'),'Visual style: '+b.style,'Pages / screens: '+b.pages,'Features: '+b.features.join(', '),'Materials: '+b.assets.join(', '),'Budget preference: INR '+b.budgetPreference,'Indicative range: INR '+q.lowPaise/100+' - '+q.highPaise/100,'Timeline: '+b.timeline,'Priority: '+b.priority,'Goal: '+b.goal,'Structured original brief retained. Pending review; no payment due.'];
 return lines.join('\n').slice(0,2000);
}
export async function registerCreator(request,env,getPublished){
 if(env.CREATOR_REGISTRATION_V1!=='enabled')return json({error:'Structured registration is not enabled.'},503);
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 try{
  const submission=await readSubmission(request);
  const published=await getPublished();
  const q=calculateQuote(submission,published),fp=await fingerprint(submission);
  const base=String(env.SUPABASE_URL||'').replace(/\/$/,'');
  const secret=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!secret)invalid('Registration service is unavailable.',503);
  // Use only the trusted edge-provided network address. No caller-controlled fallback.
  const network=request.headers.get('cf-connecting-ip');if(!network)invalid('Registration service is unavailable.',503);
  const res=await fetch(base+'/rest/v1/rpc/veloryz_register_creator_v1',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_submission:submission,p_quote:q,p_fingerprint:fp,p_rate_key:await digest(submission.contact.email),p_network_key:await digest(network),p_summary:summary(submission,q)}),signal:AbortSignal.timeout(18000)});
  if(!res.ok)invalid('Registration could not be confirmed. Retry with the same reference.',503);
  const out=await res.json();
  if(out?.result==='conflict')invalid('This registration identifier was already used for different details.',409);
  if(out?.result==='price-changed')invalid('Published pricing changed. Review the estimate and retry.',409);
  if(out?.result==='rate-limited')invalid('Too many requests. Try again in an hour.',429);
  if(!['created','replayed'].includes(out?.result)||!/^VZ-SUB-[A-F0-9]{32}$/.test(out?.reference||'')||!out.estimate)invalid('Registration could not be confirmed. Retry safely.',503);
  return json({ok:true,reference:out.reference,status:'pending-review',estimate:out.estimate},out.result==='created'?201:200);
 }catch(error){return json({error:Number.isInteger(error.status)&&error.status<500?error.message:'Registration is temporarily unavailable. Retry safely.'},Number.isInteger(error.status)?error.status:503);}
}
