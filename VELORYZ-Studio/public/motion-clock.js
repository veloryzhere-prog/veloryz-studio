'use strict';
/** VELORYZ R46 — one keyed clock for Lenis and first-party render work.
 * Continuous effects remain responsible for visibility and motion preferences.
 * Cancellation applies even during a frame; replacing Lenis removes its listener.
 */
(()=>{
 if(window.VeloryzMotionClock)return;
 const tasks=new Map(),subscribers=new Set();
 let lenis=null,unsubscribeLenis=null,frame=0,paused=document.hidden,ticking=false,batch=null;
 function next(){
  if(!frame&&!ticking&&!paused&&!document.hidden&&(lenis||tasks.size))frame=requestAnimationFrame(tick);
 }
 function tick(time){
  frame=0;
  if(paused||document.hidden)return;
  ticking=true;
  try{
   try{lenis?.raf(time);}catch(error){
    console.warn('VELORYZ scroll fallback:',error);
    const broken=lenis;detachLenis(broken);
    if(window.VeloryzScroll?.engine===broken)window.VeloryzScroll.destroy();
    else broken?.destroy?.();
   }
   batch=new Map(tasks);tasks.clear();
   for(const [key,callback]of batch){
    batch.delete(key);
    if(paused||document.hidden){tasks.set(key,callback);for(const entry of batch)if(!tasks.has(entry[0]))tasks.set(...entry);break;}
    try{callback(time);}catch(error){console.error('VELORYZ motion frame failed:',key,error);}
   }
  }finally{batch=null;ticking=false;next();}
 }
 function request(key,callback){tasks.set(key,callback);next();return 1;}
 function stopIfIdle(){if(!lenis&&!tasks.size&&frame){cancelAnimationFrame(frame);frame=0;}}
 function cancel(key){tasks.delete(key);batch?.delete(key);stopIfIdle();}
 function detachLenis(instance){
  if(!instance||instance===lenis){
   const previous=lenis;lenis=null;
   if(typeof unsubscribeLenis==='function')unsubscribeLenis();
   else previous?.off?.('scroll',notifyScroll);
   unsubscribeLenis=null;stopIfIdle();
  }
 }
 function attachLenis(instance){
  if(!instance||instance===lenis)return;
  detachLenis();lenis=instance;
  unsubscribeLenis=instance.on?.('scroll',notifyScroll);
  next();
 }
 function notifyScroll(){for(const callback of subscribers)try{callback();}catch(error){console.error('VELORYZ scroll subscriber failed',error);}}
 function subscribeScroll(fn){subscribers.add(fn);return()=>subscribers.delete(fn);}
 function suspend(){paused=true;if(frame)cancelAnimationFrame(frame);frame=0;}
 function sync(){paused=document.hidden;if(paused)suspend();else next();}
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',suspend);
 window.addEventListener('pageshow',sync);
 window.VeloryzMotionClock={request,cancel,attachLenis,detachLenis,subscribeScroll,notifyScroll,get running(){return!!frame;},get hasLenis(){return!!lenis;},get pending(){return tasks.size;},version:'r46'};
})();
