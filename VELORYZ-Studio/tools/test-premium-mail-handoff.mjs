/* Full manual VELORYZ order email / one-sheet PDF / Gmail SMTP mock. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {webcrypto} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const mailSource=read('supabase/functions/veloryz-client-portal-api/gmail-lifecycle.ts');
const lifecycleSource=read('supabase/functions/veloryz-client-portal-api/client-lifecycle.ts');
const api=read('supabase/functions/veloryz-client-portal-api/index.ts');
const ui=read('public/admin-client.js'),admin=read('public/admin.js');
const creator=read('public/creator-v4.js'),privacy=read('public/privacy-center.js');
const site=read('public/app.js'),style=read('public/make-project.css');
const compile=s=>ts.transpileModule(s,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
let lastDoc;
const font={widthOfTextAtSize:(s,size)=>String(s).length*size*.54};
const PDFDocument={create:async()=>lastDoc={
 pages:[],attachments:[],metadata:{},
 setTitle(v){this.metadata.title=v},setAuthor(v){this.metadata.author=v},
 setSubject(v){this.metadata.subject=v},setCreator(v){this.metadata.creator=v},
 embedFont:async()=>font,addPage(){
  const page={texts:[],drawRectangle(){},drawLine(){},drawText(text,options){this.texts.push({text,options})}};
  this.pages.push(page);return page;
 },async attach(data,name,options){this.attachments.push({data,name,options})},
 async save(){return new Uint8Array([37,80,68,70])}
}};
const replies=["220 ready\r\n","250 hello\r\n","334 user\r\n","334 password\r\n","235 accepted\r\n",
 "250 sender\r\n","250 recipient\r\n","354 submit\r\n","250 queued\r\n","221 bye\r\n"];
let outbound=[],credentialsRead=0;
const fakeDeno={env:{get(k){if(k==="VELORYZ_GMAIL_APP_PASSWORD"){credentialsRead++;return "EXAMPLE-ONLY-NOT-SECRET"}return ""}},
 connectTls:async(options)=>{
  assert.equal(options.hostname,"smtp.gmail.com");assert.equal(options.port,465);
  let pointer=0;
  return {writable:{getWriter:()=>({write:async chunk=>{outbound.push(new TextDecoder().decode(chunk))}})},
   readable:{getReader:()=>({read:async()=>{
    const response=replies[pointer++];
    return response?{value:new TextEncoder().encode(response),done:false}:{done:true};
   }})},close(){}};
 }};
const exports1={};
const ctx=vm.createContext({module:{exports:exports1},exports:exports1,
 require:name=>{assert.equal(name,'npm:pdf-lib@1.17.1');return {PDFDocument,StandardFonts:{Helvetica:'H',HelveticaBold:'B'},rgb:(r,g,b)=>({r,g,b})}},
 Deno:fakeDeno,Uint8Array,TextEncoder,TextDecoder,Date,console,crypto:webcrypto,btoa,atob,
 setTimeout,clearTimeout});
vm.runInContext(compile(mailSource),ctx,{timeout:2500});
const mail=exports1;
const req={id:"1",title:"Distinctive Studio Website",client_name:"Test Client",client_email:"client@example.com",
 request_reference:"VZ-ORDER-2026-0001",summary:"Original request",phase:"Discover",status:"planning",
 accepted_at:"2026-11-22T10:00:00Z",
 brief_details:"Name: Test Client\n\nPhone: 1234567890\n\nBudget: INR 120,000\n\nFeatures: Custom gallery, animations, CMS\n\nExternal URLs: https://example.org/reference and https://example.com/brief",
 next_step:"Confirm creative scope and delivery milestones"};
const items=[{title:"Discovery & scope",details:"Confirm goals and budget."},{title:"Visual direction",details:"Original art direction."},{title:"Design & handover",details:"Implement and approve."}];
const pdf=await mail.makeProjectSummaryPdf(req,items);
assert.equal(pdf[0],37);
assert.equal(lastDoc.pages.length,1,'A4 project-order summary must have exactly ONE visible page.');
const lines=lastDoc.pages[0].texts.map(x=>x.text).join(' / ');
for(const expected of ["VELORYZ","VZ-ORDER-2026-0001","CLIENT PORTAL","Complete original request","Production milestones"])
 assert.ok(lines.toLowerCase().includes(expected.toLowerCase()),'One-sheet missing '+expected);
assert.ok(lastDoc.attachments.some(a=>new TextDecoder().decode(a.data).includes("Budget: INR 120,000")),
 'Entire original submitted brief must survive even when it cannot fit visibly on one page.');
const long={...req,brief_details:"Huge detailed request\n"+("Feature: many many design options; https://example.org/reference\n").repeat(2200)};
await mail.makeProjectSummaryPdf(long,items);
assert.equal(lastDoc.pages.length,1,'Oversized orders must still produce a true one-page PDF.');
assert.ok(lastDoc.attachments[0].data.byteLength>50000,'Do not silently discard long specifications.');
const summary=mail.acceptanceMail(req,items);
assert.ok(summary.html.includes("1234567890")&&summary.html.includes("INR 120,000"));
assert.ok(summary.html.includes("https://example.org/reference"));
assert.ok(summary.html.includes("https://veloryz.online/client/"));
assert.ok(!summary.text.includes("TEST-ACCESS-CODE"),'Acceptance email must not include an access code.');
const invitation=mail.invitationMail(req,"TEST-ACCESS-CODE","https://veloryz.online/client/#invite=TEST-ACCESS-CODE","2026-12-06T10:00:00Z");
assert.ok(invitation.html.includes("TEST-ACCESS-CODE")&&invitation.text.includes("VZ-ORDER-2026-0001"));
assert.ok(invitation.text.includes("01")&&invitation.text.includes("05"),'Client invitation must include activation steps.');
outbound=[];
const delivery=await mail.sendGmailMail({to:req.client_email,...summary,attachments:[{filename:"VELORYZ-Order-Summary.pdf",bytes:pdf,contentType:"application/pdf"}]});
assert.equal(delivery.status,"sent",'Mock SMTP should return accepted only after Gmail DATA 250.');
const sent=outbound.join("");
assert.ok(sent.includes("multipart/alternative"),'Gmail MIME must support alternative HTML and text.');
assert.ok(sent.includes("multipart/mixed"),'Gmail MIME must contain PDF attachment.');
assert.ok(sent.includes('filename="VELORYZ-Order-Summary.pdf"'));
assert.ok(sent.includes("Content-Transfer-Encoding: base64"));
assert.ok(credentialsRead>0,'SMTP must read secret only in the server runtime.');
assert.ok(!sent.includes("EXAMPLE-ONLY-NOT-SECRET"),'SMTP App Password must never be included in email body/header.');
const lifecycleExports={};
const ctx2=vm.createContext({exports:lifecycleExports,module:{exports:lifecycleExports},
 require:name=>{assert.equal(name,"./gmail-lifecycle.ts");return mail;},
 Date,console,crypto:webcrypto,TextEncoder});
vm.runInContext(compile(lifecycleSource),ctx2,{timeout:2500});
let saved,invites=0,sends=0;
const enquiry={
 id:"12345678-1234-4123-8123-123456789abc",reference:"VZ-ORDER-2026-0001",
 name:"Test Client",email:"client@example.com",phone:"1234567890",budget:"INR 120,000",
 created_at:"2026-11-22T09:00:00Z",service:"Website",message:"Project: Website\nGoal: Elegant industrial design\nReference: https://example.org"
};
const db=async(key,...args)=>{
 if(key==="getEnquiry")return [enquiry];
 if(key==="findAccepted")return saved?[{id:saved.id}]:[];
 if(key==="getProjectFull")return saved?[saved]:[];
 if(key==="listItems")return items.map(x=>({...x,type:"milestone"}));
 return [];
};
const batch=async queries=>{
 assert.equal(queries[0][0],"acceptProject");
 const values=queries[0].slice(1);
 saved={id:values[0],client_name:values[1],client_email:values[2],title:values[3],
  summary:values[4],phase:values[6],status:values[5],enquiry_id:values[12],
  request_reference:values[13],brief_details:values[14],accepted_at:values[15]};
 return [{results:[{id:saved.id}]}];
};
const accepted=await lifecycleExports.acceptClientProject(enquiry.id,"2026-11-22T10:00:00Z",db,batch,async()=>{sends++});
assert.equal(accepted.summary_pending,true);assert.equal(accepted.invitation_pending,true);
assert.equal(sends,0,'Accept must never send a Gmail message or issue a private access code.');
assert.ok(saved.brief_details.includes("INR 120,000")&&saved.brief_details.includes("https://example.org"));
const again=await lifecycleExports.acceptClientProject(enquiry.id,"2026-11-22T11:00:00Z",db,batch,async()=>{sends++});
assert.equal(again.already_accepted,true);
assert.equal(sends,0,'Repeated acceptance must not send mail.');
assert.match(api,/action===\"\/admin\/send-summary\"&&req\.method===\"POST\"/);
assert.match(api,/sendAcceptanceSummary\(project,items,logDelivery\)/);
assert.match(api,/action===\"\/admin\/invite\"&&req\.method===\"POST\"/);
assert.match(ui,/data-cpm=\"send-summary\"/);assert.match(ui,/data-cpm=\"invite\"/);
assert.match(ui,/if\(action==='send-summary'\)/);assert.match(ui,/if\(action==='invite'\)/);
assert.match(admin,/No email or private access code is generated by accepting alone/);
assert.match(creator,/owner clicks Send Client Invitation/);
assert.ok(!privacy.includes("btn.textContent='Privacy choices'"),'No floating privacy control may be created.');
assert.match(site,/vz-footer-privacy-control/,'Footer must expose the privacy control.');
assert.match(style,/a\.make-project-link\{display:none!important\}/);
console.log('PASS: strict one-page PDF, complete order preservation, industrial brand, 2 distinct manual emails, MIME, SMTP mock, retry-safe acceptance and footer controls.');
