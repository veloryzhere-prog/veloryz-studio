/* VELORYZ scarf: one original video, no controls, labels or scroll-progress transforms.
   Autoplays muted whenever visible; pauses while offscreen/hidden. Reduced motion,
   explicit site Motion Off, and Save Data still take priority over autoplay.
*/
class VeloryzFrameCut extends HTMLElement{
 connectedCallback(){
  queueMicrotask(()=>{if(this.isConnected&&!this.disposeScene)this.mount();});
 }
 disconnectedCallback(){this.disposeScene?.();this.disposeScene=null;}
 mount(){
  const video=this.querySelector('.frame-scarf');
  if(!video)return;
  const controller=new AbortController();
  const listen=(node,type,callback)=>node?.addEventListener?.(type,callback,{signal:controller.signal});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  let observer=null,visible=false,loaded=false,attempting=false;
  video.muted=true;
  video.loop=true;
  video.playsInline=true;
  video.autoplay=true;
  const motionAllowed=()=>!document.hidden&&!reduced.matches&&!connection?.saveData&&
   window.StudioMotion?.level!=='reduced'&&window.StudioMotion?.level!=='paused'&&
   !window.StudioMotion?.onboardingActive;
  const pause=()=>{if(!video.paused)video.pause();};
  const sync=()=>{
   if(!this.isConnected)return;
   if(!visible||!motionAllowed()){pause();return;}
   if(!loaded){
    loaded=true;
    video.preload='metadata';
    video.src='/assets/frame-cut/scarf.mp4';
    video.load?.();
   }
   if(!video.paused||attempting)return;
   attempting=true;
   const attempt=video.play();
   if(attempt&&typeof attempt.then==='function'){
    attempt.catch(()=>{ /* Muted autoplay may still be blocked; keep the static poster. */ }).finally(()=>{attempting=false;});
   }else attempting=false;
  };
  if(typeof IntersectionObserver==='function'){
   observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(entry.target!==this)continue;
     visible=entry.isIntersecting&&entry.intersectionRatio>=.08;
     sync();
    }
   },{rootMargin:'180px 0px',threshold:[0,.08,.3]});
   observer.observe(this);
  }else visible=true;
  listen(document,'visibilitychange',sync);
  listen(document,'studio:route',sync);
  listen(document,'studio:motion-intro-complete',sync);
  listen(document,'studio:brand-intro-complete',sync);
  listen(window,'pageshow',sync);
  listen(window.StudioMotion,'change',sync);
  reduced.addEventListener?.('change',sync);
  connection?.addEventListener?.('change',sync);
  sync();
  this.disposeScene=()=>{
   controller.abort();
   observer?.disconnect();
   reduced.removeEventListener?.('change',sync);
   connection?.removeEventListener?.('change',sync);
   pause();
   video.removeAttribute('src');
   video.load?.();
  };
 }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
