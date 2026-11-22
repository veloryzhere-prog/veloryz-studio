'use strict';
/**
 * VELORYZ / Lenis Global Scrolling, Edition 2026
 * Engine: pinned self-hosted Lenis 1.3.27 (MIT / github.com/darkroomengineering/lenis).
 * ONE scroll owner site-wide. Shared rAF with the existing motion clock; no
 * homemade wheel physics, scroll-jacking, duplicate easing, or transformed body.
 *
 * Desktop wheels receive slow, precise interpolation. Touch retains the device's
 * native momentum; Lenis still coordinates anchor/keyboard navigation where safe.
 * Modal dialogs, CMS/editor sidebars, forms and embedded previews scroll natively.
 */
(()=>{
 if(window.VeloryzScroll?.version==='lenis-2026-global')return;
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse=matchMedia('(pointer: coarse)');
 const narrow=matchMedia('(max-width: 900px)');
 const network=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const lowPower=()=>Boolean(network?.saveData);
 let engine=null,routeFrame=0,awaitingMotion=false;
 const selector=[
  'dialog','[role="dialog"]','[aria-modal="true"]',
  '.modal','.modal-backdrop','.motion-dialog','.campaign-modal',
  '.vz-review-invite-shade','.vz-review-invite','.vz-ext-dialog','.vz-ext-cart-dialog','.vz-ext-frame-wrap',
  '.mobile-nav','.admin-sidebar','.admin-panel-scroll',
  '.kb-service-toc','.kb-search-results','.kb-command-results',
  '.docs-sidebar','.studio-docs-sidebar','.studio-docs-toc',
  '.vz-chat-log','.vz-chat-side','.v4-ai-messages','.chat-scroll-area','.cp-conversation','.cp-chat-card',
  '.chat-log','.expert-chat','.chat-personas','.v4-steps','.v4-step-nav',
  '.booking-main','.campaign-design','[role="log"]',
  '[data-lenis-prevent]','[data-lenis-prevent-wheel]',
  'textarea','select','input','[contenteditable]','iframe'
 ].join(',');
 const prevent=node=>Boolean(node?.matches?.(selector));
 const motionPermits=()=>{
  const motion=window.StudioMotion;
  if(root.dataset.motion==='paused'||root.dataset.motion==='reduced')return false;
  if(root.dataset.motionGate||window.VeloryzIntro?.active||motion?.onboardingActive)return false;
  if(motion&&motion.level!=='full')return false;
  return true;
 };
 const canSmooth=()=>typeof window.Lenis==='function'&&(!reduced.matches||window.StudioMotion?.level==='full')&&!lowPower()&&motionPermits();
 function clearEngine(){
  if(!engine)return;
  window.VeloryzMotionClock?.detachLenis(engine);
  engine.destroy();
  engine=null;
  delete root.dataset.vzSmoothWheel;
 }
 function sync(){
  if(document.hidden){
   engine?.stop?.();
   return;
  }
  if(!canSmooth()){
   clearEngine();
   root.style.scrollBehavior='auto';
   return;
  }
  root.style.scrollBehavior='auto';
  if(engine){engine.start?.();return;}
  try{
   engine=new window.Lenis({
    autoRaf:!window.VeloryzMotionClock,
    anchors:{offset:-82},
    lerp:0.105,
    wheelMultiplier:0.92,
    smoothWheel:true,
    syncTouch:false,
    overscroll:true,
    prevent,
    allowNestedScroll:false,
    stopInertiaOnNavigate:true,
    respectReducedMotion:true
   });
   root.dataset.vzSmoothWheel='lenis';
   window.VeloryzMotionClock?.attachLenis(engine);
  }catch(error){
   console.warn('VELORYZ native scrolling fallback:',error);
   clearEngine();root.style.scrollBehavior='auto';
  }
 }
 function onRoute(){
  cancelAnimationFrame(routeFrame);
  routeFrame=requestAnimationFrame(()=>{
   routeFrame=0;
   sync();
   if(engine){
    engine.resize();
    engine.scrollTo(window.scrollY,{immediate:true,force:true});
   }
  });
 }
 const jump=(target,options={})=>{
  const offset=options.offset??-82;
  if(engine)return engine.scrollTo(target,{offset,duration:0.9,...options});
  const behavior=reduced.matches?'instant':'smooth';
  if(typeof target==='number'){
   window.scrollTo({top:target,behavior});
   return;
  }
  const node=typeof target==='string'?document.querySelector(target):target;
  if(node?.scrollIntoView)node.scrollIntoView({block:'start',behavior});
 };
 const api={
  version:'lenis-2026-global',
  get active(){return Boolean(engine);},
  get engine(){return engine;},
  get mode(){return engine?(coarse.matches||narrow.matches?'native-touch-lenis':'lenis-wheel'):'native';},
  settings:{lerp:0.105,wheelMultiplier:0.92,touch:'native',clock:'shared',library:'lenis@1.3.27'},
  sync,scrollTo:jump,destroy:clearEngine
 };
 window.VeloryzScroll=api;
 window.StudioMotion?.addEventListener?.('change',sync);
 document.addEventListener('studio:motion-intro-complete',sync);
 document.addEventListener('studio:brand-intro-complete',sync);
 document.addEventListener('studio:route',onRoute);
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pageshow',sync);
 window.addEventListener('pagehide',()=>engine?.stop?.());
 reduced.addEventListener?.('change',sync);
 coarse.addEventListener?.('change',sync);
 narrow.addEventListener?.('change',sync);
 network?.addEventListener?.('change',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
 else sync();
})();
