'use strict';
/* Public motion preferences + two-stage, keyboard-accessible opening spotlight.
   Source of truth for movement remains data-motion and veloryz.motion.v2. */
(()=>{
 const root=document.documentElement;
 const key='veloryz.motion.v2';
 const welcomeKey='veloryz.motion.intro.v3';
 const valid=new Set(['auto','full','reduced','paused']);
 const media=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
 const listeners=new Set();
 let preference='auto',gateActive=false,gateStage=0,gateInitialized=false,gateAttempts=0,observer,queued=false,originalOverflow='',introDone=false;
 try{const saved=localStorage.getItem(key);if(valid.has(saved))preference=saved;introDone=localStorage.getItem(welcomeKey)==='1';}catch{}
 const saver=()=>typeof navigator!=='undefined'&&Boolean(navigator.connection?.saveData);
 const effective=()=>preference==='auto'?(media?.matches||saver()?'reduced':'full'):preference;
 // An actual first-visit choice is required once per browser, then remembered.
 // Existing explicit Full preference is already a completed choice.
 // The former compulsory gate locked the site and delayed all motion on first visits.
 // The existing Motion settings remain available without blocking content playback.
 const needsIntro=false;
 if(needsIntro)root.setAttribute('data-motion-gate','boot');
 let gateOverlay=null;
 function lockPage(){
  const rootNodes=['#ad-slider','#main','#footer','#modal-root','#expert-launcher','#offer-dock','#site-pin','.whatsapp-float','.skip-link','#site-progress','.site-header .brand','.site-header .desktop-nav','.site-header .header-status','.site-header .button.small','.site-header .menu-toggle','#mobile-nav'];
  rootNodes.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{
   if(el.dataset.motionInert!=='1'){
    el.dataset.motionInert='1';el.dataset.motionWasInert=String(el.inert);
   }
   el.inert=true;
  }));
 }
 function unlockPage(){
  document.querySelectorAll('[data-motion-inert="1"]').forEach(el=>{
   el.inert=el.dataset.motionWasInert==='true';
   delete el.dataset.motionInert;delete el.dataset.motionWasInert;
  });
 }
 function gateControls(dialog){
  if(!dialog)return;
  dialog.classList.toggle('motion-gate-mode',gateActive);
  const form=dialog.querySelector('form[method=dialog]');if(form)form.hidden=gateActive;
  dialog.querySelectorAll('[data-motion-choice]').forEach(btn=>{
   btn.disabled=gateActive&&btn.dataset.motionChoice!=='full';
   btn.setAttribute('aria-disabled',String(btn.disabled));
   btn.tabIndex=btn.disabled?-1:0;
  });
  const hint=dialog.querySelector('.motion-gate-hint');
  if(hint)hint.hidden=!gateActive;
  const accessibleExit=dialog.querySelector('[data-motion-accessible-exit]');if(accessibleExit)accessibleExit.hidden=!gateActive;
 }
 function createOverlay(){
  if(gateOverlay)return;
  gateOverlay=document.createElement('div');
  gateOverlay.id='motion-focus-overlay';gateOverlay.setAttribute('aria-hidden','true');
  document.body.append(gateOverlay);
 }
 function activateGate(){
  if(window.VeloryzIntro?.active)return;
  if(gateInitialized||!needsIntro)return;
  const button=document.querySelector('.site-header .header-motion');
  if(!button){if(++gateAttempts<120)requestAnimationFrame(activateGate);else root.removeAttribute('data-motion-gate');return;}
  gateInitialized=true;gateActive=true;gateStage=1;
  originalOverflow=document.body.style.overflow;
  document.body.classList.add('motion-focus-active');
  root.dataset.motionGate='icon';
  window.scrollTo?.({top:0,behavior:'instant'});
  document.body.style.overflow='hidden';
  createOverlay();lockPage();
  button.classList.add('motion-gate-target');
  button.setAttribute('aria-label','Open motion settings to enable Full motion');
  button.focus({preventScroll:true});
  // Show the decision immediately; visitors need not hunt for the header icon.
  requestAnimationFrame(()=>{if(gateActive)panel();});
 }
 function endGate(){
  if(!gateActive)return;
  gateActive=false;gateStage=0;
  root.removeAttribute('data-motion-gate');
  document.body.classList.remove('motion-focus-active');
  document.body.style.overflow=originalOverflow;
  gateOverlay?.remove();gateOverlay=null;
  document.querySelector('.site-header .header-motion')?.classList.remove('motion-gate-target');
  document.querySelector('.site-header .header-motion')?.setAttribute('aria-label','Motion settings');
  unlockPage();
  const dialog=document.querySelector('#motion-preferences');
  gateControls(dialog);
  if(dialog?.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
  sync();
  document.dispatchEvent(new CustomEvent('studio:motion-intro-complete'));
 }
 function sync(){
  const level=effective();root.dataset.motion=level;root.dataset.motionPreference=preference;
  document.body?.classList.toggle('motion-paused',level==='paused');
  document.body?.classList.toggle('motion-reduced',level==='reduced');
  document.querySelectorAll('[data-motion-label]').forEach(el=>el.textContent=level==='full'?'Motion on':level==='paused'?'Motion paused':'Reduced motion');
  document.querySelectorAll('[data-motion-choice]').forEach(el=>{const selected=el.dataset.motionChoice===preference;el.setAttribute('aria-pressed',String(selected));el.classList.toggle('selected',selected);});
  const status=document.querySelector('#motion-status');
  if(status)status.textContent=gateActive?'Select Turn motion on to unlock the animated studio. Reduced motion remains available below.':preference==='auto'?`Automatic is using ${level==='full'?'full':'reduced'} motion, following your device preference.`:level==='full'?'Full motion is on. Graphics move automatically. You can reduce or pause them at any time.':level==='paused'?'Motion is paused. All content and controls remain available.':'Reduced motion is on. The experience stays clear, with a still presentation.';
  for(const callback of listeners){try{callback({type:'change',matches:level!=='full'});}catch{console.warn('A motion view could not refresh.');}}

 }
 function choose(value){
  if(!valid.has(value)||(gateActive&&!['full','reduced'].includes(value)))return;
  preference=value;
  if(gateActive&&['full','reduced'].includes(value))introDone=true;
  try{localStorage.setItem(key,value);if(introDone)localStorage.setItem(welcomeKey,'1');}catch{}
  sync();observe();if(gateActive&&['full','reduced'].includes(value))endGate();
 }
 function observe(){
  observer?.disconnect();
  document.querySelectorAll('.motion-offscreen').forEach(el=>el.classList.remove('motion-offscreen'));
  if(typeof IntersectionObserver!=='function')return;
  try{
   observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.classList.toggle('motion-offscreen',!isIntersecting)),{rootMargin:'160px',threshold:0});
   document.querySelectorAll('.render-drift,.motion-scene,.motion-glyph,.design-preview,.people-portrait,.team-art,.process-symbol,.platform-teaser,.expert-avatar').forEach(el=>observer.observe(el));
  }catch{observer?.disconnect();}
 }
 function panel(){
  let dialog=document.querySelector('#motion-preferences');
  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='motion-preferences';dialog.className='motion-dialog';dialog.setAttribute('aria-labelledby','motion-title');
   dialog.innerHTML=`<form method="dialog"><button class="motion-close" aria-label="Close motion settings">×</button></form><div class="motion-panel-icon" aria-hidden="true"><i></i><i></i><i></i></div><span class="motion-eyebrow">VELORYZ STUDIO / YOUR EXPERIENCE</span><h2 id="motion-title">Make the studio<br><em>move.</em></h2><p>Turn on the full VELORYZ motion experience to explore its sculptural animations, fluid scrolling, and interactive details. One choice, remembered on this device.</p><div class="motion-choices">${[['auto','Automatic','Follow this device'],['full','Turn motion on','Full studio experience · fluid scroll'],['reduced','Reduced','A quieter experience'],['paused','Pause','Keep everything still']].map(([id,name,note])=>`<button type="button" data-motion-choice="${id}" aria-pressed="false"><span>${name}</span><small>${note}</small><i aria-hidden="true">↗</i></button>`).join('')}</div><p class="motion-gate-hint" role="note" hidden>Choose <strong>Full motion</strong> to enter the animated studio. Prefer less movement? Continue in reduced mode below.</p><button type="button" class="motion-accessible-exit" data-motion-accessible-exit hidden>Continue with reduced motion</button><p id="motion-status" role="status"></p><p class="motion-panel-note">Films have a separate play control if your browser limits autoplay.</p>`;
   document.body.append(dialog);
   dialog.addEventListener('click',e=>{if(e.target===dialog&&!gateActive)dialog.close();});
   dialog.addEventListener('cancel',e=>{if(gateActive){e.preventDefault();choose('reduced');}});
  }
  if(gateActive){gateStage=2;root.dataset.motionGate='panel';}
  gateControls(dialog);sync();
  if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
  else if(typeof dialog.showModal!=='function'){dialog.setAttribute('open','');dialog.classList.add('motion-dialog-fallback');}
  if(gateActive)requestAnimationFrame(()=>dialog.querySelector('[data-motion-choice=full]')?.focus());
 }
 function progress(){queued=false;const el=document.querySelector('#site-progress');if(!el)return;const total=root.scrollHeight-innerHeight;el.style.setProperty('--progress',total>0?String(Math.min(1,Math.max(0,scrollY/total))):'0');}
 window.StudioMotion={get level(){return effective();},get preference(){return preference;},get matches(){return effective()!=='full';},get onboardingActive(){return gateActive||Boolean(root.dataset.motionGate)||Boolean(window.VeloryzIntro?.active);},addEventListener(type,fn){if(type==='change')listeners.add(fn);},removeEventListener(type,fn){listeners.delete(fn);},choose,openPanel:panel,observe,sync};
 sync();
 document.addEventListener('click',event=>{
  const btn=event.target.closest('button');if(!btn)return;
  if(gateActive&&(!btn.matches('.site-header .header-motion')&&!btn.matches('#motion-preferences [data-motion-choice=full]')&&!btn.matches('#motion-preferences [data-motion-accessible-exit]'))){event.preventDefault();event.stopImmediatePropagation();return;}
  if(btn.hasAttribute('data-motion-control'))panel();
  if(btn.hasAttribute('data-motion-choice'))choose(btn.dataset.motionChoice);
  if(btn.hasAttribute('data-motion-accessible-exit'))choose('reduced');
  if(btn.matches('.motion-close')&&!gateActive){const dialog=document.querySelector('#motion-preferences');dialog?.classList.remove('motion-dialog-fallback');if(typeof dialog?.close!=='function')dialog?.removeAttribute('open');}
 },true);
 document.addEventListener('keydown',event=>{
  if(!gateActive)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();choose('reduced');return;}
  if(event.key==='Tab'&&gateStage===1){event.preventDefault();document.querySelector('.site-header .header-motion')?.focus();}
 },true);
 document.addEventListener('visibilitychange',()=>{root.toggleAttribute('data-motion-suspended',document.hidden);if(!document.hidden){sync();observe();}});
 window.addEventListener('pageshow',()=>{root.removeAttribute('data-motion-suspended');sync();observe();});
 window.addEventListener('storage',event=>{if(event.key===key){preference=valid.has(event.newValue)?event.newValue:'auto';sync();observe();}});
 window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(progress);}},{passive:true});
 const changed=()=>{if(preference==='auto')sync();};if(media?.addEventListener)media.addEventListener('change',changed);else media?.addListener?.(changed);
 document.addEventListener('studio:brand-intro-complete',()=>{if(needsIntro)activateGate();});
 document.addEventListener('DOMContentLoaded',()=>{sync();observe();progress();activateGate();});
 document.addEventListener('studio:route',()=>{if(!gateInitialized && needsIntro)activateGate();
  if(gateActive){lockPage();const target=document.querySelector('.site-header .header-motion');target?.classList.add('motion-gate-target');if(gateStage===1)target?.focus({preventScroll:true});}});
})();
