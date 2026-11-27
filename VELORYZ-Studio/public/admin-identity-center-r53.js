/* R52.3.5 — private identity and onboarding console. */
(()=>{
'use strict';
const e=v=>E(v??''),route='client-identities',base='/api/admin/client-identities';
let owner=null,seq=0,busy=false,loaded=false,error='',rows=[],total=null,pageIndex=0,q='',selected='',projectPage=0,detail=null;
function reset(){if(owner===workspace)return;owner=workspace;seq++;busy=false;loaded=false;error='';rows=[];total=null;pageIndex=0;q='';selected='';projectPage=0;detail=null;}
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
 }catch(err){if(still(s,o)){error='Identity service unavailable or not enabled. '+String(err.message||'');rows=[];total=null;loaded=false;}}
 finally{if(s===seq&&o===workspace){busy=false;refresh();}}
}
const current=()=>rows.find(r=>r.id===selected);
function projectMarkup(){
 if(!detail)return '<section class="si-panel"><h2>Select a client identity</h2><p>Inspect verification status, permanent identifiers and associated projects.</p></section>';
 const r=current(),projects=Array.isArray(detail.projects)?detail.projects:[];
 return '<section class="si-panel"><span class="si-kicker">PERMANENT CLIENT PROFILE</span><h2>'+e(r?.name_at_registration||'Client profile')+'</h2><dl class="si-facts">'+fact('Client code',r?.client_code)+fact('Registered recipient',r?.email_at_registration)+fact('Email possession',r?.identity_status==='verified'?'Verified':'Not verified')+fact('Verified at',r?.verified_at)+fact('Linked identities',detail.member_count)+fact('Projects in group',detail.project_total)+'</dl><div class="si-actions">'+button('data-id-issue','Prepare verification email ↗',busy||!r||r.identity_status!=='unverified',true)+button('data-id-group','Link verified identity',busy||!r||r.identity_status!=='verified'||r.primary_id!==r.id)+'</div><p class="si-note">Grouping preserves permanent IDs and original project relationships. No login access is shared across rooms.</p></section><section class="si-panel"><span class="si-kicker">PROJECT LIFECYCLE</span><h3>Associated workspaces</h3>'+projects.map((p,i)=>'<div class="si-panel"><span class="si-kicker">'+e(labels[p.lifecycle]||'Unknown')+'</span><h3>'+e(p.title||'Registered project')+'</h3><dl class="si-facts">'+fact('Permanent project code',p.project_code)+fact('Request reference',p.reference)+fact('Delivery status',p.delivery_status)+fact('Registered',p.created_at)+'</dl>'+(p.lifecycle==='accepted'?button('data-id-room="'+i+'"','Open verified Client Room ↗',busy):'<p class="si-note">No active delivery room confirmed. Review the original request in Submission Intelligence.</p>')+'</div>').join('')+(!projects.length?'<p>No associated workspaces returned.</p>':'')+'<div class="si-pages">'+button('data-id-project-page="-1"','← Previous projects',busy||projectPage===0)+button('data-id-project-page="1"','More projects →',busy||(projectPage+1)*25>=detail.project_total)+'</div></section>';
}
function markup(){return '<div id="identity-r53" class="si-root"><header class="si-heading"><div><span class="si-kicker">VELORYZ / BUSINESS / ONBOARDING</span><h1>Client identities.</h1><p>Permanent identifiers, verified recipients and connected project workspaces.</p></div><div class="si-actions"><a class="si-button" href="#/submission-center">Submission intelligence ↗</a><a class="si-button" href="#/client-portal">Client rooms ↗</a>'+button('data-id-refresh','Refresh',busy||preview)+'</div></header><p class="si-notice">Verification email is owner-delivered. Automatic documents, invitations and email delivery are not enabled. An accepted delivery room is separate from a pending onboarding record.</p><div class="si-metrics"><div><span>Matching identities</span><strong>'+e(total??'—')+'</strong></div><div><span>Verified on this page</span><strong>'+(loaded?rows.filter(r=>r.identity_status==='verified').length:'—')+'</strong></div><div><span>Projects in selected group</span><strong>'+e(detail?.project_total??'—')+'</strong></div></div><form id="identity-r53-search" class="si-filter"><label>Search all identities<input id="id-q" type="search" maxlength="120" value="'+e(q)+'" placeholder="Client ID, name or email"></label><button class="si-button si-primary" type="submit" '+(busy||preview?'disabled':'')+'>Search</button></form><div class="si-layout"><aside class="si-directory">'+(preview?'<p class="si-empty">Preview: no private records fetched.</p>':busy?'<p class="si-empty" role="status">Loading private identities…</p>':error?'<p class="si-empty" role="alert">'+e(error)+'</p>':rows.map(r=>'<button class="si-row '+(selected===r.id?'is-selected':'')+'" type="button" data-id-select="'+e(r.id)+'"><span class="si-avatar">'+e(String(r.name_at_registration||'?').slice(0,2).toUpperCase())+'</span><span class="si-row-text"><strong>'+e(r.name_at_registration)+'</strong><span>'+e(r.email_at_registration)+'</span><small>'+e(r.client_code)+'</small></span><span class="si-status">'+e(r.identity_status)+'</span></button>').join('')||'<p class="si-empty">No matching identities.</p>')+'<div class="si-pages">'+button('data-id-page="-1"','← Previous',busy||pageIndex===0)+button('data-id-page="1"','Next →',busy||total===null||(pageIndex+1)*25>=total)+'</div></aside><section class="si-detail">'+(busy?'<p role="status">Loading…</p>':projectMarkup())+'</section></div></div>';}
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
function page(){reset();if(!preview&&!loaded&&!busy&&!error)queueMicrotask(()=>{if(section===route&&owner===workspace&&!busy&&!loaded&&!error)load();});return markup();}
document.addEventListener('submit',ev=>{if(ev.target.id!=='identity-r53-search'||section!==route||preview||busy)return;ev.preventDefault();q=document.getElementById('id-q').value.trim();pageIndex=0;selected='';projectPage=0;load();});
document.addEventListener('click',ev=>{if(section!==route||owner!==workspace||preview||busy)return;const b=ev.target.closest('[data-id-select],[data-id-refresh],[data-id-page],[data-id-project-page],[data-id-issue],[data-id-group],[data-id-room]');if(!b)return;
 if(b.hasAttribute('data-id-select')){selected=b.dataset.idSelect;projectPage=0;load();}else if(b.hasAttribute('data-id-refresh'))load();else if(b.hasAttribute('data-id-page')){pageIndex=Math.max(0,pageIndex+Number(b.dataset.idPage));selected='';projectPage=0;load();}else if(b.hasAttribute('data-id-project-page')){projectPage=Math.max(0,projectPage+Number(b.dataset.idProjectPage));load();}else if(b.hasAttribute('data-id-issue'))issue();else if(b.hasAttribute('data-id-group'))group();else if(b.hasAttribute('data-id-room')){const p=detail?.projects?.[Number(b.dataset.idRoom)];if(p?.lifecycle==='accepted')window.VeloryzRegistrationLinks?.openRoom({reference:p.reference,accepted_project_id:p.delivery_project_id},true);}
});
window.VeloryzIdentityCenter={page};
})();