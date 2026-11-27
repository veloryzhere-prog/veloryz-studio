// Owner-only; called after existing owner authorization and mutation-origin check.
const reply=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function onboardingAdmin(request,env){
 const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)return reply({error:'Private database is unavailable.'},503);
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 const enabled=env.ONBOARDING_EMAIL_V1==='enabled'&&env.CREATOR_REGISTRATION_V1==='enabled'&&env.CLIENT_IDENTITY_V1==='enabled'&&env.ESTIMATE_DOCUMENTS_V1==='enabled';
 const edge=base+'/functions/v1/veloryz-onboarding-mail';
 try{
 if(request.method==='GET'){
  const workspace=new URL(request.url).searchParams.get('workspace')||null;
  if(workspace&&!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(workspace))return reply({error:'Invalid workspace.'},400);
  const r=await fetch(base+'/rest/v1/rpc/veloryz_onboarding_status_v1',{method:'POST',headers,body:JSON.stringify({p_workspace:workspace}),signal:AbortSignal.timeout(10000),redirect:'error'});
  if(!r.ok)throw Error('Database unavailable');const d=await r.json();
  if(d?.source!=='onboarding-status-v1'||!d.counts||!Array.isArray(d.jobs))throw Error('Invalid status');
  let transport='unverified';try{const t=await fetch(edge,{headers,signal:AbortSignal.timeout(5000),redirect:'error'});if(t.ok){const x=await t.json();if(x.ok===true)transport=x.configured===true?'configured':x.configured===false?'not-configured':'unverified';}}catch{}
  return reply({...d,enabled,transport});
 }
 if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
 if(!enabled)return reply({error:'Automatic onboarding is not activated.'},409);
 const r=await fetch(edge,{method:'POST',headers,signal:AbortSignal.timeout(7000),redirect:'error'});
 if(r.status!==202)return reply({error:'Mail processor did not accept the wake-up.'},503);
 return reply({ok:true,status:'processing-requested'},202);
 }catch{return reply({error:'Onboarding service unavailable.'},503);}
}
