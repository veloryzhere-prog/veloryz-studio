/* R51.2 executive operations. Read-only until the owner opens an existing management console. */
(()=>{
'use strict';
const paths={enquiries:'/api/admin/enquiries?status=new&page=0',clients:'/api/client-portal/admin/projects',reviews:'/api/reviews/admin',payments:'/api/admin/payments',backend:'/api/health',provider:'/api/admin/ai/settings',mail:'/api/client-portal/admin/delivery'};
const titles={enquiries:'New enquiries',clients:'Client projects',reviews:'Review moderation',payments:'Payment requests',backend:'Website backend',provider:'AI configuration',mail:'Email configuration',detail:'Client actions'};
const limit=12;
let records={},details=[],checked=0,expected=0,loadedAt=0,busy=false,sequence=0,filter='all',query='',lastOwner=null;
const E=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const arr=v=>Array.isArray(v)?v:[];
const date=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:0;};
const day=v=>date(v)?new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeZone:'Asia/Kolkata'}).format(date(v)):'Date unavailable';
const money=v=>Number.isSafeInteger(Number(v))&&Number(v)>=0?new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(v)/100):'Amount unavailable';
const istDay=v=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(v);
const active=p=>['planning','in-progress','in-review','on-hold'].includes(p.status);
const data=(r,k)=>r[k]?.state==='ready'?r[k].data:null;
function derive(r,workspaces,now=Date.now()){
 const enquiries=data(r,'enquiries'),clients=data(r,'clients'),reviews=data(r,'reviews'),payments=data(r,'payments');
 const projects=arr(clients?.projects),newItems=arr(enquiries?.items).filter(x=>x.status==='new'),pendingReviews=arr(reviews?.reviews).filter(x=>x.status==='pending'),requests=arr(payments?.items).filter(x=>x.status==='requested');
 const rows=[],activity=[];
 const add=(category,title,subtitle,time,priority,route,project='')=>rows.push({category,title,subtitle,time,priority,route,project});
 const event=(category,title,time,route,project='')=>{if(date(time))activity.push({category,title,time,route,project});};
 for(const x of newItems){const late=date(x.created_at)>0&&now-date(x.created_at)>=43200000;add('enquiries',x.reference||'New project enquiry',x.service||'Project brief',x.created_at,late?'Follow up':'New','enquiries');event('Enquiry',x.reference||'Project enquiry',x.created_at,'enquiries');}
 for(const x of pendingReviews)add('reviews',x.display_name||'Community feedback',String(x.rating||'—')+' / 5 rating',x.created_at,'Moderate','reviews');
 for(const x of arr(reviews?.reviews))event('Review',x.display_name||'Community feedback',x.created_at,'reviews');
 for(const x of requests)add('payments',x.title||'Payment request',(x.reference||'')+' · '+money(x.amount_paise),x.created_at,'Verify receipt','payments');
 for(const x of arr(payments?.items))event('Payment',x.title||'Payment request',x.created_at,'payments');
 for(const p of projects)event('Project',p.title||'Client project',p.updated_at||p.created_at,'client-portal',p.id);
 for(const w of workspaces){const p=w.project;if(!p?.id)continue;
  for(const item of arr(w.items)){
   if(item.type==='approval'&&item.state==='changes')add('clients',item.title||'Requested changes',p.title||'Client project',item.updated_at,'Changes requested','client-portal',p.id);
   if(item.type==='approval'&&item.state==='waiting')add('clients',item.title||'Pending approval',p.title||'Client project',item.updated_at,'Awaiting client','client-portal',p.id);
   if(item.type==='milestone'&&item.state!=='done'&&date(item.due_date)>0&&new Date(date(item.due_date)).toISOString().slice(0,10)<istDay(now))add('clients',item.title||'Overdue milestone',p.title||'Client project',item.due_date,'Overdue','client-portal',p.id);
  }
  const unread=arr(w.messages).filter(x=>x.sender==='client'&&!x.read_at);
  if(unread.length)add('clients',p.title||'Client project',unread.length+' unread client message'+(unread.length===1?'':'s'),unread.at(-1)?.created_at,'Reply','client-portal',p.id);
 }
 const rank={Overdue:0,'Changes requested':1,'Follow up':2,Reply:3,New:4,Moderate:5,'Verify receipt':6,'Awaiting client':7};
 rows.sort((a,b)=>(rank[a.priority]??9)-(rank[b.priority]??9)||date(b.time)-date(a.time));
 activity.sort((a,b)=>date(b.time)-date(a.time));
 return {projects,rows,activity,counts:{enquiries:enquiries&&Number.isFinite(Number(enquiries.total))?Number(enquiries.total):null,clients:clients?projects.filter(active).length:null,reviews:reviews?pendingReviews.length:null,payments:payments?requests.length:null}};
}
function stateText(k){const r=records[k];return !r?'Not checked':r.state==='loading'?'Loading…':r.state==='error'?'Unavailable':r.state==='preview'?'Owner sign-in required':'Loaded';}
const countText=(k,n)=>n===null?stateText(k):String(n);
const link=(route,project,label)=>'<a href="#/'+E(route)+'" '+(project?'data-os-project="'+E(project)+'"':'')+'>'+E(label)+' <span aria-hidden="true">↗</span></a>';
function health(k){const r=records[k];if(r?.state!=='ready')return {label:stateText(k),tone:'unknown'};const v=r.data;
 if(k==='backend')return v.ok===true?{label:'Responding',tone:'good'}:{label:'Check required',tone:'warn'};
 return v.configured===true?{label:'Configured · not tested',tone:'good'}:{label:'Not configured / unknown',tone:'warn'};
}
function renderRows(model,all){
 let list=model.rows;
 if(all){const q=query.trim().toLowerCase();list=list.filter(x=>(filter==='all'||x.category===filter)&&(!q||[x.title,x.subtitle,x.priority].join(' ').toLowerCase().includes(q)));}
 else list=list.slice(0,7);
 const coverage='Enquiries: first 25 new records. Client detail: '+checked+' of '+expected+' returned projects checked (maximum '+limit+'; directory capped at 200, items and messages capped at 150 per project). Reviews and payments reflect returned records (payments capped at 100).';
 const incomplete=['enquiries','clients','reviews','payments'].some(k=>records[k]?.state!=='ready')||checked<expected||expected>=200||model.counts.enquiries>25||arr(data(records,'payments')?.items).length>=100||details.some(w=>w.items.length>=150||w.messages.length>=150);
 return '<section class="os-panel os-queue"><div class="os-panel-head"><div><h2>'+(all?'Action inbox':'Needs your attention')+'</h2><p>Read-only queue · open the source console to act</p></div>'+(all?'':link('action-inbox','','View inbox'))+'</div>'+
 (all?'<div class="os-queue-toolbar"><label>Filter <select data-os-filter>'+[['all','All categories'],['enquiries','Enquiries'],['clients','Client work'],['reviews','Community'],['payments','Payments']].map(([k,n])=>'<option value="'+k+'" '+(filter===k?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Search <input data-os-query type="search" value="'+E(query)+'" placeholder="Find an action"></label><span>'+list.length+' displayed</span></div>':'')+
 '<div class="os-queue-list">'+(list.length?list.map(x=>'<article class="os-task"><div class="os-task-marker '+(x.priority==='Overdue'||x.priority==='Follow up'||x.priority==='Changes requested'?'is-urgent':'')+'"></div><div class="os-task-copy"><strong>'+E(x.title)+'</strong><small>'+E(x.subtitle)+'</small></div><span class="os-task-status">'+E(x.priority)+'</span><time>'+E(day(x.time))+'</time>'+link(x.route,x.project,'Open')+'</article>').join(''):'<p class="os-empty">'+(incomplete?'No actions available from the loaded records yet. Some data is incomplete.':'No matching actions in the loaded records.')+'</p>')+'</div><p class="os-coverage">'+E(coverage)+(incomplete?' Coverage incomplete; do not treat this as an all-clear.':'')+'</p></section>';
}
function markup(workspace,all){
 const model=derive(records,details),c=model.counts;
 const summary=[['enquiries','New enquiries',c.enquiries,'enquiries'],['clients','Active client projects',c.clients,'client-portal'],['reviews','Pending reviews',c.reviews,'reviews'],['payments','Payment requests',c.payments,'payments']];
 const problems=Object.keys(paths).filter(k=>records[k]?.state==='error');
 const healthRows=['backend','provider','mail'].map(k=>{const x=health(k);return '<div class="os-health-row"><span>'+E(titles[k])+'</span><span class="os-health-value '+x.tone+'">'+E(x.label)+'</span></div>';}).join('');
 return (problems.length?'<div class="os-alert" role="status">Some sources are unavailable: '+E(problems.map(k=>titles[k]).join(', '))+'. Retry to refresh. Existing records are not affected.</div>':'')+
 '<div class="os-dash-header"><div><p class="os-dash-date">'+E(new Intl.DateTimeFormat('en-IN',{dateStyle:'full',timeZone:'Asia/Kolkata'}).format(new Date()))+'</p><h1>'+(all?'Action inbox':'Studio overview')+'</h1><p>'+(all?'Prioritized actions from current studio records.':'Your business operations, creative work and system connections.')+'</p></div><div><button class="admin-button secondary" type="button" data-os-refresh '+(busy?'disabled':'')+'>'+(busy?'Refreshing…':'Refresh data')+'</button><small role="status">'+(loadedAt?'Checked '+E(new Intl.DateTimeFormat('en-IN',{timeStyle:'short',timeZone:'Asia/Kolkata'}).format(loadedAt))+' IST':'Not refreshed yet')+'</small></div></div>'+
 (!all?'<div class="os-metrics">'+summary.map(([k,n,v,route])=>'<a class="os-metric" href="#/'+route+'"><span>'+n+'</span><strong>'+E(countText(k,v))+'</strong><small>'+(k==='enquiries'?'Server total':k==='clients'?'Active among returned projects':'Returned records')+' <b aria-hidden="true">↗</b></small></a>').join('')+'</div>':'')+
 '<div class="'+(all?'os-inbox-grid':'os-dashboard-grid')+'">'+renderRows(model,all)+(!all?'<section class="os-panel os-health"><div class="os-panel-head"><div><h2>Service connections</h2><p>Configuration and read-only checks</p></div>'+link('health','','Details')+'</div>'+healthRows+'<div class="os-health-row"><span>Private client API</span><span class="os-health-value '+(records.clients?.state==='ready'?'good':'unknown')+'">'+E(records.clients?.state==='ready'?'Responding':stateText('clients'))+'</span></div><p class="os-coverage">No live inference, mail delivery or storage write test performed here.</p></section>':'')+'</div>'+
 (!all?'<div class="os-dashboard-grid os-bottom-grid"><section class="os-panel"><div class="os-panel-head"><div><h2>Client projects</h2><p>Recorded completion, not estimated progress</p></div>'+link('client-portal','','Manage')+'</div>'+(model.projects.length?model.projects.slice().sort((a,b)=>date(b.updated_at)-date(a.updated_at)).slice(0,6).map(p=>{const progress=Math.max(0,Math.min(100,Number(p.progress)||0));return '<article class="os-project-row"><div><strong>'+E(p.title||'Client project')+'</strong><small>'+E(p.status||'Unknown status')+'</small></div><div class="os-progress"><progress max="100" value="'+progress+'" aria-label="'+E((p.title||'Project')+' recorded completion')+'"></progress><span>'+progress+'%</span></div>'+link('client-portal',p.id,'Open')+'</article>';}).join(''):'<p class="os-empty">'+E(stateText('clients')==='Loaded'?'No client projects returned.':stateText('clients'))+'</p>')+'</section><section class="os-panel"><div class="os-panel-head"><div><h2>Recent records</h2><p>Latest recorded events, not a full audit trail</p></div></div>'+(model.activity.length?model.activity.slice(0,6).map(x=>'<article class="os-activity"><div><strong>'+E(x.title)+'</strong><small>'+E(x.category)+' · '+E(day(x.time))+'</small></div>'+link(x.route,x.project,'View')+'</article>').join(''):'<p class="os-empty">No dated records loaded.</p>')+'</section></div><section class="os-panel os-publication"><div><h2>Website publication</h2><p>Public revision v'+E(workspace.publishedVersion??'—')+' · '+(workspace.dirty?'Unsaved website changes':workspace.hasDraft?'Saved draft pending':'No pending website draft')+'</p></div>'+link('history','','Review releases')+'</section>':'');
}
function draw(){const host=document.querySelector('[data-os-dashboard]');if(!host||!lastOwner)return;const input=host.querySelector('[data-os-query]'),focused=input===document.activeElement,selection=focused?[input.selectionStart,input.selectionEnd]:null;host.innerHTML=markup(lastOwner,host.dataset.osDashboard==='inbox');if(selection){const next=host.querySelector('[data-os-query]');next?.focus({preventScroll:true});next?.setSelectionRange(...selection);}}
async function refresh(owner,request,preview){
 if(busy||!owner)return;lastOwner=owner;const seq=++sequence;busy=true;records={};details=[];checked=0;expected=0;
 for(const k of Object.keys(paths))records[k]={state:preview?'preview':'loading'};
 draw();
 if(preview){busy=false;draw();return;}
 const get=async(k,path)=>{try{const v=await request(path,{signal:AbortSignal.timeout(15000)});if(!v||typeof v!=='object'||(['enquiries','payments'].includes(k)&&!Array.isArray(v.items))||(k==='clients'&&!Array.isArray(v.projects))||(k==='reviews'&&!Array.isArray(v.reviews)))throw Error('Invalid response');if(seq===sequence){const fields=(list,keys)=>arr(list).map(x=>Object.fromEntries(keys.map(key=>[key,x[key]])));const minimal=k==='enquiries'?{total:v.total,items:fields(v.items,['reference','service','status','created_at'])}:k==='clients'?{projects:fields(v.projects,['id','title','status','progress','created_at','updated_at'])}:k==='reviews'?{reviews:fields(v.reviews,['display_name','rating','status','created_at'])}:k==='payments'?{items:fields(v.items,['reference','title','amount_paise','status','created_at'])}:k==='backend'?{ok:v.ok}:{configured:v.configured};records[k]={state:'ready',data:minimal};}}catch{if(seq===sequence)records[k]={state:'error'};}};
 await Promise.all(Object.entries(paths).map(([k,p])=>get(k,p)));
 if(seq!==sequence)return;
 const projects=arr(data(records,'clients')?.projects).slice().sort((a,b)=>Number(active(b))-Number(active(a))||date(b.updated_at)-date(a.updated_at));
 expected=projects.length;draw();
 const chosen=projects.slice(0,limit);
 for(let i=0;i<chosen.length;i+=3){
  await Promise.all(chosen.slice(i,i+3).map(async p=>{try{const v=await request(paths.clients+'?id='+encodeURIComponent(p.id),{signal:AbortSignal.timeout(15000)});if(seq===sequence&&v.workspace?.project?.id===p.id&&Array.isArray(v.workspace.items)&&Array.isArray(v.workspace.messages)){const w=v.workspace;details.push({project:{id:w.project.id,title:w.project.title},items:w.items.map(x=>({type:x.type,state:x.state,title:x.title,due_date:x.due_date,updated_at:x.updated_at})),messages:w.messages.map(x=>({sender:x.sender,read_at:x.read_at,created_at:x.created_at}))});checked++;}}catch{}}));
  if(seq!==sequence)return;draw();
 }
 busy=false;loadedAt=Date.now();draw();
}
function mount(owner,request,preview){
 if(lastOwner!==owner){sequence++;busy=false;records={};details=[];checked=expected=loadedAt=0;filter='all';query='';}
 lastOwner=owner;draw();
 if(!busy&&(!loadedAt||Date.now()-loadedAt>60000)&&!preview)refresh(owner,request,false);
 else if(preview&&!Object.keys(records).length)refresh(owner,request,true);
}
function page(owner,all){return '<div data-os-dashboard="'+(all?'inbox':'overview')+'">'+markup(owner,all)+'</div>';}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-os-refresh]');if(b){e.preventDefault();if(typeof workspace!=='undefined'&&workspace)refresh(workspace,api,preview);return;}
 const p=e.target.closest?.('[data-os-project]');if(p&&typeof cpLoad==='function'&&typeof cpSelected!=='undefined'){if(cpBusy){e.preventDefault();return;}e.preventDefault();cpSelected=p.dataset.osProject;cpTab='overview';cpNewProject=false;cpWorkspace=null;cpLoaded=false;location.hash='#/client-portal';}
});
document.addEventListener('input',e=>{if(e.target.matches?.('[data-os-query]')){query=e.target.value;draw();}});
document.addEventListener('change',e=>{if(e.target.matches?.('[data-os-filter]')){filter=e.target.value;draw();document.querySelector('[data-os-filter]')?.focus({preventScroll:true});}});
window.VeloryzDashboard={derive,markup,mount,page,refresh};
})();
