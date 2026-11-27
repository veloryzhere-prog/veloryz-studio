// R52.5: bounded best-effort wake-up; committed queue survives any transport failure.
export async function kickOnboarding(env){
 if(env.ONBOARDING_EMAIL_V1!=='enabled'||env.CLIENT_IDENTITY_V1!=='enabled'||env.ESTIMATE_DOCUMENTS_V1!=='enabled')return;
 const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)return;
 try{await fetch(base+'/functions/v1/veloryz-onboarding-mail',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(4000),redirect:'error'});}catch{/* pending row retained, no duplicate direct send */}
}
