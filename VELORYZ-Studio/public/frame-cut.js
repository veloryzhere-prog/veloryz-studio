/* VELORYZ original cinematic V -> portal -> scarf.
 * One native/Lenis scroll timeline; the authored reveal.mp4 is frame-scrubbed,
 * then the real scarf.mp4 loops. Never replaces the brand footage with a CSS fake.
 * No nested scroll controller, view timeline or continuously running rAF.
 */
class VeloryzFrameCut extends HTMLElement {
 connectedCallback(){queueMicrotask(()=>{if(this.isConnected&&!this.cleanup)this.mount();});}
 disconnectedCallback(){this.cleanup?.();this.cleanup=null;}
 mount(){
  const stage=this.querySelector('.frame-stage');
  const reveal=this.querySelector('.frame-reveal');
  const canvas=this.querySelector('.frame-reveal-canvas');
  const scarf=this.querySelector('.frame-scarf');
  const button=this.querySelector('.frame-toggle');
  if(!stage||!reveal||!scarf||!button)return;
  const controller=new AbortController();
  const on=(node,type,callback,options={})=>node?.addEventListener?.(type,callback,{...options,signal:controller.signal});
  const clamp=value=>Math.min(1,Math.max(0,value));
  const range=(progress,start,end)=>clamp((progress-start)/(end-start));
  const ease=t=>t*t*(3-2*t);
  let raf=0,near=false,ready=false,loaded=false,scarfLoaded=false;
  let playback=false,manualPlay=false,seekTarget=0,seekPending=false,lastSeek=-1;
  let scarfTarget=0,scarfPending=false,lastScarfSeek=-1;
  let lastProgress=-1,lastFull=null,lastFocus=null,deleted=false;
  let layout=null,lastScrollY=NaN,lastMeasureAt=0;
  const scrollY=()=>Number(window.scrollY)||0;
  // Layout is measured at mount/resize/route, never in the per-frame scrub.
  // Native and Lenis both change scrollY, so the frame follows exactly.
  const measure=()=>{
   if(deleted||!this.isConnected)return;
   const box=this.getBoundingClientRect();
   const height=stage.clientHeight||window.innerHeight||1;
   layout={top:box.top+scrollY(),height,travel:Math.max(1,box.height-height)};
   lastMeasureAt=Date.now();
  };
  // The original reveal has 90 frames across ten 3x3 WebP sprite sheets.
  // Drawing one source cell per scroll frame avoids expensive arbitrary MP4 seeking.
  let ctx=null;
  try{ctx=canvas?.getContext?.('2d',{alpha:false,desynchronized:true})||null;}catch{}
  const sprites=Boolean(ctx&&typeof Image==='function');
  let spriteFailed=false,spriteReady=false,drawnFrame=-1;
  const keepDecoded=typeof navigator==='undefined'||!(navigator.deviceMemory&&navigator.deviceMemory<=4);
  const sheets=new Map();
  const TOTAL_FRAMES=90,COLS=3,CELL_W=768,CELL_H=432;
  const frameAt=p=>Math.min(TOTAL_FRAMES-1,Math.round(range(p,0,.49)*(TOTAL_FRAMES-1)));
  // Load early poses before the scene arrives; avoid network/decode stalls
  // at the exact moment the user starts scrolling.
  const loadSheet=index=>{
   if(!sprites||spriteFailed||index<0||index>=10||sheets.has(index)||deleted)return;
   const img=new Image(),entry={img,ready:false};
   sheets.set(index,entry);
   img.onload=()=>{
    if(deleted)return;
    // Decode away from wheel-driven drawing so a new sheet won't block input.
    const mark=()=>{if(deleted)return;entry.ready=true;lastProgress=-1;schedule();};
    if(typeof img.decode==='function')img.decode().then(mark,mark);
    else mark();
   };
   img.onerror=()=>{
    if(deleted)return;
    spriteFailed=true;sheets.clear();spriteReady=false;
    lastProgress=-1;prefetch();schedule();
   };
   img.decoding='async';
   img.src='/assets/frame-cut/frames/sheet-'+index+'.webp';
  };
  const drawSprite=progress=>{
   if(!sprites||spriteFailed||!ctx)return false;
   const current=frameAt(progress),index=Math.floor(current/9);
   loadSheet(index);loadSheet(index+1);
   if(progress<.16){loadSheet(0);loadSheet(1);loadSheet(2);}
   const entry=sheets.get(index);
   if(!entry?.ready){
    // Keep the last decoded V pose on screen during rapid jumps instead of
    // flashing the poster or an empty canvas while a WebP sheet decodes.
    return spriteReady;
   }
   // Original cells are 768×432. Never create an enormous 4K canvas on each
   // scroll; one bounded canvas and one sprite draw keep the main thread nimble.
   const stageWidth=stage.clientWidth||window.innerWidth||640;
   const stageHeight=stage.clientHeight||window.innerHeight||360;
   const resolution=Math.min(1,1280/Math.max(stageWidth,stageHeight*16/9));
   const width=Math.max(1,Math.round(stageWidth*resolution));
   const height=Math.max(1,Math.round(stageHeight*resolution));
   const resize=canvas.width!==width||canvas.height!==height;
   if(resize){canvas.width=width;canvas.height=height;drawnFrame=-1;}
   if(drawnFrame!==current){
    const cell=current%9,sx=(cell%COLS)*CELL_W,sy=Math.floor(cell/COLS)*CELL_H;
    const imageWidth=Math.min(width,height*16/9),imageHeight=imageWidth*9/16;
    const x=(width-imageWidth)/2,y=(height-imageHeight)/2;
    ctx.fillStyle='#06071a';ctx.fillRect(0,0,width,height);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='medium';
    ctx.drawImage(entry.img,sx,sy,CELL_W,CELL_H,x,y,imageWidth,imageHeight);
    drawnFrame=current;
   }
   if(!spriteReady){spriteReady=true;set('--frame-canvas-ready',1);}
   // Keep the original decoded artwork in memory on capable desktops.
   if(!keepDecoded)for(const key of sheets.keys())if(Math.abs(key-index)>3)sheets.delete(key);
   return true;
  };
  const set=(key,value)=>this.style.setProperty(key,String(value));
  let lastCinema=null;
  const cinema=active=>{
   if(lastCinema===active)return;
   lastCinema=active;
   document.documentElement?.setAttribute?.('data-vz-cinema-focus',active?'true':'false');
   document.dispatchEvent?.(new CustomEvent('studio:cinema-focus',{detail:{active}}));
  };
  const pause=()=>{if(playback||!scarf.paused){playback=false;scarf.pause();}};
  const label=()=>{
   const title=scarf.paused?'Play scarf':'Pause scarf';
   if(button.textContent!==title)button.textContent=title;
   if(button.getAttribute?.('aria-label')!==title)button.setAttribute('aria-label',title);
  };
  function seekReveal(){
   if(deleted||!loaded||reveal.seeking||!seekPending)return;
   const length=Number.isFinite(reveal.duration)&&reveal.duration>0?reveal.duration:3;
   const target=clamp(seekTarget/Math.max(.001,length-.033))*(length-.033);
   // Collapse multiple wheel events into a single decode request and avoid
   // decoder thrashing on tiny movements. Seeked schedules the latest target.
   if(lastSeek>=0&&Math.abs(lastSeek-target)<.04){
    seekPending=false;return;
   }
   try{
    lastSeek=target;seekPending=false;reveal.currentTime=target;
   }catch{seekPending=true;}
  }
  const planSeek=progress=>{
   if(!loaded||progress>.62)return;
   seekTarget=range(progress,0,.49)*Math.max(0,(Number.isFinite(reveal.duration)?reveal.duration:3)-.033);
   seekPending=true;
   seekReveal();
  };
  // The scarf also follows the scroll head. No automatic looping while the
  // page is still: stopping at any scroll position freezes the actual video.
  function seekScarf(){
   if(deleted||!scarfLoaded||!scarfPending||scarf.seeking)return;
   const length=Number(scarf.duration);
   if(!Number.isFinite(length)||length<=0)return;
   const target=range(scarfTarget,0,length-.05)*(length-.05);
   // Avoid flooding the H.264 decoder with seeks for effectively identical
   // frames; 30 fps footage cannot display changes smaller than 1/30 second.
   if(lastScarfSeek>=0&&Math.abs(lastScarfSeek-target)<.055){scarfPending=false;return;}
   try{lastScarfSeek=target;scarfPending=false;scarf.currentTime=target;}
   catch{scarfPending=true;}
  }
  const planScarf=progress=>{
   const duration=Number(scarf.duration);
   if(!scarfLoaded||!Number.isFinite(duration)||duration<=0)return;
   scarfTarget=range(progress,.43,1)*(duration-.05);
   scarfPending=true;
   seekScarf();
  };
  const prefetch=()=>{
   if(!near||deleted)return;
   if((!sprites||spriteFailed)&&!loaded){
    loaded=true;
    reveal.preload='auto';
    reveal.src='/assets/frame-cut/reveal.mp4';
    reveal.load?.();
   }
   if(sprites&&!spriteFailed){
    // Prewarm all 10 small WebPs well before the user starts scrubbing.
    for(let index=0;index<10;index++)loadSheet(index);
   }
   if(!scarfLoaded){
    scarfLoaded=true;
    scarf.preload='auto';
    scarf.src='/assets/frame-cut/scarf.mp4';
    scarf.load?.();
   }
  };
  const render=()=>{
   raf=0;
   if(deleted||!this.isConnected)return;
   const full=window.StudioMotion?.level==='full'&&!document.hidden;
   if(lastFull!==full){
    lastFull=full;this.toggleAttribute('data-full',full);
    // Enabling full motion changes scene height, so invalidate cached geometry.
    layout=null;
   }
   if(!full){
    cinema(false);pause();button.hidden=true;
    if(lastFocus!==false){lastFocus=false;this.removeAttribute('data-focus');}
    if(lastProgress!==0){
     lastProgress=0;set('--frame-reveal-opacity',0);set('--scarf-film-opacity',0);
     set('--scarf-emblem-opacity',1);set('--scarf-rings-opacity',1);
    }
    return;
   }
   if(!layout)measure();
   if(!layout)return;
   const y=scrollY();
   const relativeTop=layout.top-y;
   const progress=clamp(-relativeTop/layout.travel);
   const visible=relativeTop<layout.height&&relativeTop+layout.height+layout.travel>0;
   if(!visible&&!near){cinema(false);pause();button.hidden=true;return;}
   const focus=visible&&relativeTop<=1&&relativeTop+layout.travel>=-1;
   if(focus!==lastFocus){lastFocus=focus;this.toggleAttribute('data-focus',focus);}
   cinema(focus);
   if(near)prefetch();
   // Direct pixel-to-frame timeline: V in the first 49%, quick scarf handoff
   // between 42–62%, and scarf frame scrubbing through the remaining distance.
   // No idle animation or easing that continues after the user's scroll stops.
   if(Math.abs(progress-lastProgress)>.00045){
    lastProgress=progress;
    const arrival=ease(range(progress,0,.08));
    const transition=ease(range(progress,.42,.62));
    const portalLife=1-ease(range(progress,.44,.63));
    const hasFrame=drawSprite(progress);
    const fallback=hasFrame||ready?0:1;
    set('--scarf-progress',progress.toFixed(5));
    set('--frame-reveal-opacity',portalLife.toFixed(4));
    set('--frame-reveal-ready',!hasFrame&&ready?1:0);
    set('--frame-canvas-ready',hasFrame?1:0);
    set('--frame-poster-opacity',hasFrame||ready?0:1);
    set('--frame-portal-light',((.10+.6*Math.sin(Math.PI*range(progress,.03,.62)))*portalLife).toFixed(4));
    set('--frame-portal-rotation',(-8+progress*24).toFixed(3)+'deg');
    set('--scarf-film-opacity',transition.toFixed(4));
    set('--scarf-film-scale',(1.055-.055*transition).toFixed(4));
    // This compositor-only displacement remains immediately scroll-locked
    // even when the browser's video decoder is finishing a seek.
    const fabric=range(progress,.42,1);
    set('--scarf-pan-x',((fabric-.5)*1.8).toFixed(3)+'%');
    set('--scarf-pan-y',((.5-fabric)*1.5).toFixed(3)+'%');
    set('--scarf-tilt',((fabric-.5)*.8).toFixed(3)+'deg');
    set('--scarf-emblem-opacity',fallback*(1-transition));
    set('--scarf-rings-opacity',(fallback*(.22+.78*arrival)*portalLife).toFixed(4));
    set('--scarf-scale',(1.12-.12*arrival).toFixed(4));
    set('--scarf-angle',((1-arrival)*6).toFixed(3)+'deg');
    set('--scarf-x','0%');set('--scarf-y','0%');
    if(!sprites||spriteFailed)planSeek(progress);
    if(manualPlay){manualPlay=false;pause();}
    planScarf(progress);
   }
   const showScarf=near&&visible&&progress>=.43;
   button.hidden=!showScarf;
   if(!showScarf){manualPlay=false;pause();return;}
   if(!manualPlay)pause();
  };
  const schedule=()=>{if(!raf&&!deleted)raf=requestAnimationFrame(render);};
  const preference=()=>{layout=null;lastProgress=-1;schedule();};
  let observer=null;
  if(typeof IntersectionObserver==='function'){
   observer=new IntersectionObserver(([entry])=>{
    near=Boolean(entry?.isIntersecting);
    if(near)prefetch();else pause();
    schedule();
   },{rootMargin:'200% 0px',threshold:0});
   observer.observe(this);
  }else{near=true;prefetch();}
  on(reveal,'loadedmetadata',()=>{seekPending=true;seekReveal();schedule();});
  on(reveal,'loadeddata',()=>{if(!reveal.seeking){ready=true;lastProgress=-1;schedule();}});
  on(reveal,'seeked',()=>{
   if(!ready){ready=true;lastProgress=-1;schedule();}
   if(seekPending)seekReveal();
  });
  on(reveal,'error',()=>{ready=false;lastProgress=-1;schedule();});
  on(scarf,'loadedmetadata',()=>{planScarf(Math.max(0,lastProgress));schedule();});
  on(scarf,'seeked',()=>{if(scarfPending)seekScarf();});
  on(scarf,'play',label);on(scarf,'pause',label);
  on(button,'click',()=>{
   if(manualPlay){manualPlay=false;pause();schedule();return;}
   manualPlay=true;playback=true;scarf.loop=true;
   const promise=scarf.play();
   promise?.catch?.(()=>{manualPlay=false;playback=false;label();});
   label();
  });
  on(window,'scroll',schedule,{passive:true});
  on(window,'resize',()=>{layout=null;drawnFrame=-1;lastProgress=-1;schedule();},{passive:true});
  on(window,'pageshow',()=>{layout=null;schedule();});
  on(document,'visibilitychange',schedule);
  on(document,'studio:route',()=>{layout=null;lastProgress=-1;schedule();});
  window.StudioMotion?.addEventListener?.('change',preference);
  // Geometry changes asynchronously when fonts, media and page content settle.
  let sizeObserver=null;
  if(typeof ResizeObserver==='function'){
   sizeObserver=new ResizeObserver(()=>{layout=null;lastProgress=-1;schedule();});
   sizeObserver.observe(this);
   sizeObserver.observe(stage);
  }
  this.cleanup=()=>{
   deleted=true;controller.abort();observer?.disconnect();sizeObserver?.disconnect();
   cancelAnimationFrame(raf);window.StudioMotion?.removeEventListener?.('change',preference);
   cinema(false);pause();reveal.pause?.();sheets.clear();reveal.removeAttribute('src');scarf.removeAttribute('src');
   reveal.load?.();scarf.load?.();
  };
  schedule();
 }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
