/* VELORYZ / Public Experience R27
 * Public-route accessibility, progressive enhancement, local journey measurement and light performance work.
 */
(()=>{
 'use strict';
 const body=document.body;
 if(!body||body.dataset.vzR20==='1')return;
 body.dataset.vzR20='1';
 body.classList.add('vz-r20');

 const main=document.querySelector('main,#main');
 if(main&&!main.id)main.id='main-content';
 const target=main?.id||'main';
 if(!document.querySelector('.vz-r20-skip')){
  const skip=document.createElement('a');
  skip.className='vz-r20-skip';
  skip.href='#'+target;
  skip.textContent='Skip to main content';
  document.body.prepend(skip);
 }

 const status=document.createElement('div');
 status.className='vz-r21-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
 document.body.append(status);

 const normalRoute=()=>location.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/').replace(/\/+$/,'/')||'/';
 let route=normalRoute();
 const syncRoute=()=>{
  route=normalRoute();
  body.dataset.vzRoute=route;
  body.classList.toggle('vz-r20-assistant-route',route==='/help/assistant/'||route==='/support/');
  body.classList.toggle('vz-r20-docs-route',route==='/docs/'||route.startsWith('/docs/')||route.startsWith('/help/studio/'));
  requestAnimationFrame(()=>{
   const chat=document.querySelector('.vz-chat-page');
   if(chat&&!chat.querySelector('.vz-r20-assistant-context')){
    const note=document.createElement('p');
    note.className='vz-r20-assistant-context';
    note.textContent=route==='/support/'?'A focused support workspace for project questions, technical help and direct next steps. Human contact remains available at any time.':'A focused help workspace. Choose the assistant that matches what you need, browse documentation, or return to the main site at any time.';
    const actions=document.createElement('nav');
    actions.className='vz-r20-assistant-actions';
    actions.setAttribute('aria-label','Help and support shortcuts');
    actions.innerHTML=route==='/support/'
      ? '<a href="/contact/">Contact the team ↗</a><a href="/docs/">Browse documentation ↗</a><a href="/report-bug/">Report a bug ↗</a>'
      : '<a href="/docs/">Browse documentation ↗</a><a href="/support/">Contact Support AI ↗</a><a href="/contact/">Contact the team ↗</a>';
    note.after(actions);
    chat.querySelector('.vz-chat-page-head')?.after(note);
   }
  });
 };
 syncRoute();

 // R21 privacy-safe experience measurement. Events stay in this browser session and
 // are also exposed as DOM events for first-party tooling; nothing is sent remotely.
 const metricKey='vz:r21:experience';
 const emitMetric=(name,detail={})=>{
  const payload={name,route:normalRoute(),at:Date.now(),...detail};
  try{
   const current=JSON.parse(sessionStorage.getItem(metricKey)||'[]');
   current.push(payload);
   sessionStorage.setItem(metricKey,JSON.stringify(current.slice(-80)));
  }catch{}
  document.dispatchEvent(new CustomEvent('veloryz:experience-metric',{detail:payload}));
 };
 const classifyJourney=path=>path==='/'?'home':path.startsWith('/design')?'design':path.startsWith('/create')?'create':path.startsWith('/docs')?'docs':path.startsWith('/contact')?'contact':'other';
 document.addEventListener('click',event=>{
  const anchor=event.target.closest?.('a[href]');
  if(!anchor)return;
  try{
   const url=new URL(anchor.href,location.href);
   if(url.origin!==location.origin)return;
   const from=normalRoute(),to=url.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/').replace(/\/+$/,'/')||'/';
   const fromStep=classifyJourney(from),toStep=classifyJourney(to);
   if(fromStep!=='other'||toStep!=='other')emitMetric('journey_click',{from,to,fromStep,toStep,label:(anchor.textContent||'').trim().slice(0,80)});
  }catch{}
 },{capture:true});

 const observeVitals=()=>{
  if(!('PerformanceObserver'in window))return;
  const supported=PerformanceObserver.supportedEntryTypes||[];
  if(supported.includes('largest-contentful-paint')){
   try{new PerformanceObserver(list=>{const entries=list.getEntries();const last=entries.at(-1);if(last)emitMetric('web_vital',{metric:'LCP',value:Math.round(last.startTime)})}).observe({type:'largest-contentful-paint',buffered:true})}catch{}
  }
  if(supported.includes('layout-shift')){
   let cls=0;
   try{new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)cls+=entry.value;emitMetric('web_vital',{metric:'CLS',value:Number(cls.toFixed(4))})}).observe({type:'layout-shift',buffered:true})}catch{}
  }
  if(supported.includes('event')){
   let inp=0;
   try{new PerformanceObserver(list=>{for(const entry of list.getEntries())if(entry.interactionId&&entry.duration>inp)inp=entry.duration;if(inp)emitMetric('web_vital',{metric:'INP',value:Math.round(inp)})}).observe({type:'event',durationThreshold:40})}catch{}
  }
  const nav=performance.getEntriesByType?.('navigation')?.[0];
  if(nav)emitMetric('navigation_timing',{ttfb:Math.round(nav.responseStart),domInteractive:Math.round(nav.domInteractive),load:Math.round(nav.loadEventEnd||0)});
 };
 if(document.readyState==='complete')observeVitals();else addEventListener('load',observeVitals,{once:true});

 let frame=0;
 let lastDepth=0;
 const depthSteps=[25,50,75,90];
 const syncScroll=()=>{
  frame=0;
  body.classList.toggle('vz-r20-scrolled',scrollY>18);
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const depth=Math.min(100,Math.round(scrollY/max*100));
  body.classList.toggle('vz-r22-depth-50',depth>=50);
  for(const step of depthSteps){
   if(depth>=step&&lastDepth<step)emitMetric('scroll_depth',{depth:step});
  }
  lastDepth=Math.max(lastDepth,depth);
 };
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(syncScroll)},{passive:true});
 addEventListener('pageshow',syncScroll);
 syncScroll();

 // Homepage section awareness: keep the fixed navigation useful as the page moves.
 const initHomeSectionNav=()=>{
  if(!body.classList.contains('vz-reference-site')||!('IntersectionObserver'in window))return;
  const links=[...document.querySelectorAll('.vz-home-primary-links a[href^="#"]')];
  if(!links.length)return;
  const targets=links.map(link=>({link,id:link.getAttribute('href').slice(1)}))
   .map(item=>({...item,section:document.getElementById(item.id)})).filter(item=>item.section);
  if(!targets.length)return;
  const activate=id=>{
   for(const item of targets){
    if(item.id===id)item.link.setAttribute('aria-current','location');
    else item.link.removeAttribute('aria-current');
   }
  };
  const sectionObserver=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
   if(visible)activate(visible.target.id);
  },{rootMargin:'-22% 0px -58% 0px',threshold:[.08,.2,.45]});
  targets.forEach(item=>sectionObserver.observe(item.section));
 };
 requestAnimationFrame(initHomeSectionNav);

 // Home 3D: keep four useful controls visible, move secondary controls behind one disclosure.
 const controls=document.querySelector('.vz-reference-site .vz-3d-controls');
 if(controls&&!controls.querySelector('[data-vz-r20-3d-more]')){
  const buttonBox=controls.querySelector('.vz-3d-control-buttons');
  const advanced=['continue','left','right','front'];
  advanced.forEach(action=>buttonBox?.querySelector('[data-logo-action="'+action+'"]')?.setAttribute('data-vz-r20-advanced',''));
  const more=document.createElement('button');
  more.type='button';more.className='vz-3d-more';more.dataset.vzR203dMore='';
  more.setAttribute('aria-expanded','false');more.textContent='More controls +';
  buttonBox?.append(more);
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-vz-r20-3d-more]');
  if(!button)return;
  const panel=button.closest('.vz-3d-controls');
  const open=panel.classList.toggle('is-expanded');
  button.setAttribute('aria-expanded',String(open));
  button.textContent=open?'Fewer controls −':'More controls +';
 });

 // Improve current-route semantics for public SPA links and home fixed links.
 document.querySelectorAll('a[href]').forEach(a=>{
  try{
   const url=new URL(a.href,location.href);
   if(url.origin!==location.origin)return;
   const p=url.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/').replace(/\/+$/,'/')||'/';
   if(p===route&&!url.hash)a.setAttribute('aria-current','page');
  }catch{}
 });

 // Progressive image defaults below the critical first viewport.
 const markImages=()=>{
  const cutoff=innerHeight*1.15;
  document.querySelectorAll('img:not([loading])').forEach(img=>{
   const rect=img.getBoundingClientRect();
   if(rect.top>cutoff){img.loading='lazy';img.decoding='async';}
  });
 };
 requestAnimationFrame(markImages);
 addEventListener('studio:route',()=>{
  lastDepth=0;
  syncRoute();
  requestAnimationFrame(()=>{
   markImages();
   document.querySelector('#main')?.setAttribute('aria-live','off');
   status.textContent=(document.title.split(' — ')[0]||'Page')+' loaded';
   emitMetric('route_view',{title:document.title});
  });
 });

 // R24: mirror visible Creator selection state into accessible button state.
 const syncChoiceStates=()=>{
  document.querySelectorAll('button.v4-choice').forEach(choice=>{
   choice.setAttribute('aria-pressed',String(choice.classList.contains('is-selected')));
  });
 };
 const queueChoiceSync=()=>requestAnimationFrame(syncChoiceStates);
 queueChoiceSync();
 document.addEventListener('click',event=>{
  if(event.target.closest?.('.v4-choice'))queueChoiceSync();
 },{capture:true});
 addEventListener('studio:route',queueChoiceSync);

 // R24: slash focuses the active Docs/Design search without stealing typing from forms.
 document.addEventListener('keydown',event=>{
  const active=event.target;
  const editing=active?.matches?.('input,textarea,select,[contenteditable=true]');
  if(event.key==='/'&&!editing&&!event.metaKey&&!event.ctrlKey&&!event.altKey){
   const search=document.querySelector('[data-kb-search],#docs-search,[data-source-search]');
   if(search){
    event.preventDefault();
    search.focus({preventScroll:false});
    status.textContent='Search focused';
   }
  }else if(event.key==='Escape'&&active?.matches?.('[data-kb-search],#docs-search,[data-source-search]')){
   active.blur();
   status.textContent='Search closed';
  }
 });

 // R25: subtle route-pending feedback for same-origin SPA navigation.
 const beginRoutePending=anchor=>{
  if(!anchor)return;
  let url;
  try{url=new URL(anchor.href,location.href)}catch{return}
  if(url.origin!==location.origin||url.hash&&url.pathname===location.pathname)return;
  body.classList.add('vz-r25-route-pending');
  status.textContent='Opening '+((anchor.textContent||'page').trim().slice(0,60)||'page');
 };
 document.addEventListener('click',event=>{
  const anchor=event.target.closest?.('a[href]');
  if(anchor&&!event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey)beginRoutePending(anchor);
 },{capture:true});
 addEventListener('pageshow',()=>body.classList.remove('vz-r25-route-pending'));
 addEventListener('studio:route',()=>body.classList.remove('vz-r25-route-pending'));

 // R25: one-time reveal for meaningful public sections, not every small element.
 const initSectionReveals=()=>{
  const selectors=['.docs-r20-start','.vz-r9-featured','.vz-source-collection','.vz-need-help','.vz-footer-help','.service-grid','.project-grid','.process-grid','.pricing-grid'];
  const sections=[...document.querySelectorAll(selectors.join(','))];
  sections.forEach(section=>section.classList.add('vz-r25-reveal'));
  if(!sections.length)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){
   sections.forEach(section=>section.classList.add('is-visible'));return;
  }
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
   });
  },{rootMargin:'0px 0px -10% 0px',threshold:.08});
  sections.forEach(section=>observer.observe(section));
 };
 requestAnimationFrame(initSectionReveals);
 addEventListener('studio:route',()=>requestAnimationFrame(initSectionReveals));

 // R25: synchronize body scroll-lock with the mobile menu's actual expanded state.
 const syncMenuState=()=>{
  const trigger=document.querySelector('#mb,.menu-toggle');
  const expanded=trigger?.getAttribute('aria-expanded')==='true';
  body.classList.toggle('vz-r25-menu-open',expanded);
 };
 const menuTrigger=document.querySelector('#mb,.menu-toggle');
 if(menuTrigger&&'MutationObserver'in window){
  new MutationObserver(syncMenuState).observe(menuTrigger,{attributes:true,attributeFilter:['aria-expanded']});
  syncMenuState();
 }
 addEventListener('studio:route',()=>body.classList.remove('vz-r25-menu-open'));

 // R26: reference-inspired context motion without another scroll engine.
 const initR26SpatialSystem=()=>{
  if(!body.classList.contains('vz-reference-site'))return;
  const alreadyBound=body.dataset.vzR26Spatial==='1';

  // Add small editorial indices to the existing scenes rather than duplicating headings.
  const sceneLabels=[
   ['.stmt','02 / POSITION'],
   ['.hz .head','03 / CAPABILITIES'],
   ['.lib .top','04 / SELECTED DESIGN'],
   ['.pr .wrap','05 / PROCESS'],
   ['.cta .stick','06 / START']
  ];
  for(const [selector,label] of sceneLabels){
   const host=document.querySelector(selector);
   if(!host||host.querySelector('.vz-r26-section-index'))continue;
   const marker=document.createElement('span');
   marker.className='vz-r26-section-index';
   marker.textContent=label;
   host.prepend(marker);
  }

  // The native CSS scroll timelines carry the visual motion. JS only provides
  // low-cost direction/velocity context to the fixed navigation.
  if(alreadyBound)return;
  body.dataset.vzR26Spatial='1';
  let previousY=scrollY,previousTime=performance.now(),cooldown=0;
  const syncVelocity=now=>{
   cooldown=0;
   const dt=Math.max(16,now-previousTime);
   const dy=scrollY-previousY;
   const velocity=Math.abs(dy/dt);
   body.classList.toggle('vz-r26-fast-scroll',velocity>.95);
   body.classList.toggle('vz-r26-scroll-up',dy<-1);
   body.classList.toggle('vz-r26-scroll-down',dy>1);
   previousY=scrollY;previousTime=now;
  };
  addEventListener('scroll',()=>{
   if(!cooldown)cooldown=requestAnimationFrame(syncVelocity);
  },{passive:true});
 };
 requestAnimationFrame(initR26SpatialSystem);
 addEventListener('studio:route',()=>requestAnimationFrame(initR26SpatialSystem));

 // R27: chapter-based scene navigation for the reference homepage.
 const initR27Chapters=()=>{
  if(!body.classList.contains('vz-reference-site'))return;
  const chapters=[
   ['#tp','01','Intro'],
   ['.stmt','02','Position'],
   ['#hzs','03','Capabilities'],
   ['#libs','04','Design'],
   ['.pr','05','Process'],
   ['.cta','06','Start']
  ].map(([selector,no,label])=>({selector,no,label,node:document.querySelector(selector)})).filter(item=>item.node);
  if(!chapters.length)return;

  chapters.forEach(item=>item.node.classList.add('vz-r27-scene'));
  let rail=document.querySelector('.vz-r27-chapter-rail');
  if(!rail){
   rail=document.createElement('div');
   rail.className='vz-r27-chapter-rail';
   rail.setAttribute('aria-hidden','true');
   rail.innerHTML=chapters.map(item=>'<span data-r27-chapter="'+item.no+'"><i></i><b>'+item.no+' '+item.label+'</b></span>').join('');
   document.body.append(rail);
  }

  if(body.dataset.vzR27Chapters==='1')return;
  body.dataset.vzR27Chapters='1';
  if(!('IntersectionObserver'in window))return;

  const activate=no=>{
   rail.querySelectorAll('[data-r27-chapter]').forEach(el=>el.classList.toggle('is-active',el.dataset.r27Chapter===no));
   body.dataset.vzR27Chapter=no;
  };
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>{
    const ac=Math.abs((a.boundingClientRect.top+a.boundingClientRect.height/2)-innerHeight/2);
    const bc=Math.abs((b.boundingClientRect.top+b.boundingClientRect.height/2)-innerHeight/2);
    return ac-bc;
   })[0];
   if(!visible)return;
   const item=chapters.find(chapter=>chapter.node===visible.target);
   if(item)activate(item.no);
  },{rootMargin:'-18% 0px -38% 0px',threshold:[.08,.2,.45]});
  chapters.forEach(item=>observer.observe(item.node));
  activate(chapters[0].no);
 };
 requestAnimationFrame(initR27Chapters);
 addEventListener('studio:route',()=>requestAnimationFrame(initR27Chapters));

 // Idle + intent prefetch for high-value same-origin destinations.
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const canPrefetch=()=>document.visibilityState==='visible'&&!connection?.saveData&&!/^(slow-)?2g$/.test(connection?.effectiveType||'');
 const prefetchHref=href=>{
  if(!canPrefetch()||!href)return;
  let url;
  try{url=new URL(href,location.href)}catch{return}
  if(url.origin!==location.origin)return;
  const path=url.pathname.replace(/\/+$/,'/')||'/';
  if(!['/create/','/design/','/docs/','/contact/','/pricing/','/work/'].includes(path))return;
  if(document.head.querySelector('link[rel=prefetch][href="'+path+'"]'))return;
  const link=document.createElement('link');link.rel='prefetch';link.href=path;document.head.append(link);
 };
 const prefetch=()=>['/create/','/design/','/docs/','/contact/'].forEach(prefetchHref);
 document.addEventListener('pointerover',event=>prefetchHref(event.target.closest?.('a[href]')?.getAttribute('href')),{passive:true});
 document.addEventListener('focusin',event=>prefetchHref(event.target.closest?.('a[href]')?.getAttribute('href')));
 if('requestIdleCallback'in window)requestIdleCallback(prefetch,{timeout:2400});
 else setTimeout(prefetch,1800);
})();
