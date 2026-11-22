/* VELORYZ kinetic typography: one-shot character choreography.
 * The source word stays in the DOM for accessibility, SEO and non-JS clients.
 * Never polls scroll, replaces entire page headings or starts an rAF loop.
 */
(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let observer=null,previous=null;
 const allowed=()=>!reduced.matches&&document.documentElement.dataset.motion==='full'&&!document.hidden;
 function mount(){
  const word=document.querySelector('#main .hero-kinetic-word[data-kinetic-word]');
  if(previous===word&&word?.isConnected)return;
  observer?.disconnect();observer=null;previous=word;
  if(!word)return;
  const original=String(word.dataset.kineticWord||word.textContent||'').trim();
  if(!original||original.length>32)return;
  const readable=document.createElement('span');
  readable.className='vz-kinetic-readable';
  readable.textContent=original;
  const letters=document.createElement('span');
  letters.className='vz-kinetic-letters';
  letters.setAttribute('aria-hidden','true');
  for(const [index,char] of [...original].entries()){
   const piece=document.createElement('span');
   piece.className='vz-kinetic-letter';
   piece.textContent=char;
   piece.style.setProperty('--vz-letter-index',String(index));
   letters.appendChild(piece);
  }
  word.replaceChildren(readable,letters);
  word.classList.add('is-ready');
  const start=()=>{if(!word.isConnected)return;word.classList.add('is-activated');observer?.disconnect();observer=null;};
  if(!allowed()||typeof IntersectionObserver!=='function'){
   start();return;
  }
  observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting))start();
  },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  observer.observe(word);
 }
 function refresh(){
  if(!previous?.isConnected){previous=null;mount();return;}
  if(!allowed()&&!previous.classList.contains('is-activated')){
   previous.classList.add('is-activated');
   observer?.disconnect();observer=null;
  }
 }
 document.addEventListener('studio:route',mount);
 document.addEventListener('studio:motion-intro-complete',refresh);
 document.addEventListener('studio:brand-intro-complete',refresh);
 document.addEventListener('visibilitychange',refresh);
 window.StudioMotion?.addEventListener?.('change',refresh);
 reduced.addEventListener?.('change',refresh);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();
