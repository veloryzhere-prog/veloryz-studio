/* Same reference menu on all existing functional routes, without changing their application workflows. */
(()=>{
'use strict';
if(document.body.classList.contains('vz-reference-site'))return;
const menuLinks=[
 ['Home','/'],['Services','/#services'],['Work','/#work'],['Design','/design/'],
 ['Process','/#process'],['Pricing','/#pricing'],['Studio','/#studio'],
 ['Reviews','/#reviews'],['Contact','/#contact'],['Create project','/create/'],
 ['Client portal','/client/'],['Documentation','/docs/'],['Help AI','/help/assistant/'],['Report a Bug','/report-bug/']
];
const docsLinks=[
 ['Documentation home','/docs/'],['Getting started','/help/studio/getting-started.html'],
 ['Create a project','/help/studio/create-project.html'],['Design system','/docs/studio/design/overview.html'],
 ['Motion & animation','/docs/studio/motion/overview.html'],['Responsive layouts','/docs/studio/design/responsive-troubleshooting.html'],
 ['Client workflow','/docs/studio/workspace/projects.html'],['Help Centre','/help/studio/index.html'],
 ['Troubleshooting','/help/studio/troubleshooting.html'],['Contact support','/support/']
];
const root=document.createElement('div');root.id='vz-shared-chrome';root.className='vz-shared-chrome';
const brand=document.createElement('a');brand.className='vz-shared-brand';brand.href='/';brand.setAttribute('aria-label','VELORYZ Studio homepage');
const logo=document.createElement('img');logo.src='/assets/brand/veloryz-mark.svg';logo.alt='';logo.width=30;logo.height=30;
const word=document.createElement('span');word.textContent='VELORYZ';brand.append(logo,word);
const quick=document.createElement('a');quick.className='vz-shared-quick-create';quick.href='/create/';quick.textContent='Quick Create ↗';quick.setAttribute('aria-label','Quick create a project');
const trigger=document.createElement('button');trigger.type='button';trigger.id='vz-shared-menu-toggle';trigger.className='vz-shared-menu-toggle';trigger.textContent='Menu';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','vz-shared-menu');
const menu=document.createElement('nav');menu.id='vz-shared-menu';menu.className='vz-shared-menu';menu.setAttribute('aria-label','Primary VELORYZ navigation');menu.setAttribute('aria-hidden','true');
for(const [name,link] of menuLinks){
 const a=document.createElement('a');a.href=link;a.textContent=name;
 if((link==='/create/'&&location.pathname.startsWith('/create'))||(link==='/client/'&&location.pathname.startsWith('/client')))a.setAttribute('aria-current','page');
 menu.append(a);
}
const curtain=document.createElement('div');curtain.className='vz-shared-curtain';curtain.setAttribute('aria-hidden','true');
/* Never mount a second Create button on the actual project creator or design
   pages. It must not exist in the document, not merely be hidden by CSS. */
const quickCreateExcluded=()=>/^\/(?:create|design|designs)(?:\/|$)/.test(location.pathname);
root.append(brand,trigger,menu,curtain);document.body.append(root);
const syncQuickCreate=()=>{
 if(quickCreateExcluded()){quick.remove();return;}
 if(!quick.isConnected)root.insertBefore(quick,trigger);
};
syncQuickCreate();
document.addEventListener('studio:route',syncQuickCreate);
let last=null;
const isOpen=()=>root.classList.contains('is-open');
const setOpen=open=>{
 root.classList.toggle('is-open',open);quick.setAttribute('aria-hidden',String(open));quick.tabIndex=open?-1:0;trigger.setAttribute('aria-expanded',String(open));trigger.textContent=open?'Close':'Menu';menu.setAttribute('aria-hidden',String(!open));
 document.body.classList.toggle('vz-shared-menu-open',open);
 if(open){last=document.activeElement;menu.querySelector('a')?.focus({preventScroll:true});}
 else if(last){const prev=last;last=null;(prev.isConnected?prev:trigger).focus({preventScroll:true});}
};
trigger.addEventListener('click',()=>setOpen(!isOpen()));
document.addEventListener('keydown',e=>{
 if(!isOpen())return;
 if(e.key==='Escape'){e.preventDefault();setOpen(false);return;}
 if(e.key!=='Tab')return;
 const focus=[...menu.querySelectorAll('a')];
 const first=focus[0],end=focus[focus.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}
 else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}
});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
menu.addEventListener('click',e=>{
 const link=e.target.closest('a');if(!link||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 if(link.origin!==location.origin)return;
 e.preventDefault();e.stopPropagation();root.classList.add('is-routing');
 const path=link.href;
 setTimeout(()=>location.assign(path),reduced.matches?0:390);
});
/* Public docs at the bottom, with the same staggered editorial-card hover/reveal. */
const wrap=document.createElement('section');wrap.className='vz-shared-guides';wrap.id='vz-shared-guides';
wrap.setAttribute('aria-labelledby','vz-shared-guides-title');
const head=document.createElement('div');head.className='vz-shared-guides-head';
const kicker=document.createElement('p');kicker.className='vz-shared-kicker';kicker.textContent='Knowledge / documentation';
const title=document.createElement('h2');title.id='vz-shared-guides-title';title.textContent='Learn. Explore. Build.';
const desc=document.createElement('p');desc.textContent='Official guides, motion notes, project workflows and support—ready whenever you need them.';
head.append(kicker,title,desc);wrap.append(head);
const cards=document.createElement('div');cards.className='vz-shared-guides-grid';
for(const [name,path] of docsLinks){
 const link=document.createElement('a');link.className='vz-shared-guide-card';link.href=path;
 const h=document.createElement('strong');h.textContent=name;
 const a=document.createElement('span');a.textContent='↗';a.setAttribute('aria-hidden','true');link.append(h,a);
 cards.append(link);
}
wrap.append(cards);
const end=document.createElement('p');end.className='vz-shared-guides-end';end.textContent='VELORYZ / CREATIVE × TECHNOLOGY × EXPERIENCE';wrap.append(end);
const attachDocs=()=>{
 // Documentation UI was already approved. Never inject an extra layout into it.
 if(/^\/(?:docs|help\/studio|help\/assistant|support)(?:\/|$)/.test(location.pathname)){wrap.remove();return;}
 if(wrap.isConnected)return;
 if(document.querySelector('#v4-question-body')&&!document.querySelector('#v4-question-body .v4-success'))return;
 const footer=document.querySelector('#footer')||document.querySelector('.cp-footer');
 if(footer?.parentNode)footer.parentNode.insertBefore(wrap,footer);
 else if(document.querySelector('.v4-root'))document.querySelector('.v4-root').after(wrap);
};
const observeDocLinks=()=>{
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}}
 },{threshold:.08,rootMargin:'0px 0px -15px 0px'});
 cards.querySelectorAll('.vz-shared-guide-card').forEach(x=>io.observe(x));
};
attachDocs();document.addEventListener('studio:route',attachDocs);
document.addEventListener('veloryz:creator-render',attachDocs);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachDocs,{once:true});
observeDocLinks();
/* Maintain reference cursor and editorial art direction on the real public routes.
   The original site header, AI launcher, privacy footer and motion engine remain the source. */
const refreshRoute=()=>{
 const active=/^\/(?:work|design|designs|services|studio|pricing|process|contact|book|journey|motion|veloryz|velori|teamjob|payments|developers|report-bug)(?:\/|$)/.test(location.pathname);
 document.body.classList.toggle('vz-ref-public-route',active);
};
refreshRoute();document.addEventListener('studio:route',refreshRoute);
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 const dot=document.createElement('div');dot.className='vz-ref-cross-cursor';dot.setAttribute('aria-hidden','true');document.body.append(dot);
 let frame=0,x=0,y=0,grow=false;
 const render=()=>{
  frame=0;dot.style.transform='translate3d('+x+'px,'+y+'px,0) translate(-50%,-50%) scale('+(grow?3.9:1)+')';
  dot.style.opacity=document.body.classList.contains('vz-ref-public-route')&&window.StudioMotion?.level!=='reduced'&&window.StudioMotion?.level!=='paused'?'1':'0';
 };
 document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  x=e.clientX;y=e.clientY;grow=Boolean(e.target.closest('a,button,[role="button"]'));
  if(!frame)frame=requestAnimationFrame(render);
 },{passive:true});
 document.addEventListener('pointerleave',()=>dot.style.opacity='0');
}
})();
