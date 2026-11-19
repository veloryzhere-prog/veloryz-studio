/* Native scrolling drives the three-second ident. The final shot loops independently. */
class VeloryzFrameCut extends HTMLElement {
  connectedCallback() {
    // The parser can upgrade the element before its children are available.
    queueMicrotask(() => { if (this.isConnected && !this.cleanup) this.mount(); });
  }
  disconnectedCallback() { this.cleanup?.(); this.cleanup = null; }
  mount() {
    const reveal = this.querySelector('.frame-reveal');
    const scarf = this.querySelector('.frame-scarf');
    const button = this.querySelector('.frame-toggle');
    if (!reveal || !scarf || !button) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const events = new AbortController();
    const listen = (target, type, fn) => target.addEventListener(type, fn, {signal: events.signal, passive:true});
    let visible = false, full = false, held = false, pending = 0, wanted = 0, playPending = false;
    let previousTime=0, position=0, measuredProgress=0, measureNeeded=true;
    // Decode nine frames together and draw the requested frame directly. Keep
    // only nearby sheets in memory, including when scrolling backwards.
    const canvas = document.createElement?.('canvas');
    const context = canvas?.getContext('2d', {alpha:false});
    const sheets = new Map();
    let useSheets = Boolean(context), lastFrame = -1, requestedSheet = -1;
    if (useSheets) {
      canvas.width=768; canvas.height=432;
      canvas.className='frame-canvas'; canvas.hidden=true;
      canvas.setAttribute('aria-hidden','true');
      reveal.after(canvas);
    }
    function loadSheet(index) {
      if (index<0 || index>=10 || sheets.has(index)) return;
      const image=new Image();
      const entry={image,ready:false};
      sheets.set(index,entry);
      image.src='/assets/frame-cut/frames/sheet-'+index+'.webp';
      image.decode().then(()=>{
        if (events.signal.aborted || sheets.get(index)!==entry) return;
        entry.ready=true;
        if (visible && full && index===requestedSheet) schedule();
      }).catch(()=>{
        if (events.signal.aborted || sheets.get(index)!==entry) return;
        useSheets=false; canvas.hidden=true; schedule();
      });
    }
    function drawFrame(frame) {
      const index=Math.floor(frame/9);
      if (requestedSheet!==index) {
        requestedSheet=index;
        for (const key of sheets.keys()) if (Math.abs(key-index)>1) sheets.delete(key);
        loadSheet(index); loadSheet(index+1); loadSheet(index-1);
      }
      if (!sheets.get(index)?.ready || lastFrame===frame) return;
      const cell=frame%9;
      context.drawImage(sheets.get(index).image,(cell%3)*768,Math.floor(cell/3)*432,768,432,0,0,768,432);
      lastFrame=frame; canvas.hidden=false;
    }
    function seek() {
      if (reveal.readyState && !reveal.seeking && Math.abs(reveal.currentTime - wanted) > 0.016)
        reveal.currentTime = wanted;
    }
    const update = (time=0) => {
      pending = 0;
      if(measureNeeded){
        const bounds = this.getBoundingClientRect();
        const distance = Math.max(1, bounds.height - this.firstElementChild.clientHeight);
        measuredProgress = Math.max(0, Math.min(1, -bounds.top / distance));
        // First ~62% is a reversible, 3-second reveal. Remaining scroll gives
        // the 7.4-second scarf loop genuine viewing room without replacing the UI.
        const focused=full && visible && bounds.top<=1 && bounds.top+bounds.height>=this.firstElementChild.clientHeight-1;
        this.toggleAttribute('data-focus',focused);
        measureNeeded=false;
      }
      const progress=measuredProgress;
      const elapsed=previousTime?Math.min(64,Math.max(1,time-previousTime)):16;
      previousTime=time;
      if(!visible || !full || document.hidden)position=progress;
      else position+=(progress-position)*(1-Math.exp(-elapsed/112));
      if(Math.abs(progress-position)<.001)position=progress;
      const revealProgress = Math.min(1, position / .62);
      const loop = full && position >= .62 && scarf.readyState>=2;
      this.toggleAttribute('data-scarf', loop);
      button.hidden = !loop;
      if (visible && full && !document.hidden) {
        if (!useSheets && !reveal.hasAttribute('src')) {
          reveal.preload = 'auto';
          reveal.src = '/assets/frame-cut/reveal.mp4';
        }
        if (progress > .20 && !scarf.hasAttribute('src')) { scarf.preload='auto'; scarf.src='/assets/frame-cut/scarf.mp4'; }
        wanted = revealProgress * (3 - 1/30);
        if (useSheets) drawFrame(Math.round(revealProgress*89));
        else seek();
      }
      if (loop && visible && !held && !document.hidden) {
        if (scarf.paused && !playPending) {
          playPending = true;
          scarf.play().catch(() => {button.textContent='Play scarf';button.setAttribute('aria-label','Play VELORYZ scarf animation');}).finally(() => {playPending=false;});
        }
      } else {
        scarf.pause();
        if (!loop && scarf.readyState && scarf.currentTime > 0) scarf.currentTime = 0;
      }
      if(full && visible && !document.hidden && position!==progress && !pending)pending=requestAnimationFrame(update);
      else previousTime=0;
    };
    const schedule = () => { measureNeeded=true; if (!pending) pending = requestAnimationFrame(update); };
    const preference = () => {
      full = window.StudioMotion ? window.StudioMotion.level === 'full' : !reduced.matches;
      this.toggleAttribute('data-full', full);
      if (!full && canvas) {canvas.hidden=true;lastFrame=-1;requestedSheet=-1;sheets.clear();}
      if (!full && reveal.hasAttribute('src')) {reveal.removeAttribute('src'); reveal.load();}
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting; schedule();});
    observer.observe(this);
    listen(window,'scroll',()=>{if(visible)schedule();}); listen(window,'resize',schedule);
    listen(document,'visibilitychange',schedule); listen(reduced,'change',preference);
    listen(reveal,'loadeddata',schedule); listen(reveal,'seeked',seek);
    listen(scarf,'loadeddata',schedule);
    listen(scarf,'play',()=>{button.textContent='Pause scarf';button.setAttribute('aria-label','Pause VELORYZ scarf animation');});
    listen(scarf,'pause',()=>{button.textContent='Play scarf';button.setAttribute('aria-label','Play VELORYZ scarf animation');});
    listen(button,'click',()=>{held=!scarf.paused; schedule();});
    window.StudioMotion?.addEventListener('change',preference);
    preference();
    this.cleanup = () => {
      events.abort(); sheets.clear(); canvas?.remove(); observer.disconnect(); cancelAnimationFrame(pending);
      window.StudioMotion?.removeEventListener('change',preference);
      for(const video of [reveal,scarf]) {video.pause();video.removeAttribute('src');video.load();}
    };
  }
}
customElements.define('veloryz-frame-cut',VeloryzFrameCut);
