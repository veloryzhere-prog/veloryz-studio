/* Client Rooms / R52.1.1 — private owner presentation, existing authenticated operations. */
(()=>{
'use strict';
const e=v=>E(v??'');
const pct=v=>Math.min(100,Math.max(0,Number(v)||0));
const text=(v,fallback='Not recorded')=>e(v||fallback);
const iconFor={overview:'grid',milestone:'work',file:'content',approval:'check',messages:'content',access:'lock'};
const action=(a,label,extra='',primary=false)=>'<button type="button" class="cr-button '+(primary?'cr-primary':'')+'" data-cpm="'+a+'" '+extra+'>'+label+'</button>';
const tab=(id,label)=>action('tab',label,'data-tab="'+id+'"');
const url=(route,label)=>'<a class="cr-button" href="#/'+route+'">'+label+'</a>';
const summaryUrl=p=>'/api/client-portal/admin/projects/'+encodeURIComponent(p.id)+'/summary';
const initials=name=>String(name||'?').trim().split(/\s+/).slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
function metrics(projects){
 return {total:projects.length,active:projects.filter(p=>['planning','in-progress','in-review'].includes(p.status)).length,review:projects.filter(p=>p.status==='in-review').length,launched:projects.filter(p=>p.status==='launched').length};
}
function counts(w){
 const items=Array.isArray(w?.items)?w.items:[],messages=Array.isArray(w?.messages)?w.messages:[];
 return {milestone:items.filter(i=>i.type==='milestone').length,complete:items.filter(i=>i.type==='milestone'&&i.state==='done').length,file:items.filter(i=>i.type==='file').length,approval:items.filter(i=>i.type==='approval').length,waiting:items.filter(i=>i.type==='approval'&&i.state==='waiting').length,messages:messages.length,unread:messages.filter(m=>m.sender==='client'&&!m.read_at).length};
}
function directoryRows(projects,selected,newProject){
 if(!projects.length)return '<div class="cr-empty-small"><strong>No matching workspaces</strong><p>Try a different search or status.</p>'+action('clear-search','Clear filters')+'</div>';
 return projects.map(p=>'<button type="button" class="cpm-client-row cr-directory-row '+(p.id===selected&&!newProject?'is-active':'')+'" data-cpm="select" data-id="'+e(p.id)+'" aria-current="'+(p.id===selected&&!newProject?'true':'false')+'"><span class="cr-avatar">'+e(initials(p.client_name))+'</span><span class="cr-directory-name"><strong>'+text(p.client_name,'Unnamed client')+'</strong><small>'+text(p.title,'Untitled project')+'</small><span class="cr-row-meta">'+cpBadge(p.status)+'<span>'+pct(p.progress)+'%</span></span></span></button>').join('');
}
function directory(){
 return '<aside class="cpm-directory cr-directory" aria-label="Client directory"><div class="cr-directory-head"><div><span class="cr-label">WORKSPACES</span><h2>Client directory</h2></div>'+action('reload',icon('history'),'aria-label="Refresh directory" title="Refresh directory"')+'</div><label class="cr-search">'+icon('search')+'<span class="sr-only">Search clients, email or project references</span><input id="cpm-search" type="search" placeholder="Find a workspace…" value="'+e(cpSearch)+'" autocomplete="off"></label><div class="cr-filter"><label><span class="sr-only">Filter by project status</span>'+cpSelect('filter',[['all','All projects'],...cpStatuses],cpFilter,'id="cpm-status-filter"')+'</label><span id="cpm-directory-count">'+cpMatches().length+' projects</span></div><div id="cpm-directory-results" class="cpm-client-list cr-directory-list" data-lenis-prevent>'+directoryRows(cpMatches(),cpSelected,cpNewProject)+'</div><div class="cr-directory-foot">'+action('new',icon('plus')+' New workspace','',true)+'<small>Up to 200 returned workspaces. Search covers this directory.</small></div></aside>';
}
function header(){
 const m=cpLoaded&&!cpError?metrics(cpProjects):null;
 return '<header class="cr-heading"><div><span class="cr-label">VELORYZ STUDIO / BUSINESS / CLIENT RELATIONSHIPS</span><h1>Client rooms<span>.</span></h1><p>Private relationships, project delivery and every next step.</p></div><div class="cr-header-actions">'+url('project-operations','Project operations '+icon('arrow'))+url('enquiries','Request inbox '+icon('arrow'))+action('new',icon('plus')+' New workspace','',true)+'</div></header><section class="cr-metrics" aria-label="Returned workspace summary">'+[['Returned workspaces','total'],['Active delivery','active'],['In review','review'],['Launched','launched']].map(([label,k])=>'<div><span>'+label+'</span><strong>'+(m?m[k]:'—')+'</strong></div>').join('')+'<div class="cr-connection"><span>Gmail configuration</span><strong>'+(cpDelivery.configured===true?'Configured':cpDelivery.configured===false?'Not configured':'Not verified')+'</strong><small>Configuration only</small></div></section>';
}
function tabs(w){
 const c=counts(w),items=[['overview','Overview',null],['milestone','Milestones',c.milestone],['file','Files',c.file],['approval','Approvals',c.waiting],['messages','Messages',c.unread],['access','Access & mail',null]];
 return '<nav class="cr-tabs" aria-label="Project sections" data-lenis-prevent>'+items.map(([id,label,n])=>'<button type="button" data-cpm="tab" data-tab="'+id+'" '+(cpTab===id?'aria-current="page"':'')+' class="'+(cpTab===id?'is-active':'')+'">'+icon(iconFor[id])+'<span>'+label+'</span>'+(n!==null?'<small>'+n+'</small>':'')+'</button>').join('')+'</nav>';
}
function hero(p){
 return '<section class="cr-project-heading"><div class="cr-project-top"><div><span class="cr-label">PRIVATE WORKSPACE / '+text(p.request_reference,'DIRECT PROJECT')+'</span><h2>'+text(p.title,'Untitled project')+'</h2><p>'+text(p.client_name,'Unnamed client')+'</p></div>'+action('edit-project',icon('edit')+' Edit details')+'</div><div class="cr-progress-card"><div><span class="cr-label">RECORDED COMPLETION</span><strong>'+pct(p.progress)+'<small>%</small></strong></div><div class="cr-progress-info">'+cpBadge(p.status)+'<span>'+text(p.phase,'Phase not set')+' · Target '+e(cpDate(p.due_date))+'</span></div><progress value="'+pct(p.progress)+'" max="100" aria-label="Recorded completion"></progress></div></section>';
}
function milestonePreview(w){
 const all=(w.items||[]).filter(x=>x.type==='milestone'),list=all.slice(0,5);
 return '<section class="cr-panel"><div class="cr-panel-head"><div><span class="cr-label">DELIVERY PLAN</span><h3>Milestones</h3></div>'+tab('milestone','View all '+icon('arrow'))+'</div>'+(list.length?'<ol class="cr-milestones">'+list.map((i,index)=>'<li><span class="cr-milestone-dot '+(i.state==='done'?'is-done':'')+'">'+(i.state==='done'?icon('check'):String(index+1).padStart(2,'0'))+'</span><div><strong>'+text(i.title,'Untitled milestone')+'</strong><small>'+text(cpStates.find(x=>x[0]===i.state)?.[1]||i.state)+'</small></div><time>'+e(cpDate(i.due_date))+'</time></li>').join('')+'</ol>':'<div class="cr-empty-small"><p>No milestones yet. Create the first milestone to define the delivery plan.</p>'+action('add-item','Add milestone','data-type="milestone"')+'</div>')+'</section>';
}
function overview(p,w){
 const c=counts(w);
 return '<div class="cr-panel cr-next"><div class="cr-panel-head"><div><span class="cr-label">NEXT CLIENT ACTION</span><h3>'+text(p.next_step,'No next action recorded')+'</h3></div></div><p>Keep the next step clear for your client.</p><div class="cr-mini-grid"><button data-cpm="tab" data-tab="milestone"><strong>'+c.complete+' / '+c.milestone+'</strong><span>Milestones done</span></button><button data-cpm="tab" data-tab="approval"><strong>'+c.waiting+'</strong><span>Awaiting approval</span></button><button data-cpm="tab" data-tab="file"><strong>'+c.file+'</strong><span>Deliverables</span></button><button data-cpm="tab" data-tab="messages"><strong>'+c.unread+'</strong><span>Unread messages</span></button></div></div>'+milestonePreview(w)+'<details class="cr-progress-editor" data-cr-edit><summary>Update project progress '+icon('edit')+'</summary>'+cpOverview(p)+'</details>';
}
function inspector(p,w){
 const c=counts(w);
 return '<aside class="cr-inspector" aria-label="Relationship inspector"><section class="cr-panel"><span class="cr-label">CLIENT PROFILE</span><div class="cr-person"><span class="cr-avatar">'+e(initials(p.client_name))+'</span><div><h3>'+text(p.client_name,'Unnamed client')+'</h3><a href="mailto:'+e(encodeURIComponent(String(p.client_email||'')))+'">'+text(p.client_email,'Email not recorded')+'</a></div></div><dl class="cr-facts"><dt>Project reference</dt><dd>'+text(p.request_reference,'Manually created')+'</dd><dt>Workspace ID</dt><dd class="cr-mono">'+text(p.id)+'</dd><dt>Target handover</dt><dd>'+e(cpDate(p.due_date))+'</dd><dt>Last updated</dt><dd>'+e(cpDate(p.updated_at))+'</dd></dl></section>'+(window.VeloryzRegistrationLinks?.panel(p)||'')+'<section class="cr-panel"><span class="cr-label">DOCUMENTS & ACCESS</span><h3>Client handoff</h3><p>Review the original order summary and issue access only when ready.</p>'+(p.request_reference?'<a class="cr-document" href="'+summaryUrl(p)+'" target="_blank" rel="noopener noreferrer">'+icon('content')+'<span>Project summary PDF<small>Original order details</small></span>'+icon('download')+'</a>':'<p class="cr-note">No linked request reference.</p>')+tab('access','Access & email controls '+icon('arrow'))+'<p class="cr-note">Sending remains owner-controlled. No automated invoice or onboarding email is enabled.</p></section><section class="cr-panel"><span class="cr-label">COMMUNICATION</span><h3>Private conversation</h3><p>'+c.messages+' messages · '+c.unread+' unread</p>'+tab('messages','Open conversation '+icon('arrow'))+'</section></aside>';
}
function access(p){
 const ready=cpDelivery.configured===true;
 return '<section class="cr-panel cr-access"><span class="cr-label">PRIVATE CLIENT HANDOFF</span><h3>Documents & invitations</h3><p>Confirm the recipient before sending. Summary and invitation are separate emails.</p><div class="cr-recipient"><span class="cr-label">RECIPIENT</span><strong>'+text(p.client_email)+'</strong></div><div class="cr-access-row"><div><h4>Project summary PDF</h4><p>The original order brief, not a final tax invoice.</p></div>'+(p.request_reference?'<a class="cr-button" target="_blank" rel="noopener noreferrer" href="'+summaryUrl(p)+'">'+icon('download')+' Preview PDF</a>':'')+action('send-summary','Send summary','',true)+'</div><div class="cr-access-row"><div><h4>Issue private invitation</h4><p>One-time code valid for 14 days. Reissuing revokes previous codes and sessions.</p></div>'+action('invite','Issue & send invitation','',true)+'</div><div class="cr-access-row"><div><h4>Automatic invoice & onboarding</h4><p>Planned. No automation or invoice generated by this interface.</p></div>'+url('project-operations','Automation blueprint '+icon('arrow'))+'</div></section><section class="cr-panel"><div class="cr-panel-head"><div><span class="cr-label">DELIVERY ACTIVITY</span><h3>Email history</h3></div>'+action('refresh-mail',icon('history')+' Refresh')+'</div><div data-cpm-email-audit>'+cpEmailAudit()+'</div></section><details class="cr-progress-editor"><summary>Gmail configuration and test</summary>'+cpDeliveryPill()+'</details>';
}
function detail(){
 if(cpEditMode==='project')return '<div class="cr-edit">'+cpEditor(cpNewProject?(cpNewDraft||{}):(cpWorkspace?.project||{}))+'</div>';
 if(cpEditMode==='item')return '<div class="cr-edit">'+cpItemEditor(cpEditingItem?(cpWorkspace?.items||[]).find(i=>i.id===cpEditingItem)||{}:{})+'</div>';
 const w=cpWorkspace,p=w?.project;
 if(!p||p.id!==cpSelected)return '<section class="cr-panel cr-empty"><h2>Select a workspace</h2><p>Choose a project from the directory or create a private workspace.</p></section>';
 const content=cpTab==='overview'?overview(p,w):cpTab==='access'?access(p):cpTab==='messages'?cpMessages():cpItems(cpTab);
 return '<div class="cr-room"><div class="cr-main">'+hero(p)+tabs(w)+'<div class="cr-tab-content">'+content+'</div></div>'+inspector(p,w)+'</div>';
}
function page(){
 return '<div class="cpm-shell cr-shell">'+header()+(preview?'<p class="cr-panel">Local preview. Private client data is not fetched.</p>':cpError?'<section class="cr-panel" role="alert"><h2>Client directory unavailable</h2><p>'+e(cpError)+'</p><p>Existing workspaces have not been deleted.</p>'+action('reload','Retry loading')+'</section>':!cpLoaded?'<section class="cr-panel cr-empty" role="status">Opening private client directory…</section>':'<div class="cr-layout">'+directory()+'<section id="cpm-detail" class="cpm-detail cr-detail" aria-label="Selected client workspace">'+detail()+'</section></div>')+'</div>';
}
window.VeloryzClientRooms={page,detail,directoryRows,metrics,counts};
})();
