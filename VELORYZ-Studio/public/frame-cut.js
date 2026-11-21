/* The scroll timeline animates two vector layers. Only the final scarf is film. */
class VeloryzFrameCut extends HTMLElement {
  connectedCallback() {
    queueMicrotask(() => { if (this.isConnected && !this.cleanup) this.mount(); });
  }
  disconnectedCallback() { this.cleanup?.(); this.cleanup=null; }
  mount() {
    const scarf=this.querySelector('.frame-scarf');
    const button=this.querySelector('.frame-toggle');
    if (!scarf || !button) return;
    const events=new AbortController();
    const listen=(el,name,fn)=>el.addEventListener(name,fn,{signal:events.signal,passive:true});
    const timeline=window.CSS?.supports('animation-timeline:view()') &&
      window.CSS.supports('animation-range:contain 0% contain 100%');
    let full=false, near=false, held=false, frame=0, playing=false;
    const update=()=>{
      frame=0;
      if(!full||!near||document.hidden){if(playing){playing=false;scarf.pause();}this.removeAttribute('data-focus');return;}
      const bounds=this.getBoundingClientRect();
      const height=this.firstElementChild.clientHeight;
      const progress=Math.max(0,Math.min(1,-bounds.top/Math.max(1,bounds.height-height)));
      // Decode the film only shortly before its reveal. Geometry animates with CSS.
      if(progress>=.33&&!scarf.hasAttribute('src')){
        scarf.preload='metadata';
        scarf.src='/assets/frame-cut/scarf.mp4';
      }
      const visible=full && near && !document.hidden && bounds.top<height && bounds.bottom>0;
      this.toggleAttribute('data-focus',visible && bounds.top<=1 && bounds.bottom>=height-1);
      if(!timeline && visible)this.style.setProperty('--frame-delay',-progress+'s');
      const film=visible && progress>=.47;
      button.hidden=!film;
      if(film && !held && !playing){
        playing=true;
        scarf.play().catch(()=>{if(playing){held=true;playing=false;label();}});
      }else if((!film || held) && playing){
        playing=false;scarf.pause();
      }
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const label=()=>{
      button.textContent=scarf.paused?'Play scarf':'Pause scarf';
      button.setAttribute('aria-label',button.textContent);
    };
    const preference=()=>{
      full=window.StudioMotion?.level==='full';
      this.toggleAttribute('data-full',full);
      schedule();
    };
    const observer=new IntersectionObserver(([entry])=>{
      near=entry.isIntersecting;schedule();
    },{rootMargin:'35% 0px'});
    observer.observe(this);
    listen(window,'scroll',()=>{if(near && full)schedule();});
    listen(window,'resize',schedule);
    listen(document,'visibilitychange',schedule);
    listen(button,'click',()=>{held=!scarf.paused;schedule();});
    listen(scarf,'play',label);listen(scarf,'pause',label);
    window.StudioMotion?.addEventListener('change',preference);
    preference();
    this.cleanup=()=>{
      events.abort();observer.disconnect();cancelAnimationFrame(frame);
      window.StudioMotion?.removeEventListener('change',preference);
      playing=false;scarf.pause();scarf.removeAttribute('src');scarf.load();
    };
  }
}
customElements.define('veloryz-frame-cut',VeloryzFrameCut);
