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
  let playback=false,held=false,seekTarget=0,seekPending=false,lastSeek=-1;
  let lastProgress=-1,lastFull=null,lastFocus=null,deleted=false;
  // The original reveal has 90 frames across ten 3x3 WebP sprite sheets.
  // Drawing one source cell per scroll frame avoids expensive arbitrary MP4 seeking.
  let ctx=null;
  try{ctx=canvas?.getContext?.('2d',{alpha:false,desynchronized:true})||null;}catch{}
  const sprites=Boolean(ctx&&typeof Image==='function');
  let spriteFailed=false,spriteReady=false,drawnFrame=-1;
  const sheets=new Map();
  const TOTAL_FRAMES=90,COLS=3,CELL_W=768,CELL_H=432;
  const frameAt=p=>Math.min(TOTAL_FRAMES-1,Math.round(range(p,0,.46)*(TOTAL_FRAMES-1)));
  const loadSheet=index=>{
   if(!sprites||spriteFailed||index<0||index>=10||sheets.has(index)||deleted)return;
   const img=new Image(),entry={img,ready:false};
   sheets.set(index,entry);
   img.onload=()=>{
    if(deleted)return;
    entry.ready=true;lastProgress=-1;schedule();
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
   if(progress<.16)loadSheet(0);
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
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(entry.img,sx,sy,CELL_W,CELL_H,x,y,imageWidth,imageHeight);
    drawnFrame=current;
   }
   if(!spriteReady){spriteReady=true;set('--frame-canvas-ready',1);}
   // Only active and nearby sheets are kept in decoded memory.
   for(const key of sheets.keys())if(Math.abs(key-index)>3)sheets.delete(key);
   return true;
  };
  const set=(key,value)=>this.style.setProperty(key,String(value));
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
   if(lastSeek>=0&&Math.abs(lastSeek-target)<.028){
    seekPending=false;return;
   }
   try{
    lastSeek=target;seekPending=false;reveal.currentTime=target;
   }catch{seekPending=true;}
  }
  const planSeek=progress=>{
   if(!loaded||progress>.72)return;
   seekTarget=range(progress,0,.46)*Math.max(0,(Number.isFinite(reveal.duration)?reveal.duration:3)-.033);
   seekPending=true;
   seekReveal();
  };
  const prefetch=()=>{
   if(!near||deleted)return;
   if((!sprites||spriteFailed)&&!loaded){
    loaded=true;
    reveal.preload='auto';
    reveal.src='/assets/frame-cut/reveal.mp4';
    reveal.load?.();
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
   }
   if(!full){
    pause();button.hidden=true;
    if(lastFocus!==false){lastFocus=false;this.removeAttribute('data-focus');}
    if(lastProgress!==0){
     lastProgress=0;set('--frame-reveal-opacity',0);set('--scarf-film-opacity',0);
     set('--scarf-emblem-opacity',1);set('--scarf-rings-opacity',1);
    }
    return;
   }
   const bounds=this.getBoundingClientRect(),stageHeight=stage.clientHeight||window.innerHeight||1;
   const total=Math.max(1,bounds.height-stageHeight);
   const progress=clamp(-bounds.top/total);
   const visible=bounds.top<stageHeight&&bounds.bottom>0;
   if(!visible&&!near){pause();button.hidden=true;return;}
   const focus=visible&&bounds.top<=1&&bounds.bottom>=stageHeight-1;
   if(focus!==lastFocus){lastFocus=focus;this.toggleAttribute('data-focus',focus);}
   if(near)prefetch();
   // Fast, immediately responsive timeline: original portal over the first
   // 46% of the now-short scene; scarf crossfade at 40–57%; hold scarf.
   // No slow easing on frame position: every wheel tick advances the artwork.
   if(Math.abs(progress-lastProgress)>.00045){
    lastProgress=progress;
    const arrival=ease(range(progress,0,.08));
    const transition=ease(range(progress,.40,.57));
    const portalLife=1-ease(range(progress,.43,.60));
    const hasFrame=drawSprite(progress);
    const fallback=hasFrame||ready?0:1;
    set('--scarf-progress',progress.toFixed(5));
    set('--frame-reveal-opacity',portalLife.toFixed(4));
    set('--frame-reveal-ready',!hasFrame&&ready?1:0);
    set('--frame-canvas-ready',hasFrame?1:0);
    set('--frame-poster-opacity',hasFrame||ready?0:1);
    set('--frame-portal-light',((.12+.72*Math.sin(Math.PI*range(progress,.03,.57)))*portalLife).toFixed(4));
    set('--frame-portal-rotation',(-8+progress*24).toFixed(3)+'deg');
    set('--scarf-film-opacity',transition.toFixed(4));
    set('--scarf-film-scale',(1.055-.055*transition).toFixed(4));
    set('--scarf-emblem-opacity',fallback*(1-transition));
    set('--scarf-rings-opacity',(fallback*(.22+.78*arrival)*portalLife).toFixed(4));
    set('--scarf-scale',(1.12-.12*arrival).toFixed(4));
    set('--scarf-angle',((1-arrival)*6).toFixed(3)+'deg');
    set('--scarf-x','0%');set('--scarf-y','0%');
    if(!sprites||spriteFailed)planSeek(progress);
   }
   const showScarf=near&&visible&&progress>=.43;
   button.hidden=!showScarf;
   if(!showScarf||held){pause();return;}
   if(!playback){
    playback=true;
    const promise=scarf.play();
    promise?.catch?.(()=>{if(playback){playback=false;held=true;label();}});
   }
  };
  const schedule=()=>{if(!raf&&!deleted)raf=requestAnimationFrame(render);};
  const preference=()=>{lastProgress=-1;schedule();};
  let observer=null;
  if(typeof IntersectionObserver==='function'){
   observer=new IntersectionObserver(([entry])=>{
    near=Boolean(entry?.isIntersecting);
    if(near)prefetch();else pause();
    schedule();
   },{rootMargin:'125% 0px',threshold:0});
   observer.observe(this);
  }else{near=true;prefetch();}
  on(reveal,'loadedmetadata',()=>{seekPending=true;seekReveal();schedule();});
  on(reveal,'loadeddata',()=>{if(!reveal.seeking){ready=true;lastProgress=-1;schedule();}});
  on(reveal,'seeked',()=>{
   if(!ready){ready=true;lastProgress=-1;schedule();}
   if(seekPending)seekReveal();
  });
  on(reveal,'error',()=>{ready=false;lastProgress=-1;schedule();});
  on(scarf,'play',label);on(scarf,'pause',label);
  on(button,'click',()=>{
   held=!scarf.paused;
   if(!held)playback=false;
   schedule();
  });
  on(window,'scroll',schedule,{passive:true});
  on(window,'resize',()=>{drawnFrame=-1;lastProgress=-1;schedule();},{passive:true});
  on(window,'pageshow',schedule);
  on(document,'visibilitychange',schedule);
  on(document,'studio:route',schedule);
  window.StudioMotion?.addEventListener?.('change',preference);
  this.cleanup=()=>{
   deleted=true;controller.abort();observer?.disconnect();
   cancelAnimationFrame(raf);window.StudioMotion?.removeEventListener?.('change',preference);
   pause();reveal.pause?.();sheets.clear();reveal.removeAttribute('src');scarf.removeAttribute('src');
   reveal.load?.();scarf.load?.();
  };
  schedule();
 }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
