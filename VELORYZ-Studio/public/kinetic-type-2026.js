/* VELORYZ — animated editorial word, preserving accessible original text.
 * Changing visual languages are CSS driven, not layout-thrashing JavaScript loops.
 */
(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const PHASES=['editorial','sculptural','outline','signature'];
let previous=null,observer=null,timer=0,phase=0,visible=false;
const allowed=()=>document.documentElement.dataset.motion==='full'&&!document.hidden&&!window.StudioMotion?.onboardingActive;
const stop=()=>{if(timer){clearInterval(timer);timer=0;}};
function paint(){
 if(!previous?.isConnected)return;
 previous.classList.remove('is-changing');
 void previous.offsetWidth;
 previous.classList.add('is-changing');
 previous.dataset.typePhase=PHASES[phase%PHASES.length];
 previous.classList.add('is-activated');
}
function sync(){
 if(!previous?.isConnected){mount();return;}
 if(!allowed()||!visible){stop();previous.dataset.typePhase='editorial';previous.classList.add('is-activated');return;}
 if(!timer){paint();timer=setInterval(()=>{phase=(phase+1)%PHASES.length;paint();},4700);}
}
function mount(){
 const word=document.querySelector('#main .hero-kinetic-word[data-kinetic-word]');
 if(word===previous&&word?.isConnected){sync();return;}
 stop();observer?.disconnect();observer=null;previous=word;visible=false;phase=0;
 if(!word)return;
 const original=String(word.dataset.kineticWord||word.textContent||'').trim();
 if(!original||original.length>40)return;
 const readable=document.createElement('span');
 readable.className='vz-kinetic-readable';readable.textContent=original;
 const letters=document.createElement('span');
 letters.className='vz-kinetic-letters';letters.setAttribute('aria-hidden','true');
 Array.from(original).forEach((letter,index)=>{
  const span=document.createElement('span');
  span.className='vz-kinetic-letter';span.textContent=letter;
  span.style.setProperty('--vz-letter-index',String(index));letters.appendChild(span);
 });
 word.replaceChildren(readable,letters);
 word.classList.add('is-ready','is-activated');
 word.dataset.typePhase='editorial';
 const onIntersect=entries=>{visible=entries.some(e=>e.isIntersecting);sync();};
 if(typeof IntersectionObserver==='function'){
  observer=new IntersectionObserver(onIntersect,{rootMargin:'80px',threshold:0});
  observer.observe(word);
 }else{visible=true;sync();}
}
document.addEventListener('studio:route',mount);
document.addEventListener('studio:brand-intro-complete',sync);
document.addEventListener('studio:motion-intro-complete',sync);
document.addEventListener('visibilitychange',sync);
window.addEventListener('pageshow',sync);
window.addEventListener('pagehide',stop);
window.StudioMotion?.addEventListener?.('change',sync);
reduce.addEventListener?.('change',sync);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
