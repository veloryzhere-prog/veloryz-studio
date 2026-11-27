// R52.5.3 — owner-only commercial operations; amounts in integer paise.
import {makeCommercialPdf} from './commercial-pdf-r55.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const invalid=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const clean=(v,min,max)=>{if(typeof v!=='string'||v.trim().length<min||v.trim().length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v))invalid('Invalid commercial field.');return v.trim();};
const amount=v=>{if(!Number.isSafeInteger(v)||v<1||v>100000000000)invalid('Invalid amount.');return v;};
async function body(req){if(req.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')invalid('JSON required.',415);
 const reader=req.body?.getReader();if(!reader)invalid('Request required.');let parts=[],size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>12000){try{await reader.cancel()}catch{}invalid('Request too large.',413)}parts.push(value)}}finally{reader.releaseLock()}
 const b=new Uint8Array(size);let offset=0;for(const x of parts){b.set(x,offset);offset+=x.length}let v;try{v=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b))}catch{invalid('Invalid JSON.')}if(!v||typeof v!=='object'||Array.isArray(v))invalid('Invalid JSON.');return v;}
export async function commercialAdmin(request,env){
 const base=String(env.SUPABASE_URL||'').replace(/\/$/,''),key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)return json({error:'Private database unavailable.'},503);
 const enabled=env.COMMERCIAL_BILLING_V1==='enabled';
 try{
 const p=new URL(request.url).searchParams,w=p.get('workspace')||'';if(!uuid.test(w))invalid('Invalid workspace.');
 const rpc=async(name,args)=>{const r=await fetch(base+'/rest/v1/rpc/veloryz_commercial_'+name+'_v1',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)invalid('Commercial database unavailable.',503);return await r.json();};
 const read=async()=>{const d=await rpc('read',{p_workspace:w});if(d?.source!=='commercial-v1')invalid('Workspace not found.',404);return {...d,enabled};};
 if(request.method==='GET'){const d=await read();if(p.get('pdf')==='1'){if(!d.invoice||!d.quote)invalid('No billing record issued.',404);const bytes=makeCommercialPdf(d);return new Response(bytes,{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+d.invoice.invoice_code+'.pdf"'}})}return json(d);}
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(!enabled)invalid('Commercial billing is not activated.',409);
 const x=await body(request);if(x.confirm!==true)invalid('Explicit owner confirmation required.');
 let d;
 if(x.action==='approve')d=await rpc('approve',{p_workspace:w,p_amount:amount(x.amount),p_agreement:clean(x.agreement,3,250),p_scope:clean(x.scope,10,2000)});
 else if(x.action==='issue'){if(typeof x.due!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.due)||!Number.isFinite(Date.parse(x.due))||new Date(x.due).toISOString().slice(0,10)!==x.due)invalid('Invalid due date.');d=await rpc('issue',{p_workspace:w,p_due:x.due});}
 else if(x.action==='record'){if(typeof x.id!=='string'||!uuid.test(x.id))invalid('Invalid payment identifier.');d=await rpc('record',{p_workspace:w,p_id:x.id,p_amount:amount(x.amount),p_reference:clean(x.reference,3,160)});}
 else invalid('Unknown commercial action.');
 if(d?.result!=='ready'){const reasons={'conflict':'Conflicting existing record. No change made.','ineligible':'A verified, accepted workspace and required approval are needed.','legacy-payment-review':'Legacy payment records require reconciliation first.','overpayment':'Amount exceeds outstanding balance.','invalid':'Invalid commercial details.'};invalid(reasons[d?.result]||'Commercial operation unavailable.',d?.result==='invalid'?400:409);}
 return json(await read());
 }catch(e){const status=[400,404,409,413,415,503].includes(e?.status)?e.status:503;return json({error:status===503?'Commercial service unavailable.':e.message},status);}
}
