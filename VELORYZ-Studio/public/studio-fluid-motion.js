'use strict';
/**
 * VELORYZ fluid micro-motion. Short one-time entrance animations for elements
 * without existing reveal effects; no scroll polling and no heavy transitions.
 * Native scrolling, creator state, sculptures and brand artwork remain untouched.
 */
(()=>{
 const root=document.documentElement;
 const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const coarse=window.matchMedia?.('(pointer: coarse)');
 const narrow=window.matchMedia?.('(max-width: 750px)');
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const lowPower=()=>Boolean(connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2));
 const eligible=()=>!motion?.matches&&!lowPower()&&window.StudioMotion?.level!=='paused'&&window.StudioMotion?.level!=='reduced'&&!document.hidden;
 const selector=[
  '.vz-footer-help',
  '.footer-directory .footer-dir-group',
  '.work-full .filter-bar',
  '.contact-layout .form-panel',
  '.kb-v4 .kb-help-contact',
  '.kb-v4 .kb-help-chat-cta',
  '.vz-chat-page-head',
  '.v4-root .v4-top-actions',
  '.hero-meta'
 ].join(',');
 let observer=null,lastScene=new Set(),queued=false;
 const updateCapability=()=>{
  const level=lowPower()?'lite':narrow?.matches?'compact':coarse?.matches?'touch':'desktop';
  if(root.dataset.vzCapability!==level)root.dataset.vzCapability=level;
 };
 function enter(element){
  if(lastScene.has(element)||!element.isConnected)return;
  lastScene.add(element);
  if(!eligible()||typeof element.animate!=='function')return;
  const touch=coarse?.matches||narrow?.matches;
  const duration=touch?320:500;
  const shift=touch?9:16;
  // Transform + opacity are composited; no layout, filters or box-shadow animation.
  element.animate([
   {transform:'translate3d(0,'+shift+'px,0)',opacity:.88},
   {transform:'translate3d(0,0,0)',opacity:1}
  ],{duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'none'});
 }
 function mount(){
  updateCapability();
  observer?.disconnect();
  if(typeof IntersectionObserver!=='function'||!eligible()){
   document.querySelectorAll(selector).forEach(element=>lastScene.add(element));
   return;
  }
  observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    observer.unobserve(entry.target);
    enter(entry.target);
   }
  },{rootMargin:'0px 0px -6% 0px',threshold:.05});
  document.querySelectorAll(selector).forEach(el=>{
   if(!lastScene.has(el))observer.observe(el);
  });
  // Old SPA nodes are discarded on navigation. Avoid retaining entire pages.
  for(const node of lastScene)if(!node.isConnected)lastScene.delete(node);
 }
 const schedule=()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;mount()});
 };
 document.addEventListener('studio:route',schedule);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){observer?.disconnect()}else schedule();
 });
 window.StudioMotion?.addEventListener('change',schedule);
 narrow?.addEventListener?.('change',schedule);
 coarse?.addEventListener?.('change',schedule);
 motion?.addEventListener?.('change',schedule);
 connection?.addEventListener?.('change',schedule);
 window.addEventListener('pageshow',schedule);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
 else schedule();
})();
