/* VELORYZ: independent, scroll-linked capabilities. No second scrolling engine. */
(function(){
 'use strict';
 const section=document.getElementById('hzs'),track=document.getElementById('trk'),bar=document.getElementById('hbar');
 const pin=section?.querySelector('.stick');
 if(!section||!track||!pin)return;
 const shapes=Array.from(track.querySelectorAll('.sh'));
 let raf=0,travel=0,range=1,active=false,last=-1;
 const motion=()=>window.StudioMotion?.level||document.documentElement.dataset.motion||(matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full');
 const visible=()=>section.getClientRects().length>0;
 function paint(){
  raf=0;
  if(!active||!visible())return;
  const rect=section.getBoundingClientRect();
  const p=Math.min(1,Math.max(0,-rect.top/range));
  if(Math.abs(last-p)<.00001)return;
  last=p;
  track.style.transform='translate3d('+(-p*travel).toFixed(2)+'px,0,0)';
  if(bar)bar.style.transform='scaleX('+p+')';
  shapes.forEach((shape,i)=>{shape.style.transform='translate3d(0,'+(Math.sin(p*6+i)*22).toFixed(2)+'px,0) rotate('+(p*120+i*20).toFixed(2)+'deg)'});
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
 function measure(){
  active=motion()==='full';
  section.classList.toggle('vz-capabilities-pinned',active);
  if(!active){
   section.style.removeProperty('--cap-scroll-height');
   track.style.removeProperty('transform');
   if(bar)bar.style.removeProperty('transform');
   shapes.forEach(shape=>shape.style.removeProperty('transform'));
   last=-1;return;
  }
  if(!visible())return;
  travel=Math.max(0,track.scrollWidth-pin.clientWidth);
  range=Math.max(1,Math.round(travel*1.18));
  section.style.setProperty('--cap-scroll-height',(pin.offsetHeight+range)+'px');
  last=-1;schedule();
 }
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('hashchange',()=>requestAnimationFrame(measure));
 addEventListener('pageshow',measure);
 addEventListener('vz:reference-motion-change',measure);
 document.addEventListener('studio:route',measure);
 window.StudioMotion?.addEventListener?.('change',measure);
 if('ResizeObserver'in window){const observer=new ResizeObserver(measure);observer.observe(pin);observer.observe(track)}
 document.fonts?.ready.then(measure).catch(()=>{});
 measure();
})();
