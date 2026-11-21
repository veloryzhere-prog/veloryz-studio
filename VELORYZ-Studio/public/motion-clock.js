'use strict';
/**
 * VELORYZ motion clock: one compositor-friendly requestAnimationFrame scheduler.
 * Lenis, the V4 scroll choreography and scarf use the same animation clock.
 * Existing page scroll, sticky layout, 3D models and accessibility controls are untouched.
 */
(()=>{
 if(window.VeloryzMotionClock)return;
 const tasks=new Map();
 let lenis=null,frame=0,paused=false;
 const subscribers=new Set();
 const enabled=()=>!document.hidden&&document.documentElement.dataset.motion==='full';
 function next(){
  if(!frame&&!paused&&(lenis||tasks.size))frame=requestAnimationFrame(tick);
 }
 function tick(time){
  frame=0;
  if(paused||document.hidden)return;
  try{lenis?.raf(time);}catch(error){console.warn('VELORYZ scroll fallback:',error);detachLenis(lenis);}
  const batch=[...tasks];tasks.clear();
  for(const [key,callback]of batch){
   try{callback(time);}catch(error){console.error('VELORYZ motion frame failed:',key,error);}
  }
  if(lenis||tasks.size)next();
 }
 function request(key,callback){tasks.set(key,callback);next();return 1;}
 function cancel(key){tasks.delete(key);}
 function detachLenis(instance){
  if(!instance||instance===lenis){lenis=null;if(!tasks.size&&frame){cancelAnimationFrame(frame);frame=0;}}
 }
 function attachLenis(instance){
  lenis=instance;
  instance.on?.('scroll',notifyScroll);
  next();
 }
 function notifyScroll(){
  for(const callback of subscribers)try{callback();}catch(error){console.error('VELORYZ scroll subscriber failed',error);}
 }
 function subscribeScroll(fn){subscribers.add(fn);return()=>subscribers.delete(fn);}
 function sync(){
  paused=document.hidden;
  if(paused){if(frame)cancelAnimationFrame(frame);frame=0;}
  else next();
 }
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pageshow',sync);
 window.VeloryzMotionClock={request,cancel,attachLenis,detachLenis,subscribeScroll,notifyScroll,get running(){return!!frame;},get hasLenis(){return!!lenis;}};
})();
