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
   seekTarget=ease(range(progress,0,.62))*Math.max(0,(Number.isFinite(reveal.duration)?reveal.duration:3)-.033);
   seekPending=true;
   seekReveal();
  };
  const prefetch=()=>{
   if(!near||deleted)return;
   if(!loaded){
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
   // Timeline: 0–62% original V/portal video; 58–72% seamless film blend;
   // 72–100% living scarf. Scroll up reverses the authored portal sequence.
   if(Math.abs(progress-lastProgress)>.00045){
    lastProgress=progress;
    const arrival=ease(range(progress,0,.12));
    const transition=ease(range(progress,.58,.72));
    const portalLife=1-ease(range(progress,.60,.75));
    const fallback=ready?0:1;
    set('--scarf-progress',progress.toFixed(5));
    set('--frame-reveal-opacity',portalLife.toFixed(4));
    set('--frame-reveal-ready',ready?1:0);
    set('--frame-poster-opacity',(ready?0:portalLife).toFixed(4));
    set('--frame-portal-light',((.12+.72*Math.sin(Math.PI*range(progress,.04,.72)))*portalLife).toFixed(4));
    set('--frame-portal-rotation',(-8+progress*24).toFixed(3)+'deg');
    set('--scarf-film-opacity',transition.toFixed(4));
    set('--scarf-film-scale',(1.055-.055*transition).toFixed(4));
    set('--scarf-emblem-opacity',fallback*(1-transition));
    set('--scarf-rings-opacity',(fallback*(.22+.78*arrival)*portalLife).toFixed(4));
    set('--scarf-scale',(1.12-.12*arrival).toFixed(4));
    set('--scarf-angle',((1-arrival)*6).toFixed(3)+'deg');
    set('--scarf-x','0%');set('--scarf-y','0%');
    planSeek(progress);
   }
   const showScarf=near&&visible&&progress>=.60;
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
  on(window,'resize',schedule,{passive:true});
  on(window,'pageshow',schedule);
  on(document,'visibilitychange',schedule);
  on(document,'studio:route',schedule);
  window.StudioMotion?.addEventListener?.('change',preference);
  this.cleanup=()=>{
   deleted=true;controller.abort();observer?.disconnect();
   cancelAnimationFrame(raf);window.StudioMotion?.removeEventListener?.('change',preference);
   pause();reveal.pause?.();reveal.removeAttribute('src');scarf.removeAttribute('src');
   reveal.load?.();scarf.load?.();
  };
  schedule();
 }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
