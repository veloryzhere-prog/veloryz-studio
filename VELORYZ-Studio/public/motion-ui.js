'use strict';
(()=>{
 const full=()=>window.StudioMotion?.level==='full';
 let card=null,frame=0,eventPoint=null;
 function reset(){if(card){card.style.removeProperty('--card-x');card.style.removeProperty('--card-y');card=null;}}
 document.addEventListener('pointermove',e=>{
  if(!full()||e.pointerType!=='mouse'){reset();return;}
  const target=e.target.closest('.project-link');
  if(!target){reset();return;}
  if(card&&card!==target)reset();card=target;eventPoint={x:e.clientX,y:e.clientY};
  if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(!card)return;const r=card.getBoundingClientRect();card.style.setProperty('--card-x',((.5-(eventPoint.y-r.top)/r.height)*3)+'deg');card.style.setProperty('--card-y',(((eventPoint.x-r.left)/r.width-.5)*4)+'deg');});
 },{passive:true});
 window.StudioMotion?.addEventListener('change',()=>{if(!full()){reset();cancelAnimationFrame(frame);frame=0;}});
 const stages=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-active',e.isIntersecting)),{rootMargin:'-15% 0px -30%',threshold:.25});
 function refresh(){reset();stages.disconnect();document.querySelectorAll('.process-card').forEach(el=>stages.observe(el));}
 const main=document.querySelector('#main');
 new MutationObserver(refresh).observe(main,{childList:true});
 refresh();
 try{
  if(full()&&!sessionStorage.getItem('veloryz.motion.intro')){
   sessionStorage.setItem('veloryz.motion.intro','seen');
   const entry=document.createElement('div');entry.className='brand-entry';entry.setAttribute('aria-hidden','true');
   entry.innerHTML='<img src="/assets/brand/veloryz-mark.svg" alt=""><span>A VELORYZ CREATION</span>';
   document.body.append(entry);entry.addEventListener('animationend',()=>entry.remove(),{once:true});
  }
 }catch{}
})();
