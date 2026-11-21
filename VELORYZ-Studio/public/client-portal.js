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
 isDemo=false;state=null;
 root.innerHTML='<section class="cp-entry"><div class="cp-entry-intro">'+
 '<div class="cp-kicker"><span>VELORYZ / YOUR PROJECT SPACE</span><span>AN OPEN LINE BETWEEN IDEA & LAUNCH</span></div>'+
 '<div class="cp-entry-display"><span class="cp-overline">PRIVATE CLIENT ROOM — 001</span><h1>Good things<br>take <em>shape.</em><br>Together.</h1>'+
 '<p>Everything we are building, gathered in one thoughtful place. A clear timeline, decisions to review, files to keep, and a conversation that keeps moving.</p></div>'+
 '<div class="cp-entry-footnote"><span class="cp-flower" aria-hidden="true">✳</span><span>Made for the people behind every project.<br>Thoughtfully designed by VELORYZ Studio.</span></div></div>'+
 '<div class="cp-entry-card"><span class="cp-card-index">THE CLIENT ROOM <span>01 / ACCESS</span></span><div class="cp-key-icon" aria-hidden="true">↗</div>'+
 '<h2>A personal place<br>for your project.</h2><p>We create your private workspace when a project begins. Enter the invitation code shared by our studio.</p>'+
 '<form id="cp-login" class="cp-login"><label for="cp-invite">Your private access code</label><input id="cp-invite" name="invite" placeholder="Paste your invitation code" autocomplete="off" spellcheck="false" required minlength="64" maxlength="64"><button class="cp-button" type="submit">Open my workspace <span aria-hidden="true">↗</span></button></form>'+
 (error?'<p class="cp-error" role="alert">'+esc(error)+'</p>':'')+
 '<div class="cp-entry-divider"><span></span>FIRST TIME HERE?<span></span></div><p class="cp-invite-help">Invitation missing? <a href="mailto:veloryz.here@gmail.com?subject=Client%20workspace%20access">Ask your project contact ↗</a></p>'+
 '<button type="button" class="cp-plain-link" data-cp-demo>Explore an illustrative preview <span aria-hidden="true">↗</span></button></div></section>'+
 '<section class="cp-value"><span>01 / TRANSPARENT PROGRESS</span><span>02 / THOUGHTFUL REVIEWS</span><span>03 / ONE PLACE TO COLLABORATE</span></section>';
 const hash=location.hash.match(/(?:^#|&)invite=([0-9a-f]{64})/i);
 if(hash){history.replaceState(null,"",location.pathname+location.search);const input=$("#cp-invite");input.value=hash[1];signIn(hash[1]);}
}
async function signIn(code){
 if(busy)return;busy=true;
 const btn=$("#cp-login button");if(btn){btn.disabled=true;btn.textContent="Checking your invitation…";}
 try{await api("/access",{method:"POST",body:JSON.stringify({invite:code})});history.replaceState(null,"",location.pathname);await refresh();}
 catch(e){entry(e.message)}finally{busy=false;}
}
const nav=[["overview","Overview","✳"],["timeline","Timeline","⌁"],["files","Deliverables","↗"],["reviews","Reviews","◇"],["messages","Messages","↳"]];
function header(p){
 const initials=(p.client_name||"C").split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase();
 return '<div class="cp-dashboard-top"><span class="cp-overline">A PRIVATE COLLABORATION / VELORYZ</span><div class="cp-top-greeting"><span>Welcome, <strong>'+esc(p.client_name)+'</strong></span><div class="cp-avatar">'+esc(initials)+'</div></div></div>';
}
function shell(){
 const p=state.project;
 return '<div class="cp-workspace">'+header(p)+'<div class="cp-dashboard-layout"><aside class="cp-sidebar"><div class="cp-side-project"><span>YOUR PROJECT</span><strong>'+esc(p.title)+'</strong>'+badge(p.status)+'</div>'+
 '<nav class="cp-side-nav" aria-label="Client workspace sections">'+nav.map(([id,label,mark])=>'<button type="button" data-cp-tab="'+id+'" class="'+(tab===id?'is-active':'')+'" aria-current="'+(tab===id?'page':'false')+'"><span class="cp-nav-mark">'+mark+'</span>'+label+'<span class="cp-nav-arrow">↗</span></button>').join('')+'</nav>'+
 '<div class="cp-sidebar-lower"><span class="cp-flower" aria-hidden="true">✳</span><p>A good collaboration makes room for questions.</p><a href="mailto:veloryz.here@gmail.com?subject=VELORYZ%20project%20question">Contact the studio ↗</a></div>'+
 '<button class="cp-exit" data-cp-exit>'+(isDemo?'Leave preview':'Sign out securely')+' <span>↗</span></button></aside>'+
 '<section class="cp-view" id="cp-view">'+(isDemo?'<div class="cp-demo-alert"><strong>ILLUSTRATIVE PREVIEW</strong><span>No real client details or active project are shown here.</span></div>':'')+views[tab](p)+'</section></div></div>';
}
const statusCard=(label,num,note)=>'<div class="cp-metric"><span>'+esc(label)+'</span><strong>'+esc(num)+'</strong><small>'+esc(note)+'</small></div>';
function overview(p){
 const milestones=state.items.filter(i=>i.type==="milestone"),finished=milestones.filter(i=>i.state==="done").length,pending=state.items.filter(i=>i.type==="approval"&&i.state==="waiting").length;
 return '<div class="cp-section-head"><span class="cp-overline">YOUR PROJECT / AT A GLANCE</span><h1>Progress with<br><em>perspective.</em></h1><p>'+esc(p.summary||"A thoughtfully planned space for the work ahead.")+'</p></div>'+
 '<div class="cp-feature"><div class="cp-feature-top"><span>THE CURRENT CHAPTER / '+esc(p.phase||"Discover")+'</span>'+badge(p.status)+'</div>'+
 '<div class="cp-feature-middle"><strong>'+esc(p.progress)+'<small>%</small></strong><div><span>Overall progress</span><p>Each step brings your project closer to the finish.</p></div></div>'+
 '<div class="cp-track" role="progressbar" aria-label="Project progress" aria-valuenow="'+esc(p.progress)+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+Math.max(0,Math.min(100,Number(p.progress)||0))+'%"></span></div>'+
 '<div class="cp-feature-foot"><span>CURRENT STAGE · '+esc(p.phase||"Discover")+'</span><span>ESTIMATED FINISH · '+esc(date(p.due_date))+'</span></div></div>'+
 '<div class="cp-metrics">'+statusCard("Milestones complete",finished+" / "+milestones.length,"Follow along with every chapter")+
 statusCard("Items to review",pending,"Your input helps us move")+
 statusCard("Shared deliverables",state.items.filter(i=>i.type==="file").length,"Files and important links")+'</div>'+
 '<div class="cp-two-col"><section class="cp-panel cp-next"><span class="cp-panel-kicker">COMING UP / THE NEXT STEP</span><span class="cp-big-symbol" aria-hidden="true">↗</span><h2>'+esc(p.next_step||"We’ll share the next step when it is ready.")+'</h2><button type="button" class="cp-text-button" data-cp-tab="timeline">Explore the timeline ↗</button></section>'+
 '<section class="cp-panel"><div class="cp-panel-top"><span class="cp-panel-kicker">A QUICK LOOK</span><button type="button" data-cp-tab="timeline">All milestones ↗</button></div>'+
 '<div class="cp-mini-steps">'+milestones.slice(0,4).map((i,n)=>'<div><span class="cp-step-number">0'+(n+1)+'</span><span>'+esc(i.title)+'</span>'+badge(i.state)+'</div>').join('')+'</div></section></div>';
}
function timeline(){
 const list=state.items.filter(i=>i.type==="milestone");
 return '<div class="cp-section-head"><span class="cp-overline">01 / THE ROAD AHEAD</span><h1>Every step,<br><em>accounted for.</em></h1><p>From initial thinking to the finishing touches, here is where everything stands.</p></div>'+
 (list.length?'<div class="cp-timeline">'+list.map((i,n)=>'<article class="cp-timeline-row"><span class="cp-timeline-number">'+String(n+1).padStart(2,"0")+'</span><span class="cp-timeline-marker '+(i.state==="done"?"is-done":"")+'"></span><div><div class="cp-timeline-title"><h2>'+esc(i.title)+'</h2>'+badge(i.state)+'</div><p>'+esc(i.details||"Details to follow.")+'</p><small>'+esc(i.due_date?date(i.due_date):"To be scheduled")+'</small></div></article>').join('')+'</div>':'<div class="cp-empty">Your timeline is being prepared. We will share milestones as soon as the scope is agreed.</div>');
}
function files(){
 const list=state.items.filter(i=>i.type==="file");
 return '<div class="cp-section-head"><span class="cp-overline">02 / YOUR DELIVERABLES</span><h1>Everything,<br><em>in its place.</em></h1><p>Important links and handovers, collected here as the work progresses.</p></div>'+
 (list.length?'<div class="cp-files">'+list.map((i,n)=>'<article class="cp-file"><span class="cp-file-icon" aria-hidden="true">↗</span><div><strong>'+esc(i.title)+'</strong><p>'+esc(i.details||"Shared by the studio.")+'</p><small>'+esc(date(i.due_date))+'</small></div>'+ (safeLink(i.url)?'<a href="'+esc(safeLink(i.url))+'" target="_blank" rel="noopener noreferrer" aria-label="Open '+esc(i.title)+' in a new tab">Open ↗</a>':'<span class="cp-file-wait">Awaiting file</span>')+'</article>').join('')+'</div><p class="cp-small-note">Linked files open on their original host. Access and download permissions are controlled by that provider.</p>':'<div class="cp-empty">Nothing shared yet. This space will fill with the deliverables we prepare together.</div>');
}
function reviews(){
 const list=state.items.filter(i=>i.type==="approval");
 return '<div class="cp-section-head"><span class="cp-overline">03 / YOUR APPROVALS</span><h1>A voice in<br><em>every detail.</em></h1><p>When a decision needs your attention, you will find it here. Your feedback goes straight into the project conversation.</p></div>'+
 (list.length?'<div class="cp-reviews">'+list.map(i=>'<article class="cp-review"><div class="cp-review-top"><span>REVIEW REQUEST</span>'+badge(i.state)+'</div><h2>'+esc(i.title)+'</h2><p>'+esc(i.details)+'</p>'+ (i.state==="waiting"?'<form class="cp-review-form" data-cp-review="'+esc(i.id)+'"><label for="cp-note-'+esc(i.id)+'">Optional context or changes</label><textarea id="cp-note-'+esc(i.id)+'" name="note" rows="3" maxlength="1000" placeholder="Add your thoughts…"></textarea><div class="cp-review-actions"><button type="submit" name="decision" value="approved" class="cp-button" '+(isDemo?'disabled':'')+'>Approve this direction ↗</button><button type="submit" name="decision" value="changes" class="cp-outline" '+(isDemo?'disabled':'')+'>Request changes</button></div></form>':'<p class="cp-review-resolved">This review has been recorded.</p>')+'</article>').join('')+'</div>':'<div class="cp-empty">No reviews are waiting. We will ask for your perspective when a decision is ready.</div>');
}
function messages(){
 const list=state.messages;
 return '<div class="cp-section-head"><span class="cp-overline">04 / THE CONVERSATION</span><h1>Stay in<br><em>the loop.</em></h1><p>A shared conversation for questions, progress notes and project decisions. Messages stay connected to this project.</p></div>'+
 '<div class="cp-messages"><div class="cp-conversation" role="log" aria-label="Project conversation">'+(list.length?list.map(m=>'<article class="cp-message '+(m.sender==="client"?"is-client":"is-studio")+'"><div class="cp-message-top"><span>'+esc(m.sender==="client"?"You":"VELORYZ Studio")+'</span><time>'+esc(date(m.created_at))+'</time></div><p>'+esc(m.body).replace(/\n/g,"<br>")+'</p></article>').join(''):'<p class="cp-empty">Your conversation begins here.</p>')+'</div>'+
 '<form id="cp-message-form" class="cp-message-form"><label for="cp-message">Leave a note for the studio</label><textarea id="cp-message" name="body" rows="4" maxlength="2000" required placeholder="Share an update, a question, or your feedback…" '+(isDemo?'disabled':'')+'></textarea><div><small>'+(isDemo?"Messaging is disabled in the illustrative preview.":"Only this project’s team can view your message.")+'</small><button type="submit" class="cp-button" '+(isDemo?'disabled':'')+'>Send a message ↗</button></div></form></div>';
}
const views={overview,timeline,files,reviews,messages};
function render(){if(!state)return entry(notice);root.innerHTML=shell();document.title=(isDemo?"Preview":"Your project")+" — VELORYZ Client Workspace";}
async function refresh(){
 try{state=await api("/session");isDemo=false;render();}
 catch(e){if(e.status===401)entry();else entry("The client workspace could not be loaded. Please try again.");}
}
document.addEventListener("click",async e=>{
 const tabButton=e.target.closest("[data-cp-tab]");
 if(tabButton){tab=tabButton.dataset.cpTab;if(views[tab]){render();$("#cp-view")?.scrollIntoView({block:"start",behavior:"instant"});}return;}
 if(e.target.closest("[data-cp-demo]")){sample();return;}
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