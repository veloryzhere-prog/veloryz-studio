/* VELORYZ / Scarf Film — isolated from scrolling.
 * The previous 340svh scroll-linked logo/rings transition is deliberately removed.
 * IntersectionObserver controls one native video; there is no scroll handler, rAF
 * ticker, 3D asset, canvas, frame-sheet decoding, or sticky pinning in this scene.
 */
class VeloryzFrameCut extends HTMLElement {
 connectedCallback(){
  queueMicrotask(()=>{if(this.isConnected&&!this.disposeScene)this.mount();});
 }
 disconnectedCallback(){this.disposeScene?.();this.disposeScene=null;}
 mount(){
  const video=this.querySelector('.frame-scarf');
  const button=this.querySelector('.frame-toggle');
  if(!video||!button)return;
  const controller=new AbortController();
  const listen=(target,event,callback)=>target?.addEventListener?.(event,callback,{signal:controller.signal});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const network=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  let near=false,visible=false,manual=false,held=false,loading=false,observer=null;
  const canAuto=()=>!document.hidden&&!reduced.matches&&!network?.saveData&&window.StudioMotion?.level!=='paused'&&window.StudioMotion?.level!=='reduced'&&!window.StudioMotion?.onboardingActive;
  const label=()=>{
   const playing=!video.paused;
   button.textContent=playing?'Pause scarf motion':'Play scarf motion';
   button.setAttribute('aria-label',button.textContent);
   button.setAttribute('aria-pressed',String(playing));
  };
  const load=()=>{
   if(loading)return;
   loading=true;
   video.preload='metadata';
   video.src='/assets/frame-cut/scarf.mp4';
   video.load?.();
  };
  const pause=()=>{if(!video.paused)video.pause();label();};
  const sync=()=>{
   if(!this.isConnected)return;
   const active=near&&visible&&!document.hidden;
   this.toggleAttribute('data-visible',active);
   if(!active){pause();return;}
   if(canAuto()&&!held){load();video.play()?.catch(()=>{held=true;pause();});}
   else if(manual&&!held){load();video.play()?.catch(()=>pause());}
   else pause();
   label();
  };
  const toggle=()=>{
   if(!loading)load();
   if(!video.paused){held=true;manual=false;pause();}
   else{held=false;manual=true;sync();}
  };
  if(typeof IntersectionObserver==='function'){
   observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(entry.target!==this)continue;
     near=entry.isIntersecting;
     visible=entry.isIntersecting&&entry.intersectionRatio>=.08;
     sync();
    }
   },{rootMargin:'120px 0px',threshold:[0,.08,.25]});
   observer.observe(this);
  }else {near=true;visible=true;}
  listen(button,'click',toggle);
  listen(video,'play',label);
  listen(video,'pause',label);
  listen(video,'error',()=>{held=true;button.textContent='Scarf film unavailable';button.disabled=true;});
  listen(document,'visibilitychange',sync);
  listen(document,'studio:route',sync);
  listen(document,'studio:motion-intro-complete',sync);
  listen(document,'studio:brand-intro-complete',sync);
  listen(window,'pageshow',sync);
  listen(window.StudioMotion,'change',sync);
  reduced.addEventListener?.('change',sync);
  network?.addEventListener?.('change',sync);
  label();
  sync();
  this.disposeScene=()=>{
   controller.abort();
   observer?.disconnect();
   reduced.removeEventListener?.('change',sync);
   network?.removeEventListener?.('change',sync);
   pause();
   video.removeAttribute('src');
   video.load?.();
  };
 }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
