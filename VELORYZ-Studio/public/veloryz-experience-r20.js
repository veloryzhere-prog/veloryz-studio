/* VELORYZ / Public Experience R22
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

 // Idle prefetch only the highest-intent internal routes.
 const prefetch=()=>{
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(document.visibilityState!=='visible'||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType||''))return;
  ['/create/','/design/','/docs/','/contact/'].forEach(href=>{
   if(document.head.querySelector('link[rel=prefetch][href="'+href+'"]'))return;
   const link=document.createElement('link');link.rel='prefetch';link.href=href;document.head.append(link);
  });
 };
 if('requestIdleCallback'in window)requestIdleCallback(prefetch,{timeout:2400});
 else setTimeout(prefetch,1800);
})();
