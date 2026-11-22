/* VELORYZ Studio | closing identity film.
   The 7.75-second owned video loads near the final homepage chapter, not at page load.
   Original VELORYZ assets provide a complete animated fallback until the video is hosted. */
(()=>{
'use strict';
const PAGE='#main',ID='vz-closing-film';
const FULL='/assets/brand/intro/veloryz-cinematic-full.mp4';
const MOBILE='/assets/brand/intro/veloryz-cinematic-full-mobile.mp4';
// This official existing project film is already checked into the site assets;
// it plays if the separate cinematic export was not installed in hosting.
const BUNDLED='/assets/frame-cut/reveal.mp4';
const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
const compact=typeof matchMedia==='function'?matchMedia('(max-width: 700px)'):null;
let section=null,video=null,observer=null,visible=false,loaded=false,failed=false,complete=false;
let frame=0,queued=false,manuallyPlayed=false,pendingManualPlay=false,sourceAttempt=0,fallTimer=0;
const homepage=()=>location.pathname==='/'||location.pathname==='/index.html';
const allowMotion=()=>!reduce?.matches&&!navigator.connection?.saveData&&!['paused','reduced'].includes(window.StudioMotion?.level)&&!document.hidden;
const markup=()=>[
'<section class="vz-closing-film" id="vz-closing-film" aria-labelledby="vz-film-title">',
'<div class="vz-film-heading"><div><span class="vz-film-eyebrow"><i aria-hidden="true"></i> VELORYZ / IDENTITY NO. 001</span><h2 id="vz-film-title">A little more<br><em>than a logo.</em></h2></div>',
'<p>A signature in motion. Our original faceted V, sculptural portal and official wordmark, together in one final frame.</p></div>',
'<div class="vz-film-window" data-film-state="still" data-film-media="pending"><div class="vz-film-canvas">',
'<div class="vz-film-illustration" aria-hidden="true">',
'<div class="vz-film-dark"><span class="vz-film-filmgrid"></span><span class="vz-film-orbit orbit-one"></span><span class="vz-film-orbit orbit-two"></span>',
'<img class="vz-film-emblem" loading="lazy" decoding="async" src="/assets/brand/veloryz-mark.svg" width="240" height="220" alt="">',
'<img class="vz-film-portal" loading="lazy" decoding="async" src="/assets/brand/official/Profile-Transparent.png" width="420" height="420" alt="">',
'<span class="vz-film-script">BEYOND THE FRAME</span></div>',
'<div class="vz-film-light"><img loading="lazy" decoding="async" src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" alt="" width="880" height="263"><span>DREAM. BUILD. GROW. TOGETHER.</span></div>',
'</div><video class="vz-film-video" playsinline muted preload="none" aria-label="VELORYZ original brand motion film" disablepictureinpicture></video>',
'<div class="vz-film-corner top-left">VELORYZ <span>/ STUDIO</span></div>',
'<div class="vz-film-corner top-right">BEYOND THE FRAME <span>·</span> 001</div>',
'<div class="vz-film-corner bottom-left">ORIGINAL STUDIO IDENT / VELORYZ</div>',
'</div><div class="vz-film-controls" role="group" aria-label="Studio film controls">',
'<button type="button" class="vz-film-action primary" data-vz-film-action="play">Play film ↗</button>',
'<button type="button" class="vz-film-action" data-vz-film-action="replay">Replay ↻</button>',
'<button type="button" class="vz-film-action" data-vz-film-action="sound" hidden aria-pressed="false">Sound off</button>',
'<button type="button" class="vz-film-action" data-vz-film-action="fullscreen">Fullscreen ⛶</button>',
'<span class="vz-film-time" aria-live="off">00:00 / 00:07</span></div>',
'<div class="vz-film-progress" aria-hidden="true"><span></span></div></div>',
'<div class="vz-film-after"><span>THE VELORYZ FILM / ORIGINAL IDENTITY IN MOTION</span>',
'<a href="/create/">Make something memorable with us <span aria-hidden="true">↗</span></a></div>',
'</section>'
].join('');
const el=selector=>section?.querySelector(selector);
const control=name=>el('[data-vz-film-action="'+name+'"]');
function setState(name){const host=el('.vz-film-window');if(host)host.dataset.filmState=name;}
function refreshButtons(){
 const play=control('play');if(!play)return;
 const running=(!failed&&video&&!video.paused)||el('.vz-film-window')?.dataset.filmState==='playing-fallback';
 const label=running?'Pause film':complete?'Play again':'Play film';
 play.textContent=label+' ↗';play.setAttribute('aria-label',label);
 control('sound').hidden=failed||!loaded;
}
function stopTicker(){if(frame){cancelAnimationFrame(frame);frame=0;}}
function ticker(){
 if(!video||video.paused||failed)return;
 const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:7.75;
 const position=Math.max(0,Math.min(duration,video.currentTime));
 section?.style.setProperty('--vz-film-progress',String(position/duration));
 const pad=n=>String(Math.floor(n)).padStart(2,'0');
 const label=el('.vz-film-time');if(label)label.textContent='00:'+pad(position)+' / 00:'+pad(duration);
 frame=requestAnimationFrame(ticker);
}
function pause(){
 if(video&&!video.paused)video.pause();
 if(el('.vz-film-window')?.dataset.filmState==='playing-fallback')setState('paused-fallback');
 stopTicker();refreshButtons();
}
function fallback(restart=false){
 failed=true;loaded=false;pendingManualPlay=false;video?.pause();
 const host=el('.vz-film-window');if(!host)return;
 host.dataset.filmMedia='fallback';
 if(restart){host.classList.remove('vz-film-fallback-animate');void host.offsetWidth;}
 host.classList.add('vz-film-fallback-animate');
 if(restart||allowMotion()&&visible&&!complete)setState('playing-fallback');
 else setState(complete?'complete':'still');
 refreshButtons();
}
function loadVideo(){
 if(!video||video.dataset.requested==='1')return;
 video.dataset.requested='1';video.preload='metadata';sourceAttempt=0;
 video.src=compact?.matches?MOBILE:FULL;
 video.load();
}
function play(explicit=false,restart=false){
 if(!section)return;
 if(explicit)manuallyPlayed=true;
 if(!explicit&&!allowMotion())return;
 complete=false;
 if(failed){fallback(true);return;}
 if(!loaded){if(explicit)pendingManualPlay=true;loadVideo();return;}
 if(restart){try{video.currentTime=0;}catch{}}
 setState('playing');
 const task=video.play();if(task?.catch)task.catch(()=>fallback(true));
 stopTicker();frame=requestAnimationFrame(ticker);refreshButtons();
}
function onEnded(){complete=true;setState('complete');section?.style.setProperty('--vz-film-progress','1');stopTicker();refreshButtons();}
function click(event){
 const target=event.target.closest('[data-vz-film-action]');if(!target)return;
 const action=target.dataset.vzFilmAction;
 if(action==='play'){
  const running=(!failed&&video&&!video.paused)||el('.vz-film-window')?.dataset.filmState==='playing-fallback';
  if(running)pause();else play(true,complete);
 }
 if(action==='replay')play(true,true);
 if(action==='sound'&&video&&!failed){video.muted=!video.muted;target.textContent=video.muted?'Sound off':'Sound on';target.setAttribute('aria-pressed',String(!video.muted));}
 if(action==='fullscreen'){
  if(document.fullscreenElement===section)document.exitFullscreen?.();
  else section.requestFullscreen?.().catch?.(()=>{});
 }
}
function observe(){
 observer?.disconnect();
 if(!section)return;
 if(typeof IntersectionObserver!=='function'){visible=true;if(allowMotion()){loadVideo();play();}return;}
 observer=new IntersectionObserver(entries=>{
  for(const item of entries){
   if(item.target!==section)continue;
   visible=item.isIntersecting&&item.intersectionRatio>=.12;
   if(visible){if(allowMotion()){loadVideo();if(!manuallyPlayed&&!complete)play();}}
   else pause();
  }
 },{rootMargin:'160px 0px 140px 0px',threshold:[0,.12,.3]});
 observer.observe(section);
}
function dispose(){
 observer?.disconnect();observer=null;visible=false;loaded=false;failed=false;complete=false;manuallyPlayed=false;pendingManualPlay=false;
 stopTicker();
 if(fallTimer)clearTimeout(fallTimer);fallTimer=0;sourceAttempt=0;
 if(video){video.pause();video.removeAttribute('src');video.load();}
 section?.remove();section=null;video=null;
}
function mount(){
 queued=false;
 if(!homepage()){dispose();return;}
 const host=document.querySelector(PAGE);if(!host)return;
 if(section?.isConnected&&section.parentElement===host)return;
 dispose();host.insertAdjacentHTML('beforeend',markup());
 section=host.querySelector('#'+ID);video=el('video');
 if(!section||!video)return;
 section.addEventListener('click',click);
 video.addEventListener('loadeddata',()=>{
  loaded=true;failed=false;el('.vz-film-window').dataset.filmMedia='video';refreshButtons();
  const duration=Number.isFinite(video.duration)?video.duration:7.75;
  video.setAttribute('aria-label','VELORYZ original brand motion film, '+Math.round(duration)+' seconds');
  if((visible&&allowMotion()&&!manuallyPlayed)||pendingManualPlay){const manual=pendingManualPlay;pendingManualPlay=false;play(manual);}
 });
 video.addEventListener('error',()=>{
  if(!section||!video?.dataset.requested)return;
  if(sourceAttempt===0){sourceAttempt=1;video.src=BUNDLED;video.load();return;}
  fallback(pendingManualPlay||visible&&allowMotion());
 });
 video.addEventListener('ended',onEnded);
 section.addEventListener('animationend',event=>{
  if(event.animationName==='vz-film-cream'&&el('.vz-film-window')?.dataset.filmMedia==='fallback')onEnded();
 });
 video.addEventListener('pause',refreshButtons);
 video.addEventListener('play',refreshButtons);
 refreshButtons();observe();
}
const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(mount);};
document.addEventListener('studio:route',schedule);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.StudioMotion?.addEventListener('change',()=>{if(!allowMotion())pause();});
reduce?.addEventListener?.('change',()=>{if(reduce.matches)pause();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
