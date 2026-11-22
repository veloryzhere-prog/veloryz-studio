import {mailStatus,sendGmailMail,invitationMail,messageMail,brandEmail,makeProjectSummaryPdf} from './gmail-lifecycle.ts';
import {acceptClientProject} from './client-lifecycle.ts';
// Isolated VELORYZ client portal API. Never import a service key into the browser.
const BASE=(Deno.env.get("SUPABASE_URL")||"").replace(/\/$/,"");
const KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const OWNER=BASE+"/functions/v1/veloryz-studio-api/api/admin/state";
const QUERIES={"listProjects":"SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at FROM veloryz_studio.studio_client_projects ORDER BY updated_at DESC LIMIT 100","getProject":"SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at FROM veloryz_studio.studio_client_projects WHERE id=?","addProject":"INSERT INTO veloryz_studio.studio_client_projects (id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id","editProject":"UPDATE veloryz_studio.studio_client_projects SET client_name=?,client_email=?,title=?,summary=?,status=?,phase=?,progress=?,due_date=?,next_step=?,updated_at=? WHERE id=? RETURNING id","listItems":"SELECT id,project_id,type,title,details,state,due_date,url,created_at,updated_at FROM veloryz_studio.studio_client_items WHERE project_id=? ORDER BY created_at ASC LIMIT 150","addItem":"INSERT INTO veloryz_studio.studio_client_items (id,project_id,type,title,details,state,due_date,url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id","editItem":"UPDATE veloryz_studio.studio_client_items SET title=?,details=?,state=?,due_date=?,url=?,updated_at=? WHERE id=? AND project_id=? RETURNING id","deleteItem":"DELETE FROM veloryz_studio.studio_client_items WHERE id=? AND project_id=? RETURNING id","listMessages":"SELECT id,project_id,sender,body,created_at FROM veloryz_studio.studio_client_messages WHERE project_id=? ORDER BY created_at DESC LIMIT 100","addMessage":"INSERT INTO veloryz_studio.studio_client_messages (id,project_id,sender,body,created_at) VALUES (?,?,?,?,?) RETURNING id","revokeInvites":"UPDATE veloryz_studio.studio_client_invites SET revoked_at=? WHERE project_id=? AND revoked_at=''","revokeSessionsByProject":"UPDATE veloryz_studio.studio_client_sessions SET revoked_at=? WHERE project_id=? AND revoked_at=''","addInvite":"INSERT INTO veloryz_studio.studio_client_invites (id,project_id,token_hash,expires_at,revoked_at,created_at) VALUES (?,?,?,?,?,?) RETURNING id","consumeInvite":"UPDATE veloryz_studio.studio_client_invites SET revoked_at=? WHERE token_hash=? AND revoked_at='' AND expires_at>? RETURNING project_id","verifyInvite":"SELECT project_id FROM veloryz_studio.studio_client_invites WHERE token_hash=? AND revoked_at='' AND expires_at>?","addSession":"INSERT INTO veloryz_studio.studio_client_sessions (id,project_id,token_hash,expires_at,revoked_at,created_at) VALUES (?,?,?,?,?,?) RETURNING id","verifySession":"SELECT project_id FROM veloryz_studio.studio_client_sessions WHERE token_hash=? AND revoked_at='' AND expires_at>?","revokeSession":"UPDATE veloryz_studio.studio_client_sessions SET revoked_at=? WHERE token_hash=?","clientDecision":"UPDATE veloryz_studio.studio_client_items SET state=?,updated_at=? WHERE id=? AND project_id=? AND type='approval' AND state='waiting' RETURNING id","getEnquiry":"SELECT id,reference,name,email,phone,service,budget,preferred_date,preferred_time,company,message,status,acceptance_status,accepted_project_id,accepted_at,created_at FROM veloryz_studio.studio_enquiries WHERE id=?","findAccepted":"SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,brief_details,accepted_at FROM veloryz_studio.studio_client_projects WHERE enquiry_id=?","acceptProject":"INSERT INTO veloryz_studio.studio_client_projects (id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,brief_details,accepted_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (enquiry_id) WHERE enquiry_id IS NOT NULL DO NOTHING RETURNING id","linkEnquiry":"UPDATE veloryz_studio.studio_enquiries SET acceptance_status='accepted',accepted_project_id=(SELECT id FROM veloryz_studio.studio_client_projects WHERE enquiry_id=?),accepted_at=CASE WHEN accepted_at='' THEN ? ELSE accepted_at END,status=CASE WHEN status='new' THEN 'contacted' ELSE status END,updated_at=? WHERE id=? RETURNING id,accepted_project_id","addMilestoneOnce":"INSERT INTO veloryz_studio.studio_client_items (id,project_id,type,title,details,state,due_date,url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING RETURNING id","logEmail":"INSERT INTO veloryz_studio.studio_client_email_events (id,project_id,kind,recipient,sender,transport,state,provider_message_id,error_label,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING id","listEmailEvents":"SELECT id,kind,recipient,sender,transport,state,error_label,created_at FROM veloryz_studio.studio_client_email_events WHERE project_id=? ORDER BY created_at DESC LIMIT 35","markRead":"UPDATE veloryz_studio.studio_client_messages SET read_at=? WHERE project_id=? AND sender=? AND read_at='' RETURNING id","listProjectsFull":"SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,accepted_at FROM veloryz_studio.studio_client_projects ORDER BY updated_at DESC LIMIT 200","getProjectFull":"SELECT id,client_name,client_email,title,summary,status,phase,progress,due_date,next_step,created_at,updated_at,enquiry_id,request_reference,brief_details,accepted_at FROM veloryz_studio.studio_client_projects WHERE id=?","listMessagesFull":"SELECT id,project_id,sender,body,read_at,created_at FROM veloryz_studio.studio_client_messages WHERE project_id=? ORDER BY created_at DESC LIMIT 150","recalcProgress":"UPDATE veloryz_studio.studio_client_projects AS p SET progress=COALESCE((SELECT ROUND(100.0*COUNT(*) FILTER (WHERE state='done')/NULLIF(COUNT(*),0))::integer FROM veloryz_studio.studio_client_items WHERE project_id=p.id AND type='milestone'),p.progress),next_step=COALESCE((SELECT title FROM veloryz_studio.studio_client_items WHERE project_id=p.id AND type='milestone' AND state<>'done' ORDER BY created_at ASC,title ASC LIMIT 1),p.next_step),updated_at=? WHERE p.id=? RETURNING id,progress,next_step"};
const enc=new TextEncoder(),common={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
function send(data,status=200,extra={}){return Response.json(data,{status,headers:{...common,...extra}})}
function fail(msg,status=400){throw Object.assign(new Error(msg),{status})}
function trim(v,max=240,required=false){const s=String(v??"").trim();if(s.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f<>]/.test(s)||(required&&!s))fail("Check the field limits and required information.");return s}
function id(v){if(!/^[0-9a-f-]{36}$/i.test(String(v)))fail("Invalid item identifier.");return v}
function choice(v,options,fallback){return options.includes(v)?v:fallback}
function link(v){const s=trim(v,1500);if(!s)return "";let u;try{u=new URL(s)}catch{fail("Enter a valid HTTPS link.");}if(u.protocol!=="https:"||u.username||u.password)fail("A secure HTTPS link is required.");return u.toString()}
async function sha(s){const a=new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s)));return Array.from(a,b=>b.toString(16).padStart(2,"0")).join("")}
function secret(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,"0")).join("")}
function inviteCode(){const raw=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();return "VZ-"+raw.match(/.{4}/g).join("-")}
function normalizedInvite(value){const raw=trim(value,100).replace(/[\s-]/g,"").replace(/^VZ/i,"").toLowerCase();return /^[0-9a-f]{32}$|^[0-9a-f]{64}$/.test(raw)?raw:""}
function htmlEsc(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function sendInvitation(project,code,url,expires){
 return await sendGmailMail({to:project.client_email,...invitationMail(project,code,url,expires)});
}
async function dbBatch(statements){
 if(!BASE||!KEY)fail("Studio client backend is not configured.",503);
 const p_statements=await Promise.all(statements.map(async entry=>({key:await sha(QUERIES[entry[0]]),params:entry.slice(1)})));
 const response=await fetch(BASE+"/rest/v1/rpc/veloryz_studio_query",{
  method:"POST",headers:{"Content-Type":"application/json",apikey:KEY,Authorization:"Bearer "+KEY},
  body:JSON.stringify({p_statements}),signal:AbortSignal.timeout(24000)
 });
 if(!response.ok){console.error("Portal transaction failure",response.status);fail("Project acceptance failed. Please refresh and retry.",503)}
 return response.json();
}
async function logDelivery(project,kind,recipient,result){
 try{const now=new Date().toISOString();
  await db("logEmail",crypto.randomUUID(),project.id,kind,recipient,"veloryz.here@gmail.com",
   "gmail-smtp-465",result.status,result.provider_message_id||"",
   result.status==="sent"?"":String(result.message||"").slice(0,180),now,now);
 }catch{console.error("Client email delivery audit could not be saved");}
}
/* Save messages immediately. Mail is a best-effort notification and cannot
   cause a successful private chat message to fail or wait for SMTP. */
function queueNotification(project,kind,to,template){
 const task=(async()=>{
  const outcome=await sendGmailMail({to,...template});
  await logDelivery(project,kind,to,outcome);
 })().catch(()=>{console.error("Project notification task failed");});
 if(typeof EdgeRuntime!=="undefined"&&typeof EdgeRuntime.waitUntil==="function"){
  EdgeRuntime.waitUntil(task);
  return {status:"queued",message:"Message saved. Gmail notification queued; delivery status is tracked separately."};
 }
 // The runtime may not support background tasks; still avoid false "sent" statuses.
 void task;
 return {status:"queued",message:"Message saved. Gmail notification attempted; check the project mail log."};
}

async function issueInvite(project,now,revokeOld=true){
 const code=inviteCode(),expires=new Date(Date.now()+14*86400000).toISOString();
 const url="https://veloryz.online/client/#invite="+encodeURIComponent(code);
 if(revokeOld){
  await db("revokeInvites",now,project.id);
  await db("revokeSessionsByProject",now,project.id);
 }
 await db("addInvite",crypto.randomUUID(),project.id,await sha(normalizedInvite(code)),expires,"",now);
 const delivery=await sendInvitation(project,code,url,expires);
 await logDelivery(project,"invitation",project.client_email,delivery);
 return {code,url,email:project.client_email,expires_at:expires,one_time:true,delivery};
}
async function db(name,...params){
 if(!BASE||!KEY)fail("Studio client backend is not configured.",503);
 const sql=QUERIES[name];if(!sql)fail("Unsupported operation.",404);
 const response=await fetch(BASE+"/rest/v1/rpc/veloryz_studio_query",{
 method:"POST",headers:{"Content-Type":"application/json",apikey:KEY,Authorization:"Bearer "+KEY},
 body:JSON.stringify({p_statements:[{key:await sha(sql),params}]}),signal:AbortSignal.timeout(18000)
 });
 if(!response.ok){console.error("Portal query failure",name,response.status);fail("The studio database is temporarily unavailable.",503)}
 return (await response.json())[0]?.results||[];
}
async function payload(r){
 if(!r.headers.get("content-type")?.includes("application/json"))fail("Use a JSON request.",415);
 if(Number(r.headers.get("content-length")||0)>16000)fail("The document is too large.",413);
 const text=await r.text();if(text.length>16000)fail("The document is too large.",413);
 try{const v=JSON.parse(text);if(!v||typeof v!=="object"||Array.isArray(v))throw 0;return v}catch{fail("The document could not be read.");}
}
function getCookie(req,name){const s=req.headers.get("cookie")||"";const value=s.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));return value?.slice(name.length+1)||""}
async function admin(req){
 const cookie=getCookie(req,"vz_admin");
 if(!cookie)return false;
 const res=await fetch(OWNER,{headers:{"cookie":"vz_admin="+cookie},cache:"no-store",signal:AbortSignal.timeout(13000)});
 return res.ok;
}
async function client(req){
 const raw=getCookie(req,"vz_portal");
 if(!/^[0-9a-f]{64}$/.test(raw))return "";
 const result=await db("verifySession",await sha(raw),new Date().toISOString());
 return result[0]?.project_id||"";
}
async function view(pid){
 const project=(await db("getProjectFull",pid))[0];if(!project)fail("Project not found.",404);
 const [items,messages]=await Promise.all([db("listItems",pid),db("listMessagesFull",pid)]);
 return {project,items,messages:messages.reverse()};
}
function fields(v){
 const email=trim(v.client_email,180,true).toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail("Enter a valid client email.");
 const prog=Number(v.progress??0);
 if(!Number.isFinite(prog)||prog<0||prog>100)fail("Progress must be between 0 and 100.");
 const date=trim(v.due_date,10);
 if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))fail("Use YYYY-MM-DD for the due date.");
 return [trim(v.client_name,100,true),email,trim(v.title,160,true),trim(v.summary,1700),
 choice(v.status,["planning","in-progress","in-review","launched","on-hold"],"planning"),
 choice(v.phase,["Discover","Define","Design","Develop","Review","Launch"],"Discover"),
 Math.round(prog),date,trim(v.next_step,1200)];
}
function itemFields(v){
 const type=choice(v.type,["milestone","file","approval"],"milestone");
 const state=choice(v.state,["upcoming","in-progress","done","waiting","approved","changes"],type==="approval"?"waiting":"upcoming");
 const due=trim(v.due_date,10);if(due&&!/^\d{4}-\d{2}-\d{2}$/.test(due))fail("Use YYYY-MM-DD for the date.");
 return [type,trim(v.title,160,true),trim(v.details,1400),state,due,link(v.url)];
}
function mutation(req){
 const origin=req.headers.get("origin");
 if(origin&&origin!=="https://veloryz.online"&&!/^http:\/\/localhost:\d+$/.test(origin))fail("This request must come from the studio website.",403);
 if(req.headers.get("sec-fetch-site")==="cross-site")fail("Cross-origin actions are not allowed.",403);
}
async function main(req){
 const u=new URL(req.url),path=u.pathname.replace(/^.*?\/veloryz-client-portal-api(?=\/)/,"").replace(/\/$/,"");
 if(!path.startsWith("/api/client-portal"))return send({error:"Not found."},404);
 if(!["GET","POST","PUT","DELETE"].includes(req.method))return send({error:"Unsupported method."},405);
 if(req.method!=="GET")mutation(req);
 const action=path.slice("/api/client-portal".length),now=new Date().toISOString();
 if(action==="/access"&&req.method==="POST"){
  const v=await payload(req),code=normalizedInvite(v.invite);
  if(!code)fail("This invitation is invalid or expired.",401);
  const found=await db("consumeInvite",now,await sha(code),now);
  if(!found.length)fail("This invitation is invalid or expired.",401);
  const t=secret(),exp=new Date(Date.now()+7*86400000).toISOString();
  await db("addSession",crypto.randomUUID(),found[0].project_id,await sha(t),exp,"",now);
  return send({ok:true},200,{"Set-Cookie":"vz_portal="+t+"; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict"});
 }
 if(action==="/logout"&&req.method==="POST"){
  const raw=getCookie(req,"vz_portal");
  if(/^[0-9a-f]{64}$/.test(raw))await db("revokeSession",now,await sha(raw));
  return send({ok:true},200,{"Set-Cookie":"vz_portal=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"});
 }
 if(action.startsWith("/admin/")){
  if(!await admin(req))return send({error:"Studio owner login required."},401);
  if(action==="/admin/delivery"&&req.method==="GET")return send(mailStatus());
  if(action==="/admin/projects"&&req.method==="GET"){
   const projects=await db("listProjectsFull"),pid=u.searchParams.get("id");
   return send(pid?{projects,workspace:await view(id(pid))}:{projects});
  }
  if(action==="/admin/test-email"&&req.method==="POST"){
   if(!mailStatus().configured)return send({ok:false,status:"not-configured",message:"Configure VELORYZ_GMAIL_APP_PASSWORD in Supabase first."},503);
   const recipient="veloryz.here@gmail.com";
   const outcome=await sendGmailMail({to:recipient,subject:"VELORYZ | Gmail sender connection test",
    html:brandEmail("PRIVATE OWNER DELIVERY TEST","Gmail SMTP is reachable.",
     '<p style="line-height:1.7;color:#596079">Your VELORYZ Studio Gmail test was accepted by the SMTP provider. This is an owner-only test; no client record or invitation was changed.</p>'),
    text:"VELORYZ Studio Gmail test message. This is an owner-only delivery test and has no client effect."});
   return send({ok:outcome.status==="sent",...outcome},outcome.status==="sent"?200:503);
  }
  if(action==="/admin/accept"&&req.method==="POST"){
   const v=await payload(req);
   return send(await acceptClientProject(id(v.enquiry_id),now,db,dbBatch,issueInvite,logDelivery));
  }
  if(action==="/admin/mail-events"&&req.method==="GET"){
   return send({events:await db("listEmailEvents",id(u.searchParams.get("project_id")))});
  }
  if(action.startsWith("/admin/projects/")&&action.endsWith("/summary")&&req.method==="GET"){
   const pid=id(action.split("/").at(-2)),project=(await db("getProjectFull",pid))[0];
   if(!project)fail("Project not found.",404);
   const items=(await db("listItems",pid)).filter(i=>i.type==="milestone");
   const pdf=await makeProjectSummaryPdf(project,items);
   return new Response(pdf,{headers:{...common,"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="VELORYZ-Project-Summary.pdf"'}});
  }
  if(action==="/admin/messages/read"&&req.method==="POST"){
   const v=await payload(req),pid=id(v.project_id);
   if(!(await db("getProject",pid)).length)fail("Project not found.",404);
   return send({ok:true,read:(await db("markRead",now,pid,"client")).length});
  }
  if(action==="/admin/projects"&&req.method==="POST"){
   const v=await payload(req),pid=crypto.randomUUID();
   await db("addProject",pid,...fields(v),now,now);
   return send({ok:true,id:pid},201);
  }
  if(action.startsWith("/admin/projects/")&&req.method==="PUT"){
   const pid=id(action.split("/").pop()),v=await payload(req);
   const previous=(await db("getProject",pid))[0];
   if(!previous)fail("Project not found.",404);
   const values=fields(v);
   const emailChanged=previous.client_email!==values[1];
   // Never leave an old recipient logged in after the owner reassigns a project.
   // Revoke first: failed subsequent edits cannot accidentally preserve old access.
   if(emailChanged){
    await db("revokeInvites",now,pid);
    await db("revokeSessionsByProject",now,pid);
   }
   if(!(await db("editProject",...values,now,pid)).length)fail("Project not found.",404);
   return send({ok:true,id:pid,email_access_reset:emailChanged});
  }
  if(action==="/admin/items"&&req.method==="POST"){
   const v=await payload(req),pid=id(v.project_id);
   if(!(await db("getProject",pid)).length)fail("Project not found.",404);
   const [type,title,details,state,due,fileUrl]=itemFields(v);
   if(v.id){
    const item=id(v.id);
    if(!(await db("editItem",title,details,state,due,fileUrl,now,item,pid)).length)fail("Item not found.",404);
    if(type==="milestone")await db("recalcProgress",now,pid);
    return send({ok:true,id:item});
   }
   const item=crypto.randomUUID();
   await db("addItem",item,pid,type,title,details,state,due,fileUrl,now,now);
   if(type==="milestone")await db("recalcProgress",now,pid);
   return send({ok:true,id:item},201);
  }
  if(action.startsWith("/admin/items/")&&req.method==="DELETE"){
   const item=id(action.split("/").pop()),pid=id(u.searchParams.get("project_id"));
   if(!(await db("deleteItem",item,pid)).length)fail("Item not found.",404);
   await db("recalcProgress",now,pid);
   return send({ok:true});
  }
  if(action==="/admin/messages"&&req.method==="POST"){
   const v=await payload(req),pid=id(v.project_id),message=trim(v.body,2000,true);
   if(!(await db("getProject",pid)).length)fail("Project not found.",404);
   await db("addMessage",crypto.randomUUID(),pid,"studio",message,now);
   const project=(await db("getProjectFull",pid))[0];
   const notification=queueNotification(project,"studio-message",project.client_email,messageMail(project,"studio"));
   return send({ok:true,notification},201);
  }
  if(action==="/admin/invite"&&req.method==="POST"){
   const v=await payload(req),pid=id(v.project_id);
   if(!(await db("getProject",pid)).length)fail("Project not found.",404);
   const project=(await db("getProjectFull",pid))[0];
   return send({ok:true,...await issueInvite(project,now,true)});
  }
  return send({error:"Not found."},404);
 }
 const pid=await client(req);
 if(!pid)return send({error:"Use your private invitation to open this workspace.",signedOut:true},401);
 if(action==="/session"&&req.method==="GET")return send(await view(pid));
 if(action==="/summary"&&req.method==="GET"){
  const project=(await db("getProjectFull",pid))[0];
  if(!project)fail("Client project not found.",404);
  const items=(await db("listItems",pid)).filter(i=>i.type==="milestone");
  const bytes=await makeProjectSummaryPdf(project,items);
  return new Response(bytes,{headers:{...common,"Content-Type":"application/pdf",
   "Content-Disposition":'attachment; filename="VELORYZ-Project-Summary.pdf"'}});
 }
 if(action==="/messages/read"&&req.method==="POST"){
  return send({ok:true,read:(await db("markRead",now,pid,"studio")).length});
 }
 if(action==="/messages"&&req.method==="POST"){
  const v=await payload(req),message=trim(v.body,2000,true);
  if(message.length<2)fail("Write at least two characters.");
  await db("addMessage",crypto.randomUUID(),pid,"client",message,now);
  const project=(await db("getProjectFull",pid))[0];
  const recipient="veloryz.here@gmail.com";
  const notification=queueNotification(project,"client-message",recipient,messageMail(project,"client"));
  return send({ok:true,notification},201);
 }
 if(action==="/decisions"&&req.method==="POST"){
  const v=await payload(req),item=id(v.id),status=choice(v.state,["approved","changes"],"");
  if(!status)fail("Select approve or request changes.");
  if(!(await db("clientDecision",status,now,item,pid)).length)fail("This review is no longer pending.",409);
  const note=trim(v.note,1000);
  await db("addMessage",crypto.randomUUID(),pid,"client",status==="approved"?"Approved a review. "+note:"Requested changes. "+note,now);
  return send({ok:true});
 }
 return send({error:"Not found."},404);
}
Deno.serve(async req=>{try{return await main(req)}catch(e){return send({error:e.status?e.message:"The client workspace could not complete this request."},e.status||500)}});
