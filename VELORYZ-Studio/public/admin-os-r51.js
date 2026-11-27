/* Studio OS 4.0 — private presentation and navigation only. */
(()=>{
'use strict';
const groups=[
 {id:'home',label:'Home',routes:['overview','action-inbox','command']},
 {id:'business',label:'Business',routes:['enquiries','submission-center','client-portal','project-operations','payments']},
 {id:'creative',label:'Creative',routes:['projects','content','catalogue','media','branding','platform']},
 {id:'growth',label:'Growth',routes:['offers','reviews']},
 {id:'intelligence',label:'Intelligence',routes:['ai-control','knowledge-ai','ai-mindset']},
 {id:'knowledge',label:'Knowledge',routes:['documentation']},
 {id:'systems',label:'Systems',routes:['health','history','settings']}
];
const names={command:'Site controls',enquiries:'Enquiries & CRM','client-portal':'Client rooms','project-operations':'Project operations','submission-center':'Submission intelligence',payments:'Finance',projects:'Portfolio projects',content:'Website CMS',catalogue:'Design marketplace',branding:'Brand system',platform:'Platform pages',offers:'Campaigns',reviews:'Community', 'ai-control':'AI Intelligence','knowledge-ai':'Assistant profiles','ai-mindset':'Adviser briefs',health:'Infrastructure Flightdeck',history:'Releases & history',settings:'Settings'};
const draftRoutes=new Set(['command','projects','content','catalogue','platform','offers','branding','history','settings','ai-mindset']);
const mode=(route,tab)=>draftRoutes.has(route)||(route==='ai-control'&&tab==='personas')?'draft':route==='overview'?'overview':'immediate';
const groupFor=route=>groups.find(g=>g.routes.includes(route))||groups[0];
const title=(route,navigation)=>names[route]||navigation.find(n=>n[0]===route)?.[1]||'Overview';
let compact=false;
try{compact=localStorage.getItem('veloryz.admin.rail.r51')==='1';}catch{}
function sidebar(route,navigation,workspace,icon,E,counts={}){
 const map=new Map(navigation.map(n=>[n[0],n]));
 const sections=groups.map(g=>'<section class="ad-nav-group os-nav-group" data-ad-nav-group><div class="ad-nav-group-label">'+E(g.label)+'</div><nav class="admin-nav" aria-label="'+E(g.label)+'">'+g.routes.filter(id=>map.has(id)).map(id=>{
 const active=id===route,label=title(id,navigation),ico=map.get(id)[2],n=id==='enquiries'&&counts.enquiriesLoaded?counts.enquiryTotal:id==='reviews'&&counts.reviewsLoaded?counts.pendingReviewCount:id==='client-portal'&&counts.clientsLoaded?counts.clientCount:null;
 return '<a data-ad-nav-item data-ad-search="'+E(label+' '+id+' '+map.get(id)[1])+'" href="#/'+E(id)+'" title="'+E(label)+'" aria-label="'+E(label)+'" class="'+(active?'active':'')+'" '+(active?'aria-current="page"':'')+'>'+icon(ico)+'<span class="ad-nav-link-text">'+E(label)+'</span>'+(n!==null&&n!==undefined?'<span class="nav-count">'+E(String(n))+'</span>':'')+'</a>';
 }).join('')+'</nav></section>').join('');
 return '<aside id="os-sidebar" class="sidebar ad-sidebar os-sidebar" aria-label="Studio administration"><div class="os-brand-row"><a class="admin-brand os-brand" href="#/overview" aria-label="VELORYZ Studio OS home"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" alt="VELORYZ"><span>Studio OS 4.0</span></a><button class="os-rail-toggle" data-os-rail type="button" title="Toggle compact sidebar" aria-label="Toggle compact sidebar" aria-pressed="'+compact+'">‹</button><button class="os-mobile-close" type="button" data-action="close-menu" aria-label="Close navigation">×</button></div><button class="os-side-search" type="button" data-action="nav-search" aria-label="Search administration consoles">'+icon('search')+'<span>Find a console</span><kbd>Ctrl K</kbd></button><div class="ad-side-scroll">'+sections+'</div><div class="sidebar-bottom os-sidebar-bottom"><a class="os-revision" href="#/history"><span class="os-revision-dot"></span><span>Public revision <strong>v'+E(String(workspace.publishedVersion??'—'))+'</strong></span></a><div class="sidebar-user"><span class="avatar" aria-hidden="true">V</span><div><strong>Studio owner</strong><span>Private workspace</span></div><button class="icon-button" data-platform="lock" aria-label="Lock workspace and sign out">'+icon('logout')+'</button></div></div></aside><div class="admin-mobile-overlay" data-action="close-menu"></div>';
}
function topbar(route,navigation,workspace,icon,E,tab){
 const kind=mode(route,tab),dirty=workspace.dirty,has=workspace.hasDraft;
 const status=dirty?'Unsaved website edits':has?'Saved website draft':'Website published';
 const publishActions='<a class="admin-button secondary" href="/admin/preview" target="_blank" rel="noopener">'+icon('eye')+'<span>Saved preview</span></a><button class="admin-button secondary" data-action="save">'+icon('save')+'<span>Save draft</span></button><button class="admin-button" data-action="publish">'+icon('publish')+'<span>Publish site</span></button>';
 return '<header class="admin-topbar os-topbar"><div class="breadcrumbs"><button type="button" class="mobile-admin-menu" data-action="menu" aria-controls="os-sidebar" aria-expanded="false" aria-label="Open admin menu">'+icon('menu')+'</button><span class="workspace-label">'+E(groupFor(route).label)+'</span><span class="os-crumb-slash" aria-hidden="true">/</span><strong>'+E(title(route,navigation))+'</strong></div><div class="topbar-actions"><button type="button" class="ad-search-trigger" data-action="nav-search" aria-label="Search admin consoles (Control K)">'+icon('search')+'<span>Search</span><kbd>Ctrl K</kbd></button><a class="os-health-link" href="#/health" aria-label="System diagnostics">'+icon('info')+'<span>Health</span></a><span id="workspace-status" class="status-label '+(dirty?'unsaved':'')+'" role="status" '+(kind==='draft'?'':'hidden')+'>'+E(status)+'</span>'+(kind==='draft'?publishActions:'<a class="os-release-link" href="#/history">'+(dirty?'Unsaved website edits':has?'Website draft pending':'Publishing & history')+' ↗</a>')+'</div></header>';
}
function context(route,tab){const kind=mode(route,tab);return '<div class="os-context"><span class="os-context-tag">'+(kind==='draft'?'Website draft':kind==='immediate'?'Operational console':'Workspace overview')+'</span><span>'+(kind==='draft'?'Website changes become public only after publishing. Separate service forms save independently.':kind==='immediate'?'Use the controls inside this console. Website publishing is separate.':'Open a console to manage real studio records and website content.')+'</span></div>';}
function mobile(open){
 const sidebar=document.getElementById('os-sidebar'),trigger=document.querySelector('.mobile-admin-menu'),main=document.querySelector('.admin-main');
 if(!sidebar)return;
 const small=window.matchMedia('(max-width: 850px)').matches;
 const active=!!open&&small;
 sidebar.classList.toggle('open',active);
 sidebar.inert=small&&!active;
 trigger?.setAttribute('aria-expanded',String(active));
 if(main)main.inert=active;const skip=document.querySelector('.os-skip');if(skip)skip.inert=active;
 if(active)sidebar.querySelector('.os-mobile-close')?.focus();
 else if(open===false&&small&&trigger?.isConnected)trigger.focus({preventScroll:true});
}
function mount(){const layout=document.querySelector('.os-layout');if(!layout)return;layout.classList.toggle('os-compact',compact);const sidebar=document.getElementById('os-sidebar');if(sidebar){sidebar.inert=window.matchMedia('(max-width: 850px)').matches&&!sidebar.classList.contains('open');}}
document.addEventListener('click',e=>{const skip=e.target.closest?.('.os-skip');if(skip){e.preventDefault();document.getElementById('admin-content')?.focus();return;}const b=e.target.closest?.('[data-os-rail]');if(!b)return;compact=!compact;try{localStorage.setItem('veloryz.admin.rail.r51',compact?'1':'0');}catch{}b.setAttribute('aria-pressed',String(compact));mount();});
window.addEventListener('resize',()=>{const layout=document.querySelector('.os-layout');if(!layout)return;if(!window.matchMedia('(max-width: 850px)').matches){document.querySelector('.os-sidebar')?.classList.remove('open');const main=document.querySelector('.admin-main');if(main)main.inert=false;const skip=document.querySelector('.os-skip');if(skip)skip.inert=false;document.querySelector('.mobile-admin-menu')?.setAttribute('aria-expanded','false');}mount();});
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!document.querySelector('.os-sidebar.open'))return;const list=[...document.querySelectorAll('.os-sidebar.open a[href],.os-sidebar.open button:not([disabled])')].filter(x=>x.getClientRects().length);if(!list.length)return;const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
window.VeloryzStudioOS={groups,mode,title,sidebar,topbar,context,mount,mobile};
})();
