// Private read-only business dashboard. Caller MUST verify owner session.
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function businessOverview(request,env,hosted=false){
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)return json({error:'Private database unavailable.'},503);
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 const count=(o,keys)=>o&&keys.every(k=>Number.isSafeInteger(o[k])&&o[k]>=0);
 try{
  const r=await fetch(base+'/rest/v1/rpc/veloryz_business_overview_v1',{method:'POST',headers,body:'{}',signal:AbortSignal.timeout(12000),redirect:'error'});
  if(!r.ok)throw Error('Overview unavailable');const d=await r.json();
  if(d?.source!=='business-overview-v1'||!count(d.registration,['total','pending','accepted','closed'])||!count(d.identities,['total','verified'])||!count(d.rooms,['total','active'])||!count(d.finance,['quotes','bills','billed_paise','recorded_paise','outstanding_paise','overdue','overlap'])||d.finance.billed_paise!==d.finance.recorded_paise+d.finance.outstanding_paise||!count(d.legacy,['requests','paid_marked'])||!count(d.onboarding,['pending','held','sending','stalled','sent','uncertain','cancelled'])||!count(d.access,['eligible','sending','stalled','sent','uncertain'])||!count(d.billing_mail,['pending','sending','stalled','uncertain','held','sent']))throw Error('Invalid overview');
  let transport='unverified';try{const t=await fetch(base+'/functions/v1/veloryz-onboarding-mail',{headers,signal:AbortSignal.timeout(3500),redirect:'error'});if(t.ok){const x=await t.json();if(x.ok===true)transport=x.configured===true?'configured':x.configured===false?'not-configured':'unverified';}}catch{}
  const enabled=k=>env[k]==='enabled';
  const readiness=hosted?null:{registration:enabled('CREATOR_REGISTRATION_V1'),identity:enabled('CLIENT_IDENTITY_V1'),estimate:enabled('ESTIMATE_DOCUMENTS_V1'),email:enabled('ONBOARDING_EMAIL_V1'),access:enabled('ONBOARDING_ACCESS_V1'),billing:enabled('COMMERCIAL_BILLING_V1'),challenge:!!(env.CREATOR_TURNSTILE_SITE_KEY&&env.CREATOR_TURNSTILE_SECRET&&env.CREATOR_TURNSTILE_HOSTNAME===new URL(request.url).hostname)};
  return json({...d,runtime:hosted?'hosted':'direct',readiness,transport});
 }catch{return json({error:'Business overview unavailable. No figures were estimated.'},503);}
}
