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
/* Industrial one-sheet order document. The complete submission is also attached
   as text INSIDE the PDF for requests too long to fit visibly on one A4 page. */
async function createPdf(project:ProjectEmail,items:DocumentMilestone[]){
 const doc=await PDFDocument.create(),regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 doc.setTitle("VELORYZ / Order "+(project.request_reference||project.title));
 doc.setAuthor("VELORYZ Studio");
 doc.setSubject("Official acceptance / one-page project and order summary");
 doc.setCreator("VELORYZ Studio / Private Project Operations");
 const W=595.28,H=841.89,px=doc.addPage([W,H]),M=43;
 const C={paper:color("#f7f6f3"),ink:color("#25293d"),muted:color("#687183"),
         accent:color("#c57e9d"),line:color("#d7d5da"),light:color("#ebe8ec"),white:rgb(1,1,1)};
 px.drawRectangle({x:0,y:0,width:W,height:H,color:C.paper});
 px.drawRectangle({x:0,y:H-131,width:W,height:131,color:C.ink});
 px.drawRectangle({x:0,y:0,width:8,height:H,color:C.accent});
 px.drawLine({start:{x:44,y:804},end:{x:63,y:761},thickness:7,color:C.white});
 px.drawLine({start:{x:63,y:761},end:{x:82,y:804},thickness:7,color:C.accent});
 px.drawText("VELORYZ",{x:99,y:781,size:26,font:bold,color:C.white,characterSpacing:1.7});
 px.drawText("STUDIO / PRIVATE CLIENT OPERATIONS",{x:100,y:762,size:8,font:regular,color:color("#c9c3cd"),characterSpacing:1.3});
 px.drawText("PROJECT ACCEPTANCE / ORDER RECORD",{x:M,y:735,size:9.2,font:bold,color:C.white,characterSpacing:1.2});
 px.drawText("ISSUED "+normalPdf(date(project.accepted_at||new Date().toISOString())).toUpperCase(),{x:388,y:735,size:7.6,font:bold,color:C.white});
 px.drawText("ONE-SHEET  /  A4",{x:455,y:812,size:7.2,font:regular,color:color("#d2cad4")});
 function fitted(value:unknown,x:number,y:number,max:number,size=10,weight=false,ink=C.ink){
  let t=normalPdf(value).replace(/\s+/g," ").trim()||"—";
  const ft=weight?bold:regular;
  while(t.length>1&&ft.widthOfTextAtSize(t,size)>max)t=t.slice(0,-2);
  if(t!==normalPdf(value).replace(/\s+/g," ").trim())t=t.replace(/[ .,;:-]+$/,"")+"...";
  px.drawText(t.slice(0,250),{x,y,size,font:ft,color:ink});
 }
 function rule(y:number,x=M,w=W-M*2){px.drawLine({start:{x,y},end:{x:x+w,y},thickness:.65,color:C.line});}
 function meta(label:string,value:unknown,x:number,y:number,w:number){
  fitted(label.toUpperCase(),x,y,w,7.2,true,C.muted);
  fitted(value,x,y-17,w,12.2,true,C.ink);
 }
 function heading(text:string,x:number,y:number,w:number){
  px.drawRectangle({x,y:y-3,width:3.5,height:15,color:C.accent});
  fitted(text.toUpperCase(),x+11,y,w-11,9.6,true,C.ink);
 }
 function wrap(text:string,width:number,size:number,ft=regular){
  const lines:string[]=[];
  for(const paragraph of normalPdf(text).split("\n")){
   if(!paragraph.trim()){lines.push("");continue}
   let line="";
   for(const word of paragraph.split(/\s+/)){
    if(!word)continue;
    const want=line?line+" "+word:word;
    if(ft.widthOfTextAtSize(want,size)<=width){line=want;continue}
    if(line){lines.push(line);line=""}
    let rest=word;
    while(ft.widthOfTextAtSize(rest,size)>width&&rest.length>1){
     let chunk="";
     for(const ch of rest){if(ft.widthOfTextAtSize(chunk+ch,size)>width)break;chunk+=ch}
     if(!chunk)break;
     lines.push(chunk);rest=rest.slice(chunk.length);
    }
    line=rest;
   }
   if(line)lines.push(line);
  }
  return lines;
 }
 // Identity / project details
 meta("ORDER / REQUEST REF",project.request_reference||"VELORYZ",M,681,246);
 meta("PROJECT / TITLE",project.title,304,681,245);
 meta("CLIENT",project.client_name+" / "+project.client_email,M,631,243);
 meta("PHASE / STATUS",(project.phase||"Discover")+"  /  "+(project.status||"planning"),304,631,245);
 rule(586);
 heading("01   Complete original request",M,564,305);
 heading("02   Production milestones",376,564,175);
 px.drawLine({start:{x:359,y:282},end:{x:359,y:572},thickness:.65,color:C.line});
 const entire=normalPdf(project.brief_details||project.summary||"Project scope will be confirmed with the team.");
 const briefFont=8.25,briefLine=11.25,width=300,maxLines=21;
 const brief=wrap(entire,width,briefFont);
 brief.slice(0,maxLines).forEach((line,i)=>{if(line)fitted(line,M,537-i*briefLine,width,briefFont,false,C.ink)});
 if(brief.length>maxLines)fitted("CONTINUED IN ORIGINAL BRIEF ATTACHMENT + ACCEPTANCE EMAIL",M,292,width,7.1,true,C.accent);
 else fitted("ORIGINAL SUBMISSION / STORED WITH YOUR ORDER",M,287,width,7.05,true,C.muted);
 const roadmap=items.filter(x=>x.type!=="file").slice(0,6);
 let y=537;
 roadmap.forEach((item,i)=>{
  fitted(String(i+1).padStart(2,"0"),376,y,24,9.2,true,C.accent);
  const titleLines=wrap(item.title||"Milestone",144,8.8,bold).slice(0,2);
  titleLines.forEach((line,j)=>fitted(line,398,y-j*12,144,8.8,true,C.ink));
  const info=(item.state&&item.state!=="upcoming"?item.state+" · ":"")+(item.due_date||"");
  if(info.trim())fitted(info,398,y-26,145,7.3,false,C.muted);
  y-=43;
 });
 rule(269);
 heading("03   Project, reference & studio links",M,246,W-2*M);
 const briefLinks=[...new Set((project.brief_details||project.summary||"").match(/https?:\/\/[^\s<>"']+/gi)||[])].map(v=>v.replace(/[),.;!?]+$/,"")).filter(v=>/^https?:\/\/[\w.-]+(?:[/:?#]|$)/.test(v)).slice(0,4);
 const urls=[
 ["CLIENT PORTAL","veloryz.online/client/"],
 ["CONTACT","veloryz.online/contact/"],
 ["DOCUMENTATION","veloryz.online/docs/"],
 ["STUDIO","veloryz.online/"],
 ...briefLinks.map((url,i)=>["CLIENT LINK "+(i+1),url.replace(/^https?:\/\//,"")])
 ];
 const left=urls.slice(0,4),right=urls.slice(4,8);
 for(const [entries,x] of [[left,M],[right,302]] as [string[][],number][]){
  let pos=222;
  for(const [label,url] of entries){
   fitted(label,x,pos,230,7.1,true,C.muted);
   fitted(url,x,pos-13,230,8.3,false,C.ink);
   pos-=31;
  }
 }
 rule(92);
 fitted("ONE-TIME CLIENT ACCESS IS SENT SEPARATELY BY THE STUDIO OWNER",M,74,480,8.35,true,C.ink);
 fitted("Reference is not a login code  /  Terms, scope and payments require a separate agreement.",M,55,505,7.8,false,C.muted);
 fitted("VELORYZ   /   PRIVATE CLIENT COPY",M,30,330,7.6,true,C.muted);
 fitted("01 / 01",503,30,45,8.2,true,C.ink);
 // Full original order details remain inside this same PDF, regardless of page
 // capacity. Many PDF viewers expose the text attachment via Attachments.
 try{
  const attachments="VELORYZ / COMPLETE ORIGINAL ORDER DETAILS\n"+(project.request_reference||"")+"\n\n"+
   "PROJECT: "+project.title+"\nCLIENT: "+project.client_name+" <"+project.client_email+">\n\n"+
   (project.brief_details||project.summary||"")+"\n\nPROJECT LINKS\n"+briefLinks.join("\n")+"\n\n"+
   "MILESTONES\n"+items.map((x,i)=>(i+1)+". "+x.title+" / "+x.details+" / "+(x.due_date||"")).join("\n");
  await doc.attach(new TextEncoder().encode(attachments),"VELORYZ-Full-Order-Details.txt",{mimeType:"text/plain",description:"Complete submitted scope, references, links and project milestone data"});
 }catch{ /* Email and protected original project record still hold the full brief. */ }
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
