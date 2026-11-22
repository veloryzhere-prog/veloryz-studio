/* VELORYZ — one measured, continuous review-marquee controller for both review sections.
   Works on the visible homepage and the dedicated reviews page; rebinds after live API refresh.
   WAAPI uses exact group width + gap for a gapless loop. CSS keyframes are the fallback. */
(()=>{
'use strict';
const selectors=['#vz-home-reviews-track','#vz-live-reviews-track'];
const instances=new WeakMap();
const motionFull=()=>window.StudioMotion?window.StudioMotion.level==='full':!matchMedia('(prefers-reduced-motion:reduce)').matches;
const msPerPixel=1000/52; // constant travel speed on mobile and desktop
function attach(track){
 if(!track||instances.has(track))return;
 const viewport=track.closest('.vz-live-reviews-viewport');
 if(!viewport)return;
 let group=null,resize=null,animation=null,measured=0,visible=false,frame=0,keyboardFocus=false;
 const status=()=>motionFull()&&!document.hidden&&!track.classList.contains('is-paused')&&!keyboardFocus;
 const pauseButton=document.querySelector(track.id==='vz-home-reviews-track'?'#vz-home-reviews-pause':'#vz-reference-reviews-pause');
 const stop=()=>{if(animation)animation.pause();};
 const motionRefresh=()=>{
  const full=motionFull();
  viewport.classList.toggle('is-manual',!full);
  if(!full){
   stop();
   if(animation)animation.currentTime=0;
   if(pauseButton){pauseButton.disabled=true;pauseButton.textContent='Reduced motion';}
  }else{
   if(pauseButton){pauseButton.disabled=false;if(track.classList.contains('is-paused'))pauseButton.textContent='Resume motion ▶';else pauseButton.textContent='Pause motion ‖';}
   if(animation&&status()&&visible)animation.play();
   else stop();
  }
 };
 const rebuild=()=>{
  frame=0;
  if(!track.isConnected)return;
  const next=track.querySelector(':scope > .vz-live-review-group');
  if(!next){
   resize?.disconnect();group=null;animation?.cancel();animation=null;measured=0;
   return;
  }
  if(next!==group){
   resize?.disconnect();group=next;
   if(typeof ResizeObserver==='function'){
    resize=new ResizeObserver(()=>schedule());
    resize.observe(group);
   }
  }
  const groupWidth=group.getBoundingClientRect().width;
  const gap=Number.parseFloat(getComputedStyle(track).columnGap)||18;
  const distance=groupWidth+gap;
  if(!Number.isFinite(distance)||distance<=gap+1)return;
  const changed=!animation||Math.abs(measured-distance)>.8;
  if(changed&&typeof track.animate==='function'){
   let progress=0;
   if(animation){
    const oldDuration=animation.effect?.getTiming()?.duration||1;
    progress=(((Number(animation.currentTime)||0)%oldDuration)+oldDuration)%oldDuration/oldDuration;
    animation.cancel();
   }
   // Disable the CSS animation only when WAAPI is successfully available;
   // this avoids two competing transforms silently cancelling visible motion.
   track.style.animation='none';
   measured=distance;
   const duration=Math.max(18000,Math.round(distance*msPerPixel));
   animation=track.animate([
    {transform:'translate3d(0px,0,0)'},
    {transform:'translate3d(-'+distance.toFixed(2)+'px,0,0)'}
   ],{duration,iterations:Infinity,easing:'linear',fill:'both'});
   animation.currentTime=progress*duration;
  }
  motionRefresh();
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(rebuild);};
 const changes=new MutationObserver(records=>{
  if(records.some(x=>x.type==='childList'))schedule();
  else motionRefresh();
 });
 changes.observe(track,{childList:true,attributes:true,attributeFilter:['class']});
 const page=track.closest('.pg');
 if(page)new MutationObserver(()=>schedule()).observe(page,{attributes:true,attributeFilter:['class']});
 if(typeof IntersectionObserver==='function'){
  const intersection=new IntersectionObserver(entries=>{
   visible=entries.some(x=>x.isIntersecting);
   if(visible)schedule();
   motionRefresh();
  },{threshold:0.01});
  intersection.observe(viewport);
 }else visible=true;
 track.addEventListener('focusin',()=>{keyboardFocus=true;motionRefresh();});
 track.addEventListener('focusout',()=>{keyboardFocus=track.matches(':focus-within');motionRefresh();});
 document.addEventListener('visibilitychange',motionRefresh);
 window.addEventListener('pageshow',()=>{schedule();motionRefresh();});
 window.addEventListener('resize',schedule,{passive:true});
 window.StudioMotion?.addEventListener?.('change',()=>{schedule();motionRefresh();});
 instances.set(track,{refresh:schedule});
 schedule();
}
function mount(){selectors.forEach(s=>attach(document.querySelector(s)));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();