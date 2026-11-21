/* VELORYZ frame-cut: one reliable rAF scroll progress for original V, rings and scarf film.
 * No CSS view-timeline dependency; no image redraw and no scroll hijacking.
 */
class VeloryzFrameCut extends HTMLElement {
  connectedCallback() {
    queueMicrotask(() => { if (this.isConnected && !this.cleanup) this.mount(); });
  }
  disconnectedCallback() { this.cleanup?.(); this.cleanup=null; }
  mount() {
    const scarf=this.querySelector('.frame-scarf');
    const button=this.querySelector('.frame-toggle');
    const stage=this.querySelector('.frame-stage');
    if(!scarf||!button||!stage)return;
    const controller=new AbortController();
    const listen=(target,type,fn,options={})=>target?.addEventListener?.(type,fn,{...options,signal:controller.signal});
    const clamp=value=>Math.min(1,Math.max(0,value));
    const mix=(a,b,t)=>a+(b-a)*t;
    const part=(p,a,b)=>clamp((p-a)/(b-a));
    let full=false,near=false,held=false,playing=false,frame=0,videoLoadStarted=false,lastProgress=-1,lastFull=null,lastFocus=null;
    let observer;
    const style=(name,value)=>this.style.setProperty(name,String(value));
    const setProgress=p=>{
      // Ignore sub-pixel changes; an unchanged scene should not recalculate styles.
      if(Math.abs(p-lastProgress)<.0008)return;
      lastProgress=p;
      // Match the original authored choreography, including the pause before scarf reveal.
      const intro=part(p,0,.38),outro=part(p,.47,.69);
      const easeOut=t=>1-Math.pow(1-t,3);
      const zoom=easeOut(intro);
      const x=mix(0,13,outro),y=mix(0,-3,outro);
      const scale=intro<1?mix(4.1,1,zoom):mix(1,.58,outro);
      const angle=intro<1?mix(12,0,zoom):mix(0,17,outro);
      style('--scarf-progress',p.toFixed(5));
      style('--scarf-x',x.toFixed(3)+'%');
      style('--scarf-y',y.toFixed(3)+'%');
      style('--scarf-scale',scale.toFixed(4));
      style('--scarf-angle',angle.toFixed(3)+'deg');
      style('--scarf-emblem-opacity',(1-outro).toFixed(4));
      style('--scarf-rings-opacity',part(p,.06,.32).toFixed(4));
      style('--scarf-film-opacity',part(p,.47,.69).toFixed(4));
      style('--scarf-film-scale',mix(1.05,1,part(p,.47,.69)).toFixed(4));
    };
    const label=()=>{
      button.textContent=scarf.paused?'Play scarf':'Pause scarf';
      button.setAttribute('aria-label',button.textContent);
    };
    const pause=()=>{
      if(playing||!scarf.paused){playing=false;scarf.pause();}
    };
    const update=()=>{
      frame=0;
      if(!this.isConnected)return;
      full=window.StudioMotion?.level==='full';
      if(lastFull!==full){lastFull=full;this.toggleAttribute('data-full',full);}
      if(!full||document.hidden){
        pause();button.hidden=true;if(lastFocus!==false){lastFocus=false;this.removeAttribute('data-focus');}setProgress(0);return;
      }
      const bounds=this.getBoundingClientRect();
      const stageHeight=stage.clientHeight||window.innerHeight||1;
      // Sticky stage travels over the height of the entire scene minus the viewport.
      const travel=Math.max(1,bounds.height-stageHeight);
      const progress=clamp(-bounds.top/travel);
      const visible=bounds.top<stageHeight&&bounds.bottom>0;
      if(!visible&&!near){pause();button.hidden=true;if(lastFocus!==false){lastFocus=false;this.removeAttribute('data-focus');}return;}
      // The rAF controller runs only on actual scroll/resize/change events.
      setProgress(progress);
      const focus=visible&&bounds.top<=1&&bounds.bottom>=stageHeight-1;
      if(lastFocus!==focus){lastFocus=focus;this.toggleAttribute('data-focus',focus);}
      if(near&&visible&&progress>=.22&&!videoLoadStarted){
        videoLoadStarted=true;
        scarf.preload='auto';
        scarf.src='/assets/frame-cut/scarf.mp4';
      }
      const film=near&&visible&&progress>=.47;
      button.hidden=!film;
      if(!film||held){pause();return;}
      if(!playing){
        playing=true;
        const promise=scarf.play();
        promise?.catch?.(()=>{
          if(playing){playing=false;held=true;label();}
        });
      }
    };
    const schedule=()=>{
      if(!frame)frame=requestAnimationFrame(update);
    };
    const preference=()=>{schedule();};
    if(typeof IntersectionObserver==='function'){
      observer=new IntersectionObserver(([entry])=>{near=entry.isIntersecting; if(!near)pause();schedule();},{rootMargin:'60% 0px'});
      observer.observe(this);
    }else near=true;
    listen(window,'scroll',schedule,{passive:true});
    listen(window,'resize',schedule,{passive:true});
    listen(window,'pageshow',schedule);
    listen(document,'visibilitychange',schedule);
    listen(document,'studio:route',schedule);
    listen(button,'click',()=>{held=!scarf.paused; if(!held)playing=false; schedule();});
    listen(scarf,'play',label);
    listen(scarf,'pause',label);
    window.StudioMotion?.addEventListener?.('change',preference);
    schedule();
    this.cleanup=()=>{
      controller.abort();observer?.disconnect();cancelAnimationFrame(frame);
      window.StudioMotion?.removeEventListener?.('change',preference);
      pause();scarf.removeAttribute('src');scarf.load();
    };
  }
}
if(!customElements.get('veloryz-frame-cut'))customElements.define('veloryz-frame-cut',VeloryzFrameCut);
