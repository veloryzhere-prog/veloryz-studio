/* R52.3.5 — private identity and onboarding console. */
(()=>{
'use strict';
const e=v=>E(v??''),route='client-identities',base='/api/admin/client-identities';
let owner=null,seq=0,busy=false,loaded=false,error='',rows=[],total=null,pageIndex=0,q='',selected='',projectPage=0,detail=null,mail=null,mailBusy=false,mailError='';
function reset(){if(owner===workspace&&!preview)return;owner=workspace;seq++;busy=false;loaded=false;error='';rows=[];total=null;pageIndex=0;q='';selected='';projectPage=0;detail=null;mail=null;mailBusy=false;mailError='';}
const still=(s,o)=>s===seq&&o===workspace&&section===route&&!preview;
const button=(attr,title,disabled=false,primary=false)=>'<button type="button" class="si-button '+(primary?'si-primary':'')+'" '+attr+(disabled?' disabled':'')+'>'+title+'</button>';
const fact=(key,value)=>'<div><dt>'+e(key)+'</dt><dd>'+e(value??'—')+'</dd></div>';
const labels={'pending-review':'Pending studio review','closed':'Closed','accepted':'Accepted delivery room','link-review':'Needs link reconciliation'};
function refresh(){const node=document.getElementById('identity-r53');if(node&&section===route&&owner===workspace)node.outerHTML=markup();}
async function load(){
 if(preview||!workspace)return;const s=++seq,o=workspace;busy=true;error='';detail=null;refresh();
 try{const d=await api(base+'?q='+encodeURIComponent(q)+'&page='+pageIndex+'&client='+encodeURIComponent(selected)+'&projectPage='+projectPage,{signal:AbortSignal.timeout(18000)});
 if(!still(s,o))return;if(d.source!=='identity-v1'||!Array.isArray(d.items)||!Number.isSafeInteger(d.total))throw Error('Incomplete identity directory.');
 rows=d.items;total=d.total;detail=d.detail;loaded=true;
 }catch(err){if(still(s,o)){error=err.status===401?'Owner session expired. Reopen the admin workspace.':err.status===403?'Owner access is required.':err.status===503?'Client identity service is not activated or cannot reach its private database. The legacy request inbox is still available.':'Could not load the private identity directory.';rows=[];total=null;loaded=false;}}
 finally{if(s===seq&&o===workspace){busy=false;refresh();}}
}
const current=()=>rows.find(r=>r.id===selected);
function projectMarkup(){
 if(preview||!detail)return '<section class="si-panel"><h2>Select a client identity</h2><p>Inspect verification status, permanent identifiers and associated projects.</p></section>';
 const r=current(),projects=Array.isArray(detail.projects)?detail.projects:[];
 return '<section class="si-panel"><span class="si-kicker">PERMANENT CLIENT PROFILE</span><h2>'+e(r?.name_at_registration||'Client profile')+'</h2><dl class="si-facts">'+fact('Client code',r?.client_code)+fact('Registered recipient',r?.email_at_registration)+fact('Email possession',r?.identity_status==='verified'?'Verified':'Not verified')+fact('Verified at',r?.verified_at)+fact('Linked identities',detail.member_count)+fact('Projects in group',detail.project_total)+'</dl><div class="si-actions">'+button('data-id-issue','Prepare verification email ↗',busy||!r||r.identity_status!=='unverified',true)+button('data-id-group','Link verified identity',busy||!r||r.identity_status!=='verified'||r.primary_id!==r.id)+'</div><p class="si-note">Grouping preserves permanent IDs and original project relationships. No login access is shared across rooms.</p></section><section class="si-panel"><span class="si-kicker">PROJECT LIFECYCLE</span><h3>Associated workspaces</h3>'+projects.map((p,i)=>'<div class="si-panel"><span class="si-kicker">'+e(labels[p.lifecycle]||'Unknown')+'</span><h3>'+e(p.title||'Registered project')+'</h3><dl class="si-facts">'+fact('Permanent project code',p.project_code)+fact('Request reference',p.reference)+fact('Delivery status',p.delivery_status)+fact('Registered',p.created_at)+'</dl>'+button('data-id-estimate="'+i+'"','Download registration estimate PDF ↓',busy)+button('data-id-billing="'+i+'"','Quotation & billing ↗',busy)+(p.lifecycle==='accepted'?button('data-id-room="'+i+'"','Open verified Client Room ↗',busy):'<p class="si-note">No active delivery room confirmed. Review the original request in Submission Intelligence.</p>')+'</div>').join('')+(!projects.length?'<p>No associated workspaces returned.</p>':'')+'<div class="si-pages">'+button('data-id-project-page="-1"','← Previous projects',busy||projectPage===0)+button('data-id-project-page="1"','More projects →',busy||(projectPage+1)*25>=detail.project_total)+'</div></section>';
}
function mailMarkup(){
 const counts=mail?.counts||{},labels=[['pending','Ready to process'],['held','Held / closed'],['sending','Sending'],['stalled','Stalled — review'],['sent','SMTP accepted'],['uncertain','Uncertain — review'],['cancelled','Cancelled']];
 const transport=mail?.transport==='configured'?'Credentials configured; delivery not confirmed':mail?.transport==='not-configured'?'Gmail credentials missing':'Transport not verified';
 return '<section class="si-panel"><span class="si-kicker">ONBOARDING / DELIVERY CONTROL</span><h3>Email delivery operations</h3><p>'+e(mail?mail.enabled?'Automation enabled · '+transport:'Automation disabled · '+transport:'Load delivery status to inspect the actual queue.')+'</p>'+(mailError?'<p role="alert">'+e(mailError)+'</p>':'')+'<div class="si-metrics">'+labels.map(([k,l])=>'<div><span>'+e(l)+'</span><strong>'+e(counts[k]??'—')+'</strong></div>').join('')+'</div><div class="si-actions">'+button('data-id-mail-status','Refresh delivery status',mailBusy||preview)+button('data-id-mail-process','Process pending delivery',mailBusy||preview||!mail?.enabled||mail?.transport!=='configured'||!(counts.pending>0||mail?.accessEnabled&&mail?.access?.eligible>0),true)+'</div><p class="si-note">SMTP accepted does not guarantee inbox delivery. Stalled and uncertain jobs require review; processing only claims pending jobs. No automatic resend is performed.</p><span class="si-kicker">PRIVATE ROOM INVITATIONS</span><p>'+e(mail?mail.accessEnabled?'Automatic access enabled for verified, accepted rooms.':'Automatic access disabled. Existing manual invitations remain available.':'Access status not loaded.')+'</p><div class="si-metrics">'+[['eligible','Eligible rooms'],['sending','Sending'],['sent','SMTP accepted'],['stalled','Stalled'],['uncertain','Uncertain']].map(([k,l])=>'<div><span>'+e(l)+'</span><strong>'+e(mail?.access?.[k]??'—')+'</strong></div>').join('')+'</div></section>';
}
async function delivery(process=false){
 if(preview||mailBusy||!workspace)return;
 if(process&&(!mail?.enabled||mail?.transport!=='configured'||!confirm('Process pending onboarding delivery and, if enabled, an eligible room invitation? This may send emails to recorded recipients.')))return;
 const o=workspace;mailBusy=true;mailError='';refresh();
 try{
  if(process){await api('/api/admin/onboarding-status',{method:'POST'});if(o!==workspace||section!==route||preview)return;toast('Processing requested. Refresh status to confirm SMTP outcome.');}
  const d=await api('/api/admin/onboarding-status',{signal:AbortSignal.timeout(18000)});
  if(o===workspace&&section===route&&!preview){if(d.source!=='onboarding-status-v1'||!d.counts)throw Error('Incomplete delivery status.');mail=d;}
 }catch(err){if(o===workspace&&section===route&&!preview){mail=null;mailError=String(err.message||'Delivery status unavailable.');}}
 finally{if(o===workspace){mailBusy=false;refresh();}}
}
function markup(){return '<div id="identity-r53" class="si-root"><header class="si-heading"><div><span class="si-kicker">VELORYZ / BUSINESS / ONBOARDING</span><h1>Client identities.</h1><p>Permanent identifiers, verified recipients and connected project workspaces.</p></div><div class="si-actions"><a class="si-button" href="#/submission-center">Submission intelligence ↗</a><a class="si-button" href="#/client-portal">Client rooms ↗</a>'+button('data-id-refresh','Refresh',busy||preview)+'</div></header>'+mailMarkup()+'<p class="si-notice">An accepted delivery room is separate from a pending onboarding record. Check the delivery controls below for current configuration.</p><div class="si-metrics"><div><span>Matching identities</span><strong>'+e(total??'—')+'</strong></div><div><span>Verified on this page</span><strong>'+(loaded?rows.filter(r=>r.identity_status==='verified').length:'—')+'</strong></div><div><span>Projects in selected group</span><strong>'+e(detail?.project_total??'—')+'</strong></div></div><form id="identity-r53-search" class="si-filter"><label>Search all identities<input id="id-q" type="search" maxlength="120" value="'+e(q)+'" placeholder="Client ID, name or email"></label><button class="si-button si-primary" type="submit" '+(busy||preview?'disabled':'')+'>Search</button></form><div class="si-layout"><aside class="si-directory">'+(preview?'<p class="si-empty">Preview: no private records fetched.</p>':busy?'<p class="si-empty" role="status">Loading private identities…</p>':error?'<p class="si-empty" role="alert">'+e(error)+'</p>':rows.map(r=>'<button class="si-row '+(selected===r.id?'is-selected':'')+'" type="button" data-id-select="'+e(r.id)+'"><span class="si-avatar">'+e(String(r.name_at_registration||'?').slice(0,2).toUpperCase())+'</span><span class="si-row-text"><strong>'+e(r.name_at_registration)+'</strong><span>'+e(r.email_at_registration)+'</span><small>'+e(r.client_code)+'</small></span><span class="si-status">'+e(r.identity_status)+'</span></button>').join('')||'<p class="si-empty">No matching identities.</p>')+'<div class="si-pages">'+button('data-id-page="-1"','← Previous',busy||pageIndex===0)+button('data-id-page="1"','Next →',busy||total===null||(pageIndex+1)*25>=total)+'</div></aside><section class="si-detail">'+(busy?'<p role="status">Loading…</p>':projectMarkup())+'</section></div></div>';}
async function issue(){
 const r=current();if(!r||r.identity_status!=='unverified'||busy)return;
 if(!confirm('Prepare a one-time verification link for '+r.email_at_registration+'? Send it only to this registered address.'))return;
 const s=++seq,o=workspace;busy=true;
 try{const d=await api(base,{method:'POST',body:JSON.stringify({action:'issue',client:r.id})});if(!still(s,o))return;
 if(d.recipient!==r.email_at_registration||!d.url)throw Error('Recipient mismatch. Do not send this link.');
 const u=new URL(d.url);if(u.origin!==location.origin||u.pathname!=='/verify-client.html'||!/^#token=[0-9a-f]{64}$/.test(u.hash))throw Error('Verification URL is invalid.');
 const draft='mailto:'+encodeURIComponent(d.recipient)+'?subject='+encodeURIComponent('VELORYZ — verify your email')+'&body='+encodeURIComponent('Please verify your registered email using this one-time link (valid for 30 minutes):\n\n'+u.href+'\n\nThis is not a project access code. If you did not request this, ignore this email.');
 showModal('Verification-only email','Send only to the registered recipient','<p>'+e(d.recipient)+'</p><p>Expires: '+e(d.expires_at)+'</p><p>No email has been sent. The link contains no project information.</p><a class="admin-button" href="'+e(draft)+'">Open email draft ↗</a>','<button class="admin-button secondary" data-action="close-modal">Close</button>');
 }catch(err){if(still(s,o))toast(err.message||'Could not prepare verification.');}finally{if(s===seq&&o===workspace){busy=false;refresh();}}
}
async function group(){
 const r=current();if(!r||r.identity_status!=='verified'||busy)return;
 const value=window.prompt('Enter the full VZ-CL- client code of the verified primary profile. Both identities must have independently verified the same email address.');if(!value)return;
 const m=value.trim().match(/^VZ-CL-([a-f0-9]{32})$/i);if(!m){toast('Enter a full client code.');return;}
 const h=m[1].toLowerCase(),id=[h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');if(id===r.id)return;
 if(!confirm('Link these profiles for owner-side project management? This does not grant access to another workspace.'))return;
 const s=++seq,o=workspace;busy=true;
 try{await api(base,{method:'POST',body:JSON.stringify({action:'group',member:r.id,primary:id,confirm:true})});if(still(s,o)){toast('Verified identities linked.');busy=false;await load();}}
 catch(err){if(still(s,o))toast(err.message||'Link failed.');}finally{if(s===seq&&o===workspace){busy=false;refresh();}}
}
async function downloadEstimate(p){
 if(!p?.id||busy||preview)return;
 const o=workspace,s=++seq;busy=true;refresh();
 try{
 const r=await fetch('/api/admin/estimate-document?workspace='+encodeURIComponent(p.id),{method:'POST',credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(25000)});
 if(!still(s,o))return;
 if(!r.ok){const out=await r.json().catch(()=>({}));throw Error(r.status===401?'Owner session expired. Sign in again.':r.status===403?'Owner access required.':out.error||'Estimate is unavailable.');}if(!r.headers.get('content-type')?.startsWith('application/pdf'))throw Error('Invalid document response. No file downloaded.');
 const b=await r.blob();if(!still(s,o))return;
 const name=r.headers.get('content-disposition')?.match(/filename="(VZ-EST-[A-F0-9]{32}\.pdf)"/)?.[1]||'VELORYZ-registration-estimate.pdf';
 const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
 }catch(err){if(still(s,o))toast(err.message||'PDF download failed.');}finally{if(s===seq&&o===workspace){busy=false;refresh();}}
}
let bill=null,billSeq=0;
const billingMoney=n=>Number.isSafeInteger(n)?'₹'+(n/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
const billingPath=id=>'/api/admin/commercial-billing?workspace='+encodeURIComponent(id);
const billingStill=(token,o)=>token===billSeq&&o===workspace&&owner===workspace&&section===route&&!preview;
function billingView(d,p){
 const q=d.quote,b=d.invoice,receipts=Array.isArray(d.receipts)?d.receipts:[];
 const form=!q?'<h3>Record agreed quotation</h3><label>Agreed amount (INR)<input id="bill-amount" type="text" inputmode="decimal" maxlength="15" placeholder="50000.00"></label><label>Client agreement reference<input id="bill-agreement" maxlength="250" placeholder="Signed scope / written approval reference"></label><label>Approved scope<textarea id="bill-scope" maxlength="2000" rows="4"></textarea></label>'+button('data-bill-action="approve"','Record approved quotation',!d.enabled,true):!b?'<h3>Issue billing record</h3><label>Agreed due date<input id="bill-due" type="date"></label>'+button('data-bill-action="issue"','Issue billing record',!d.enabled,true):'<h3>Record a reconciled receipt</h3><label>Received amount (INR)<input id="bill-amount" inputmode="decimal" maxlength="15"></label><label>Verified bank / receipt reference<input id="bill-reference" maxlength="160"></label>'+button('data-bill-action="record"','Record payment evidence',!d.enabled||d.balance_paise===0,true)+button('data-bill-action="pdf"','Download billing statement ↓',false)+button('data-bill-action="deliver"',d.delivery?.state==='pending'?'Process queued billing email':'Queue billing email to verified recipient',!d.deliveryEnabled||!!(d.delivery?.state&&d.delivery.state!=='pending'));
 const stats='<dl class="si-facts">'+fact('Project',p.project_code)+fact('Quotation',q?.quote_code)+fact('Billing reference',b?.invoice_code)+fact('Due date',b?.due_date)+fact('Approved amount',billingMoney(q?.amount_paise))+fact('Recorded receipts',billingMoney(d.paid_paise))+fact('Outstanding balance',billingMoney(d.balance_paise))+fact('Billing email',d.delivery?.state||'Not queued')+'</dl>';
 return '<div id="r55-billing" class="si-root"><div class="si-panel"><span class="si-kicker">COMMERCIAL RECORDS / OWNER REVIEW</span><p>'+e(d.enabled?'Owner-attested records. No payment is collected here.':'Read-only: commercial billing is not activated.')+'</p>'+stats+(b?'<p>'+e(d.balance_paise===0?'Fully recorded':d.paid_paise>0?'Partially recorded':'Outstanding')+'</p>':'')+'<p class="si-note">This is a non-tax billing record. Confirm tax treatment and reconcile existing payment requests before issuing. Recorded receipts are not gateway confirmations.</p></div><div class="si-panel si-filter" style="display:grid;gap:12px">'+form+'<p id="bill-feedback" role="status"></p></div>'+(receipts.length?'<div class="si-panel"><h3>Latest recorded receipts</h3><p>Showing '+receipts.length+' of '+e(d.receipt_count)+'</p>'+receipts.map(x=>'<dl class="si-facts">'+fact('Reference',x.receipt_reference)+fact('Amount',billingMoney(x.amount_paise))+fact('Recorded',x.created_at)+'</dl>').join('')+'</div>':'')+'</div>';
}
async function openBilling(p){
 if(!p?.id||preview||busy)return;const token=++billSeq,o=workspace;bill=null;busy=true;refresh();
 try{const d=await api(billingPath(p.id));if(!billingStill(token,o))return;if(d.source!=='commercial-v1')throw Error('Incomplete commercial response.');bill={p,o,token,d,working:false,receiptId:crypto.randomUUID()};showModal('Quotation & billing','Private commercial records',billingView(d,p),'<button class="admin-button secondary" data-action="close-modal">Close</button>');}
 catch(err){if(billingStill(token,o))toast(err.message||'Billing service unavailable.');}finally{if(o===workspace){busy=false;refresh();}}
}
function parseAmount(value){const s=String(value||'').trim();if(!/^\d{1,10}(\.\d{1,2})?$/.test(s))throw Error('Enter an amount in rupees, with up to two decimal places.');const [whole,fraction='']=s.split('.'),n=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(!Number.isSafeInteger(n)||n<1||n>100000000000)throw Error('Amount is outside the allowed range.');return n;}
async function billingAction(action){
 const b=bill,root=document.getElementById('r55-billing');if(!root||!b||b.working||!billingStill(b.token,b.o))return;
 const active=()=>billingStill(b.token,b.o)&&document.getElementById('r55-billing')===root;
 const feedback=root.querySelector('#bill-feedback'),read=id=>root.querySelector('#'+id)?.value||'';
 const setBusy=v=>{b.working=v;root.querySelectorAll('[data-bill-action]').forEach(x=>{x.disabled=v||(!b.d.enabled&&x.dataset.billAction!=='pdf')||(x.dataset.billAction==='record'&&b.d.balance_paise===0);});};
 try{
  if(action==='pdf'){
   setBusy(true);const r=await fetch(billingPath(b.p.id)+'&pdf=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(25000)});
   if(!r.ok||!r.headers.get('content-type')?.startsWith('application/pdf'))throw Error('Billing statement unavailable.');
   const bytes=await r.blob();if(!active())return;const u=URL.createObjectURL(bytes),a=document.createElement('a');a.href=u;a.download=(b.d.invoice?.invoice_code||'VELORYZ-billing')+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return;
  }
  if(!b.d.enabled)return;let x={action,confirm:true};
  if(action==='approve'){x={...x,amount:parseAmount(read('bill-amount')),agreement:read('bill-agreement').trim(),scope:read('bill-scope').trim()};if(x.agreement.length<3||x.scope.length<10)throw Error('Agreement reference and approved scope are required.');if(!confirm('Confirm the client already agreed to '+billingMoney(x.amount)+' and this scope in writing. The quotation is immutable.'))return;}
  else if(action==='issue'){x.due=read('bill-due');if(!x.due)throw Error('Choose a due date.');if(!confirm('Issue an immutable non-tax billing record? No email or payment will be sent.'))return;}
  else if(action==='record'){x={...x,id:b.receiptId,amount:parseAmount(read('bill-amount')),reference:read('bill-reference').trim()};if(x.reference.length<3)throw Error('A verified receipt reference is required.');if(!confirm('Confirm you independently verified receipt of '+billingMoney(x.amount)+'. This does not collect money.'))return;}
  else if(action==='deliver'){if(!b.d.deliveryEnabled||!confirm('Queue this private billing statement for the original verified recipient? No automatic retry follows an uncertain delivery.'))return;}
  else return;
  setBusy(true);feedback.textContent='Saving…';const d=await api(billingPath(b.p.id),{method:'POST',body:JSON.stringify(x)});if(!active())return;if(d.source!=='commercial-v1')throw Error('Could not confirm operation. Refresh and inspect the ledger before retrying.');b.d=d;b.receiptId=crypto.randomUUID();root.outerHTML=billingView(d,b.p);toast('Commercial record saved.');
 }catch(err){if(active())feedback.textContent=err.message||'Commercial operation could not be confirmed.';}finally{b.working=false;if(active())setBusy(false);}
}
document.addEventListener('click',ev=>{const x=ev.target.closest('[data-bill-action]');if(x)void billingAction(x.dataset.billAction);});
function page(){reset();if(!preview&&!loaded&&!busy&&!error)queueMicrotask(()=>{if(section===route&&owner===workspace&&!busy&&!loaded&&!error)load();});return markup();}
document.addEventListener('submit',ev=>{if(ev.target.id!=='identity-r53-search'||section!==route||preview||busy)return;ev.preventDefault();q=document.getElementById('id-q').value.trim();pageIndex=0;selected='';projectPage=0;load();});
document.addEventListener('click',ev=>{if(section!==route||owner!==workspace||preview||busy)return;const b=ev.target.closest('[data-id-select],[data-id-refresh],[data-id-page],[data-id-project-page],[data-id-issue],[data-id-group],[data-id-room],[data-id-estimate],[data-id-mail-status],[data-id-mail-process],[data-id-billing]');if(!b)return;
 if(b.hasAttribute('data-id-mail-status')){void delivery();}else if(b.hasAttribute('data-id-mail-process')){void delivery(true);}else if(b.hasAttribute('data-id-select')){selected=b.dataset.idSelect;projectPage=0;load();}else if(b.hasAttribute('data-id-refresh'))load();else if(b.hasAttribute('data-id-page')){pageIndex=Math.max(0,pageIndex+Number(b.dataset.idPage));selected='';projectPage=0;load();}else if(b.hasAttribute('data-id-project-page')){projectPage=Math.max(0,projectPage+Number(b.dataset.idProjectPage));load();}else if(b.hasAttribute('data-id-issue'))issue();else if(b.hasAttribute('data-id-group'))group();else if(b.hasAttribute('data-id-billing')){void openBilling(detail?.projects?.[Number(b.dataset.idBilling)]);}else if(b.hasAttribute('data-id-estimate')){void downloadEstimate(detail?.projects?.[Number(b.dataset.idEstimate)]);}else if(b.hasAttribute('data-id-room')){const p=detail?.projects?.[Number(b.dataset.idRoom)];if(p?.lifecycle==='accepted')window.VeloryzRegistrationLinks?.openRoom({reference:p.reference,accepted_project_id:p.delivery_project_id},true);}
});
window.VeloryzIdentityCenter={page};
})();