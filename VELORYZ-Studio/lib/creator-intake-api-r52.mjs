// R52.2.6: call ONLY after existing owner authorization and password session validation.
export async function listCreatorSubmissions(request,env){
 const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 if(env.CREATOR_REGISTRATION_V1!=='enabled')return json({error:'Structured registration is not enabled.'},503);
 const params=new URL(request.url).searchParams,status=params.get('status')||'all',q=(params.get('q')||'').trim(),page=Number(params.get('page')||0);
 if(!['all','new','contacted','confirmed','closed'].includes(status)||q.length>120||!Number.isInteger(page)||page<0||page>10000)return json({error:'Invalid search or page.'},400);
 const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),secret=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!secret)return json({error:'Registration directory unavailable.'},503);
 try{
  const response=await fetch(base+'/rest/v1/rpc/veloryz_list_creator_v1',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_status:status,p_query:q,p_page:page}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('Database unavailable');
  const data=await response.json();
  if(data?.source!=='structured-v1'||!Array.isArray(data.items)||data.items.length>25||!Number.isSafeInteger(data.total)||data.total<0)throw Error('Invalid response');
  return json(data);
 }catch{return json({error:'Registration directory unavailable.'},503);}
}
