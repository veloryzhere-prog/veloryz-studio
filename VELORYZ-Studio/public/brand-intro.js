/* VELORYZ / Cinematic brand introduction
 * First-page, once-per-tab-session. Real brand assets, no fake loading percentage.
 * The existing mandatory motion preference remains the next step on first visit.
 */
(()=>{
 'use strict';
 const root=document.documentElement;
 const preview=root.dataset.vzIntroPreview==='true';
 const sessionKey='veloryz.brand.intro.session.v1';
 const concepts=new Set(['prism','orbit','editorial']);
 const reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
 const network=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const home=location.pathname==='/'||location.pathname==='/index.html';
 const saveData=()=>Boolean(network?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2));
 function motionOff(){
  let selected='';
  try{selected=localStorage.getItem('veloryz.motion.v2')||'';}catch{}
  return Boolean(reduced?.matches||saveData()||['reduced','paused'].includes(selected));
 }
 let seen=false;
 try{seen=sessionStorage.getItem(sessionKey)==='1';}catch{}
 let active=!preview&&home&&!seen&&!motionOff();
 let started=false,finished=false,overlay=null,returnFocus=null;
 let runTimer=0,exitTimer=0,safetyTimer=0,previousOverflow='',locked=[];
 root.dataset.vzIntro=active?'preparing':'idle';
 function remember(){
  if(preview)return;
  try{sessionStorage.setItem(sessionKey,'1');}catch{}
 }
 function clearTimers(){
  clearTimeout(runTimer);clearTimeout(exitTimer);clearTimeout(safetyTimer);
  runTimer=exitTimer=safetyTimer=0;
 }
 function lockPage(){
  previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  locked=[];
  ['#main','#footer','#header','#modal-root','.whatsapp-float','.skip-link','#site-progress'].forEach(selector=>{
   document.querySelectorAll(selector).forEach(node=>{
    locked.push([node,node.inert]);
    node.inert=true;
   });
  });
 }
 function restorePage(){
  document.body.style.overflow=previousOverflow;
  for(const [node,inert] of locked)node.inert=inert;
  locked=[];
 }
 function done(skipped=false){
  if(finished||!active)return;
  finished=true;clearTimers();remember();
  if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true');}
  root.dataset.vzIntro='done';
  restorePage();
  active=false;
  if(preview){returnFocus?.focus?.({preventScroll:true});}
  else if(document.activeElement?.closest?.('#vz-intro')){document.querySelector('#main')?.focus?.({preventScroll:true});}
  document.dispatchEvent(new CustomEvent('studio:brand-intro-complete',{detail:{skipped,concept:overlay?.dataset.concept||'prism'}}));
 }
 function exit(skipped=false){
  if(!active||finished||root.dataset.vzIntro==='exiting')return;
  clearTimeout(runTimer);
  if(skipped||motionOff()){done(true);return;}
  root.dataset.vzIntro='exiting';
  exitTimer=setTimeout(()=>done(false),740);
 }
 function start(concept='prism',force=false){
  if(!concepts.has(concept))concept='prism';
  if(preview&&!force)return;
  if(!force&&!active)return;
  if(active&&started)return;
  if(force&&motionOff())return;
  overlay=document.getElementById('vz-intro');
  if(!overlay){if(active)done(true);return;}
  returnFocus=force?document.activeElement:null;
  active=true;started=true;finished=false;
  root.dataset.vzIntro='preparing';
  overlay.hidden=false;overlay.removeAttribute('aria-hidden');
  overlay.dataset.concept=concept;
  const logo=overlay.querySelector('[data-vz-intro-wordmark]');
  if(logo)logo.src='/assets/brand/official/'+(concept==='editorial'?'Main-Dark-Ink-Transparent.webp':'Main-Transparent.webp');
  lockPage();
  // A two-frame transition guarantees the entrance choreography can restart in the concept gallery.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!active||finished)return;
   root.dataset.vzIntro='playing';
   overlay.querySelector('[data-vz-intro-skip]')?.focus({preventScroll:true});
  }));
  runTimer=setTimeout(()=>exit(false),2110);
  // Never block access indefinitely if animation events are interrupted.
  safetyTimer=setTimeout(()=>done(true),5700);
 }
 window.VeloryzIntro={
  get active(){return active;},
  get state(){return root.dataset.vzIntro;},
  get concept(){return overlay?.dataset.concept||'prism';},
  replay(concept='prism'){if(active)return;start(concept,true);},
  skip(){exit(true);}
 };
 document.addEventListener('DOMContentLoaded',()=>{
  overlay=document.getElementById('vz-intro');
  if(active)start('prism');
  else if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true');}
 });
 document.addEventListener('click',event=>{
  const skip=event.target.closest?.('[data-vz-intro-skip]');
  if(skip){event.preventDefault();exit(true);return;}
  const demo=event.target.closest?.('[data-vz-demo]');
  if(preview&&demo){event.preventDefault();if(active)return;start(demo.dataset.vzDemo,true);}
 });
 document.addEventListener('keydown',event=>{
  if(!active)return;
  if(event.key==='Escape'){event.preventDefault();exit(true);}
  if(event.key==='Tab'){
   const skip=overlay?.querySelector('[data-vz-intro-skip]');
   if(skip){event.preventDefault();skip.focus({preventScroll:true});}
  }
 },true);
 document.addEventListener('studio:route',()=>{if(active&&!home)exit(true);});
 window.addEventListener('pageshow',event=>{if(active&&event.persisted)exit(true);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)exit(true);});
 reduced?.addEventListener?.('change',()=>{if(reduced.matches&&active)exit(true);});
 network?.addEventListener?.('change',()=>{if(saveData()&&active)exit(true);});
})();