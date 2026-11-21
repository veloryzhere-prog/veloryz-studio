'use strict';
/**
 * VELORYZ selective animation-provider integration.
 * Motion (MIT) is lazy-imported for small viewport entries, never scroll control.
 * Lottie-web (MIT) is downloaded only after a CONFIRMED project submission.
 * Existing Lenis + motion clock own ALL scrolling and scroll-linked 3D scenes.
 *
 * Remote provider failures leave the native CSS/WAAPI animation intact.
 */
(()=>{
 if(window.VeloryzAnimationProviders)return;
 const root=document.documentElement;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const touch=matchMedia('(pointer: coarse)');
 const narrow=matchMedia('(max-width: 800px)');
 const network=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const lowPower=()=>Boolean(network?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=3));
 const allow=()=>root.dataset.motion==='full'&&!reduce.matches&&!document.hidden&&!lowPower();
 const targets='.v4-question-heading,.v4-reference,.v4-handoff-step,.v4-success-handoff,.vz-chat-side-head,.chat-name-card,.kb-reader-tools';
 let motionLoader=null,lottieLoader=null,observer=null,routeTimer=0;
 const observed=new WeakSet(),finished=new WeakSet();
 const motionURL='https://cdn.jsdelivr.net/npm/motion@14.11.1/mini/+esm';
 const lottieURL='https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/lottie_light.min.js';
 const animatedEvent=(name,detail={})=>document.dispatchEvent(new CustomEvent('veloryz:provider-'+name,{detail}));
 function motion(){
  if(!allow())return Promise.resolve(null);
  if(!motionLoader)motionLoader=import(motionURL).then(mod=>mod?.animate?mod:null).catch(()=>null);
  return motionLoader;
 }
 function enter(el){
  if(!el.isConnected||finished.has(el)||!allow())return;
  finished.add(el);
  // Opacity only: do not replace transform matrices used by existing scene controllers.
  motion().then(mod=>{
   if(!el.isConnected||!allow())return;
   if(mod?.animate){
    try{mod.animate(el,{opacity:[.55,1]},{duration:.35,ease:'ease-out'});animatedEvent('motion',{kind:'entrance'});return;}catch{}
   }
   try{el.animate([{opacity:.55},{opacity:1}],{duration:350,easing:'ease-out'});}catch{}
  });
 }
 function observe(){
  observer?.disconnect();
  observer=null;
  if(!allow()||typeof IntersectionObserver!=='function')return;
  observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){observer?.unobserve(entry.target);enter(entry.target);}
  },{threshold:.10,rootMargin:'0px 0px -4% 0px'});
  for(const el of document.querySelectorAll(targets)){
   if(observed.has(el))continue;
   observed.add(el);
   observer.observe(el);
  }
 }
 function schedule(){
  if(routeTimer)return;
  routeTimer=requestAnimationFrame(()=>{routeTimer=0;observe();});
 }
 function loadLottie(){
  if(lottieLoader)return lottieLoader;
  lottieLoader=new Promise(resolve=>{
   if(window.lottie?.loadAnimation){resolve(window.lottie);return;}
   const script=document.createElement('script');
   script.src=lottieURL;
   script.async=true;
   script.crossOrigin='anonymous';
   script.onload=()=>resolve(window.lottie?.loadAnimation?window.lottie:null);
   script.onerror=()=>resolve(null);
   document.head.append(script);
  });
  return lottieLoader;
 }
 async function celebrate(){
  if(!allow())return;
  const mark=document.querySelector('.v4-root .v4-success-check');
  if(!mark||mark.dataset.vzLottie==='done')return;
  mark.dataset.vzLottie='done';
  const lottie=await loadLottie();
  if(!lottie||!mark.isConnected||!allow())return;
  try{
   // The animation is positioned around the EXISTING success check; the original remains visible.
   const surround=document.createElement('span');
   surround.className='vz-lottie-confirmation';
   surround.setAttribute('aria-hidden','true');
   mark.append(surround);
   const instance=lottie.loadAnimation({
    container:surround,renderer:'svg',loop:false,autoplay:false,
    path:'/assets/motion/project-confirmation.json',
    rendererSettings:{preserveAspectRatio:'xMidYMid meet',progressiveLoad:true}
   });
   instance.addEventListener?.('DOMLoaded',()=>{if(allow())instance.play();else instance.destroy();});
   instance.addEventListener?.('complete',()=>{instance.destroy();surround.remove();});
   window.setTimeout(()=>{instance.destroy();surround.remove();},2300);
   animatedEvent('lottie',{kind:'confirmed-project'});
  }catch{ /* Decorative animation must never affect submission result. */ }
 }
 document.addEventListener('veloryz:creator-render',schedule);
 document.addEventListener('studio:route',schedule);
 document.addEventListener('veloryz:creator-state',event=>{
  if(event.detail?.state==='success')celebrate();
 });
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){observer?.disconnect();observer=null;}else schedule();
 });
 window.StudioMotion?.addEventListener('change',schedule);
 reduce.addEventListener?.('change',schedule);
 network?.addEventListener?.('change',schedule);
 window.addEventListener('pageshow',schedule);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
 else schedule();
 window.VeloryzAnimationProviders={get motionAvailable(){return Boolean(motionLoader);},get lottieRequested(){return Boolean(lottieLoader);},refresh:schedule};
})();
