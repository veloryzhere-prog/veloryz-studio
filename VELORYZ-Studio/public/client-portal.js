'use strict';
(()=>{
const root=document.getElementById('cp-main');
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>v?new Date(v.length===10?v+"T12:00:00":v).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):"To be agreed";
const safeLink=s=>{try{const u=new URL(s);return u.protocol==="https:"?u.href:""}catch{return ""}};
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
function toast(message){const el=$("#cp-toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),4200);}
function badge(s){const labels={"planning":"Planning","in-progress":"In progress","in-review":"In review","launched":"Launched","on-hold":"On hold","done":"Complete","waiting":"Needs your review","approved":"Approved","changes":"Changes requested","upcoming":"Coming up"};return '<span class="cp-badge cp-badge-'+esc(s)+'">'+esc(labels[s]||s)+'</span>'}
function sample(){isDemo=true;state=demo;tab="overview";render();}
function entry(error=""){
 isDemo=false;state=null;document.body.classList.remove('cp-logged');
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
const nav=[["overview","Dashboard","grid"],["timeline","Project Plan","map"],["reviews","Action Items","check"],["files","Deliverables","file"],["messages","Messages","chat"],["ai","AI Guide","chat"]];
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
 return '<div class="cp-app-layout"><aside class="cp-app-sidebar">'+
 '<a class="cp-app-brand" href="/"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" alt="VELORYZ" width="880" height="263"><span>CLIENT PORTAL</span></a>'+
 '<div class="cp-app-client"><div class="cp-app-client-icon">'+esc(initials)+'</div><span><strong>'+esc(p.client_name)+'</strong><small>'+esc(p.title)+'</small></span></div>'+
 '<nav class="cp-app-nav" aria-label="Client workspace navigation">'+nav.map(([id,label,icon])=>'<button type="button" data-cp-tab="'+id+'" class="'+(tab===id?'is-active':'')+'" '+(tab===id?'aria-current="page"':'')+'>'+navIcon(icon)+'<span>'+label+'</span>'+(id==="reviews"&&actionCount?'<b class="cp-nav-count">'+actionCount+'</b>':'')+'</button>').join('')+'</nav>'+
 '<div class="cp-app-sidebar-footer"><div class="cp-security"><span>◉</span><p>Private & secure<br><small>Shared by VELORYZ Studio</small></p></div><button class="cp-exit" data-cp-exit>'+(isDemo?'Exit preview':'Sign out')+' <span>↗</span></button></div></aside>'+
 '<div class="cp-app-main"><header class="cp-app-topbar"><div><span class="cp-app-breadcrumb">YOUR PROJECT</span><span class="cp-app-divider">/</span><strong>'+esc(nav.find(n=>n[0]===tab)?.[1]||"Dashboard")+'</strong></div><div class="cp-app-top-right"><button class="cp-refresh-button" type="button" data-cp-refresh title="Refresh project updates" aria-label="Refresh project updates">↻ <span>Refresh</span></button><span class="cp-app-live"><i></i> YOUR WORKSPACE</span><span class="cp-app-avatar">'+esc(initials)+'</span></div></header>'+
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
 '<section class="cp-surface cp-progress-card"><div class="cp-card-top"><div class="cp-card-title"><span class="cp-mini-icon">▥</span><div><h2>Project timeline</h2><p>'+esc(p.phase)+' · '+esc(p.status.replaceAll("-"," "))+'</p></div></div><span class="cp-progress-percent">'+Math.round(stage)+'% complete</span></div>'+
 '<div class="cp-phase-grid">'+effectiveSteps.slice(0,7).map((step,i)=>'<div class="cp-phase"><div class="cp-phase-bar '+(step.state==="done"?'is-done':step.state==="in-progress"?'is-current':'')+'"></div><span>'+esc(step.title)+'</span>'+(step.state==="done"?'<small>✓</small>':'')+'</div>').join('')+'</div>'+
 '<div class="cp-progress-caption"><span>Current phase: <strong>'+esc(p.phase)+'</strong></span><span>Expected finish: '+esc(date(p.due_date))+'</span></div></section>'+
 '<div class="cp-stats"><div class="cp-stat"><strong class="cp-stat-green">'+done+'<small> / '+steps.length+'</small></strong><span>MILESTONES</span></div><div class="cp-stat"><strong class="cp-stat-blue">'+delivered+'<small> / '+files.length+'</small></strong><span>DELIVERABLES</span></div><div class="cp-stat"><strong class="cp-stat-orange">'+approvals.length+'</strong><span>ACTION ITEMS</span></div></div>'+
 '<section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-green">◇</span><div><h2>Deliverables</h2><p>Files and links shared for your review.</p></div></div><button data-cp-tab="files">View all ↗</button></div>'+
 (files.length?files.slice(0,5).map(item=>'<div class="cp-doc-group"><div class="cp-doc-title"><strong>'+esc(item.title)+'</strong>'+badge(item.state)+'</div><div class="cp-doc-file"><span class="cp-doc-icon">▤</span><div><strong>'+esc(item.title)+'</strong><small>'+esc(item.details||"Shared by VELORYZ Studio")+'</small></div>'+(safeLink(item.url)?'<a href="'+esc(safeLink(item.url))+'" target="_blank" rel="noopener noreferrer" class="cp-dark-button">↧ &nbsp; Open file</a>':'<span class="cp-doc-pending">Awaiting file</span>')+'</div></div>').join(''):'<div class="cp-empty-small">No deliverables have been shared yet. Your studio will add them here as the project progresses.</div>')+'</section>'+
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
 (list.length?list.map((item,i)=>'<div class="cp-file-list-row"><span class="cp-file-type">▤</span><div class="cp-file-meta"><strong>'+esc(item.title)+'</strong><p>'+esc(item.details||"File supplied by VELORYZ Studio")+'</p><small>'+esc(item.due_date?date(item.due_date):"No due date")+'</small></div>'+badge(item.state)+(safeLink(item.url)?'<a href="'+esc(safeLink(item.url))+'" target="_blank" rel="noopener noreferrer" class="cp-dark-button">↧ Open file</a>':'<span class="cp-doc-pending">Not shared yet</span>')+'</div>').join(''):'<div class="cp-empty-small">There are no shared files yet. We will add deliverables here as they are ready.</div>')+'</section><p class="cp-file-caution">Linked deliverables open on the original file provider. Their own access permissions apply.</p>';
}
function reviews(){
 const list=state.items.filter(i=>i.type==="approval"),waiting=list.filter(i=>i.state==="waiting");
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">DECISIONS THAT MOVE WORK FORWARD</span><h1>Action Items</h1><p>Review work that needs your input. Approve a direction or request changes with clear notes.</p></div>'+
 '<div class="cp-action-count"><span>'+waiting.length+'</span> item'+(waiting.length===1?'':'s')+' waiting on you</div>'+
 '<section class="cp-surface cp-dashboard-section"><div class="cp-section-label"><div class="cp-section-left"><span class="cp-section-dot cp-dot-lime">✓</span><div><h2>Approvals</h2><p>Decisions needing your sign-off.</p></div></div></div>'+
 (list.length?list.map(item=>'<article class="cp-approval"><div class="cp-approval-heading"><div><span class="cp-file-type">▤</span><strong>'+esc(item.title)+'</strong></div>'+badge(item.state)+'</div><p>'+esc(item.details||"Please review the proposed direction.")+'</p>'+
 (item.state==="waiting"?'<form data-cp-review="'+esc(item.id)+'" class="cp-review-form"><label for="cp-note-'+esc(item.id)+'">Feedback or change request (optional)</label><textarea id="cp-note-'+esc(item.id)+'" name="note" rows="3" maxlength="1000" placeholder="Share your thoughts…"></textarea><div class="cp-approval-actions"><button class="cp-approve-button" type="submit" name="decision" value="approved" '+(isDemo?'disabled':'')+'>✓ &nbsp; Approve</button><button class="cp-secondary-button" type="submit" name="decision" value="changes" '+(isDemo?'disabled':'')+'>Request changes</button></div></form>':'<div class="cp-approval-recorded">✓ Decision recorded for this review.</div>')+'</article>').join(''):'<div class="cp-empty-small">There are no action items right now. You are all caught up.</div>')+'</section>';
}
function messages(){
 const list=state.messages;
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">THE CONVERSATION</span><h1>Messages</h1><p>Keep questions and updates connected to the project. No more searching through separate email threads.</p></div>'+
 '<section class="cp-surface cp-chat-card"><div class="cp-chat-title"><span class="cp-section-dot cp-dot-green">↗</span><div><strong>VELORYZ Studio</strong><small>Your shared project conversation</small></div><span class="cp-chat-live">PRIVATE THREAD</span></div>'+
 '<div class="cp-conversation" role="log" aria-label="Project conversation">'+(list.length?list.map(m=>'<article class="cp-message '+(m.sender==="client"?"is-client":"is-studio")+'"><div class="cp-message-top"><span>'+esc(m.sender==="client"?"You":"VELORYZ Studio")+'</span><time>'+esc(date(m.created_at))+'</time></div><p>'+esc(m.body).replace(/\n/g,"<br>")+'</p></article>').join(''):'<p class="cp-empty-small">No messages yet. This is where the conversation will begin.</p>')+'</div>'+
 '<form id="cp-message-form" class="cp-message-form"><label for="cp-message">Send a message</label><textarea id="cp-message" name="body" rows="4" maxlength="2000" required placeholder="Write a message to your VELORYZ project team…" '+(isDemo?'disabled':'')+'></textarea><div><small>'+(isDemo?"Messaging is disabled in this demonstration.":"Your message is visible only in this project workspace.")+'</small><button class="cp-button" type="submit" '+(isDemo?'disabled':'')+'>Send message ↗</button></div></form></section>';
}
function aiGuide(){
 return '<div class="cp-page-heading"><span class="cp-page-eyebrow">YOUR PROJECT COMPANION</span><h1>Studio AI Guide</h1><p>Ask questions about your portal, milestones, approvals and communication. This is a guidance assistant and cannot read confidential project details.</p></div>'+
 (window.VeloryzSupportChat?.render('client',{embed:true})||'<p>AI Guide is loading. You can still <a href="/support/">contact support</a>.</p>')+
 '<div class="cp-ai-disclaimer">This assistant does not access your private client records. For a project-specific decision or update, use <button type="button" data-cp-tab="messages">Messages</button> to contact the team.</div>';
}
const views={overview,timeline,files,reviews,messages,ai:aiGuide};
function render(){document.body.classList.toggle('cp-logged',!!state);if(!state)return entry(notice);root.innerHTML=shell();if(tab==='ai')window.VeloryzSupportChat?.mount(root);document.title=(isDemo?"Preview":"Your project")+" — VELORYZ Client Workspace";}
async function refresh(){
 try{state=await api("/session");isDemo=false;render();}
 catch(e){if(e.status===401)entry();else entry("The client workspace could not be loaded. Please try again.");}
}
document.addEventListener("click",async e=>{
 const tabButton=e.target.closest("[data-cp-tab]");
 if(tabButton){tab=tabButton.dataset.cpTab;if(views[tab]){render();$("#cp-view")?.scrollIntoView({block:"start",behavior:"instant"});}return;}
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
  busy=true;clicked.disabled=true;
  try{await api("/decisions",{method:"POST",body:JSON.stringify({id:f.dataset.cpReview,state:clicked.value,note:f.elements.note.value})});state=await api("/session");render();toast("Your decision has been recorded.");}
  catch(err){toast(err.message);clicked.disabled=false;}finally{busy=false}
 }
});
refresh();
})();