/* Interactive first-party concept previews, never embeds third-party websites. */
(function(){
'use strict';
const raw=document.getElementById('vz-design-data');
if(!raw)return;
let p;try{p=JSON.parse(raw.textContent||'{}')}catch{return}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=esc(p.name||'Studio concept'),category=esc(p.category||'Website');
const concept=document.getElementById('vz-concept'),stage=document.getElementById('vz-stage');
let bag=0,toastTimer=0,activeTab='All';
const strong=txt=>'<strong>'+esc(txt)+'</strong>';
function categoryType(){
 const s=(p.category+' '+p.description).toLowerCase();
 if(/motion & components|template collections|inspiration only/.test(s))return 'components';
 if(/project management|kanban|issues|tasks|sprints/.test(s))return 'board';
 if(/saas|dashboard|fintech|admin|analytics/.test(s))return 'dashboard';
 if(/grocery|food|delivery|restaurant/.test(s))return 'food';
 if(/ecommerce|shop|storefront|commerce|marketplace|b2b/.test(s))return 'commerce';
 if(/logistics|transport|cargo|courier/.test(s))return 'logistics';
 if(/portfolio|agenc|creative|studio|3d/.test(s))return 'portfolio';
 if(/publishing|blog|editorial|magazine/.test(s))return 'editorial';
 if(/travel|hospitality|hotel|tourism/.test(s))return 'travel';
 if(/real estate|property/.test(s))return 'estate';
 if(/education|learning|lms|course/.test(s))return 'education';
 if(/jobs|hiring|recruit/.test(s))return 'jobs';
 if(/community|nonprofit|forum/.test(s))return 'community';
 if(/healthcare|forms|medical/.test(s))return 'health';
 return 'portfolio';
}
const type=categoryType();
const conceptLabels={
 commerce:['CURATED / 2026','Objects with presence.','Thoughtful pieces for everyday living.','Explore the collection','The essentials'],
 food:['LOCAL DELIVERY / FRESH TODAY','Good things, delivered.','Fresh essentials, beautiful moments, all in one place.','Explore the menu','Made to order'],
 dashboard:['WORKSPACE / OVERVIEW','Everything in its place.','A calmer way to manage your day and see what matters.','Explore workspace','Your overview'],
 board:['TEAMS / PROJECTS','Better work, in motion.','Plan, focus and move your ideas forward together.','Explore board','Active initiatives'],
 portfolio:['INDEPENDENT / CREATIVE','An idea worth feeling.','Thoughtful digital stories, deliberately made to move.','Explore selected work','Selected projects'],
 editorial:['THE EDIT / VOL. 01','Stories worth slowing down for.','A place for fresh perspectives and considered ideas.','Read the journal','The latest issue'],
 travel:['DESTINATIONS / CURATED','Find somewhere extraordinary.','Go further, explore slowly, arrive inspired.','Discover places','Thoughtful escapes'],
 estate:['SPACES / NEW PERSPECTIVES','Find your next chapter.','A considered collection of places to live and belong.','Explore spaces','Featured spaces'],
 logistics:['LOGISTICS / CONNECTED','Every delivery matters.','A clearer way to move everything forward.','Explore services','Our network'],
 education:['LEARN / DISCOVER','Curiosity looks good on you.','Classes, people and ideas worth learning from.','Browse learning','Featured courses'],
 jobs:['FUTURES / OPPORTUNITY','Discover what comes next.','A better place to find your people and your purpose.','Explore roles','Open opportunities'],
 community:['PEOPLE / TOGETHER','Good things grow together.','A place to bring ideas, voices and people closer.','Join the community','Upcoming moments'],
 health:['CARE / EXPERIENCE','Make space for better.','Thoughtful experiences built around real people.','Explore our care','Our approach'],
 components:['MOTION / PLAYGROUND','Interaction is an art.','Explore kinetic systems, playful interfaces and thoughtful details.','Explore components','Motion experiments']
};
const copy=conceptLabels[type]||conceptLabels.portfolio;
const sample={
 commerce:['Form & Function','Daily Essentials','The Studio Edition','Designed Objects'],
 food:['Morning Market','Everyday Fresh','Kitchen Favourites','Local Picks'],
 portfolio:['Selected Identity','Material Studies','New Perspectives','Future Forms'],
 editorial:['A different perspective','Culture in motion','Designing for tomorrow','Space to think'],
 travel:['Slow Coast','Mountain House','The Blue Escape','Hidden Valleys'],
 estate:['The Atelier','Garden Residence','Light House','The Loft'],
 education:['Design Foundations','Learning by Doing','Creative Thinking','Digital Futures'],
 jobs:['Product Designer','Frontend Engineer','Creative Strategist','Operations Lead'],
 health:['Whole-person Care','Gentle Movement','Recovery & Rest','Everyday Wellness'],
 logistics:['Local Dispatch','Warehouse Network','Express Route','Global Connections'],
 community:['Open Studio','Gather & Create','Shared Ideas','The Community Lab']
};
const picks=sample[type]||sample.portfolio;
const tiles=(items,buttons=true)=>'<div class="c-cards">'+items.map((s,i)=>'<article class="c-tile"><div class="c-tile-art art-'+i+'"><div class="c-object c-obj-'+i+'"></div><span class="c-art-number">0'+(i+1)+'</span></div><div class="c-tile-meta"><div><span>COLLECTION / '+String(i+1).padStart(2,'0')+'</span><h3>'+esc(s)+'</h3><p>'+esc(type==='food'?'Made fresh, made for you.':'Designed to feel different.')+'</p></div>'+(buttons?'<button type="button" data-demo-add aria-label="Add '+esc(s)+' to demo bag">+</button>':'<span class="c-arrow">↗</span>')+'</div></article>').join('')+'</div>';
function nav(){
 return '<div class="c-nav"><a class="c-brand" href="/design/" aria-label="Back to the VELORYZ design library"><span class="c-brandmark">V.</span> VELORYZ <small>CREATIVE PREVIEW</small></a><div class="c-navlinks"><a href="#concept-intro">Home</a><a href="#concept-collection">Explore</a><a href="#concept-about">Studio</a></div><button class="c-icon-button" type="button" data-demo-bag>Bag <span data-bag-count>0</span></button><button class="c-menu" aria-expanded="false" data-demo-menu type="button">Menu ☰</button></div>';
}
function marketing(){
 let isMotion=type==='portfolio',isEcommerce=type==='commerce'||type==='food';
 return '<div class="c-site c-'+type+'">'+nav()+
 '<div class="c-hero" id="concept-intro"><div class="c-hero-text"><span class="c-kicker"><i></i>'+esc(copy[0])+'</span>'+
 '<h2>'+esc(copy[1])+'</h2><p>'+esc(copy[2])+'</p>'+
 '<div class="c-actions"><a href="#concept-collection">'+esc(copy[3])+' <span>↗</span></a><span class="c-micro">VELORYZ / DIGITAL EXPERIENCE</span></div></div>'+
 '<div class="c-hero-art" aria-hidden="true"><span class="c-hero-ring"></span><span class="c-hero-form"></span><span class="c-hero-label">DESIGN STUDY / 001</span><span class="c-hero-signal">↗</span></div></div>'+
 '<div class="c-marquee" aria-hidden="true"><div>MADE TO MOVE <span>✳</span> MADE WITH INTENTION <span>✳</span> VELORYZ CREATIVE STUDIO <span>✳</span> MADE TO MOVE <span>✳</span> MADE WITH INTENTION <span>✳</span></div></div>'+
 '<section class="c-section" id="concept-collection"><div class="c-section-heading"><span>01 / THE COLLECTION</span><div><h2>'+esc(copy[4])+'.</h2><p>An original responsive concept layout made for the VELORYZ design explorer. Demo elements illustrate interaction, not real stock or live accounts.</p></div></div>'+tiles(picks,isEcommerce)+
 '</section><section class="c-statement" id="concept-about"><span>02 / OUR APPROACH</span><h2>Made for possibility.<br><em>Made to feel something.</em></h2><a href="/create/?reference='+encodeURIComponent(p.id)+'">Create your own with VELORYZ ↗</a></section>'+
 '<footer class="c-foot"><strong>VELORYZ<span>.</span></strong><span>STUDIO CONCEPT / '+category+'</span><a href="/create/?reference='+encodeURIComponent(p.id)+'">Start a project ↗</a></footer></div>';
}
function dashboard(){
const board=type==='board';
return '<div class="c-app">'+
 '<aside class="c-app-side"><div class="c-app-brand">V<span>VELORYZ</span></div><span class="c-app-overline">WORKSPACE</span>'+
 '<button type="button" data-demo-view="Overview" class="on">◫ <span>Overview</span></button>'+
 '<button type="button" data-demo-view="Projects">▤ <span>Projects</span></button>'+
 '<button type="button" data-demo-view="Analytics">▥ <span>Analytics</span></button>'+
 '<button type="button" data-demo-view="Settings">⚙ <span>Settings</span></button>'+
 '<div class="c-app-side-bottom">✳ <span>STUDIO CONCEPT<br>BY VELORYZ</span></div></aside>'+
 '<main class="c-app-main"><header class="c-app-header"><div><span>MONDAY / WORKSPACE</span><h2 id="c-view-title">'+esc(board?'Projects & priorities':'Your overview')+'</h2></div><button type="button" data-demo-add-task>+ New task</button></header>'+
 '<section class="c-app-stats"><div><span>Active projects</span><b>08</b><small>↗ 12% this month</small></div><div><span>Tasks in progress</span><b>24</b><small>7 completed recently</small></div><div><span>Team focus</span><b>94<span>%</span></b><small>On track this week</small></div></section>'+
 '<div class="c-app-content"><div class="c-app-section-heading"><h3>'+esc(board?'Project board':'What needs your focus')+'</h3><div><button type="button" data-demo-filter="All" aria-pressed="true">All</button><button type="button" data-demo-filter="Priority" aria-pressed="false">Priority</button></div></div>'+
 '<div class="c-board">'+[['TO DO','Design directions','Research concepts','Prepare client brief'],['IN PROGRESS','Prototype screens','Build components','Test interactions'],['COMPLETED','Define scope','Review concept','Plan milestones']].map((lane,i)=>'<div class="c-lane"><div class="c-lane-title"><i class="c-lane-dot d'+i+'"></i>'+lane[0]+' <small>'+String(lane.length-1).padStart(2,'0')+'</small></div>'+lane.slice(1).map((x,j)=>'<button class="c-task" data-demo-task data-priority="'+(j===0?'true':'false')+'" type="button"><span class="c-task-flag">'+(j===0?'HIGH PRIORITY':'STUDIO TASK')+'</span><strong>'+x+'</strong><span class="c-task-bottom">◯ &nbsp; Open task <em>↗</em></span></button>').join('')+'</div>').join('')+'</div></div>'+
 '<div class="c-app-attribution">Interactive demonstration UI · No live data, clients, accounts or backend integrations</div></main></div>';
}
function components(){
const names=['Morphing text','Magnetic action','Ambient orbit','Interactive card','Motion timeline','Smooth transition'];
return '<div class="c-component-site">'+nav()+'<header><span class="c-kicker"><i></i> VELORYZ MOTION LAB / CREATIVE DEMOS</span><h2>Design that<br><em>moves with you.</em></h2><p>Original interactions built for the VELORYZ studio preview. Explore hover, focus and responsive transitions.</p></header>'+
 '<div class="c-component-grid">'+names.map((name,i)=>'<button class="c-component c-effect-'+i+'" type="button" data-demo-component="'+i+'"><span class="c-effect">✳</span><span><strong>'+name+'</strong><small>Interact to preview ↗</small></span></button>').join('')+'</div>'+
 '<div class="c-component-bottom"><span>ORIGINAL DEMO / '+category+'</span><a href="/create/?reference='+encodeURIComponent(p.id)+'">Create a motion-rich site ↗</a></div></div>';
}
function render(){
concept.innerHTML=type==='dashboard'||type==='board'?dashboard():type==='components'?components():marketing();
}
render();
document.addEventListener('click',function(e){
 const b=e.target.closest('[data-vz-device],[data-demo-add],[data-demo-bag],[data-demo-menu],[data-demo-view],[data-demo-filter],[data-demo-task],[data-demo-add-task],[data-demo-component]');
 if(!b)return;
 if(b.dataset.vzDevice){document.querySelectorAll('[data-vz-device]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stage.dataset.vzDevice=b.dataset.vzDevice;return}
 if(b.hasAttribute('data-demo-add')){bag++;document.querySelectorAll('[data-bag-count]').forEach(x=>x.textContent=String(bag));message('Added to the demo bag · No payment or purchase');return}
 if(b.hasAttribute('data-demo-bag')){message('Demo bag: '+bag+' item(s). This concept does not process payments.');return}
 if(b.hasAttribute('data-demo-menu')){const nav=b.closest('.c-nav'),open=nav.classList.toggle('open');b.setAttribute('aria-expanded',String(open));return}
 if(b.hasAttribute('data-demo-view')){document.querySelectorAll('[data-demo-view]').forEach(x=>x.classList.toggle('on',x===b));document.getElementById('c-view-title').textContent=b.dataset.demoView==='Overview'?'Your overview':b.dataset.demoView+' workspace';return}
 if(b.hasAttribute('data-demo-filter')){activeTab=b.dataset.demoFilter;document.querySelectorAll('[data-demo-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('.c-task').forEach(x=>x.hidden=activeTab==='Priority'&&x.dataset.priority!=='true');return}
 if(b.hasAttribute('data-demo-task')){b.classList.toggle('done');b.querySelector('.c-task-bottom').innerHTML=b.classList.contains('done')?'✓ &nbsp; Marked complete <em>↗</em>':'◯ &nbsp; Open task <em>↗</em>';return}
 if(b.hasAttribute('data-demo-add-task')){message('This is a front-end concept; task creation needs a project backend.');return}
 if(b.hasAttribute('data-demo-component')){b.classList.toggle('active');return}
});
function message(s){const el=document.getElementById('vz-toast');clearTimeout(toastTimer);el.textContent=s;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),3600)}
})();
