'use strict';
/**
 * VELORYZ / Fluid Scroll
 * Lenis v1.3.27 (self-hosted) for desktop wheel input only.
 * Phones/tablets retain native touch inertia; no scroll-jacking of chat,
 * forms, dialogs, docs sidebars or project creation.
 *
 * Native-feeling Lenis input: lerp 0.23 on regular pages, direct 1 inside the cinematic scene:
 * no artificially slow, multi-second trailing scroll or acceleration.
 */
(()=>{
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse=matchMedia('(pointer: coarse)');
 const narrow=matchMedia('(max-width: 900px)');
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const lowPower=()=>Boolean(connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2));
 let lenis=null,resizeFrame=0,cinematic=false;
 const defaultLerp=.23;
 const applyCinematic=()=>{if(lenis)lenis.options.lerp=cinematic?1:defaultLerp;};
 const selectors=[
  'dialog',
  '.modal-backdrop',
  '.modal',
  '.vz-ext-cart-dialog',
  '.vz-ext-dialog',
  '.vz-ext-frame-wrap',
  '.mobile-nav',
  '.vz-chat-log',
  '.vz-chat-side',
  '.kb-service-toc',
  '.kb-search-results',
  '.kb-command-results',
  '.docs-sidebar',
  '.studio-docs-sidebar',
  '.studio-docs-toc',
  '.v4-ai-messages',
  '.v4-steps',
  '.v4-step-nav',
  '.booking-main',
  '.campaign-modal',
  '.campaign-design',
  'textarea',
  'select',
  '[contenteditable]',
  '[data-lenis-prevent]'
 ].join(',');
 const shouldSmooth=()=>Boolean(
  root.dataset.motion==='full'&&
  window.StudioMotion?.level==='full'&&
  !window.StudioMotion?.onboardingActive&&
  !reduced.matches&&!coarse.matches&&!narrow.matches&&!lowPower()&&
  !document.hidden&&typeof window.Lenis==='function'
 );
 const prevent=node=>Boolean(node?.matches?.(selectors));
 function cleanup(){
  if(!lenis)return;
  lenis.destroy();
  lenis=null;
  root.removeAttribute('data-vz-smooth-wheel');
 }
 function sync(){
  if(!shouldSmooth()){
   cleanup();
   // Native scrolling on mobile/low-power/reduced devices must not be animated twice.
   // CSS smooth is retained for explicit anchors only, via the jump() helper.
   root.style.scrollBehavior='auto';
   return;
  }
  root.style.scrollBehavior='auto'; // Never combine browser smooth scroll with Lenis smoothing.
  if(lenis)return;
  try{
   lenis=new window.Lenis({
    autoRaf:true,
    anchors:{offset:-96},
    lerp:defaultLerp,
    wheelMultiplier:1,
    smoothWheel:true,
    syncTouch:false,
    overscroll:true,
    prevent,
    allowNestedScroll:false,
    stopInertiaOnNavigate:true,
    respectReducedMotion:true
   });
   root.dataset.vzSmoothWheel='lenis';
   // Dispatch from Lenis's own rAF, after scroll position has advanced,
   // so the cinematic canvas can render during the SAME browser frame.
   lenis.on?.('scroll',()=>window.dispatchEvent(new Event('veloryz:scroll-frame')));
   applyCinematic();
  }catch{
   cleanup();root.style.scrollBehavior='auto'; // Keep the page navigable if vendor JS fails.
  }
 }
 function onRoute(){
  // The SPA swaps page DOM and may jump to the top. Keep Lenis dimensions and
  // animated position synchronized with actual document scroll after repaint.
  cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(()=>{
   resizeFrame=0;
   sync();
   if(lenis){
    lenis.resize();
    lenis.scrollTo(window.scrollY,{immediate:true,force:true});
   }
  });
 }
 const jump=(target,options={})=>{
  if(lenis)return lenis.scrollTo(target,{offset:-96,duration:0.65,...options});
  if(typeof target==='number')window.scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});
  else if(typeof target==='string')document.querySelector(target)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 };
 window.VeloryzScroll={
  get active(){return Boolean(lenis);},
  get engine(){return lenis;},
  settings:{lerp:defaultLerp,wheelMultiplier:1,touch:'native',cinematicLerp:1},
  sync,scrollTo:jump
 };
 window.StudioMotion?.addEventListener('change',sync);
 document.addEventListener('studio:motion-intro-complete',sync);
 document.addEventListener('studio:route',()=>{cinematic=false;applyCinematic();onRoute();});
 document.addEventListener('studio:cinema-focus',event=>{
  const active=Boolean(event.detail?.active);
  if(active===cinematic)return;
  cinematic=active;
  applyCinematic();
  // Cancel any previous trailing Lenis animation when entering the film.
  // Keep the current position, not the target, so there is no visual jump.
  if(active&&lenis&&Number.isFinite(window.scrollY))lenis.scrollTo(window.scrollY,{immediate:true,force:true});
 });
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pageshow',sync);
 reduced.addEventListener?.('change',sync);
 coarse.addEventListener?.('change',sync);
 narrow.addEventListener?.('change',sync);
 connection?.addEventListener?.('change',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
 else sync();
})();
