/* R52.2.6 — submission intake, owner-only existing enquiry API + gated structured API. */
(()=>{
'use strict';
const esc=v=>E(v??'');
const date=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Not recorded';};
const money=v=>Number.isSafeInteger(v)&&v>=0?'₹'+(v/100).toLocaleString('en-IN',{maximumFractionDigits:2}):'Not recorded';
const statuses=[['all','All statuses'],['new','New'],['contacted','Contacted'],['confirmed','Confirmed'],['closed','Closed']];
const label=v=>statuses.find(x=>x[0]===v)?.[1]||'Unknown';
const creatorHint=m=>/^PROJECT CREATOR V[345](?:\r?\n|$)/.test(String(m||''));
const fields=m=>{const f=Object.create(null);if(!creatorHint(m))return f;for(const line of String(m).split('\n').slice(1,60)){const i=line.indexOf(': ');if(i>0&&!Object.hasOwn(f,line.slice(0,i)))f[line.slice(0,i)]=line.slice(i+2);}return f;};
const queryMatch=(rows,q,type)=>rows.filter(r=>(type==='all'||(type==='creator'?creatorHint(r.message):!creatorHint(r.message)))&&(!q||[r.reference,r.name,r.email,r.company,r.service,r.message].some(v=>String(v||'').toLowerCase().includes(q.toLowerCase()))));
const button=(attrs,content,disabled=false,primary=false)=>'<button type="button" class="si-button '+(primary?'si-primary':'')+'" '+attrs+(disabled?' disabled':'')+'>'+content+'</button>';
let owner=null,source='legacy',rows=[],total=null,pageIndex=0,filter='all',type='all',search='',selected='',activity=null,activityError='',busy=false,error='',loaded=false,seq=0,actSeq=0;
function reset(){if(owner===workspace)return;owner=workspace;source='legacy';rows=[];total=null;pageIndex=0;filter='all';type='all';search='';selected='';activity=null;activityError='';busy=false;error='';loaded=false;seq++;actSeq++;}
function visible(){return source==='legacy'?queryMatch(rows,search.trim(),type):rows;}
function current(){return visible().find(r=>r.id===selected);}
function refresh(){if(section!=='submission-center'||workspace!==owner)return;const el=document.getElementById('si-root');if(el)el.outerHTML=markup();}
function updateList(){if(section!=='submission-center'||workspace!==owner)return;const el=document.getElementById('si-list');if(el)el.innerHTML=listing();const d=document.getElementById('si-detail');if(d)d.innerHTML=detail();}
function changeSource(s){if(!['legacy','structured'].includes(s)||s===source)return;source=s;pageIndex=0;search='';filter='all';type='all';selected='';void load();}
async function load(){
 if(preview||!workspace)return;
 const token=++seq,session=owner,mode=source;busy=true;loaded=false;rows=[];total=null;selected='';activity=null;activityError='';error='';actSeq++;refresh();
 const qs='?status='+encodeURIComponent(filter)+'&page='+pageIndex+(mode==='structured'?'&q='+encodeURIComponent(search.trim()):'');
 try{
  const data=await api((mode==='structured'?'/api/admin/project-submissions':'/api/admin/enquiries')+qs,{signal:AbortSignal.timeout(15000)});
  if(token!==seq||session!==workspace||mode!==source)return;
  if(!Array.isArray(data.items)||!Number.isSafeInteger(data.total)||data.total<0||data.items.length>25||(mode==='structured'&&data.source!=='structured-v1'))throw Error('The response did not match the expected directory.');
  rows=data.items.filter(r=>r&&typeof r.id==='string'&&typeof r.reference==='string');total=data.total;loaded=true;
 }catch(err){if(token!==seq||session!==workspace||mode!==source)return;error=mode==='structured'?'Structured registration is unavailable or not enabled. No verified count can be shown.':String(err.message||'Could not load the request inbox.');}
 finally{if(token===seq&&session===workspace&&mode===source){busy=false;refresh();}}
}
async function choose(id){
 if(busy||!visible().some(r=>r.id===id))return;
 selected=id;activity=null;activityError='';const token=++actSeq,session=owner,requestSeq=seq;updateList();
 try{const d=await api('/api/admin/enquiries/'+encodeURIComponent(id)+'/activity',{signal:AbortSignal.timeout(12000)});if(token!==actSeq||session!==workspace||requestSeq!==seq||selected!==id)return;if(!Array.isArray(d.events))throw Error('Invalid activity');activity=d.events;}
 catch{if(token===actSeq&&session===workspace&&requestSeq===seq&&selected===id)activityError='Activity could not be loaded.';}
 if(token===actSeq&&session===workspace&&requestSeq===seq&&selected===id&&section==='submission-center'){const el=document.getElementById('si-detail');if(el)el.innerHTML=detail();}
}
function listing(){
 const list=visible();
 if(preview)return '<p class="si-empty">Preview mode. No private records are fetched.</p>';
 if(busy)return '<p role="status" class="si-empty">Loading private submissions…</p>';
 if(error)return '<div class="si-empty" role="alert"><strong>Directory unavailable</strong><p>'+esc(error)+'</p>'+button('data-si-refresh','Retry')+'</div>';
 if(!loaded)return '<p class="si-empty">Waiting for the owner API.</p>';
 return '<div class="si-list-summary"><span>'+list.length+' shown on this page</span><span>Page '+(pageIndex+1)+'</span></div>'+(list.length?list.map(r=>{const hint=creatorHint(r.message),f=fields(r.message),title=source==='structured'?r.category||'Project registration':f.Project||r.service||'General enquiry';return '<button type="button" class="si-row '+(selected===r.id?'is-selected':'')+'" data-si-select="'+esc(r.id)+'" aria-pressed="'+(selected===r.id)+'"><span class="si-avatar">'+esc(String(r.name||'?').trim().split(/\s+/).slice(0,2).map(v=>v[0]).join('').toUpperCase())+'</span><span class="si-row-text"><strong>'+esc(r.name||'Unnamed contact')+'</strong><span>'+esc(title)+'</span><small>'+esc(r.reference)+'</small><small>'+esc(date(r.created_at))+'</small></span><span class="si-row-status"><span class="si-status">'+esc(label(r.status))+'</span><small>'+esc(source==='structured'?'Verified record':hint?'Creator text hint':'General request')+'</small></span></button>';}).join(''):'<p class="si-empty">No matching records on this page.</p>')+'<div class="si-pages">'+button('data-si-page="-1"','← Previous',pageIndex===0)+button('data-si-page="1"','Next →',(pageIndex+1)*25>=total)+'</div>';
}
const fact=(k,v)=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v||'Not recorded')+'</dd></div>';
function structured(r){
 const snapshot=r.brief||{},b=snapshot.brief||{},c=snapshot.contact||{},q=r.quote||{};
 const lines=Array.isArray(q.lines)?q.lines:[];
 return '<section class="si-panel"><span class="si-kicker">IMMUTABLE REGISTRATION SNAPSHOT</span><h3>Original project brief</h3><dl class="si-facts">'+[['Category',b.category],['Template',b.template||b.external],['Visual direction',[b.style,b.palette].filter(Boolean).join(' / ')],['Pages / screens',String(b.pages||'')],['Features',(b.features||[]).join(', ')],['Materials',(b.assets||[]).join(', ')],['Technology',(b.technologies||[]).join(', ')],['Timeline',b.timeline],['Motion',b.motion],['Contact at submission',c.email],['Consent',snapshot.consent===true?'Recorded':'Not recorded'],['Published pricing revision',String(q.publishedRevision??'')]].map(([k,v])=>fact(k,v)).join('')+'</dl><p class="si-brief">'+esc(b.goal||'No goal recorded')+'</p><details><summary>Complete original structured snapshot</summary><pre class="si-brief">'+esc(JSON.stringify(snapshot,null,2))+'</pre></details></section><section class="si-panel"><span class="si-kicker">SERVER-CALCULATED ESTIMATE</span><h3>'+esc(money(q.lowPaise))+' – '+esc(money(q.highPaise))+'</h3><p>Indicative planning range; not a final invoice or approved quote.</p><dl class="si-facts">'+lines.map(l=>fact(l.label,money(l.amountPaise))).join('')+fact('Contingency',money(q.contingencyPaise))+fact('Amount due',money(q.amountDuePaise))+fact('Pricing rules',q.pricingVersion)+fact('Reference status',q.referenceStatus)+fact('Promotion applied',q.promotionApplied===true?'Yes':'No')+'</dl></section>';
}
function detail(){
 const r=current();if(!r)return '<section class="si-panel si-empty"><h2>Select a request</h2><p>Inspect the original request, contact details and recorded review history.</p></section>';
 const f=fields(r.message);
 return '<section class="si-panel si-detail-head"><span class="si-kicker">'+esc(source==='structured'?'VERIFIED STRUCTURED REGISTRATION':'LEGACY REQUEST / UNVERIFIED ORIGIN')+'</span><h2>'+esc(r.name)+'</h2><p>'+esc(r.reference)+'</p><dl class="si-facts">'+fact('Email',r.email)+fact('Phone',r.phone)+fact('Company',r.company)+fact('Review status',label(r.status))+fact('Received',date(r.created_at))+fact('Budget preference',r.budget)+'</dl><div class="si-actions">'+button('data-si-crm','Open in request inbox ↗',false,true)+button('data-si-copy','Copy reference')+'</div><p class="si-note">Use the existing owner CRM to save notes, change review status or accept a project. These actions do not automatically send emails.</p></section>'+(source==='structured'?structured(r):'<section class="si-panel"><span class="si-kicker">ORIGINAL ENQUIRY MESSAGE</span><h3>Submitted brief</h3>'+(creatorHint(r.message)?'<p class="si-note">Creator-format text is a hint only. Any price mentioned here is customer-provided planning text, not a verified estimate.</p><dl class="si-facts">'+[['Project','Project'],['Template','Starting point'],['Visual style','Visual style'],['Pages / screens','Pages / screens'],['Features','Features'],['Indicative range','Unverified planning range'],['Timeline','Timeline']].filter(([k])=>f[k]).map(([k,l])=>fact(l,f[k])).join('')+'</dl>':'')+'<pre class="si-brief">'+esc(r.message||'No message recorded')+'</pre></section>')+'<section class="si-panel"><span class="si-kicker">OWNER REVIEW ACTIVITY</span><h3>Request history</h3>'+(activityError?'<p role="alert">'+esc(activityError)+'</p>':activity===null?'<p role="status">Loading activity…</p>':!activity.length?'<p>No activity events returned.</p>':'<ol class="si-events">'+activity.map(a=>'<li><strong>'+esc(label(a.status))+'</strong><small>'+esc(date(a.recorded_at))+'</small><p>'+esc(a.notes||'Status recorded')+'</p></li>').join('')+'</ol>')+'</section>';
}
function markup(){
 const v=visible(),counts={new:v.filter(r=>r.status==='new').length,creator:v.filter(r=>creatorHint(r.message)).length};
 const totalText=total===null?'—':String(total);
 return '<div class="si-root" id="si-root"><header class="si-heading"><div><span class="si-kicker">VELORYZ / BUSINESS / INTAKE</span><h1>Submission intelligence.</h1><p>Review incoming requests and inspect their actual recorded provenance.</p></div><div class="si-actions"><a class="si-button" href="#/project-operations">Project operations ↗</a><a class="si-button" href="#/client-portal">Client rooms ↗</a>'+button('data-si-refresh',busy?'Refreshing…':'Refresh',busy||preview)+'</div></header><nav class="si-source" aria-label="Submission source">'+button('data-si-source="legacy" aria-pressed="'+(source==='legacy')+'"','Request inbox',false,source==='legacy')+button('data-si-source="structured" aria-pressed="'+(source==='structured')+'"','Verified registrations',false,source==='structured')+'</nav><div class="si-metrics"><div><span>'+(source==='structured'?'Matching verified registrations':'Total enquiries for status')+'</span><strong>'+totalText+'</strong></div><div><span>New on current page</span><strong>'+(loaded?counts.new:'—')+'</strong></div><div><span>'+(source==='structured'?'Verified on current page':'Creator-format hints on page')+'</span><strong>'+(loaded?(source==='structured'?v.length:counts.creator):'—')+'</strong></div></div><p class="si-notice">'+(source==='legacy'?'Existing owner inbox. Search and Creator hints cover only the returned page; legacy message format cannot prove structured registration.':'Structured registration API is gated until deployment verification. A failed connection is not a zero-record result.')+'</p><form class="si-filter" id="si-filter"><label>Search '+(source==='structured'?'all verified registrations':'this page')+'<input type="search" id="si-search" maxlength="120" value="'+esc(search)+'" placeholder="Client, reference, email, service"></label><label>Review status<select id="si-status">'+statuses.map(([k,l])=>'<option value="'+k+'" '+(filter===k?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+(source==='legacy'?'<label>Request format<select id="si-type">'+[['all','All request formats'],['creator','Creator text hint'],['other','Other requests']].map(([k,l])=>'<option value="'+k+'" '+(type===k?'selected':'')+'>'+l+'</option>').join('')+'</select></label>':button('type="submit" data-si-search','Search',busy))+'</form><div class="si-layout"><aside id="si-list" class="si-directory" aria-label="Submission list">'+listing()+'</aside><main id="si-detail" class="si-detail" aria-label="Selected submission">'+detail()+'</main></div></div>';
}
function page(){reset();if(!preview&&!busy&&!loaded&&!error)queueMicrotask(()=>{if(section==='submission-center'&&workspace===owner&&!busy&&!loaded&&!error)load();});return markup();}
document.addEventListener('click',e=>{if(section!=='submission-center'||workspace!==owner||preview)return;
 const mode=e.target.closest('[data-si-source]');if(mode){changeSource(mode.dataset.siSource);return;}
 if(e.target.closest('[data-si-refresh]')){if(!busy)load();return;}
 const row=e.target.closest('[data-si-select]');if(row){choose(row.dataset.siSelect);return;}
 const pg=e.target.closest('[data-si-page]');if(pg&&!busy){const next=pageIndex+Number(pg.dataset.siPage);if(next>=0&&next*25<total){pageIndex=next;load();}return;}
 if(e.target.closest('[data-si-search]')){e.preventDefault();if(!busy){pageIndex=0;load();}return;}
 if(e.target.closest('[data-si-copy]')){const r=current();if(r&&navigator.clipboard?.writeText)navigator.clipboard.writeText(r.reference).then(()=>toast('Reference copied.')).catch(()=>toast('Select and copy the reference.'));return;}
 if(e.target.closest('[data-si-crm]')){const r=current();if(!r)return;enquiryFilter=filter;enquiryPage=source==='legacy'?pageIndex:0;enquiryLoaded=false;enquiryError='';location.hash='#/enquiries';return;}
});
document.addEventListener('input',e=>{if(section!=='submission-center'||workspace!==owner||preview||e.target.id!=='si-search')return;search=e.target.value;if(source==='legacy'){if(!current()){selected='';actSeq++;activity=null;}updateList();}});
document.addEventListener('change',e=>{if(section!=='submission-center'||workspace!==owner||preview)return;if(e.target.id==='si-status'){filter=e.target.value;pageIndex=0;load();}if(e.target.id==='si-type'){type=e.target.value;if(!current()){selected='';actSeq++;activity=null;}updateList();}});
document.addEventListener('submit',e=>{if(e.target.id!=='si-filter')return;e.preventDefault();if(source==='structured'&&!busy){pageIndex=0;load();}});
window.VeloryzSubmissionCenter={page,creatorHint,fields,queryMatch};
})();
