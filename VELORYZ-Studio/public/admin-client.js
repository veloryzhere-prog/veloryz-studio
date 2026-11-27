'use strict';
// VELORYZ / Client Management. Private data is loaded only from the owner API.
let cpProjects=[],cpWorkspace=null,cpSelected='',cpLoaded=false,cpLoading=false,cpError='';
let cpSearch='',cpFilter='all',cpTab='overview',cpEditMode='',cpEditingItem='',cpItemType='milestone';
let cpNewDraft=null,cpNewProject=false,cpBusy=false,cpSequence=0;
let cpDelivery={configured:null,provider:'Gmail SMTP · TLS 465'},cpDeliveryLoaded=false,cpDeliveryError='',cpEmailEvents=[],cpMailAuditState='idle';
const cpReq=async(path,options={})=>{try{return await api('/api/client-portal/admin'+path,options);}catch(error){if(error.status===503)throw Object.assign(new Error('The Client Portal service is unavailable (HTTP 503). The project records have not been deleted. Please retry after backend recovery.'),{status:503});if(error.status===401||error.status===403)throw Object.assign(new Error('Your Studio owner session is not authorized for Client Management. Sign in again or check the owner connection.'),{status:error.status});throw error;}};
const cpE=v=>E(v??'');
const cpStatuses=[['planning','Planning'],['in-progress','In progress'],['in-review','In review'],['on-hold','On hold'],['launched','Launched']];
const cpPhases=['Discover','Define','Design','Develop','Review','Launch'];
const cpStates=[['upcoming','Upcoming'],['in-progress','In progress'],['done','Completed'],['waiting','Awaiting approval'],['approved','Approved'],['changes','Changes requested']];
const cpKinds={milestone:'Milestone',file:'Deliverable',approval:'Approval'};
function cpDate(value){if(!value)return 'Not set';const d=new Date(String(value).length===10?value+'T12:00:00':value);return Number.isNaN(d.getTime())?'Not set':d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
function cpOption(v,label,current){return '<option value="'+cpE(v)+'" '+(String(v)===String(current)?'selected':'')+'>'+cpE(label)+'</option>';}
function cpSelect(name,choices,current,extra=''){return '<select name="'+name+'" '+extra+'>'+choices.map(x=>cpOption(Array.isArray(x)?x[0]:x,Array.isArray(x)?x[1]:x,current)).join('')+'</select>';}
function cpInput(label,name,value='',extra='',help=''){return '<label class="cpm-field"><span>'+cpE(label)+'</span><input name="'+name+'" value="'+cpE(value)+'" '+extra+'>'+(help?'<small>'+cpE(help)+'</small>':'')+'</label>';}
function cpArea(label,name,value='',max=1200,help=''){return '<label class="cpm-field cpm-wide"><span>'+cpE(label)+'</span><textarea name="'+name+'" maxlength="'+max+'" rows="3">'+cpE(value)+'</textarea>'+(help?'<small>'+cpE(help)+'</small>':'')+'</label>';}
function cpStateLabel(status){return cpStatuses.find(x=>x[0]===status)?.[1]||String(status||'Planning');}
function cpBadge(status){return '<span class="cpm-badge cpm-status-'+cpE(status||'planning')+'"><i></i>'+cpE(cpStateLabel(status))+'</span>';}
function cpAvatar(name){return '<span class="cpm-avatar" aria-hidden="true">'+cpE(String(name||'?').split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase())+'</span>';}
function cpMatches(){
 const q=cpSearch.toLowerCase().trim();
 return cpProjects.filter(p=>(cpFilter==='all'||p.status===cpFilter)&&(!q||[p.title,p.client_name,p.client_email,p.phase,p.status].some(v=>String(v||'').toLowerCase().includes(q))));
}
function cpDirectoryCards(){
 const projects=cpMatches();
 if(!projects.length)return '<div class="cpm-empty-directory"><strong>No clients found</strong><p>Try a different search or status, or create your first client workspace.</p><button type="button" class="cpm-mini-link" data-cpm="clear-search">Clear filters</button></div>';
 return projects.map(p=>'<button type="button" class="cpm-client-row '+(cpSelected===p.id&&!cpNewProject?'is-active':'')+'" data-cpm="select" data-id="'+cpE(p.id)+'" aria-current="'+(cpSelected===p.id&&!cpNewProject?'true':'false')+'">'+cpAvatar(p.client_name)+'<span class="cpm-client-info"><strong>'+cpE(p.client_name)+'</strong><small>'+cpE(p.title)+'</small><span>'+cpBadge(p.status)+'<i>'+cpE(Number(p.progress||0))+'%</i></span></span><span class="cpm-row-arrow">›</span></button>').join('');
}
function cpSummaryNumbers(){
 const active=cpProjects.filter(p=>!['launched','on-hold'].includes(p.status)).length;
 const launched=cpProjects.filter(p=>p.status==='launched').length;
 const onHold=cpProjects.filter(p=>p.status==='on-hold').length;
 return '<div class="cpm-metrics">'+
 '<div class="cpm-metric"><span>All clients</span><strong>'+cpProjects.length+'</strong><small>Private workspaces</small></div>'+
 '<div class="cpm-metric"><span>Active projects</span><strong>'+active+'</strong><small>Planning or in progress</small></div>'+
 '<div class="cpm-metric"><span>Launched</span><strong>'+launched+'</strong><small>Completed workspaces</small></div>'+
 '<div class="cpm-metric"><span>On hold</span><strong>'+onHold+'</strong><small>Awaiting a restart</small></div></div>';
}
function cpDeliveryPill(){
 const verified=cpDelivery.configured===true,missing=cpDelivery.configured===false,unknown=!verified&&!missing;
 const heading=verified?'Gmail App Password detected by the running backend':
  missing?'Active Client Portal reports no Gmail credential':'Could not verify Gmail configuration';
 const detail=verified?'The deployed Supabase function sees the private Gmail secret. This does not verify SMTP connectivity or inbox delivery; use the owner-only test below.':
  missing?'The active function does not see VELORYZ_GMAIL_APP_PASSWORD. Verify the exact secret name and project in Supabase, then refresh this page.':
  'The status request failed, so we cannot tell whether Gmail is configured. '+(cpDeliveryError?'Reason: '+cpDeliveryError:'Retry after the client backend is available.');
 return '<section class="cpm-email-status '+(verified?'is-ready':unknown?'is-warning':'is-manual')+'" aria-live="polite">'+
 '<span class="cpm-email-dot"></span><div><strong>'+cpE(heading)+'</strong><small>'+cpE(detail)+'</small>'+
 '<div class="cpm-mail-setup-actions"><button type="button" class="admin-button secondary" data-cpm="refresh-mail">Recheck Gmail status ↻</button>'+
 '<button type="button" class="admin-button secondary" data-cpm="test-email" '+(missing?'disabled title="Gmail credential must be available to the running backend"':'')+'>Send test email to studio mailbox ↗</button></div>'+
 '<details><summary>How sender verification works</summary><p>VELORYZ sends from veloryz.here@gmail.com through encrypted Gmail SMTP. Supabase must expose <code>VELORYZ_GMAIL_APP_PASSWORD</code> to the deployed <code>veloryz-client-portal-api</code> function. The setup is checked by the backend, not inferred from failed network requests. The test email is sent only after you choose the button and does not alter any client project.</p></details></div></section>';
}
function cpEditor(p={}){
 const edit=!!p.id&&!cpNewProject;
 return '<section class="cpm-card cpm-edit-card"><div class="cpm-card-head"><div><span class="cpm-eyebrow">'+(edit?'EDIT CLIENT WORKSPACE':'NEW CLIENT WORKSPACE')+'</span><h2>'+(edit?'Update project details':'Start a new client project')+'</h2><p>'+(cpNewDraft?'These details are prefilled from the client enquiry. Verify the email before creating access.':'Add the essentials first. You can refine progress and milestones later.')+'</p></div><button class="admin-button secondary" data-cpm="cancel">Cancel</button></div>'+
 '<form data-cpm-form="project" class="cpm-form-grid"><div class="cpm-form-group cpm-wide"><span class="cpm-form-section">01 / CLIENT DETAILS</span></div>'+
 cpInput('Client name *','client_name',p.client_name,'required maxlength="100" autocomplete="name"')+
 cpInput('Invitation email *','client_email',p.client_email,'required type="email" maxlength="180" autocomplete="email"','Changing this email revokes earlier invitations and signs out existing client sessions.')+
 '<div class="cpm-form-group cpm-wide"><span class="cpm-form-section">02 / PROJECT DETAILS</span></div>'+
 cpInput('Project title *','title',p.title,'required maxlength="160"')+
 '<label class="cpm-field"><span>Current phase</span>'+cpSelect('phase',cpPhases,p.phase||'Discover')+'</label>'+
 cpArea('What are we building?','summary',p.summary,1700)+
 '<details class="cpm-advanced cpm-wide" '+(edit?'open':'')+'><summary>More project settings <span>Due date, status and completion</span></summary><div class="cpm-form-grid">'+
 '<label class="cpm-field"><span>Project status</span>'+cpSelect('status',cpStatuses,p.status||'planning')+'</label>'+
 cpInput('Completion · 0–100%','progress',p.progress??0,'required type="number" min="0" max="100"')+
 cpInput('Target handover','due_date',p.due_date,'type="date"')+
 cpArea('What should happen next?','next_step',p.next_step,1200)+'</div></details>'+
 '<div class="cpm-form-actions cpm-wide"><button class="admin-button" type="submit">'+(edit?'Save project details':'Create private workspace')+' ↗</button><button type="button" class="admin-button secondary" data-cpm="cancel">Cancel</button><span>Client invitations are issued separately, only when you choose.</span></div></form></section>';
}
function cpItemEditor(item={}){
 const isEdit=!!item.id;
 const type=isEdit?item.type:cpItemType;
 const label=cpKinds[type]||'Project item';
 const statusChoices=type==='approval'?cpStates.filter(s=>['waiting','approved','changes'].includes(s[0])):cpStates.filter(s=>['upcoming','in-progress','done'].includes(s[0]));
 const defaults={approval:'waiting',file:'upcoming',milestone:'upcoming'};
 return '<section class="cpm-card cpm-edit-card"><div class="cpm-card-head"><div><span class="cpm-eyebrow">'+(isEdit?'EDIT '+label.toUpperCase():'ADD '+label.toUpperCase())+'</span><h2>'+(isEdit?'Refine this item.':'One more step, clearly tracked.')+'</h2><p>Updates are saved privately and appear in this client’s portal after refresh.</p></div><button class="admin-button secondary" data-cpm="cancel">Back</button></div>'+
 '<form data-cpm-form="item" class="cpm-form-grid">'+
 cpInput(label+' title *','title',item.title,'required maxlength="160"')+
 '<label class="cpm-field"><span>Status</span>'+cpSelect('state',statusChoices,item.state||defaults[type])+'</label>'+
 cpArea(type==='approval'?'What should the client review?':type==='file'?'File description':'Milestone details','details',item.details,1400)+
 cpInput(type==='file'?'Shared date (optional)':'Due date (optional)','due_date',item.due_date,'type="date"')+
 (type==='file'?cpInput('File link · HTTPS','url',item.url,'type="url" maxlength="1500" placeholder="https://…"','Use a link with suitable access permissions; files are hosted on the provider you choose.'):
 '<input type="hidden" name="url" value="'+cpE(item.url||'')+'">')+
 '<div class="cpm-form-actions cpm-wide"><button class="admin-button" type="submit">'+(isEdit?'Save item':'Add '+label.toLowerCase())+' ↗</button><button type="button" class="admin-button secondary" data-cpm="cancel">Back to project</button></div></form></section>';
}
function cpClientTabs(){
 const items=cpWorkspace?.items||[];
 const reviewCount=items.filter(x=>x.type==='approval'&&x.state==='waiting').length;
 const tabs=[['overview','Overview',''],['milestone','Milestones',items.filter(i=>i.type==='milestone').length],['file','Deliverables',items.filter(i=>i.type==='file').length],['approval','Approvals',reviewCount],['messages','Messages',(cpWorkspace?.messages||[]).filter(m=>m.sender==='client'&&!m.read_at).length]];
 return '<nav class="cpm-detail-tabs" aria-label="Client management sections">'+tabs.map(([id,label,count])=>'<button type="button" data-cpm="tab" data-tab="'+id+'" class="'+(cpTab===id?'is-active':'')+'" '+(cpTab===id?'aria-current="page"':'')+'>'+label+(count!==''?'<span>'+count+'</span>':'')+'</button>').join('')+'</nav>';
}
function cpActionButton(label,action,extra=''){return '<button type="button" class="admin-button secondary" data-cpm="'+action+'" '+extra+'>'+label+'</button>';}
function cpOverview(p){
 const items=cpWorkspace.items||[],messages=cpWorkspace.messages||[];
 const review=items.filter(x=>x.type==='approval'&&x.state==='waiting').length;
 const counts={milestone:items.filter(x=>x.type==='milestone').length,file:items.filter(x=>x.type==='file').length,approval:items.filter(x=>x.type==='approval').length};
 return '<div class="cpm-overview-grid"><section class="cpm-card"><div class="cpm-card-head"><div><span class="cpm-eyebrow">QUICK PROJECT UPDATE</span><h3>Keep progress current</h3><p>Change the essentials and save in one click.</p></div></div>'+
 '<form data-cpm-form="quick" class="cpm-quick-form"><div class="cpm-quick-row"><label>Current phase'+cpSelect('phase',cpPhases,p.phase)+'</label><label>Status'+cpSelect('status',cpStatuses,p.status)+'</label></div>'+
 '<label class="cpm-progress-label" for="cpm-progress-slider">Completion <output data-cpm-progress-output>'+Number(p.progress||0)+'%</output></label>'+
 '<input id="cpm-progress-slider" type="range" name="progress" min="0" max="100" step="1" value="'+Number(p.progress||0)+'" data-cpm-progress>'+
 '<div class="cpm-progress-scale"><span>0% / Started</span><span>100% / Finished</span></div>'+
 '<label class="cpm-quick-note">Next action for the client<textarea name="next_step" maxlength="1200" rows="3" placeholder="What should happen next?">'+cpE(p.next_step)+'</textarea></label>'+
 '<div class="cpm-quick-footer"><button class="admin-button" type="submit">Save progress ↗</button><small>Private project updates save immediately.</small></div></form></section>'+
 '<section class="cpm-card cpm-next-card"><span class="cpm-eyebrow">WHAT TO DO NEXT</span>'+
 '<div class="cpm-checkline '+(counts.milestone?'done':'')+'"><span>'+ (counts.milestone?'✓':'1')+'</span><div><strong>Add your project plan</strong><small>'+ (counts.milestone?counts.milestone+' milestones created':'Outline the stages the client will follow')+'</small></div><button type="button" data-cpm="add-item" data-type="milestone">+ Add</button></div>'+
 '<div class="cpm-checkline '+(counts.file?'done':'')+'"><span>'+(counts.file?'✓':'2')+'</span><div><strong>Share deliverables</strong><small>'+(counts.file?counts.file+' deliverables in workspace':'Publish links when files are ready')+'</small></div><button type="button" data-cpm="add-item" data-type="file">+ Add</button></div>'+
 '<div class="cpm-checkline '+(counts.approval?'done':'')+'"><span>'+(counts.approval?'✓':'3')+'</span><div><strong>Request a review</strong><small>'+(review?review+' awaiting client feedback':'Ask your client to approve the work')+'</small></div><button type="button" data-cpm="add-item" data-type="approval">+ Add</button></div>'+
 '<div class="cpm-checkline '+(messages.length?'done':'')+'"><span>'+(messages.length?'✓':'4')+'</span><div><strong>Start the conversation</strong><small>'+(messages.length?messages.length+' messages so far':'Send the first project update')+'</small></div><button type="button" data-cpm="tab" data-tab="messages">Open ↗</button></div></section></div>'+
 '<section class="cpm-card cpm-project-note"><div><span class="cpm-eyebrow">THE PROJECT BRIEF</span><h3>What we are creating</h3><p>'+cpE(p.summary||'No project description yet. Use Edit details to complete the brief.')+'</p></div><div><span class="cpm-eyebrow">TARGET DELIVERY</span><strong>'+cpDate(p.due_date)+'</strong><span class="cpm-eyebrow">LAST UPDATED</span><strong>'+cpDate(p.updated_at)+'</strong></div></section>';
}
function cpItems(type){
 const items=(cpWorkspace?.items||[]).filter(x=>x.type===type);
 const name=type==='milestone'?'milestone':type==='file'?'deliverable':'approval request';
 return '<section class="cpm-card"><div class="cpm-card-head"><div><span class="cpm-eyebrow">'+cpE(name.toUpperCase())+'S</span><h3>'+cpE(type==='milestone'?'Project milestones':type==='file'?'Shared deliverables':'Review requests')+'</h3><p>'+cpE(type==='milestone'?'Plan the work in clear stages.':type==='file'?'Upload protected project files or add external handover links.':'Give your client one clear decision at a time.')+'</p></div><div class="cpm-item-head-actions"><button type="button" class="admin-button" data-cpm="add-item" data-type="'+type+'">+ Add '+cpE(name)+'</button>'+(type==='milestone'?'<button type="button" class="admin-button secondary" data-cpm="starter-plan">Use starter plan</button>':'')+'</div></div>'+
 (type==='file'?'<form class="cpm-r50-upload" data-cpm-form="private-file"><h4>Upload a private deliverable</h4><p>PDF, PNG, JPEG or TXT · up to 2 MB. Only this project’s signed-in client and the owner can download it.</p><label>Title <input name="title" required maxlength="160"></label><label>Description <input name="details" maxlength="1400"></label><label>File <input name="file" type="file" required accept=".pdf,.png,.jpg,.jpeg,.txt"></label><button type="submit" class="admin-button">Upload privately ↗</button></form>':'')+
 (items.length?'<div class="cpm-item-list">'+items.map(i=>'<article class="cpm-item"><span class="cpm-item-mark '+(i.state==='done'||i.state==='approved'?'done':'')+'">'+(i.state==='done'||i.state==='approved'?'✓':type==='file'?'↗':type==='approval'?'◇':'◌')+'</span><div class="cpm-item-main"><div><strong>'+cpE(i.title)+'</strong><span class="cpm-item-state cpm-item-'+cpE(i.state)+'">'+cpE(cpStates.find(s=>s[0]===i.state)?.[1]||i.state)+'</span></div><p>'+cpE(i.details||'No notes added.')+'</p><small>'+(i.due_date?'Date: '+cpDate(i.due_date):'Date not set')+'</small>'+(type==='file'&&i.url?'<a href="'+cpE(/^https:\/\/veloryz\.online\/api\/client-portal\/files\/[0-9a-f-]{36}$/i.test(i.url)?'/api/client-portal/admin/files/'+encodeURIComponent(i.id)+'?project_id='+encodeURIComponent(cpSelected):i.url)+'" target="_blank" rel="noopener noreferrer">Open shared file ↗</a>':'')+'</div><div class="cpm-item-actions">'+(type==='milestone'&&i.state!=='done'?'<button type="button" class="cpm-advance" data-cpm="advance-item" data-id="'+cpE(i.id)+'">'+(i.state==='upcoming'?'Start':'✓ Complete')+'</button>':'')+'<button type="button" data-cpm="edit-item" data-id="'+cpE(i.id)+'">Edit</button><button type="button" class="is-danger" data-cpm="remove-item" data-id="'+cpE(i.id)+'">Remove</button></div></article>').join('')+'</div>':
 '<div class="cpm-tab-empty"><span>✳</span><h4>No '+cpE(name)+'s yet.</h4><p>Start by adding your first '+cpE(name)+'. Your client will see it in their portal.</p><button class="admin-button secondary" type="button" data-cpm="add-item" data-type="'+type+'">+ Add now</button></div>')+'</section>';
}

function cpEmailAudit(){
 const events=cpEmailEvents||[];
 return '<section class="cpm-mail-history"><div class="cpm-mail-header"><strong>Automatic email activity</strong><span>GMAIL / PRIVATE OWNER LOG</span></div>'+
 (cpMailAuditState==='loading'?'<p role="status">Loading delivery history…</p>':cpMailAuditState==='error'?'<p role="alert">Delivery history unavailable. Refresh the workspace to retry.</p>':cpMailAuditState!=='ready'?'<p>Delivery history has not been checked.</p>':events.length?events.slice(0,15).map(e=>'<div class="cpm-mail-event"><span class="cpm-mail-state '+(e.state==='sent'?'is-sent':'is-pending')+'">'+cpE(e.state==='sent'?'Accepted by Gmail':e.state==='not-configured'?'Not configured':e.state==='failed'?'Failed':e.state)+'</span>'+
 '<div><strong>'+cpE((e.kind||'').replaceAll('-',' '))+'</strong><small>'+cpE(e.recipient)+' · '+cpDate(e.created_at)+'</small>'+(e.error_label?'<p>'+cpE(e.error_label)+'</p>':'')+'</div></div>').join(''):
 '<p class="cpm-mail-empty">No automated emails recorded yet. Invitation and chat notifications will appear here with their provider delivery status.</p>')+'</section>';
}

function cpMessages(){
 const messages=cpWorkspace?.messages||[];
 return '<section class="cpm-card cpm-message-card"><div class="cpm-card-head"><div><span class="cpm-eyebrow">PRIVATE CONVERSATION</span><h3>Client messages</h3><p>Write directly to your client. All messages stay with this project.</p></div><span class="cpm-conversation-count">'+messages.length+' messages</span></div>'+
 '<div class="cpm-conversation" role="log" aria-label="Client conversation">'+(messages.length?messages.slice(-75).map(m=>'<div class="cpm-message '+(m.sender==='studio'?'from-studio':'from-client')+'"><div><b>'+(m.sender==='studio'?'VELORYZ STUDIO':'CLIENT')+'</b><time>'+cpDate(m.created_at)+'</time></div><p>'+cpE(m.body).replace(/\n/g,'<br>')+'</p><small class="cpm-receipt">'+(m.read_at?'Seen by '+(m.sender==='studio'?'client':'studio'):'Sent · not marked read')+'</small></div>').join(''):'<div class="cpm-tab-empty"><span>↗</span><h4>Start the conversation.</h4><p>Write a welcome note or share the next project step.</p></div>')+'</div>'+
 '<div class="cpm-reply-templates" aria-label="Quick project message starters"><button data-cpm-template="update" type="button">Progress update</button><button data-cpm-template="review" type="button">Request feedback</button><button data-cpm-template="handover" type="button">Handover note</button></div><form data-cpm-form="message" class="cpm-message-form"><label for="cpm-message-text">New message to your client</label><textarea id="cpm-message-text" name="body" required maxlength="2000" minlength="2" rows="4" placeholder="Share an update, ask a question or leave a useful note…"></textarea><div><small>Messages save directly in this private thread. Gmail sends a notification if configured; message contents stay in the portal.</small><button class="admin-button" type="submit">Send message ↗</button></div></form></section>';
}
function cpDetail(){
 if(cpEditMode==='project')return cpEditor(cpNewProject?(cpNewDraft||{}):(cpWorkspace?.project||{}));
 if(cpEditMode==='item')return cpItemEditor(cpEditingItem?(cpWorkspace?.items||[]).find(i=>i.id===cpEditingItem)||{}:{});
 const p=cpWorkspace?.project;
 if(!p)return '<section class="cpm-card cpm-tab-empty"><span>⌁</span><h3>Select a client</h3><p>Choose a workspace on the left to manage its progress, files and invitations.</p></section>';
 return '<div class="cpm-project-hero"><div class="cpm-project-top"><div>'+cpAvatar(p.client_name)+'<div class="cpm-project-id"><span class="cpm-eyebrow">CLIENT WORKSPACE</span><h2>'+cpE(p.title)+'</h2><p>'+cpE(p.client_name)+' <span aria-hidden="true">·</span> <a href="mailto:'+cpE(p.client_email)+'">'+cpE(p.client_email)+'</a></p></div></div><div class="cpm-project-buttons"><button type="button" class="admin-button cpm-send-summary" data-cpm="send-summary">✉ Send Project Summary + PDF</button><button type="button" class="admin-button secondary cpm-send-invitation" data-cpm="invite">Send Client Invitation ↗</button><button type="button" class="admin-button secondary" data-cpm="edit-project">Edit details</button></div></div>'+
 '<div class="cpm-project-stats"><div>'+cpBadge(p.status)+'</div><span><b>'+cpE(p.phase)+'</b> Current phase</span><span><b>'+Number(p.progress||0)+'%</b> Progress</span><span><b>'+cpDate(p.due_date)+'</b> Target handover</span></div><div class="cpm-project-track" aria-label="Project completion"><i style="width:'+Math.max(0,Math.min(100,Number(p.progress)||0))+'%"></i></div></div>'+
 '<div class="cpm-invite-help">✉ <strong>Owner-controlled delivery:</strong> Accepting a request prepares the project and PDF, but sends nothing. Click <strong>Send Project Summary + PDF</strong> to email the full order, then separately <strong>Send Client Invitation</strong> to create and email the access code. Reissuing a code signs out previous portal sessions. '+(cpDelivery.configured?'Gmail credentials are configured.':'Gmail is not configured. The secure manual invitation handoff is still available.')+'</div>'+(p.request_reference?'<section class="cpm-reference-panel"><span>LINKED PROJECT REQUEST</span><strong>'+cpE(p.request_reference)+'</strong><p>Accepted '+cpE(cpDate(p.accepted_at))+' · Your original submitted brief remains preserved on this project.</p><a class="admin-button secondary" href="/api/client-portal/admin/projects/'+encodeURIComponent(p.id)+'/summary" target="_blank" rel="noopener">Download full project PDF ↓</a></section>':'')+'<div data-cpm-email-audit>'+cpEmailAudit()+'</div>'+
 cpClientTabs()+
 '<div class="cpm-tab-content">'+(cpTab==='overview'?cpOverview(p):cpTab==='messages'?cpMessages():cpItems(cpTab))+'</div>';
}
function clientPortalAdmin(){
 return '<div class="cpm-shell">'+(window.VeloryzClientOperations?.clientHeader()||heading('Private workspace / Client management','Manage your clients','Find a client, make an update and send an invitation—everything in one organized place. Changes here save directly to the private portal.','<div class="cpm-heading-actions"><a href="#/enquiries" class="admin-button secondary">Project requests ↗</a><button type="button" class="admin-button" data-cpm="new">+ New client</button></div>'))+
 (cpError?'<section class="cpm-error" role="alert"><strong>Client directory connection failed — project count not verified.</strong><p>'+cpE(cpError)+'</p><p>Your existing client workspaces are not deleted. Reload after the backend has recovered.</p><button class="admin-button secondary" data-cpm="reload">Retry loading clients ↻</button><a class="admin-button secondary" href="#/enquiries">Open project requests ↗</a></section>':!cpLoaded?'<div class="cpm-loading" role="status">Opening your client directory…</div>':
 cpSummaryNumbers()+(window.VeloryzCRM?.clientSwitcher(cpProjects)||'')+cpDeliveryPill()+
 '<details class="cpm-how-it-works"><summary>How client invitations work <span>3 easy steps</span></summary><div><p><strong>1.</strong> Create a project or import a project request from the enquiry inbox.</p><p><strong>2.</strong> Add milestones and deliverables, then select <em>Issue invitation</em>.</p><p><strong>3.</strong> The unique code is valid once, expires in 14 days and opens only that client workspace.</p></div></details>'+
 '<div class="cpm-layout '+(window.VeloryzCRM?.clientMode()==='board'?'os-crm-directory-hidden':'')+'"><aside class="cpm-directory"><div class="cpm-directory-head"><div><strong>Client directory</strong><small id="cpm-directory-count">'+cpMatches().length+' projects</small></div><button data-cpm="reload" class="cpm-refresh" title="Refresh clients" aria-label="Refresh clients">↻</button></div>'+
 '<label class="cpm-search"><span class="sr-only">Search clients</span><input id="cpm-search" type="search" placeholder="Search clients or projects…" value="'+cpE(cpSearch)+'" autocomplete="off"></label>'+
 '<label class="cpm-filter"><span>Status</span>'+cpSelect('filter',[['all','All projects'],...cpStatuses],cpFilter,'id="cpm-status-filter"')+'</label>'+
 '<div id="cpm-directory-results" class="cpm-client-list">'+cpDirectoryCards()+'</div><button class="cpm-new-client" data-cpm="new">+ Add another client</button></aside>'+
 '<section id="cpm-detail" class="cpm-detail">'+cpDetail()+'</section></div>')+'</div>';
}
async function cpLoad(selected=null){
 const seq=++cpSequence;
 cpLoading=true;cpError='';
 const desired=selected===null?cpSelected:selected;
 cpEmailEvents=[];cpMailAuditState='loading';
 try{
  const work=cpReq('/projects'+(desired?'?id='+encodeURIComponent(desired):''));
  const delivery=!cpDeliveryLoaded?cpReq('/delivery').then(data=>({ok:true,data}),error=>({ok:false,error})):Promise.resolve({ok:true,data:cpDelivery});
  const [result,emailResult]=await Promise.all([work,delivery]);
  if(seq!==cpSequence)return;
  if(emailResult.ok){cpDelivery=emailResult.data;cpDeliveryLoaded=true;cpDeliveryError='';}else{cpDelivery={configured:null,provider:'Gmail SMTP · TLS 465'};cpDeliveryError=String(emailResult.error?.message||'Connection unavailable');cpDeliveryLoaded=false;}
  cpProjects=result.projects||[];
  const available=cpProjects.some(p=>p.id===desired)||!!(desired&&result.workspace?.project?.id===desired);
  cpSelected=available?desired:(cpProjects[0]?.id||'');
  cpWorkspace=available&&result.workspace?result.workspace:null;
  if(available&&cpWorkspace?.project&&!cpProjects.some(p=>p.id===desired))cpProjects=[cpWorkspace.project,...cpProjects];
  if(cpSelected&&!cpWorkspace){
   const detail=await cpReq('/projects?id='+encodeURIComponent(cpSelected));
   if(seq!==cpSequence)return;
   cpWorkspace=detail.workspace||null;
  }
  cpLoaded=true;
  if(!cpSelected)cpMailAuditState='idle';
  if(section==='client-portal')render();
  if(cpSelected)void cpRefreshMailEvents();
 }catch(e){
  if(seq!==cpSequence)return;
  cpLoaded=true;cpError=String(e.message||'The client directory request failed.');cpDeliveryLoaded=false;cpDeliveryError=cpError;cpDelivery={configured:null,provider:'Gmail SMTP · TLS 465'};cpWorkspace=null;
  if(section==='client-portal')render();
 }finally{if(seq===cpSequence)cpLoading=false;}
}
function cpSetTab(tab){
 if(!['overview','milestone','file','approval','messages'].includes(tab))return;
 cpTab=tab;cpEditMode='';
 if(tab==='messages'&&cpSelected&&!cpBusy){cpReq('/messages/read',{method:'POST',body:JSON.stringify({project_id:cpSelected})}).then(()=>{if(cpWorkspace?.messages)cpWorkspace.messages.forEach(m=>{if(m.sender==='client'&&!m.read_at)m.read_at=new Date().toISOString();});}).catch(()=>{});}
 const detail=document.getElementById('cpm-detail');
 if(detail)detail.innerHTML=cpDetail();
}
function cpEditItem(type,id=''){
 cpItemType=type;
 cpEditingItem=id;
 cpEditMode='item';
 const detail=document.getElementById('cpm-detail');if(detail){detail.innerHTML=cpDetail();detail.scrollIntoView({block:'nearest',behavior:'instant'});detail.querySelector('input[name="title"]')?.focus({preventScroll:true});}
}
function cpRefreshDirectory(){
 const list=document.getElementById('cpm-directory-results');
 if(list)list.innerHTML=cpDirectoryCards();
 const count=document.getElementById('cpm-directory-count');
 if(count)count.textContent=cpMatches().length+' projects';
}
async function cpRefreshMailEvents(){
 if(!cpSelected)return;
 const projectId=cpSelected,seq=cpSequence,session=workspace;
 cpEmailEvents=[];cpMailAuditState='loading';
 const update=()=>{const box=document.querySelector('[data-cpm-email-audit]');if(box)box.innerHTML=cpEmailAudit();};update();
 try{
  const response=await cpReq('/mail-events?project_id='+encodeURIComponent(projectId));
  if(seq!==cpSequence||cpSelected!==projectId||workspace!==session)return;
  if(!Array.isArray(response.events))throw Error('Incomplete mail event response.');
  cpEmailEvents=response.events;cpMailAuditState='ready';update();
 }catch{if(seq===cpSequence&&cpSelected===projectId&&workspace===session){cpEmailEvents=[];cpMailAuditState='error';update();}}
}
function cpSummaryDelivery(data){
 const delivery=data.delivery||{},sent=delivery.status==='sent',status=delivery.status||'failed';
 const pdf='/api/client-portal/admin/projects/'+encodeURIComponent(cpSelected)+'/summary';
 const result='<div class="cpm-delivery-result '+(sent?'is-sent':'is-manual')+'"><span>VELORYZ / PROJECT ORDER DELIVERY</span>'+
  '<h3>'+(sent?'Gmail SMTP accepted the order summary.':'The project summary email was not sent.')+'</h3>'+
  '<p>'+cpE(delivery.message||'No delivery response was received from Gmail.')+'</p>'+
  '<div><strong>Recipient:</strong> '+cpE(data.recipient||cpWorkspace?.project?.client_email||'')+'</div>'+
  '<div><strong>Reference:</strong> '+cpE(data.reference||cpWorkspace?.project?.request_reference||'')+'</div>'+
  '<div><strong>Attached document:</strong> Industrial one-page VELORYZ order summary PDF</div>'+
  '<p>'+(sent?'Gmail accepted this message for delivery; inbox arrival is not guaranteed. Check the recipient address and delivery activity.':'The private project and PDF remain available. Verify Gmail setup and click the separate Send Project Summary button again once resolved.')+'</p></div>';
 showModal('Project summary / delivery result',sent?'SMTP accepted the email.':'The email attempt needs attention.',result,
  '<a href="'+cpE(pdf)+'" target="_blank" rel="noopener" class="admin-button secondary">Open one-page project PDF ↓</a>'+
  '<button type="button" class="admin-button secondary" data-action="close-modal">Close</button>','medium');
}
function cpInvitation(data){
 const delivery=data.delivery||{},sent=delivery.status==='sent';
 const status=sent?'Invitation accepted by Gmail SMTP':'Invitation created, but email delivery needs attention';
 const note=delivery.message||'The invitation code is securely available to the owner here.';
 const greeting='Hello '+(cpWorkspace?.project?.client_name||'')+',\n\nYour private VELORYZ Studio workspace is ready.\n\nProject reference: '+(cpWorkspace?.project?.request_reference||'')+
  '\nOne-time access code: '+data.code+'\nActivate at: '+data.url+'\nCode expires in 14 days.\n\n1. Open the portal.\n2. Paste your private code.\n3. Activate and review your milestones.\n\nDo not share your code.\nVELORYZ Studio';
 const draft='mailto:'+encodeURIComponent(data.email)+'?subject='+encodeURIComponent('VELORYZ / Your private client invitation')+'&body='+encodeURIComponent(greeting);
 const html='<div class="cpm-invite-modal"><div class="cpm-invite-result '+(sent?'is-sent':'is-manual')+'"><strong>'+cpE(status)+'</strong><p>'+cpE(note)+'</p></div>'+
  '<p class="cpm-modal-note">This private invitation was sent only because you clicked <strong>Send Client Invitation</strong> in Client Management. An invitation is never sent automatically by accepting a project.</p>'+
  '<label>Invitation recipient</label><input readonly value="'+cpE(data.email)+'">'+
  '<label>Official project reference</label><input readonly value="'+cpE(cpWorkspace?.project?.request_reference||'VELORYZ project')+'">'+
  '<label>One-time access code</label><div class="cpm-copy-row"><input readonly id="cpm-invite-code" value="'+cpE(data.code)+'"><button class="admin-button secondary" type="button" data-cpm-copy="cpm-invite-code">Copy securely</button></div>'+
  '<label>Private activation link</label><div class="cpm-copy-row"><input readonly id="cpm-invite-link" value="'+cpE(data.url)+'"><button class="admin-button secondary" type="button" data-cpm-copy="cpm-invite-link">Copy link</button></div>'+
  (sent?'<p class="cpm-modal-note">Gmail accepted the invitation for delivery. Inbox receipt is not guaranteed. The code is single-use and valid for 14 days.</p>':
   '<a class="admin-button" href="'+cpE(draft)+'">Open manual email draft ↗</a><p class="cpm-modal-note">The prepared draft is NOT sent automatically. Send it from your mail app only if Gmail SMTP failed. The server stores only the hashed code, so copy it now if manual delivery is necessary.</p>')+
  '</div>';
 showModal('Separate client invitation','One-time private project access / 14-day expiration',html,
  '<button class="admin-button secondary" data-action="close-modal">Close</button>','medium');
}
function cpImportedEnquiry(id){
 const item=typeof enquiryItems!=='undefined'?enquiryItems.find(i=>i.id===id):null;
 if(!item)return;
 const fields=typeof parseCreatorV3==='function'?parseCreatorV3(item.message):null;
 const category=fields?.Project||'Client project',starter=fields?.Template||'';
 const title=fields?(starter&&starter!=='Custom'?starter+' / '+category:category+' project'):(item.service||'Client project');
 cpNewDraft={client_name:item.name,client_email:item.email,title:title.slice(0,160),summary:String(item.message||'').slice(0,1600),status:'planning',phase:'Discover',progress:0,next_step:'Review the project brief and confirm the scope, proposal and milestones before issuing portal access.'};
 cpNewProject=true;cpEditMode='project';cpEditingItem='';cpTab='overview';
 closeModal();
 location.hash='#/client-portal';
 render();
}
async function cpCopyFromInput(id){
 const input=document.getElementById(id);if(!input)return;
 try{await navigator.clipboard.writeText(input.value);toast('Copied to clipboard.');}
 catch{input.focus();input.select();toast('Select the text and copy it securely.');}
}
document.addEventListener('input',e=>{
 if(e.target.id==='cpm-search'){cpSearch=e.target.value;cpRefreshDirectory();}
 if(e.target.matches('[data-cpm-progress]')){const output=document.querySelector('[data-cpm-progress-output]');if(output)output.textContent=e.target.value+'%';}
});
document.addEventListener('change',e=>{if(e.target.id==='cpm-status-filter'){cpFilter=e.target.value;cpRefreshDirectory();}});
document.addEventListener('click',async e=>{
 const shortcut=e.target.closest('[data-cpm-template]');
 if(shortcut){const textarea=document.getElementById('cpm-message-text');if(textarea){const templates={update:'Project update: We have completed the following work:\n\nNext milestone:\n\nWhat we need from you:',review:'Hello! Please review the latest shared work in your Client Portal. Let us know what feels right and list any requested changes so we can resolve them precisely.',handover:'Handover update: The agreed deliverables are ready for review in the Files section. Please confirm access and share any final observations.'};textarea.value=templates[shortcut.dataset.cpmTemplate]||'';textarea.focus();}return;}
 const copy=e.target.closest('[data-cpm-copy]');if(copy){await cpCopyFromInput(copy.dataset.cpmCopy);return;}
 const b=e.target.closest('[data-cpm]');if(!b)return;
 const action=b.dataset.cpm;
 if(action==='from-enquiry'){cpImportedEnquiry(b.dataset.id);return;}
 if(action==='refresh-mail'){cpDeliveryLoaded=false;cpDeliveryError='';await cpLoad(cpSelected);return;}
 if(action==='test-email'){if(cpDelivery.configured===false){toast('The active function does not detect the Gmail credential. Recheck after configuring the secret.');return;}b.disabled=true;try{const result=await cpReq('/test-email',{method:'POST',body:'{}'});toast(result.message||'Gmail connection test accepted by SMTP.');}catch(error){toast('Gmail test failed: '+error.message);}finally{b.disabled=false;}return;}
 if(section!=='client-portal')return;
 if(action==='tab'){cpSetTab(b.dataset.tab);return;}
 if(action==='clear-search'){cpSearch='';cpFilter='all';const s=document.getElementById('cpm-search'),f=document.getElementById('cpm-status-filter');if(s)s.value='';if(f)f.value='all';cpRefreshDirectory();return;}
 if(action==='new'){window.VeloryzCRM?.openDirectory();cpNewProject=true;cpNewDraft=null;cpEditMode='project';cpEditingItem='';const detail=document.getElementById('cpm-detail');if(detail)detail.innerHTML=cpDetail();else {cpLoaded=true;render();}return;}
 if(action==='cancel'){cpNewProject=false;cpNewDraft=null;cpEditingItem='';cpEditMode='';const detail=document.getElementById('cpm-detail');if(detail)detail.innerHTML=cpDetail();return;}
 if(action==='edit-project'){cpNewProject=false;cpEditMode='project';const detail=document.getElementById('cpm-detail');if(detail)detail.innerHTML=cpDetail();return;}
 if(action==='add-item'){cpEditItem(b.dataset.type||'milestone');return;}
 if(action==='edit-item'){const item=(cpWorkspace?.items||[]).find(i=>i.id===b.dataset.id);if(item)cpEditItem(item.type,item.id);return;}
 if(action==='select'){if(cpBusy)return;cpEmailEvents=[];cpMailAuditState='loading';cpSelected=b.dataset.id;cpNewProject=false;cpEditMode='';cpTab='overview';cpWorkspace=null;const detail=document.getElementById('cpm-detail');if(detail)detail.innerHTML='<div class="cpm-loading">Opening selected client…</div>';cpRefreshDirectory();await cpLoad(cpSelected);return;}
 if(action==='reload'){if(cpBusy)return;cpLoaded=false;cpDeliveryLoaded=false;await cpLoad();return;}
 if(action==='starter-plan'){
  if(cpBusy||!cpWorkspace?.project)return;
  const starter=[
   ['Discovery & scope','Review goals, audience, requirements and the agreed scope.'],
   ['Visual direction','Share creative references and agree the visual approach.'],
   ['Design & feedback','Create layouts and refine the design with client feedback.'],
   ['Development','Build the agreed website or product experience.'],
   ['Testing & handover','Review quality, prepare the final files and launch.']
  ];
  const existing=new Set((cpWorkspace.items||[]).filter(i=>i.type==='milestone').map(i=>i.title.toLowerCase()));
  const remaining=starter.filter(([name])=>!existing.has(name.toLowerCase()));
  if(!remaining.length){toast('Starter milestones are already in this project.');return;}
  if(!window.confirm('Add '+remaining.length+' editable starter milestones to this client project?'))return;
  cpBusy=true;b.disabled=true;let added=0;
  try{
   for(const [title,details] of remaining){
    await cpReq('/items',{method:'POST',body:JSON.stringify({project_id:cpSelected,type:'milestone',title,details,state:'upcoming',due_date:'',url:''})});
    added++;
   }
   cpTab='milestone';toast('Added '+added+' starter milestones. You can edit each one.');
  }catch(error){toast(added+' milestones added before an error: '+error.message);}
  finally{cpBusy=false;b.disabled=false;await cpLoad(cpSelected);}
  return;
 }
 if(action==='advance-item'){
  if(cpBusy)return;
  const item=(cpWorkspace?.items||[]).find(i=>i.id===b.dataset.id&&i.type==='milestone');
  if(!item)return;
  cpBusy=true;b.disabled=true;
  try{
   const next=item.state==='upcoming'?'in-progress':'done';
   await cpReq('/items',{method:'POST',body:JSON.stringify({...item,state:next})});
   cpTab='milestone';await cpLoad(cpSelected);
   toast(next==='done'?'Milestone completed.':'Milestone started.');
  }catch(error){toast(error.message);}
  finally{cpBusy=false;b.disabled=false;}
  return;
 }
 if(cpBusy)return;
 try{
  cpBusy=true;b.disabled=true;
  if(action==='send-summary'){
   if(!cpWorkspace?.project)return;
   if(!window.confirm('Send the complete VELORYZ project/order summary, with its one-page branded PDF, to '+cpWorkspace.project.client_email+' now?\n\nThis sends one real email through Gmail. The private access code is NOT included.'))return;
   const result=await cpReq('/send-summary',{method:'POST',body:JSON.stringify({project_id:cpSelected})});
   cpSummaryDelivery(result);
   await cpRefreshMailEvents();
  }
  if(action==='invite'){
   if(!cpWorkspace?.project)return;
   if(!window.confirm('Send a separate VELORYZ invitation email to '+cpWorkspace.project.client_email+'?\n\nThis generates a new one-time client access code, sends it using Gmail SMTP, and revokes any previously issued invitation and active client sessions.'))return;
   const result=await cpReq('/invite',{method:'POST',body:JSON.stringify({project_id:cpSelected})});
   cpInvitation(result);
   await cpRefreshMailEvents();
  }
  if(action==='remove-item'){
   const item=(cpWorkspace?.items||[]).find(x=>x.id===b.dataset.id);
   if(!item)return;
   if(!window.confirm('Remove "'+item.title+'" from this client workspace?\n\nThis cannot be undone.'))return;
   const removed=await cpReq('/items/'+encodeURIComponent(item.id)+'?project_id='+encodeURIComponent(cpSelected),{method:'DELETE'});
   toast(removed.storage_cleanup===false?'Item removed; private storage cleanup requires operator attention.':'Project item removed.');
   await cpLoad(cpSelected);
  }
 }catch(error){toast(error.message);}finally{cpBusy=false;b.disabled=false;}
});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!form.matches('[data-cpm-form]'))return;
 e.preventDefault();if(cpBusy||!form.reportValidity())return;
 const button=e.submitter||form.querySelector('[type="submit"]');cpBusy=true;if(button)button.disabled=true;
 try{
  const v=Object.fromEntries(new FormData(form));
  if(form.dataset.cpmForm==='private-file'){
   const projectId=cpSelected,file=v.file;if(!projectId||!file||!file.size||file.size>2097152||!/\.(pdf|png|jpe?g|txt)$/i.test(file.name))throw Error('Choose a supported file up to 2 MB.');
   const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   if(cpSelected!==projectId)throw Error('Project changed. Select it again before uploading.');
   await cpReq('/files',{method:'POST',body:JSON.stringify({project_id:projectId,title:v.title,details:v.details,filename:file.name,content:btoa(binary)})});
   toast('Private deliverable uploaded.');if(cpSelected===projectId){cpTab='file';await cpLoad(projectId);}return;
  }
  if(form.dataset.cpmForm==='project'){
   const edit=!cpNewProject&&!!cpWorkspace?.project;
   const result=await cpReq(edit?'/projects/'+encodeURIComponent(cpSelected):'/projects',{method:edit?'PUT':'POST',body:JSON.stringify(v)});
   cpNewProject=false;cpEditMode='';cpNewDraft=null;cpSelected=result.id;cpTab='overview';
   toast(edit?'Project details saved.':'Client workspace created. Use the separate Summary and Invitation send buttons when ready.');
   await cpLoad(result.id);
  }
  if(form.dataset.cpmForm==='quick'){
   const p=cpWorkspace?.project;if(!p)throw Error('Select a client first.');
   const result=await cpReq('/projects/'+encodeURIComponent(cpSelected),{method:'PUT',body:JSON.stringify({...p,...v})});
   toast('Progress and next steps updated.');
   await cpLoad(result.id);
  }
  if(form.dataset.cpmForm==='item'){
   const type=cpEditingItem?(cpWorkspace.items||[]).find(i=>i.id===cpEditingItem)?.type:cpItemType;
   if(!type)throw Error('Choose a valid project item type.');
   await cpReq('/items',{method:'POST',body:JSON.stringify({...v,type,id:cpEditingItem||undefined,project_id:cpSelected})});
   cpEditMode='';cpEditingItem='';cpTab=type;
   toast('Project '+(cpKinds[type]||'item').toLowerCase()+' saved.');
   await cpLoad(cpSelected);
  }
  if(form.dataset.cpmForm==='message'){
   const result=await cpReq('/messages',{method:'POST',body:JSON.stringify({project_id:cpSelected,body:v.body})});
   toast('Message saved to the private client conversation. '+(result.notification?.status==='not-configured'?'Gmail alerts need setup.':''));
   cpTab='messages';await cpLoad(cpSelected);
  }
 }catch(err){toast(err.message);if(button)button.disabled=false;}
 finally{cpBusy=false;}
});

/* Private owner refresh: read-only polling while the conversation editor is idle. */
setInterval(async()=>{
 if(section!=='client-portal'||!cpSelected||!cpLoaded||cpBusy||cpLoading||cpEditMode||document.hidden)return;
 if(document.activeElement?.matches?.('input,textarea,select,[contenteditable="true"]'))return;
 const selected=cpSelected;
 try{
  const latest=await cpReq('/projects?id='+encodeURIComponent(selected));
  if(section!=='client-portal'||selected!==cpSelected||!latest.workspace)return;
  const before=cpWorkspace?.messages?.at(-1)?.id||'';
  const after=latest.workspace.messages?.at(-1)?.id||'';
  const changed=before!==after||latest.workspace.project?.updated_at!==cpWorkspace?.project?.updated_at;
  if(!changed)return;
  cpWorkspace=latest.workspace;cpProjects=latest.projects||cpProjects;
  const target=document.getElementById('cpm-detail');
  if(target)target.innerHTML=cpDetail();
  cpRefreshDirectory();
  if(before!==after&&after)toast('New client conversation activity. Your workspace is up to date.');
 }catch{ /* Keep the working console; manual Refresh remains available. */ }
},18000);
