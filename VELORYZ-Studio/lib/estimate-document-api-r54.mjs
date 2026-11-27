import {makeEstimatePdf} from './estimate-pdf-r54.mjs';
// Owner-only route. Preparing an immutable record is an explicit POST; no invoice or payment action.
export async function estimateDocument(request,env){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 const json=(v,status)=>Response.json(v,{status,headers});
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(env.ESTIMATE_DOCUMENTS_V1!=='enabled'||env.CLIENT_IDENTITY_V1!=='enabled'||env.CREATOR_REGISTRATION_V1!=='enabled')return json({error:'Estimate documents are not enabled.'},503);
 const id=new URL(request.url).searchParams.get('workspace')||'',base=String(env.SUPABASE_URL||'').replace(/\/$/,''),key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return json({error:'Invalid workspace.'},400);
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)return json({error:'Estimate service unavailable.'},503);
 try{
  const r=await fetch(base+'/rest/v1/rpc/veloryz_estimate_prepare_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_workspace:id}),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!r.ok)throw Error('RPC unavailable');
  const d=await r.json();if(d?.result==='not-found')return json({error:'Workspace not found.'},404);
  if(d?.result!=='ready'||d.document?.workspace_id!==id.toLowerCase())throw Error('Invalid document');
  const bytes=makeEstimatePdf(d.document);
  return new Response(bytes,{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+d.document.document_code+'.pdf"'}});
 }catch{return json({error:'Estimate document could not be generated.'},503);}
}
