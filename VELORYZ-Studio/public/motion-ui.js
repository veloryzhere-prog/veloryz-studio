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
 const seenKey='veloryz.workInvitation.v1';
 const lifecycle=new AbortController();
 const options={signal:lifecycle.signal};
 let invitation;
 function dismiss(){
  invitation?.remove();
  lifecycle.abort();
 }
 function offerWork(){
  if(invitation || location.pathname!=='/' || document.hidden || location.hash ||
     window.StudioMotion?.onboardingActive || document.querySelector('dialog[open],.modal-backdrop'))return;
  const work=document.getElementById('selected-work');
  if(!work || window.scrollY>96)return;
  try{if(localStorage.getItem(seenKey)){dismiss();return;}}catch{}
  invitation=document.createElement('aside');
  invitation.className='work-invitation';
  invitation.setAttribute('aria-label','Explore the studio’s work');
  invitation.innerHTML=`<img src="/assets/brand/veloryz-mark.svg" width="34" height="34" alt="">
   <div><p>Scroll down to see what we make.</p><a href="#selected-work">Explore our work <span aria-hidden="true">↓</span></a></div>
   <button type="button" aria-label="Dismiss scroll invitation">×</button>`;
  document.body.append(invitation);
  try{localStorage.setItem(seenKey,'1');}catch{}
  invitation.querySelector('button').addEventListener('click',dismiss);
  invitation.querySelector('a').addEventListener('click',event=>{
   event.preventDefault();
   const target=document.getElementById('selected-work');
   dismiss();
   if(!target)return;
   const heading=target.querySelector('h2');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
   target.scrollIntoView({block:'start',behavior:full()?'smooth':'instant'});
  });
  window.addEventListener('scroll',()=>{if(window.scrollY>96)dismiss();},{passive:true,...options});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')dismiss();},options);
 }
 function onRoute(){
  if(invitation && (location.pathname!=='/' || !document.getElementById('selected-work')))dismiss();
  else offerWork();
 }
 document.addEventListener('studio:route',onRoute,options);
 document.addEventListener('studio:motion-intro-complete',offerWork,options);
 document.addEventListener('visibilitychange',offerWork,options);
 window.addEventListener('storage',event=>{if(event.key===seenKey && event.newValue)dismiss();},options);
 offerWork();
})();
