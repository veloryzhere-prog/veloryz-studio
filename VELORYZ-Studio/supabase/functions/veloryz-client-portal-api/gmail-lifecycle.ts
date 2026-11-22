/* VELORYZ protected lifecycle mail / branded PDF.
   Uses free Gmail SMTP submission over TLS port 465. No Resend.
   Configure VELORYZ_GMAIL_APP_PASSWORD as an encrypted Supabase Edge secret
   for the mailbox veloryz.here@gmail.com. Never send this secret to a browser.
   Gmail daily sending limits and recipient filtering still apply. */
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const MAILBOX="veloryz.here@gmail.com";
const BASE="https://veloryz.online";
const BRAND={navy:"#23243b",rose:"#b66e9b",muted:"#687088",lavender:"#ede6f2"};
const htmlEsc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"} as Record<string,string>)[c]);
const plain=(v:unknown,max=16000)=>String(v??"").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,"").slice(0,max);
const date=(v:string)=>v?new Date(v).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Kolkata"}):"To be scheduled";
const safe=(v:unknown)=>String(v??"").replace(/\r?\n/g," ").replace(/[\x00-\x1f\x7f]/g,"").slice(0,180);
const emailOk=(v:string)=>/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)&&v.length<181;
const b64=(bytes:Uint8Array)=>{let out="";for(let i=0;i<bytes.length;i+=0x6000)out+=String.fromCharCode(...bytes.subarray(i,i+0x6000));return btoa(out)};
const utf64=(s:string)=>b64(new TextEncoder().encode(s));
const wrapped=(s:string)=>s.match(/.{1,76}/g)?.join("\r\n")??"";
const color=(hex:string)=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
const normalPdf=(v:unknown)=>plain(v,50000).replace(/₹/g,"INR ").replace(/[–—−]/g,"-").replace(/[“”]/g,'"').replace(/[‘’]/g,"'").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\x7E\n]/g,"?");
export type ProjectEmail={id:string;title:string;client_name:string;client_email:string;summary?:string;brief_details?:string;request_reference?:string;status?:string;phase?:string;progress?:number;next_step?:string;due_date?:string;accepted_at?:string;};
type DocumentMilestone={title:string;details:string;phase?:string;due_date?:string;state?:string};
export function mailIsConfigured(){return !!(Deno.env.get("VELORYZ_GMAIL_APP_PASSWORD")||"").trim()}
export function mailStatus(){return {provider:"Gmail SMTP · TLS 465",from:MAILBOX,senderName:"VELORYZ",configured:mailIsConfigured(),requires:"Gmail 2-Step Verification and a Google App Password stored as VELORYZ_GMAIL_APP_PASSWORD in Supabase function secrets. No Resend service is used."}}
export function brandEmail(kicker:string,title:string,inner:string,cta?:{text:string;url:string}){
 const button=cta?'<div style="padding:16px 0 23px"><a href="'+htmlEsc(cta.url)+'" style="background:#29253d;color:#fff;display:inline-block;border-radius:11px;text-decoration:none;font-weight:700;font-size:14px;padding:16px 24px">'+htmlEsc(cta.text)+' &rarr;</a></div>':"";
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="margin:0;background:#f3f0f4;font-family:Arial,Helvetica,sans-serif;color:#25253c"><table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background:#f3f0f4"><tr><td align="center" style="padding:32px 14px">'+
 '<table width="100%" role="presentation" style="max-width:620px;border-collapse:collapse;background:#fff;border-radius:17px;overflow:hidden;box-shadow:0 10px 40px #11102411">'+
 '<tr><td style="background:#1e1d35;padding:29px 35px;color:#fff"><div style="font-size:24px;font-weight:900;letter-spacing:3px">VELORYZ<span style="color:#ed98c5">.</span></div><div style="font-size:10px;letter-spacing:2px;color:#cbbad2;margin-top:7px">PRIVATE PROJECT CORRESPONDENCE &bull; STUDIO TEAM</div></td></tr>'+
 '<tr><td style="padding:35px 36px"><div style="font-size:10px;letter-spacing:2.3px;font-weight:800;color:#99618d">'+htmlEsc(kicker)+'</div><h1 style="font-size:30px;line-height:1.18;letter-spacing:-1px;margin:14px 0 20px">'+htmlEsc(title)+'</h1>'+inner+button+
 '<p style="margin:25px 0 0;border-top:1px solid #ece8ed;padding-top:22px;color:#6f7484;font-size:12px;line-height:1.8">This message is about a VELORYZ project you requested. For questions, reply to this email or visit <a style="color:#97609d" href="'+BASE+'/contact/">'+BASE+'/contact/</a>.</p></td></tr>'+
 '<tr><td style="padding:20px 36px;background:#f9f7fa;border-top:1px solid #ece8f0;color:#767486;font-size:10px;line-height:1.7">VELORYZ STUDIO &bull; A THOUGHTFUL WAY TO BUILD<br>Sent by VELORYZ &lt;'+MAILBOX+'&gt; &bull; '+BASE+'</td></tr></table></td></tr></table></body></html>';
}
const p=(content:string)=>'<p style="color:#52546b;font-size:14px;line-height:1.85;margin:10px 0 18px">'+content+'</p>';
const box=(label:string,value:string)=>'<div style="border:1px solid #e8e3ed;border-radius:10px;background:#fbf9fd;padding:13px 16px;margin:9px 0"><div style="color:#8b7195;font-size:9px;font-weight:750;letter-spacing:1.3px">'+htmlEsc(label)+'</div><div style="color:#2b2b40;font-size:13px;font-weight:650;margin-top:7px;overflow-wrap:anywhere">'+htmlEsc(value)+'</div></div>';
export function acceptanceMail(project:ProjectEmail,items:DocumentMilestone[]){
 const reference=project.request_reference||"Project confirmed";
 const html=brandEmail("YOUR PROJECT / ACCEPTED","Let's bring your idea to life.",
  p("Hello <strong>"+htmlEsc(project.client_name)+"</strong>,")+
  p("The VELORYZ Studio team has accepted your project request. We have opened a private project workspace for <strong>"+htmlEsc(project.title)+"</strong> and prepared your detailed project summary as an attached PDF.")+
  box("PROJECT REFERENCE",reference)+box("PROJECT NAME",project.title)+box("STARTING PHASE",project.phase||"Discover")+
  box("NEXT STEP",project.next_step||"Our team will review the brief and agree the scope and next milestones.")+
  p("<strong>Your attached project summary includes:</strong> original request details, planning notes, timeline, initial milestone roadmap, important project links, communication rules and client access instructions. An indicative budget is not a binding quote.")+
  p("Your separate private invitation email includes the one-time access code. Never share that code. Once you activate the portal you can follow updates, review deliverables, request changes and message the team."),
  {text:"Visit your Client Portal",url:BASE+"/client/"});
 return {subject:"VELORYZ Studio | Your project has been accepted | "+reference,html,
  text:"Hello "+project.client_name+",\n\nVELORYZ Studio has accepted your project: "+project.title+".\nReference: "+reference+
  "\nStarting phase: "+(project.phase||"Discover")+"\nNext step: "+(project.next_step||"Our team will confirm scope and milestones.")+
  "\n\nYour complete project summary PDF is attached. A separate one-time portal invitation follows.\nClient Portal: "+BASE+"/client/\n\nReply to this email for questions.\nVELORYZ Studio"};
}
export function invitationMail(project:ProjectEmail,code:string,url:string,expires:string){
 const html=brandEmail("PRIVATE CLIENT ACCESS / ONE-TIME","Your private workspace awaits.",
  p("Hello <strong>"+htmlEsc(project.client_name)+"</strong>,")+
  p("Your project <strong>"+htmlEsc(project.title)+"</strong> is ready in the private VELORYZ Client Portal. Use the secure, single-use invitation below to activate your project workspace.")+
  box("PROJECT REFERENCE",project.request_reference||"VELORYZ project")+
  '<div style="background:#27223d;border-radius:13px;padding:22px 16px;margin:24px 0;color:#fff;text-align:center"><div style="font-size:10px;letter-spacing:2px;color:#d5c3db">YOUR ONE-TIME INVITATION CODE</div><div style="font-size:18px;font-weight:900;letter-spacing:1.7px;margin-top:12px;overflow-wrap:anywhere">'+htmlEsc(code)+'</div></div>'+
  p("This code expires <strong>"+htmlEsc(date(expires))+"</strong> and can only be used once. After activation, you can return with the secure browser session. A project reference number is not an invitation code.")+
  p("<strong>Inside your workspace:</strong> verified project progress, milestones, deadlines, shared files, approvals, and your private conversation with our team. Please do not forward your invitation to anyone else."),
  {text:"Activate project access",url});
 return {subject:"VELORYZ | Activate your private project workspace",html,
  text:"Hello "+project.client_name+",\n\nYour private VELORYZ Studio workspace for "+project.title+" is ready.\n\nOne-time invitation code:\n"+code+
  "\n\nOpen: "+url+"\nExpires: "+date(expires)+". The code is single-use. Do not forward it.\n\nVELORYZ Studio"};
}
export function messageMail(project:ProjectEmail,who:"client"|"studio"){
 const subject=who==="client"?"New client message | "+(project.request_reference||project.title):"New VELORYZ project update | "+(project.request_reference||project.title);
 const title=who==="client"?"Your client has replied.":"A new project message.";
 const intro=who==="client"?"A client has posted a new private message in the VELORYZ workspace. Open the owner Client Management console to read it and respond.":"The VELORYZ team has posted a new message in your project workspace. Open the secure portal to read it and reply.";
 return {subject,html:brandEmail("PROJECT COMMUNICATION",title,p(htmlEsc(intro))+box("PROJECT",project.title)+box("REFERENCE",project.request_reference||"VELORYZ project"),{text:"Open your project workspace",url:who==="client"?BASE+"/admin/#/client-portal":BASE+"/client/"}),
 text:intro+"\nProject: "+project.title+"\nReference: "+(project.request_reference||"VELORYZ project")+"\n\nVELORYZ Studio"};
}
async function createPdf(project:ProjectEmail,items:DocumentMilestone[]){
 const doc=await PDFDocument.create(),roman=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 doc.setTitle("VELORYZ Project Summary | "+(project.request_reference||project.title));
 doc.setAuthor("VELORYZ Studio");doc.setSubject("Private client project brief, scope and onboarding roadmap");
 const W=595,H=842,L=48,maxX=548;
 let page:any,y=0,count=0;
 const newPage=(heading?:string)=>{
  page=doc.addPage([W,H]);count++;
  page.drawRectangle({x:0,y:H-13,width:W,height:13,color:color(BRAND.rose)});
  page.drawRectangle({x:0,y:H-88,width:W,height:75,color:color(BRAND.navy)});
  page.drawText("VELORYZ / PRIVATE PROJECT DOCUMENT",{x:L,y:H-54,size:16,font:bold,color:rgb(1,1,1)});
  page.drawText("PROJECT SUMMARY  /  "+(project.request_reference||"STUDIO WORKSPACE").slice(0,50),{x:L,y:H-75,size:8,font:roman,color:rgb(.85,.81,.9)});
  y=H-124;if(heading)title(heading);
 };
 const paragraph=(s:string,size=10,indent=0)=>{
  const lines=normalPdf(s).split("\n");
  for(const para of lines){
   const words=para.split(/\s+/),maxWidth=W-2*L-indent;
   let current="";
   const draw=()=>{
    if(y<76)newPage();
    page.drawText(current,{x:L+indent,y,size,font:roman,color:color(BRAND.navy)});
    y-=size+7;current="";
   };
   for(const word of words){
    if(!word)continue;
    const proposed=current?current+" "+word:word;
    if(roman.widthOfTextAtSize(proposed,size)>maxWidth&&current)draw();
    current=word;
   }
   if(current)draw();else y-=7;
  }
  y-=5;
 };
 const title=(s:string)=>{
  if(y<115)newPage();
  page.drawText(normalPdf(s).slice(0,68),{x:L,y,size:16,font:bold,color:color(BRAND.navy)});y-=27;
  page.drawLine({start:{x:L,y:y+8},end:{x:maxX,y:y+8},thickness:.6,color:color(BRAND.lavender)});
 };
 const entry=(k:string,v:unknown)=>{
  if(v===undefined||v===null||String(v).trim()==="")return;
  if(y<120)newPage();
  page.drawText(normalPdf(k).toUpperCase().slice(0,60),{x:L,y,size:8,font:bold,color:color(BRAND.rose)});y-=17;
  paragraph(String(v),10,0);y-=5;
 };
 newPage();
 title("A project with direction.");
 paragraph("PRIVATE CLIENT DOCUMENT - CREATED AFTER STUDIO ACCEPTANCE");
 entry("Project name",project.title);
 entry("Official request reference",project.request_reference||"Pending assignment");
 entry("Client",project.client_name+" | "+project.client_email);
 entry("Accepted",date(project.accepted_at||new Date().toISOString()));
 entry("Current status",project.status||"Planning");
 entry("Current phase",project.phase||"Discover");
 entry("Progress",String(project.progress||0)+"% (owner-updated)");
 entry("Expected finish",date(project.due_date||""));
 entry("Next agreed action",project.next_step||"The team will review scope and propose milestones.");
 newPage("01 / Your original project request");
 paragraph("This is the original information submitted by the client and captured for studio planning; it is not an automatically accepted fixed price.");
 paragraph(project.brief_details||project.summary||"The complete original request will be confirmed with the team.");
 newPage("02 / Scope and preparation");
 entry("Project summary",project.summary||"Discuss scope with the studio.");
 paragraph("Review the requested features, pages, design direction, content and assets with the team. Unless separately agreed in writing, planning figures and timeline preferences are indicative only.");
 title("03 / Initial delivery roadmap");
 for(let i=0;i<items.length;i++){
  entry(String(i+1).padStart(2,"0")+" / "+items[i].title,items[i].details);
  if(items[i].due_date)entry("Target date",items[i].due_date);
 }
 newPage("04 / Client access and collaboration");
 entry("Private Client Portal",BASE+"/client/");
 entry("Studio website",BASE+"/");
 entry("Contact the team",BASE+"/contact/");
 entry("Project reference",project.request_reference||"Provided in acceptance email");
 paragraph("A separate one-time private invitation code arrives in a dedicated email, or the team can provide it through an authenticated channel. The public project reference is NOT a password or invitation code. Do not forward access details.");
 paragraph("The portal provides owner-entered project stages, progress, review decisions, secure project messages and links to deliverables. External file links retain the permissions of their original file hosts.");
 title("05 / Communication and approval rules");
 paragraph("Project questions should be sent in the portal Messages tab. The studio can update phases and milestones; client approvals are only recorded for items explicitly marked for review. An accepted request does not mean a payment was collected, a fixed quotation was agreed or a deadline was guaranteed.");
 title("06 / Secure handling");
 paragraph("Do not send passwords, OTPs, payment card details or private login secrets in chat or email. Verify any invoices directly with the Studio team. Only the active private portal session exposes client project information.");
 const pages=doc.getPages();for(let i=0;i<pages.length;i++){
  const pg=pages[i];pg.drawLine({start:{x:L,y:59},end:{x:maxX,y:59},thickness:.6,color:color(BRAND.lavender)});
  pg.drawText("VELORYZ STUDIO  /  PRIVATE CLIENT COPY",{x:L,y:40,size:8,font:bold,color:color(BRAND.muted)});
  pg.drawText((i+1)+" / "+pages.length,{x:522,y:40,size:8,font:roman,color:color(BRAND.muted)});
 }
 return await doc.save();
}
export const makeProjectSummaryPdf=createPdf;
type Attachment={filename:string;bytes:Uint8Array;contentType:string};
type Outgoing={to:string;subject:string;html:string;text:string;attachments?:Attachment[]};
export type MailOutcome={status:"sent"|"failed"|"not-configured";message:string;provider_message_id?:string};
export async function sendGmailMail(m:Outgoing):Promise<MailOutcome>{
 const pass=(Deno.env.get("VELORYZ_GMAIL_APP_PASSWORD")||"").replace(/\s/g,"");
 if(!pass)return {status:"not-configured",message:"Gmail is not connected. Set VELORYZ_GMAIL_APP_PASSWORD in Supabase Edge Function secrets. No message was sent."};
 if(!emailOk(m.to))return {status:"failed",message:"The recipient email address is invalid."};
 let socket:Deno.TlsConn|undefined;
 try{
  socket=await Deno.connectTls({hostname:"smtp.gmail.com",port:465});
  const writer=socket.writable.getWriter(),reader=socket.readable.getReader(),encoder=new TextEncoder(),decoder=new TextDecoder();
  let buffer="";
  const readLine=async():Promise<string>=>{
   while(true){
    const at=buffer.indexOf("\n");
    if(at>=0){const text=buffer.slice(0,at).replace(/\r$/,"");buffer=buffer.slice(at+1);return text;}
    const {value,done}=await reader.read();if(done)throw Error("SMTP connection closed");buffer+=decoder.decode(value,{stream:true});
    if(buffer.length>12000)throw Error("SMTP response length exceeded");
   }
  };
  const response=async(expected:number)=>{
   let line=await readLine(),code=Number(line.slice(0,3)),attempts=0;
   while(line[3]==="-"&&attempts++<35)line=await readLine();
   if(code!==expected)throw Error("SMTP command rejected ("+code+")");
   return line;
  };
  const write=async(v:string)=>writer.write(encoder.encode(v+"\r\n"));
  const command=async(v:string,expect:number)=>{await write(v);return response(expect)};
  await response(220);
  await command("EHLO veloryz.online",250);
  await command("AUTH LOGIN",334);
  await command(utf64(MAILBOX),334);
  await command(utf64(pass),235);
  await command("MAIL FROM:<"+MAILBOX+">",250);
  await command("RCPT TO:<"+m.to+">",250);
  await command("DATA",354);
  const boundary="vz-"+crypto.randomUUID(),id=crypto.randomUUID()+"@veloryz.online";
  const headers=[
   "From: VELORYZ <"+MAILBOX+">","To: <"+m.to+">","Reply-To: "+MAILBOX,
   "Subject: "+safe(m.subject),"Date: "+new Date().toUTCString(),
   "Message-ID: <"+id+">","MIME-Version: 1.0",
   'Content-Type: multipart/mixed; boundary="'+boundary+'"'
  ];
  const part=(type:string,value:string)=>["--"+boundary,"Content-Type: "+type+'; charset="UTF-8"',
   "Content-Transfer-Encoding: base64","",wrapped(utf64(value)),""].join("\r\n");
  const mime=[headers.join("\r\n"),"",
   part("text/plain",m.text),part("text/html",m.html)];
  for(const attachment of (m.attachments||[])){
   mime.push(["--"+boundary,'Content-Type: '+attachment.contentType+'; name="'+safe(attachment.filename)+'"',
    "Content-Disposition: attachment; filename=\""+safe(attachment.filename)+"\"",
    "Content-Transfer-Encoding: base64","",wrapped(b64(attachment.bytes)),""].join("\r\n"));
  }
  mime.push("--"+boundary+"--","");
  const full=mime.join("\r\n").replace(/^\./gm,"..");
  // SMTP DATA terminator is sent only once. Base64 encoded body prevents dot injection.
  await writer.write(encoder.encode(full+"\r\n.\r\n"));
  await response(250);
  await command("QUIT",221);
  return {status:"sent",message:"Gmail SMTP accepted the message for "+m.to+". Delivery to Inbox is not guaranteed.",provider_message_id:id};
 }catch(e){
  // Suppress credentials and raw provider error messages.
  const label=String((e as Error)?.message||"").includes("rejected")?"Gmail SMTP rejected the request. Check app password and mailbox permissions.":"Gmail SMTP delivery failed or timed out. Check server outbound port 465 and app password.";
  return {status:"failed",message:label};
 }finally{try{socket?.close()}catch{}}
}
