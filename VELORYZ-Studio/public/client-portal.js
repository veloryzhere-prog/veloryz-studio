'use strict';
(()=>{
const root=document.getElementById('cp-main');
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>v?new Date(v.length===10?v+"T12:00:00":v).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):"To be agreed";
const safeLink=s=>{try{const u=new URL(s);return u.protocol==="https:"&&!u.username&&!u.password?u.href:""}catch{return ""}};
const hostedFile=s=>{try{const u=new URL(s);return u.origin==="https://veloryz.online"&&/^\/api\/client-portal\/files\/[0-9a-f-]{36}$/i.test(u.pathname)&&!u.search&&!u.hash;}catch{return false;}};
const moneyPaise=v=>Number.isSafeInteger(Number(v))&&Number(v)>=0?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(Number(v)/100):"Not available";
const api=async(path,options={})=>{
 const res=await fetch("/api/client-portal"+path,{...options,credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",...(options.headers||{})}});
 const data=await res.json().catch(()=>({error:"The studio service is unavailable."}));
 if(!res.ok)throw Object.assign(new Error(data.error||"The request did not complete."),{status:res.status});
 return data;
};
const demo={
 project:{id:"demo",title:"Your project, in one place.",client_name:"Guest",client_email:"",summary:"A clear view of every stage, decision, and handover. This is an illustrative preview, not a real client project.",status:"in-progress",phase:"Design",progress:62,due_date:"",next_step:"Review the design direction together."},
 items:[
  {id:"1",type:"milestone",title:"Discover the direction",details:"Audience, purpose, objectives, and the first brief.",state:"done",due_date:""},
  {id:"2",type:"milestone",title:"Shape the experience",details:"Structure, screens, visual language, and first review.",state:"in-progress",due_date:""},
  {id:"3",type:"milestone",title:"Build and refine",details:"Responsive implementation and feedback.",state:"upcoming",due_date:""},
  {id:"4",type:"milestone",title:"Prepare for launch",details:"Quality checks and handover.",state:"upcoming",due_date:""},
  {id:"5",type:"approval",title:"Homepage visual direction",details:"Check the proposed layout, type, and colours.",state:"waiting",due_date:""},
  {id:"6",type:"file",title:"Visual reference deck",details:"Deliverables will appear here once shared.",state:"upcoming",url:""}
 ],messages:[{id:"7",sender:"studio",body:"Welcome to your private project space. This is where our conversations and next steps stay together.",created_at:new Date().toISOString()}]
};
let state=null,tab="overview",busy=false,notice="",isDemo=false;
let archiveVersion=null,archiveNotes=[],archiveScope="",archiveBusy=false,archiveGeneration=0;
function clearArchiveSession(){archiveGeneration++;archiveBusy=false;archiveVersion=null;archiveNotes=[];archiveScope="";window.VeloryzSupportChat?.clearClient();}
function toast(message){const el=$("#cp-toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),4200);}
function badge(s){const labels={"planning":"Planning","in-progress":"In progress","in-review":"In review","launched":"Launched","on-hold":"On hold","done":"Complete","waiting":"Needs your review","approved":"Approved","changes":"Changes requested","upcoming":"Coming up"};return '<span class="cp-badge cp-badge-'+esc(s)+'">'+esc(labels[s]||s)+'</span>'}
function sample(){clearArchiveSession();isDemo=true;state=demo;tab="overview";render();}
function entry(error=""){
 clearArchiveSession();isDemo=false;state=null;document.body.classList.remove('cp-logged');
 root.innerHTML='<div class="cp-auth-shell"><section class="cp-auth-main">'+
 '<div class="cp-auth-logo"><span class="cp-auth-flower">✳</span> PRIVATE CLIENT PORTAL</div>'+
 '<div class="cp-auth-head"><span class="cp-auth-eyebrow">GOOD WORK. ONE PLACE.</span><h1>Welcome to your<br>project workspace<span class="cp-auth-stop">.</span></h1>'+
 '<p>See exactly where your project stands, review shared work, approve decisions, and keep every important conversation in one calm space.</p></div>'+
 '<div class="cp-auth-card"><div class="cp-auth-card-head"><span class="cp-auth-key">↗</span><div><h2>Open your client portal</h2><p>Enter the one-time invitation code sent by VELORYZ Studio.</p></div></div>'+
 '<form id="cp-login" class="cp-auth-form"><label for="cp-invite">Invitation code <span>*</span></label><input id="cp-invite" name="invite" type="text" placeholder="VZ-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" autocomplete="one-time-code" spellcheck="false" required minlength="32" maxlength="100" aria-describedby="cp-code-help"><p id="cp-code-help" class="cp-auth-hint">Your private code is issued by the studio, expires after 14 days and can be used once.</p><button class="cp-button" type="submit">Open my workspace <span>↗</span></button></form>'+
 (error?'<p class="cp-error" role="alert">'+esc(error)+'</p>':'')+
 '<div class="cp-auth-under"><span>HAVE A PROJECT IN MIND?</span><a href="/create/">Start a project ↗</a></div></div>'+
 '<p class="cp-auth-support">Not received an invitation? <a href="/support/">Ask Contact Support AI ↗</a> · <a href="mailto:veloryz.here@gmail.com?subject=VELORYZ%20Client%20Portal%20Access">Contact your studio project manager ↗</a></p></section>'+
 '<aside class="cp-auth-preview"><div class="cp-auth-preview-top"><span>VELORYZ / A CONNECTED EXPERIENCE</span><span>✳</span></div><div class="cp-preview-wrap"><div class="cp-preview-app"><div class="cp-preview-side"><b>V.</b><i></i><i></i><i></i><i></i></div><div class="cp-preview-content"><small>CLIENT VIEW / PREVIEW</small><strong>Everything, in sync.</strong><p>Project timeline</p><div class="cp-preview-steps"><i class="done"></i><i class="done"></i><i class="current"></i><i></i><i></i></div><div class="cp-preview-metrics"><span><b>2/5</b>Milestones</span><span><b>3</b>Deliverables</span><span><b>1</b>To review</span></div><div class="cp-preview-deliverable"><strong>Deliverables</strong><p>Brand direction <span>Shared</span></p><p>Homepage concept <span>In review</span></p></div></div></div></div><div class="cp-auth-preview-foot"><p>A calmer way to collaborate, from first idea to final handover.</p><button type="button" data-cp-demo>Explore an interactive demo ↗</button></div></aside></div>';
 const hash=location.hash.match(/(?:^#|&)invite=([^&]+)/i);
 if(hash){
  let token;try{token=decodeURIComponent(hash[1]);}catch{token="";}
  history.replaceState(null,"",location.pathname+location.search);
  if(token){const input=$("#cp-invite");input.value=token;signIn(token);}
 }
}
async function signIn(code){
 if(busy)return;busy=true;
 const btn=$("#cp-login button");if(btn){btn.disabled=true;btn.textContent="Checking your invitation…";}
 try{await api("/access",{method:"POST",body:JSON.stringify({invite:code})});history.replaceState(null,"",location.pathname);await refresh();}
 catch(e){entry(e.message)}finally{busy=false;}
}
const nav=[["overview","Dashboard","grid"],["timeline","Project Plan","map"],["reviews","Action Items","check"],["files","Deliverables","file"],["billing","Payments","file"],["handover","Handover","check"],["messages","Messages","chat"],["ai","AI Guide","chat"]];
function navIcon(name){
 const shapes={
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
 check:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 12 3 3 6-6"/>',
 file:'<path d="M6 2h9l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm9 0v5h4M8 12h8M8 16h8"/>',
 chat:'<path d="M20 11a8 8 0 0 1-8 8 8 8 0 0 1-4-.9L3 20l1.9-5A8 8 0 1 1 20 11Z"/>'
 };
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[name]+'</svg>';
}
function shell(){
 const p=state.project;
 const initials=(p.client_name||"C").split(/\s+/).slice(0,2).map(s=>s[0]?.[0]||"").join("").toUpperCase();
 const actionCount=state.items.filter(i=>i.type==="approval"&&i.state==="waiting").length;
 const unreadCount=state.messages.filter(m=>m.sender==='studio'&&!m.read_at).length;
 return '<div class="cp-app-layout"><aside class="cp-app-sidebar">'+
 '<a class="cp-app-brand" href="/"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" alt="VELORYZ" width="880" height="263"><span>CLIENT PORTAL</span></a>'+
 '<div class="cp-app-client"><div class="cp-app-client-icon">'+esc(initials)+'</div><span><strong>'+esc(p.client_name)+'</strong><small>'+esc(p.title)+'</small></span></div>'+
 '<nav class="cp-app-nav" aria-label="Client workspace navigation">'+nav.map(([id,label,icon])=>'<button type="button" data-cp-tab="'+id+'" class="'+(tab===id?'is-active':'')+'" '+(tab===id?'aria-current="page"':'')+'>'+navIcon(icon)+'<span>'+label+'</span>'+(id==="reviews"&&actionCount?'<b class="cp-nav-count">'+actionCount+'</b>':id==="messages"&&unreadCount?'<b class="cp-nav-count">'+unreadCount+'</b>':'')+'</button>').join('')+'</nav>'+
 '<div class="cp-app-sidebar-footer"><div class="cp-security"><span>◉</span><p>Private & secure<br><small>Shared by VELORYZ Studio</small></p></div><button class="cp-exit" data-cp-exit>'+(isDemo?'Exit preview':'Sign out')+' <span>↗</span></button></div></aside>'+
 '<div class="cp-app-main"><header class="cp-app-topbar"><div><span class="cp-app-breadcrumb">YOUR PROJECT</span><span class="cp-app-divider">/</span><strong>'+esc(nav.find(n=>n[0]===tab)?.[1]||"Dashboard")+'</strong></div><div class="cp-app-top-right"><button class="cp-refresh-button" type="button" data-cp-refresh title="Refresh project updates" aria-label="Refresh project updates">↻ <span>Refresh</span></button><span class="cp-app-live"><i></i> '+(isDemo?"DEMO":"PRIVATE WORKSPACE")+'</span><span class="cp-app-avatar">'+esc(initials)+'</span></div></header>'+
 '<section class="cp-app-content" id="cp-view">'+
 (isDemo?'<div class="cp-demo-alert"><strong>ILLUSTRATIVE DEMO</strong><span>Example content only. No project changes or client messages are sent from this preview.</span></div>':'')+
 views[tab](p)+'</section><footer class="cp-app-bottom"><span>VELORYZ STUDIO · CLIENT COLLABORATION</span><a href="mailto:veloryz.here@gmail.com">Need help? Contact us ↗</a></footer></div></div>';
}
const statusCard=(label,num,note)=>'<div class="cp-metric"><span>'+esc(label)+'</span><strong>'+esc(num)+'</strong><small>'+esc(note)+'</small></div>';
function overview(p){
 const steps=state.items.filter(i=>i.type==="milestone");
 const files=state.items.filter(i=>i.type==="file");
 const delivered=files.filter(i=>i.state==="done"&&safeLink(i.url)).length;
 const approvals=state.items.filter(i=>i.type==="approval"&&i.state==="waiting");
 const done=steps.filter(i=>i.state==="done").length;
 const phaseOrder=["Discover","Define","Design","Develop","Review","Launch"];
 const effectiveSteps=steps.length?steps:phaseOrder.map(s=>({title:s,state:s===p.phase?"in-progress":"upcoming"}));
 const stage=Number(p.progress)||0;
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">PROJECT DASHBOARD / LIVE SNAPSHOT</span><h1>Welcome to '+esc(p.title)+'</h1><p>A clear snapshot of your project — milestones, deliverables, and anything that needs your attention.</p></div>'+
 '<section class="cp-journey-brief"><div class="cp-journey-copy"><span>YOUR VELORYZ PROJECT</span><h2>'+esc(p.title)+'</h2><p>'+esc(p.summary||'Your original goals and agreed project plan live here with the team.')+'</p></div><div class="cp-journey-meta"><div><span>PROJECT REFERENCE</span><strong>'+esc(p.request_reference||'Private project')+'</strong></div><div><span>CURRENT PHASE</span><strong>'+esc(p.phase)+'</strong></div><a href="/api/client-portal/summary" target="_blank" rel="noopener" class="cp-download-summary">↓ Detailed project PDF</a></div></section>'+'<section class="cp-surface cp-progress-card"><div class="cp-card-top"><div class="cp-card-title"><span class="cp-mini-icon">▥</span><div><h2>Project timeline</h2><p>'+esc(p.phase)+' · '+esc(p.status.replaceAll("-"," "))+'</p></div></div><span class="cp-progress-percent">'+Math.round(stage)+'% complete</span></div>'+
 '<div class="cp-phase-grid">'+effectiveSteps.slice(0,7).map((step,i)=>'<div class="cp-phase"><div class="cp-phase-bar '+(step.state==="done"?'is-done':step.state==="in-progress"?'is-current':'')+'"></div><span>'+esc(step.title)+'</span>'+(step.state==="done"?'<small>✓</small>':'')+'</div>').join('')+'</div>'+
 '<div class="cp-progress-caption"><span>Current phase: <strong>'+esc(p.phase)+'</strong></span><span>Expected finish: '+esc(date(p.due_date))+'</span></div><p class="cp-progress-explainer">Completion reflects milestones marked as finished by the studio. Target dates remain estimates until separately confirmed.</p></section>'+
 '<div class="cp-stats"><div class="cp-stat"><strong class="cp-stat-green">'+done+'<small> / '+steps.length+'</small></strong><span>MILESTONES</span></div><div class="cp-stat"><strong class="cp-stat-blue">'+delivered+'<small> / '+files.length+'</small></strong><span>DELIVERABLES</span></div><div class="cp-stat"><strong class="cp-stat-orange">'+approvals.length+'</strong><span>ACTION ITEMS</span></div></div>'+
 '<section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-green">◇</span><div><h2>Deliverables</h2><p>Files and links shared for your review.</p></div></div><button data-cp-tab="files">View all ↗</button></div>'+
 (files.length?files.slice(0,5).map(item=>'<div class="cp-doc-group"><div class="cp-doc-title"><strong>'+esc(item.title)+'</strong>'+badge(item.state)+'</div><div class="cp-doc-file"><span class="cp-doc-icon">▤</span><div><strong>'+esc(item.title)+'</strong><small>'+esc(item.details||"Shared by VELORYZ Studio")+'</small></div>'+(safeLink(item.url)?'<a href="'+esc(safeLink(item.url))+'" target="_blank" rel="noopener noreferrer" class="cp-dark-button">↧ &nbsp; '+(hostedFile(item.url)?"Download private file":"Open shared link")+'</a>':'<span class="cp-doc-pending">Awaiting file</span>')+'</div></div>').join(''):'<div class="cp-empty-small">No deliverables have been shared yet. Your studio will add them here as the project progresses.</div>')+'</section>'+
 '<div class="cp-dashboard-duo"><section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-lime">✓</span><div><h2>Waiting on you</h2><p>Approvals requiring your decision.</p></div></div></div>'+
 (approvals.length?approvals.slice(0,3).map(item=>'<button class="cp-action-row" data-cp-tab="reviews"><span class="cp-alert-circle">!</span><span><strong>'+esc(item.title)+'</strong><small>'+esc(item.details||"Please review this direction.")+'</small></span><b>Review ↗</b></button>').join(''):'<div class="cp-empty-small">You’re all caught up. No approvals waiting.</div>')+'</section>'+
 '<section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-blue">↗</span><div><h2>What’s next</h2><p>The next step in our collaboration.</p></div></div></div>'+
 '<div class="cp-next-copy"><strong>'+esc(p.next_step||"We will share the next step as soon as it is confirmed.")+'</strong><p>Stay connected with the studio and keep an eye on this dashboard.</p><button data-cp-tab="messages">View conversation ↗</button></div></section></div>';
}
function timeline(){
 const p=state.project,steps=state.items.filter(i=>i.type==="milestone");
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">PLANNING & MILESTONES</span><h1>Project Plan</h1><p>Every stage of '+esc(p.title)+' in one clear timeline. See what is complete and what comes next.</p></div>'+
 '<section class="cp-surface cp-plan-head"><div><span class="cp-mini-kicker">CURRENT STAGE</span><h2>'+esc(p.phase)+'</h2><p>'+esc(p.next_step||"The studio will confirm the next project step.")+'</p></div>'+badge(p.status)+'</section>'+
 '<div class="cp-plan-list">'+(steps.length?steps.map((item,i)=>'<article class="cp-plan-step"><div class="cp-plan-dot '+(item.state==="done"?'done':'')+'">'+(item.state==="done"?'✓':String(i+1).padStart(2,"0"))+'</div><div class="cp-plan-item"><div><span>PHASE '+String(i+1).padStart(2,"0")+'</span>'+badge(item.state)+'</div><h2>'+esc(item.title)+'</h2><p>'+esc(item.details||"The studio will add details as this phase begins.")+'</p><small>'+esc(date(item.due_date))+'</small></div></article>').join(''):'<div class="cp-empty-small cp-surface">Your project plan will be added by the studio. You will see each stage and its status here.</div>')+'</div>';
}
function files(){
 const list=state.items.filter(i=>i.type==="file");
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">SHARED FILES & LINKS</span><h1>Deliverables</h1><p>Everything shared with you, organized by project. No lost files or scattered email threads.</p></div>'+
 '<section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-green">◇</span><div><h2>Project files</h2><p>'+list.length+' deliverable'+(list.length===1?'':'s')+' in your workspace.</p></div></div></div>'+
 (list.length?list.map((item,i)=>'<div class="cp-file-list-row"><span class="cp-file-type">▤</span><div class="cp-file-meta"><strong>'+esc(item.title)+'</strong><p>'+esc(item.details||"File supplied by VELORYZ Studio")+'</p><small>'+esc(item.due_date?date(item.due_date):"No due date")+'</small></div>'+badge(item.state)+(safeLink(item.url)?'<a href="'+esc(safeLink(item.url))+'" target="_blank" rel="noopener noreferrer" class="cp-dark-button">↧ '+(hostedFile(item.url)?"Download private file":"Open shared link")+'</a>':'<span class="cp-doc-pending">Not shared yet</span>')+'</div>').join(''):'<div class="cp-empty-small">There are no shared files yet. We will add deliverables here as they are ready.</div>')+'</section><p class="cp-file-caution">VELORYZ-hosted files require your active invitation session and download as attachments. External links open on their original provider and follow that provider’s access permissions.</p>';
}
function reviews(){
 const list=state.items.filter(i=>i.type==="approval"),waiting=list.filter(i=>i.state==="waiting");
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">DECISIONS THAT MOVE WORK FORWARD</span><h1>Action Items</h1><p>Review work that needs your input. Approve a direction or request changes with clear notes.</p></div>'+
 '<div class="cp-action-count"><span>'+waiting.length+'</span> item'+(waiting.length===1?'':'s')+' waiting on you</div>'+
 '<section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-lime">✓</span><div><h2>Approvals</h2><p>Decisions needing your sign-off.</p></div></div></div>'+
 (list.length?list.map(item=>'<article class="cp-approval"><div class="cp-approval-heading"><div><span class="cp-file-type">▤</span><strong>'+esc(item.title)+'</strong></div>'+badge(item.state)+'</div><p>'+esc(item.details||"Please review the proposed direction.")+'</p>'+
 (item.state==="waiting"?'<form data-cp-review="'+esc(item.id)+'" class="cp-review-form"><label for="cp-note-'+esc(item.id)+'">Feedback (required when requesting changes)</label><textarea id="cp-note-'+esc(item.id)+'" name="note" rows="3" maxlength="1000" placeholder="Share your thoughts…"></textarea><div class="cp-approval-actions"><button class="cp-approve-button" type="submit" name="decision" value="approved" '+(isDemo?'disabled':'')+'>✓ &nbsp; Approve</button><button class="cp-secondary-button" type="submit" name="decision" value="changes" '+(isDemo?'disabled':'')+'>Request changes</button></div></form>':'<div class="cp-approval-recorded">✓ Decision recorded for this review.</div>')+'</article>').join(''):'<div class="cp-empty-small">There are no action items right now. You are all caught up.</div>')+'</section>';
}
function messages(){
 const list=state.messages;
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">THE CONVERSATION</span><h1>Messages</h1><p>Keep questions and updates connected to the project. No more searching through separate email threads.</p></div>'+
 '<section class="cp-surface cp-chat-card"><div class="cp-chat-title"><span class="cp-section-dot cp-dot-green">↗</span><div><strong>VELORYZ Studio</strong><small>Your shared project conversation</small></div><span class="cp-chat-live">PRIVATE THREAD</span></div>'+
 '<div class="cp-conversation" role="log" aria-label="Project conversation" aria-live="polite">'+(list.length?list.map(m=>'<article class="cp-message '+(m.sender==="client"?"is-client":"is-studio")+'"><div class="cp-message-top"><span>'+esc(m.sender==="client"?"You":"VELORYZ Studio")+'</span><time>'+esc(date(m.created_at))+'</time></div><p>'+esc(m.body).replace(/\n/g,"<br>")+'</p><small class="cp-message-receipt">'+(m.sender==='client'?(m.read_at?'✓ Read by studio':'✓ Sent to studio'):'From your VELORYZ team')+'</small></article>').join(''):'<p class="cp-empty-small">No messages yet. This is where the conversation will begin.</p>')+'</div>'+
 '<div class="cp-quick-replies" aria-label="Message starters"><button type="button" data-cp-compose="update">Request an update</button><button type="button" data-cp-compose="question">Ask a project question</button><button type="button" data-cp-compose="feedback">Share feedback</button></div>'+'<div class="cp-compose-counter" id="cp-message-count" aria-live="off">0 / 2000 characters · Ctrl/⌘ + Enter to send</div>'+'<form id="cp-message-form" class="cp-message-form"><label for="cp-message">Send a message</label><textarea id="cp-message" name="body" rows="4" maxlength="2000" required placeholder="Write a message to your VELORYZ project team…" '+(isDemo?'disabled':'')+'></textarea><div><small>'+(isDemo?"Messaging is disabled in this demonstration.":"Private project thread · Gmail notifications are sent when configured.")+'</small><button class="cp-button" type="submit" '+(isDemo?'disabled':'')+'>Send message ↗</button></div></form></section>';
}
function archivePanel(){return isDemo?"":'<section class="cp-ai-archive"><h2>Private guidance archive</h2><p>Optionally save up to eight recent messages and two short text notes to your authenticated project. Notes are encrypted and never attached to AI requests. Loaded conversation messages may be sent as context when you ask a new AI question. Saved content can be loaded for 30 days; delete it at any time. Expired content is hidden, not automatically purged.</p><div class="cp-ai-archive-actions"><button type="button" data-cp-archive="load">Load saved archive</button><button type="button" data-cp-archive="save">Save current archive</button><button type="button" data-cp-archive="delete">Delete saved archive</button></div><label>Private text note <input type="file" data-cp-archive-file accept=".txt,.md,text/plain,text/markdown"></label><div id="cp-archive-notes"></div><label><input type="checkbox" id="cp-archive-consent"> I choose to store this conversation and these notes in my private project.</label><p id="cp-archive-status" role="status"></p></section>';}
function archiveDraw(){const host=$("#cp-archive-notes");if(host)host.innerHTML=archiveNotes.map((n,i)=>'<details><summary>'+esc(n.name)+'</summary><pre>'+esc(n.text)+'</pre><button type="button" data-cp-note-remove="'+i+'">Remove note</button></details>').join("");}
function aiGuide(){
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">YOUR PROJECT COMPANION</span><h1>Studio AI Guide</h1><p>Ask questions about your portal, milestones, approvals and communication. This is a guidance assistant and cannot read confidential project details.</p></div>'+
 (window.VeloryzSupportChat?.render('client',{embed:true})||'<p>AI Guide is loading. You can still <a href="/support/">contact support</a>.</p>')+archivePanel()+
 '<div class="cp-ai-disclaimer">This assistant does not access your private client records. For a project-specific decision or update, use <button type="button" data-cp-tab="messages">Messages</button> to contact the team.</div>';
}
function billing(){
 const payments=state.payments;
 const list=Array.isArray(payments)?payments:[];
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">PROJECT FINANCES</span><h1>Payment requests</h1><p>Review actual payment requests linked to your accepted project. Payments are confirmed by the Studio team, not by this screen.</p></div>'+
 (isDemo?'<p class="cp-empty-small cp-surface">No real payment records are displayed in the demonstration.</p>':payments===null?'<p class="cp-empty-small cp-surface">Payment records could not be loaded. Refresh or contact the Studio team.</p>':
 '<section class="cp-surface cp-dashboard-section"><h2>Payment history</h2>'+(list.length?list.map(x=>'<div class="cp-file-list-row"><div class="cp-file-meta"><strong>'+esc(x.title)+'</strong><small>'+esc(x.reference)+' · '+esc(date(x.created_at))+'</small></div><strong>'+esc(moneyPaise(x.amount_paise))+'</strong><span class="cp-badge">'+esc(({requested:"Awaiting confirmation",verified:"Receipt verified by studio",cancelled:"Cancelled"})[x.status]||"Status unavailable")+'</span></div>').join(""):'<p class="cp-empty-small">No payment requests linked to this workspace yet.</p>')+'</section>')+
 '<section class="cp-surface cp-dashboard-section"><h2>Need help with payment?</h2><p>No card or bank details are collected here. Ask your Studio team for the agreed payment instructions and receipt.</p><button class="cp-button" data-cp-tab="messages">Ask the Studio ↗</button></section>';
}
function handover(){
 const steps=state.items.filter(i=>i.type==="milestone"),files=state.items.filter(i=>i.type==="file"),reviews=state.items.filter(i=>i.type==="approval");
 const rows=[["Agreed milestones",steps.filter(x=>x.state==="done").length,steps.length,"timeline"],["Shared deliverables",files.filter(x=>x.state==="done"&&safeLink(x.url)).length,files.length,"files"],["Recorded approvals",reviews.filter(x=>x.state==="approved").length,reviews.length,"reviews"]];
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">DELIVERY & HANDOVER</span><h1>Handover readiness</h1><p>Review recorded project progress before the Studio confirms final handover. This checklist is not a launch or acceptance certificate.</p></div><section class="cp-surface cp-dashboard-section">'+rows.map(([title,done,total,route])=>'<div class="cp-r50-check"><span><strong>'+esc(title)+'</strong><small>'+done+' of '+total+' recorded'+(total===0?" · Not yet planned":"")+'</small></span><button type="button" data-cp-tab="'+route+'">View ↗</button></div>').join("")+'</section><section class="cp-surface cp-dashboard-section"><h2>Project summary</h2><p>Download the current Studio-generated PDF or ask the team to confirm outstanding work.</p>'+(isDemo?"":'<a class="cp-dark-button" href="/api/client-portal/summary" target="_blank" rel="noopener">Download project summary ↓</a>')+' <button class="cp-secondary-button" data-cp-tab="messages">Contact the team</button></section>';
}
const views={overview,timeline,files,reviews,billing,handover,messages,ai:aiGuide};
function render(){document.body.classList.toggle('cp-logged',!!state);if(!state)return entry(notice);const scope=String(state.project.id)+":"+String(state.project.client_email||"").toLowerCase();if(archiveScope!==scope){clearArchiveSession();archiveScope=scope;}root.innerHTML=shell();if(tab==='ai'){window.VeloryzSupportChat?.mount(root);archiveDraw();}document.title=(isDemo?"Preview":"Your project")+" — VELORYZ Client Workspace";}
async function refresh(){
 try{state=await api("/session");isDemo=false;render();}
 catch(e){if(e.status===401)entry();else entry("The client workspace could not be loaded. Please try again.");}
}
document.addEventListener("click",async e=>{
 const archive=e.target.closest("[data-cp-archive]"),remove=e.target.closest("[data-cp-note-remove]");if(remove){archiveNotes.splice(Number(remove.dataset.cpNoteRemove),1);archiveDraw();return;}
 if(archive){if(!state||isDemo||archiveBusy)return;const scope=archiveScope,generation=archiveGeneration,status=$("#cp-archive-status"),action=archive.dataset.cpArchive;archiveBusy=true;archive.disabled=true;try{
 if(action==="load"){const data=await api("/ai-archive");if(scope!==archiveScope||generation!==archiveGeneration)return;archiveVersion=data.version;archiveNotes=data.documents||[];window.VeloryzSupportChat?.loadClientHistory(data.messages||[]);archiveDraw();if(status)status.textContent=data.expired?"Saved archive expired. You may save a new one.":"Archive loaded.";}
 else if(action==="save"){if(!$("#cp-archive-consent")?.checked)throw Error("Confirm private storage first.");if(archiveVersion===null)throw Error("Load the saved archive first to avoid overwriting another device.");const data=await api("/ai-archive",{method:"PUT",body:JSON.stringify({version:archiveVersion,consent:true,messages:window.VeloryzSupportChat.clientHistory(),documents:archiveNotes})});if(scope!==archiveScope||generation!==archiveGeneration)return;archiveVersion=data.version;if(status)status.textContent="Private archive saved.";}
 else if(action==="delete"){if(!confirm("Delete the saved conversation and notes from this project?"))return;await api("/ai-archive",{method:"DELETE"});if(scope!==archiveScope||generation!==archiveGeneration)return;archiveVersion=0;archiveNotes=[];window.VeloryzSupportChat?.clearClient();archiveDraw();if(status)status.textContent="Saved archive deleted.";}
 }catch(err){if(status)status.textContent=err.message;}finally{if(generation===archiveGeneration)archiveBusy=false;archive.disabled=false;}return;}
 const starter=e.target.closest("[data-cp-compose]");
 if(starter){
  const el=$("#cp-message");if(!el)return;
  const presets={
   update:"Hello VELORYZ team! Could you share the current stage, what has been completed and the next expected milestone? Thank you.",
   question:"I have a question about my project:\n\nContext:\n\nWhat I need clarified:",
   feedback:"Feedback on the latest shared work:\n\nWhat works well:\n\nWhat I would like to change:\n\nPriority:"
  };
  el.value=presets[starter.dataset.cpCompose]||"";el.dispatchEvent(new Event("input",{bubbles:true}));el.focus();return;
 }
 const tabButton=e.target.closest("[data-cp-tab]");
 if(tabButton){tab=tabButton.dataset.cpTab;if(views[tab]){render();$("#cp-view")?.scrollIntoView({block:"start",behavior:"instant"});if(tab==="messages"&&!isDemo){api("/messages/read",{method:"POST",body:"{}"}).then(async()=>{if(tab==="messages"&&state){state=await api("/session");render();}}).catch(()=>{});}}return;}
 if(e.target.closest("[data-cp-demo]")){sample();return;}
 if(e.target.closest("[data-cp-refresh]")){
  if(isDemo){toast("Preview is up to date.");return;}
  try{state=await api("/session");render();toast("Project updates refreshed.");}
  catch(err){toast(err.message);}
  return;
 }
 if(e.target.closest("[data-cp-exit]")){
  if(!isDemo){try{await api("/logout",{method:"POST",body:"{}"});}catch{toast("Please close this browser if you are on a shared device.");}}
  entry();return;
 }
});

document.addEventListener("change",async e=>{const field=e.target;if(!field.matches("[data-cp-archive-file]")||!state||isDemo)return;const file=field.files?.[0],scope=archiveScope,generation=archiveGeneration,status=$("#cp-archive-status");try{if(!file)return;if(archiveNotes.length>=2)throw Error("Remove a note first. Maximum two notes.");if(file.size>8192||!/\.(txt|md)$/i.test(file.name))throw Error("Choose a .txt or .md file under 8 KB.");const text=(await file.text()).trim();if(!text||text.length>2000||/\x00/.test(text))throw Error("Use up to 2,000 characters of plain text.");if(scope!==archiveScope||generation!==archiveGeneration||!field.isConnected)return;archiveNotes.push({name:file.name.slice(0,80),text});archiveDraw();if(status)status.textContent="Note ready. It has not been uploaded or shared with AI.";}catch(err){if(status)status.textContent=err.message;}finally{field.value="";}});
document.addEventListener("input",e=>{
 if(e.target?.id!=="cp-message")return;
 const count=$("#cp-message-count");
 if(count)count.textContent=String(e.target.value||"").length+" / 2000";
});
document.addEventListener("keydown",e=>{
 if(e.target?.id==="cp-message"&&(e.ctrlKey||e.metaKey)&&e.key==="Enter"){
  e.preventDefault();e.target.closest("form")?.requestSubmit();
 }
});
/* Background read-only refresh; never reset an unfinished client reply. */
setInterval(async()=>{
 if(!state||isDemo||busy||document.visibilityState==="hidden")return;
 if(document.activeElement?.matches?.('input,textarea,select,[contenteditable="true"]')||tab==="ai"||archiveBusy)return;
 if($("#cp-message")?.value.trim()||[...document.querySelectorAll(".cp-review-form textarea")].some(el=>el.value.trim()))return;
 try{
  const current=state,newState=await api("/session");
  if(state!==current||isDemo)return;
  const previousId=current.messages.at(-1)?.id||"",newId=newState.messages.at(-1)?.id||"";
  const changed=previousId!==newId||newState.project.updated_at!==current.project.updated_at||
   JSON.stringify(newState.items.map(i=>[i.id,i.state,i.updated_at]))!==JSON.stringify(current.items.map(i=>[i.id,i.state,i.updated_at]))||JSON.stringify(newState.payments)!==JSON.stringify(current.payments);
  if(!changed)return;
  state=newState;render();
  if(newId&&previousId!==newId)toast("A new project message is available.");
 }catch(error){if(error.status===401)entry("Your session has expired. Open the workspace again."); /* Preserve the workspace on temporary connection errors. */ }
},17000);

document.addEventListener("submit",async e=>{
 const f=e.target;
 if(f.id==="cp-login"){e.preventDefault();if(f.reportValidity())await signIn(f.elements.invite.value);return;}
 if(f.id==="cp-message-form"){
  e.preventDefault();if(busy||isDemo||!f.reportValidity())return;
  busy=true;const btn=f.querySelector("button");btn.disabled=true;
  try{await api("/messages",{method:"POST",body:JSON.stringify({body:f.elements.body.value})});state=await api("/session");render();toast("Your message has been sent.");}
  catch(err){toast(err.message);btn.disabled=false}finally{busy=false}return;
 }
 if(f.matches("[data-cp-review]")){
  e.preventDefault();if(busy||isDemo)return;
  const clicked=e.submitter||f.querySelector('[type="submit"]');
  if(clicked.value==="changes"&&!f.elements.note.value.trim()){toast("Please describe the changes you want.");f.elements.note.focus();return;}
  if(clicked.value==="approved"&&!window.confirm("Record your approval of this direction?"))return;
  busy=true;clicked.disabled=true;
  try{await api("/decisions",{method:"POST",body:JSON.stringify({id:f.dataset.cpReview,state:clicked.value,note:f.elements.note.value})});state=await api("/session");render();toast("Your decision has been recorded.");}
  catch(err){toast(err.message);clicked.disabled=false;}finally{busy=false}
 }
});
refresh();
})();