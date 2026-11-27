/* R52.1 — client and delivery operations, using existing private owner APIs. */
(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stages=[['planning','Planning'],['in-progress','In progress'],['in-review','In review'],['on-hold','On hold'],['launched','Launched']];
const statusLabel=s=>stages.find(x=>x[0]===s)?.[1]||'Other';
const progress=p=>Math.max(0,Math.min(100,Number(p.progress)||0));
const day=d=>{const x=Date.parse(d||'');return Number.isFinite(x)?new Date(x).toLocaleDateString('en-IN',{dateStyle:'medium'}):'Not set';};
const due=(p,now=Date.now())=>{const date=String(p.due_date||'').slice(0,10);const today=new Date(now+19800000).toISOString().slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(date)&&date<today&&p.status!=='launched';};
function findProjects(items,q,status){
 q=String(q||'').trim().toLowerCase();return items.filter(p=>(status==='all'||p.status===status)&&(!q||[p.id,p.title,p.client_name,p.client_email,p.request_reference,p.phase].some(v=>String(v||'').toLowerCase().includes(q))));
}
function summarize(items,now=Date.now()){
 return {total:items.length,active:items.filter(p=>['planning','in-progress','in-review'].includes(p.status)).length,review:items.filter(p=>p.status==='in-review').length,overdue:items.filter(p=>due(p,now)).length,launched:items.filter(p=>p.status==='launched').length};
}
function linked(request,projects){return projects.find(p=>p.request_reference&&p.request_reference===request.reference);}
let owner=null,projects=null,requests=null,delivery=null,errors={},busy=false,sequence=0,view='portfolio',query='',status='all',requestPage=0,checkedAt=0;
function reset(){if(owner===workspace)return;owner=workspace;projects=null;requests=null;delivery=null;errors={};busy=false;sequence++;requestPage=0;checkedAt=0;query='';status='all';}
async function load(){
 if(busy||preview)return;busy=true;errors={};const seq=++sequence,session=owner;refresh();
 const jobs=[['projects',()=>cpReq('/projects',{signal:AbortSignal.timeout(15000)}),d=>{if(!Array.isArray(d.projects))throw Error('Invalid project directory.');projects=d.projects;}],['requests',()=>api('/api/admin/enquiries?status=all&page='+requestPage,{signal:AbortSignal.timeout(15000)}),d=>{if(!Array.isArray(d.items)||!Number.isFinite(Number(d.total)))throw Error('Invalid enquiry directory.');requests={items:d.items,total:Number(d.total)};}],['delivery',()=>cpReq('/delivery',{signal:AbortSignal.timeout(15000)}),d=>{if(typeof d.configured!=='boolean')throw Error('Email configuration unavailable.');delivery={configured:d.configured};}]];
 await Promise.all(jobs.map(async ([k,run,apply])=>{try{const d=await run();if(seq===sequence&&workspace===session)apply(d);}catch{if(seq===sequence&&workspace===session){errors[k]='Could not verify this service. Refresh to retry.';if(k==='projects')projects=null;if(k==='requests')requests=null;if(k==='delivery')delivery=null;}}}));
 if(seq!==sequence||workspace!==session)return;busy=false;checkedAt=Date.now();refresh();
}
const link=(route,label)=>'<a class="co-button secondary" href="#/'+route+'">'+esc(label)+' ↗</a>';
const button=(attr,label,disabled=false)=>'<button type="button" class="co-button secondary" '+attr+' '+(disabled?'disabled':'')+'>'+esc(label)+'</button>';
function headingMarkup(){
 const s=projects?summarize(projects):null;
 return '<header class="co-hero"><div><span class="co-kicker">VELORYZ / CLIENT & DELIVERY OPERATIONS / R52.1</span><h1>Every project.<br><em>One clear story.</em></h1><p>From incoming brief to private client workspace, milestones, commercial handoff and delivery.</p><div class="co-actions">'+link('client-portal','Client workspace')+link('enquiries','Request inbox')+button('data-co-refresh',busy?'Refreshing…':'Refresh records',busy||preview)+'</div></div><div class="co-hero-card"><small>RETURNED PRIVATE WORKSPACES</small><strong>'+esc(s?s.total:'—')+'</strong><p>'+esc(checkedAt?'Checked '+new Date(checkedAt).toLocaleString('en-IN'):'Awaiting owner API')+'</p><div class="co-mini"><span>Active <b>'+esc(s?s.active:'—')+'</b></span><span>Review <b>'+esc(s?s.review:'—')+'</b></span><span>Past target <b>'+esc(s?s.overdue:'—')+'</b></span></div><small>Up to 200 returned workspaces; not database-wide counts.</small></div></header>';
}
function controls(){return '<div class="co-toolbar"><label>Search returned workspaces<input id="co-query" type="search" value="'+esc(query)+'" placeholder="Client, project, ID or request reference"></label><label>Project status<select id="co-status">'+[['all','All statuses'],...stages].map(([v,l])=>'<option value="'+v+'" '+(status===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label></div>';}
function card(p){
 return '<article class="co-project"><div class="co-project-head"><span class="co-avatar">'+esc(String(p.client_name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())+'</span><div><small>'+esc(p.request_reference||'Manually created workspace')+'</small><h3>'+esc(p.title||'Untitled project')+'</h3><p>'+esc(p.client_name||'Unnamed client')+'</p></div><span class="co-status">'+esc(statusLabel(p.status))+'</span></div><div class="co-progress"><progress max="100" value="'+progress(p)+'" aria-label="Recorded completion"></progress><b>'+progress(p)+'%</b></div><div class="co-meta"><span>Phase <b>'+esc(p.phase||'Not set')+'</b></span><span>Target <b>'+esc(day(p.due_date))+'</b></span></div>'+(due(p)?'<p class="co-warning">Target date passed · review delivery</p>':'')+'<div class="co-actions">'+button('data-co-open="'+esc(p.id)+'"','Open private project')+'</div></article>';
}
function portfolio(){
 if(!projects)return '<p role="status">'+esc(errors.projects||'Project directory not loaded.')+'</p>';
 const list=findProjects(projects,query,status);
 return '<p class="co-note">'+list.length+' of '+projects.length+' returned workspaces · exact recorded progress</p><div class="co-project-grid">'+(list.length?list.map(card).join(''):'<p>No matching workspaces.</p>')+'</div>';
}
function board(){
 if(!projects)return '<p role="status">'+esc(errors.projects||'Project directory not loaded.')+'</p>';
 const list=findProjects(projects,query,status),other=list.some(p=>!stages.some(s=>s[0]===p.status));
 return '<p class="co-note">'+list.length+' returned matching workspaces. Use the existing validated editor to change status.</p><div class="co-board">'+[...stages,...(other?[['other','Other']]:[])].map(([id,name])=>{const rows=list.filter(p=>id==='other'?!stages.some(s=>s[0]===p.status):p.status===id);return '<section><header><h3>'+name+'</h3><b>'+rows.length+'</b></header>'+(rows.length?rows.map(card).join(''):'<p>No matching projects.</p>')+'</section>';}).join('')+'</div>';
}
function inbox(){
 if(!requests)return '<p role="status">'+esc(errors.requests||'Request inbox not loaded.')+'</p>';
 return '<p class="co-note">'+requests.total+' total enquiries · page '+(requestPage+1)+' · matching references compare only the returned project directory.</p><div class="co-requests">'+requests.items.map(r=>{const p=projects?linked(r,projects):null;return '<article><div><small>'+esc(r.reference)+' · '+esc(day(r.created_at))+'</small><h3>'+esc(r.name||'Unnamed contact')+'</h3><p>'+esc(r.service)+' · '+esc(r.budget||'Budget to discuss')+'</p></div><div><span class="co-status">'+esc(r.status)+'</span><p>'+esc(p?'Linked workspace found':projects?'No match in returned workspaces':'Workspace link not checked')+'</p></div><div class="co-actions">'+(p?button('data-co-open="'+esc(p.id)+'"','Open project'):'')+button('data-co-request="'+esc(r.id)+'"','Inspect request')+'</div></article>';}).join('')+'</div><div class="co-actions">'+button('data-co-page="-1"','Previous',busy||requestPage===0)+button('data-co-page="1"','Next',busy||(requestPage+1)*25>=requests.total)+link('enquiries','Manage acceptance and notes')+'</div>';
}
function automation(){
 return '<div class="co-automation"><header><span class="co-kicker">AUTOMATION BLUEPRINT / NOT ENABLED</span><h2>Submission to welcome pack</h2><p>Proposed event-driven onboarding. Existing delivery controls remain manual.</p></header><div class="co-flow">'+[['01','Project Creator submitted','Validate consent, spam protection, source and server-side price snapshot.'],['02','Create pending workspace','Atomically link the request, client ID, project ID and delivery job.'],['03','Prepare documents','Provisional invoice or estimate PDF until the scope and amount are confirmed.'],['04','Generate private access','Single-use, expiring invitation; no plaintext access code in admin listings.'],['05','Send one welcome email','Reuse Gmail SMTP; attach the PDF and include the client ID, project reference and secure activation code.'],['06','Track onboarding','Store delivery outcome, retry state and activation status for owner review.']].map(([n,t,d])=>'<article><span>'+n+'</span><div><h3>'+t+'</h3><p>'+d+'</p></div><small>Planned</small></article>').join('')+'</div><div class="co-delivery"><div><strong>Existing Gmail configuration</strong><p>'+esc(delivery?delivery.configured?'Credential reported configured; sending not verified.':'Credential reported missing.':errors.delivery||'Not checked.')+'</p></div>'+link('client-portal','Manual delivery controls')+'</div><p class="co-note">The automation requires a transactional job/outbox, recipient verification controls, reliable retry semantics and provider deployment. No client emails, invitations or invoices were generated by this console.</p></div>';
}
function results(){return view==='portfolio'?portfolio():view==='pipeline'?board():view==='intake'?inbox():automation();}
function page(){
 reset();if(!preview&&!busy&&!checkedAt)queueMicrotask(()=>{if(section==='project-operations'&&!busy&&!checkedAt)load();});
 return '<div id="co-root" class="co-root">'+headingMarkup()+'<nav class="co-nav" aria-label="Project operations views">'+[['portfolio','Project portfolio'],['pipeline','Delivery pipeline'],['intake','Request intake'],['automation','Automation blueprint']].map(([v,l],i)=>'<button type="button" data-co-view="'+v+'" aria-pressed="'+(view===v)+'"><small>0'+(i+1)+'</small>'+l+'</button>').join('')+'</nav><section class="co-content">'+(preview?'<p class="co-note">Design preview only. No private records are fetched.</p>':'')+(['portfolio','pipeline'].includes(view)?controls():'')+'<div id="co-results">'+results()+'</div></section></div>';
}
function refresh(){if(section!=='project-operations')return;const root=document.getElementById('co-root');if(root)root.outerHTML=page();}
function refreshResults(){const el=document.getElementById('co-results');if(el)el.innerHTML=results();}
function clientHeader(){
 return '<div class="co-client-head"><span class="co-kicker">VELORYZ / PRIVATE CLIENT RELATIONSHIPS</span><div class="co-client-head-row"><div><h1>Client rooms.</h1><p>Manage each private workspace, project records, approvals, files and communication.</p></div><div class="co-actions">'+link('project-operations','Project operations')+link('enquiries','Incoming requests')+'<button type="button" class="co-button" data-cpm="new">+ New client workspace</button></div></div><div class="co-client-note">Direct private workspace updates · existing owner authorization · no automatic billing or invitation activation yet</div></div>';
}
document.addEventListener('click',e=>{
 if(section!=='project-operations')return;
 const v=e.target.closest('[data-co-view]');if(v){view=v.dataset.coView;refresh();document.querySelector('[data-co-view="'+view+'"]')?.focus({preventScroll:true});return;}
 if(e.target.closest('[data-co-refresh]')){load();return;}
 const open=e.target.closest('[data-co-open]');if(open&&projects?.some(p=>p.id===open.dataset.coOpen)){if(cpBusy||cpLoading){toast('Wait for the current private workspace operation to complete.');return;}window.VeloryzCRM?.openDirectory();cpNewProject=false;cpNewDraft=null;cpEditMode='';cpTab='overview';cpSelected=open.dataset.coOpen;cpWorkspace=null;cpEmailEvents=[];cpLoaded=false;location.hash='#/client-portal';return;}
 const request=e.target.closest('[data-co-request]');if(request){const r=requests?.items.find(x=>x.id===request.dataset.coRequest);if(!r)return;showModal('Project request',esc(r.reference),'<p><strong>'+esc(r.name)+'</strong> · '+esc(r.email)+'</p><p>'+esc(r.service)+' · '+esc(r.budget)+'</p><pre class="co-brief">'+esc(r.message)+'</pre><p>Use the existing enquiry inbox to accept the request and preserve its original history.</p>','<a class="admin-button secondary" href="#/enquiries" data-co-close>Open request inbox ↗</a><button class="admin-button secondary" data-action="close-modal">Close</button>');return;}
 if(e.target.closest('[data-co-close]'))closeModal();
 const pg=e.target.closest('[data-co-page]');if(pg&&!busy){requestPage=Math.max(0,requestPage+Number(pg.dataset.coPage));load();}
});
document.addEventListener('input',e=>{if(e.target.id==='co-query'){query=e.target.value;refreshResults();}});
document.addEventListener('change',e=>{if(e.target.id==='co-status'){status=e.target.value;refreshResults();}});
window.VeloryzClientOperations={page,clientHeader};
})();
