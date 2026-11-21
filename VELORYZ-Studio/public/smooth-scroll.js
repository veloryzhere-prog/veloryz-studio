'use strict';
// Natural smooth scrolling. Leave touchscreens, trackpads, keyboard navigation,
// nested scrollers and motion-reduced preferences to the browser.
(()=>{
 const html=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),mouse=matchMedia('(hover: hover) and (pointer: fine)');
 let raf=0,position=0,target=0,last=0;
 const enabled=()=>mouse.matches&&!reduce.matches&&window.StudioMotion?.level==='full'&&!html.hasAttribute('data-motion-gate');
 function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
 function sync(){html.style.scrollBehavior=enabled()?'smooth':'auto';if(!enabled())cancel();}
 function nested(node,dy){
  for(let el=node instanceof Element?node:null;el&&el!==document.body;el=el.parentElement){
   if(el.matches('textarea,select,[contenteditable="true"],[role="dialog"],[aria-modal="true"],[data-scroll-native]'))return true;
   const s=getComputedStyle(el);
   if(/auto|scroll/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+2){
    if(dy<0&&el.scrollTop>0)return true;
    if(dy>0&&el.scrollTop+el.clientHeight<el.scrollHeight-2)return true;
   }
  }
  return false;
 }
 function frame(now){
  const dt=Math.min(50,last?now-last:16);last=now;
  position+=(target-position)*(1-Math.pow(.82,dt/16));
  if(Math.abs(target-position)<.75){scrollTo({top:target,behavior:'instant'});cancel();return;}
  scrollTo({top:position,behavior:'instant'});
  raf=requestAnimationFrame(frame);
 }
 window.addEventListener('wheel',event=>{
  if(!enabled()||!event.cancelable||event.defaultPrevented||event.ctrlKey||event.shiftKey||event.altKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
  if(document.body.style.overflow==='hidden'||document.body.classList.contains('motion-focus-active')||document.querySelector('[aria-modal="true"]:not([hidden])'))return;
  const dy=event.deltaMode===1?event.deltaY*24:event.deltaMode===2?event.deltaY*innerHeight:event.deltaY;
  if(Math.abs(dy)<45||nested(event.target,dy))return;
  const max=Math.max(0,html.scrollHeight-innerHeight);if(!max)return;
  event.preventDefault();
  if(!raf){position=scrollY;target=position;}
  target=Math.max(0,Math.min(max,target+Math.max(-240,Math.min(240,dy))));
  if(!raf)raf=requestAnimationFrame(frame);
 },{passive:false});
 document.addEventListener('studio:route',cancel);
 window.addEventListener('keydown',event=>{if(['PageDown','PageUp','Home','End','ArrowUp','ArrowDown',' '].includes(event.key))cancel();});
 window.addEventListener('touchstart',cancel,{passive:true});
 window.addEventListener('pagehide',cancel);
 window.StudioMotion?.addEventListener('change',sync);reduce.addEventListener('change',sync);mouse.addEventListener('change',sync);
 sync();
})();
