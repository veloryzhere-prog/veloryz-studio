/* Protected project request -> active VELORYZ client workspace.
   The caller has already checked the owner session and Origin protections.
   Query execution uses server-side SHA-pinned SQL contracts; no dynamic SQL. */
import {makeProjectSummaryPdf,acceptanceMail,sendGmailMail} from './gmail-lifecycle.ts';
const milestones=[
 ["Discovery & kickoff","Confirm the original request, audience, project goals and decision makers."],
 ["Scope & project plan","Agree the scope, required pages and features, deliverables, timeline and budget assumptions."],
 ["Creative direction","Produce approved design direction, structure, original visual references and concept options."],
 ["Production & development","Build the agreed experience, core functionality, integrations and creative assets."],
 ["Review & refinement","Share work for feedback, record approvals and resolve requested changes."],
 ["Launch & handover","Complete the review, deliver agreed files, launch when approved and arrange support."]
];
const shorten=(value,max=160)=>String(value??"").trim().slice(0,max);
const v4id=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function creatorFields(msg:string){const fields:Record<string,string>={};for(const line of String(msg||"").split("\n").slice(0,75)){const n=line.indexOf(": ");if(n>0&&n<90){const key=line.slice(0,n).trim();if(key)fields[key]=line.slice(n+2).trim().slice(0,800)}}return fields;}
async function stableUUID(enquiry:string,kind:string){
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(enquiry+"|"+kind));
 const b=new Uint8Array(digest).slice(0,16);b[6]=b[6]&0x0f|0x40;b[8]=b[8]&0x3f|0x80;
 const hex=Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");
 return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join("-");
}
type Db=(name:string,...values:unknown[])=>Promise<any[]>;
type Batch=(statements:unknown[][])=>Promise<any[]>;
type Delivery=(project:any,kind:string,recipient:string,outcome:any)=>Promise<void>;
type Invitation=(project:any,now:string,revoke:boolean)=>Promise<any>;
export async function acceptClientProject(
 enquiryId:string,now:string,db:Db,batch:Batch,issueInvitation:Invitation,recordDelivery:Delivery
){
 if(!v4id.test(String(enquiryId)))throw Object.assign(new Error("Invalid project request identifier."),{status:400});
 const request=(await db("getEnquiry",enquiryId))[0];
 if(!request)throw Object.assign(new Error("Project request not found. Refresh the inbox."),{status:404});
 if(request.status==="closed")throw Object.assign(new Error("Closed requests must be reopened before acceptance."),{status:409});
 const prev=(await db("findAccepted",enquiryId))[0];
 if(prev)return {ok:true,already_accepted:true,id:prev.id,project:prev,message:"Already accepted. No duplicate email or invitation was issued."};
 const info=creatorFields(request.message),category=shorten(info.Project||request.service||"Creative",90);
 const starter=shorten(info.Template||"",65),title=shorten(starter&&starter.toLowerCase()!=="custom"?starter+" / "+category:category+" project",160);
 const summary=shorten((info.Goal?info.Goal+"\n\n":"")+String(request.message||""),1700);
 const plan="Review the entire original brief with our team, confirm scope and agree milestones before production.";
 const id=crypto.randomUUID(),values=[id,request.name,request.email,title,summary,"planning","Discover",0,"",plan,now,now,request.id,request.reference,request.message,now];
 const statements:any[][]=[["acceptProject",...values]];
 for(const [name,detail] of milestones)statements.push([
  "addMilestoneOnce",await stableUUID(request.id,name),id,"milestone",name,detail,"upcoming","","",now,now
 ]);
 statements.push(["linkEnquiry",request.id,now,now,request.id]);
 const outcome=await batch(statements);
 const project=(await db("findAccepted",enquiryId))[0];
 if(!project)throw Object.assign(new Error("The accepted project could not be linked."),{status:503});
 if(!(outcome[0]?.results?.length))return {ok:true,already_accepted:true,id:project.id,project,message:"Already accepted in another session. No duplicate invitation was issued."};
 const items=(await db("listItems",project.id)).filter((x:any)=>x.type==="milestone");
 let acceptance:any;
 try{
  const pdf=await makeProjectSummaryPdf(project,items);
  acceptance=await sendGmailMail({
   to:project.client_email,...acceptanceMail(project,items),
   attachments:[{filename:"VELORYZ-"+String(project.request_reference||"Project").replace(/[^a-z0-9-]/gi,"").slice(0,48)+"-Summary.pdf",bytes:pdf,contentType:"application/pdf"}]
  });
 }catch{
  acceptance={status:"failed",message:"The project was accepted, but the acceptance PDF/email could not be prepared. Download the summary in Client Management."};
 }
 await recordDelivery(project,"acceptance",project.client_email,acceptance);
 const invitation=await issueInvitation(project,now,false);
 return {ok:true,already_accepted:false,id:project.id,project,reference:project.request_reference,
  acceptance_delivery:acceptance,invitation};
}
