/* VELORYZ / Brand Flow R17
 * One passive scroll listener, rAF-throttled. No second scroll engine.
 */
(()=>{
 'use strict';
 const headerBrand=document.querySelector('.vz-official-header-brand');
 const footer=document.querySelector('footer');
 if(!headerBrand&&!footer)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false,addEventListener(){}};
 let frame=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const syncHeader=()=>{
  if(!headerBrand)return;
  const start=8;
  const end=Math.max(96,Math.min(150,innerHeight*.16));
  const progress=clamp((scrollY-start)/(end-start));
  const opacity=progress>=.985?0:1-progress;
  headerBrand.style.setProperty('--vz-brand-scroll-opacity',opacity.toFixed(3));
  headerBrand.style.setProperty('--vz-brand-scroll-y',reduced.matches?'0px':(-12*progress).toFixed(2)+'px');
  headerBrand.style.setProperty('--vz-brand-scroll-scale',reduced.matches?'1':(1-.035*progress).toFixed(4));
  const away=progress>=.985;
  headerBrand.classList.toggle('is-scrolled-away',away);
  if(away){
   headerBrand.setAttribute('aria-hidden','true');
   headerBrand.setAttribute('tabindex','-1');
  }else{
   headerBrand.removeAttribute('aria-hidden');
   headerBrand.removeAttribute('tabindex');
  }
 };
 const requestSync=()=>{
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;
   syncHeader();
  });
 };
 addEventListener('scroll',requestSync,{passive:true});
 addEventListener('resize',requestSync,{passive:true});
 addEventListener('pageshow',requestSync);
 reduced.addEventListener?.('change',requestSync);
 syncHeader();

 if(footer){
  if('IntersectionObserver'in window){
   const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     if(entry.isIntersecting){
      footer.classList.add('vz-footer-in');
      io.disconnect();
     }
    });
   },{threshold:.12,rootMargin:'0px 0px -4% 0px'});
   io.observe(footer);
  }else{
   footer.classList.add('vz-footer-in');
  }
 }
})();
