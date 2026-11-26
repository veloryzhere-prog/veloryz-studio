/* VELORYZ original scarf film — motion-aware, route-safe, automatic playback.
 * Native muted inline video remains the animation engine; no duplicate rAF loops.
 */
class VeloryzFrameCut extends HTMLElement {
 connectedCallback(){queueMicrotask(()=>{if(this.isConnected&&!this.cleanup)this.mount();});}
 disconnectedCallback(){this.cleanup?.();this.cleanup=null;}
 mount(){
  const video=this.querySelector('.frame-scarf');if(!video)return;
  const controller=new AbortController(),signal=controller.signal;
  const setState=value=>this.setAttribute('data-scarf-state',value);
  const listen=(el,name,fn)=>el?.addEventListener?.(name,fn,{signal});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  let observer,visible=false,attempting=false,loaded=false,lastError='',retryTimer=0,generation=0;
  video.defaultMuted=true;video.muted=true;video.loop=true;video.autoplay=true;video.playsInline=true;
  video.setAttribute('muted','');video.setAttribute('autoplay','');video.setAttribute('loop','');video.setAttribute('playsinline','');
  video.preload='auto';
  const allowed=()=>this.isConnected&&!document.hidden&&!(reduced.matches&&window.StudioMotion?.level!=='full')&&!connection?.saveData&&
    !['paused','reduced'].includes(window.StudioMotion?.level)&&!window.StudioMotion?.onboardingActive;
  const clearRetry=()=>{if(retryTimer){clearTimeout(retryTimer);retryTimer=0;}};
  const load=()=>{if(loaded)return;loaded=true;video.src='/assets/frame-cut/scarf.mp4';video.load();};
  const pause=()=>{clearRetry();generation++;attempting=false;if(!video.paused)video.pause();};
  const sync=()=>{
   if(!visible||!allowed()){pause();return;}
   load();
   if(!video.paused||attempting)return;
   attempting=true;const attempt=++generation;
   try {
    Promise.resolve(video.play()).then(()=>{if(attempt!==generation){if(!visible||!allowed())video.pause();return;}if(!visible||!allowed()){pause();return;}lastError='';setState('playing');},error=>{
     if(attempt!==generation)return;
     lastError=error?.name||'PlaybackError';setState('blocked');
     // Browsers can deny autoplay. Retry once media is ready or after user interaction.
     // Do not spam play() from a timer if permissions forbid it.
    }).finally(()=>{if(attempt===generation)attempting=false;});
   }catch(error){attempting=false;lastError=error?.name||'PlaybackError';setState('blocked');}
  };
  const onUserGesture=()=>{if(lastError&&allowed()&&visible){lastError='';sync();}};
  if(typeof IntersectionObserver==='function'){
   observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.target===this){
     visible=entry.isIntersecting;sync();
    }
   },{rootMargin:'360px 0px',threshold:0});
   observer.observe(this);
  }else visible=true;
  listen(video,'canplay',sync);
  listen(video,'stalled',()=>{if(visible&&allowed()){clearRetry();retryTimer=setTimeout(sync,1500);}});
  listen(video,'waiting',()=>{if(visible&&allowed()){clearRetry();retryTimer=setTimeout(sync,1500);}});
  listen(video,'ended',()=>{try{video.currentTime=0;}catch{}sync();});
  listen(video,'error',()=>{setState('unavailable');});
  listen(video,'playing',()=>{if(visible&&allowed())setState('playing');else pause();});
  listen(video,'pause',()=>{if(this.getAttribute?.('data-scarf-state')==='playing')setState('paused');});
  listen(document,'visibilitychange',sync);
  listen(window,'pageshow',sync);
  listen(window,'focus',sync);
  listen(document,'pointerdown',onUserGesture);
  listen(document,'keydown',onUserGesture);
  listen(document,'studio:route',sync);
  listen(document,'studio:motion-intro-complete',sync);
  listen(document,'studio:brand-intro-complete',sync);
  listen(window.StudioMotion,'change',sync);
  reduced.addEventListener?.('change',sync);
  connection?.addEventListener?.('change',sync);
  sync();
  this.cleanup=()=>{
   controller.abort();observer?.disconnect();clearRetry();
   reduced.removeEventListener?.('change',sync);connection?.removeEventListener?.('change',sync);
   pause();video.removeAttribute('src');video.load();
  };
 }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
