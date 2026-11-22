'use strict';
/**
 * Site-wide VELORYZ kinetic interactions, version 2.
 * Broad, visible effects using CSS/WAAPI; no additional scroll RAF or wheel listeners.
 * Compatible with self-hosted Lenis, Lottie and Motion. Works without a CDN.
 */
(()=>{
 if(window.VeloryzKineticSite)return;
 const doc=document,root=doc.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse=matchMedia('(pointer: coarse)');
 const network=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const lite=()=>Boolean(network?.saveData);
 const allowed=()=>(!reduced.matches||root.dataset.motion==='full')&&root.dataset.motion!=='paused'&&root.dataset.motion!=='reduced'&&!doc.hidden;
 const desktop=()=>allowed()&&!coarse.matches&&!lite();
 const buttonSelector='button,[role="button"],input[type="submit"],input[type="button"],.btn,.button,.v4-primary,.v4-secondary,.vz-chat-send,.cta-button,.submit-button,[data-v4-action],[data-v4-pick]';
 const cardSelector='.project-card,.project-art,.folio-shot,.process-card,.service-item,.design-card,.feature-card,.price-card,.people-card,.ui-study-card,.lab-swatch-card,.v4-choice,.v4-category-card,.v4-template-card,.vz-ext-card,.vz-chat-suggestion,.kb-article-card,.studio-ai-help,.platform-teaser';
 const revealSelector='.section-head,.page-intro,.platform-intro,.v4-question-heading,.v4-reference,.v4-success-handoff,.v4-handoff-step,.vz-chat-side-head,.kb-reader-tools,.feature-card,.process-card,.service-item,.project-caption,.people-card,.design-card,.price-card,.call-card,.v4-choice';
 const chatSelector='.chat-message,.vz-chat-message,.vz-chat-messages article,.vz-chat-log article,.chat-typing,.vz-chat-typing,.chat-error,.vz-chat-error';
 const errorSelector='#v4-error:not([hidden]),.v4-error:not([hidden]),.chat-error,.vz-chat-error:not([hidden]),[role="alert"]:not([hidden]),[aria-invalid="true"]';
 const successSelector='.v4-success-check,.v4-success-enhanced .v4-reference,.toast.is-success,[role="status"].success';
 const prepared=new WeakSet(),entered=new WeakSet(),notified=new WeakSet();
 let sceneObserver=null,domObserver=null,pending=new Set(),batch=0,halo=null,glow=null,ambient=null,point=null,pointerFrame=0,hovered=false,down=false;
 const rootSelector=[buttonSelector,cardSelector,revealSelector,chatSelector,errorSelector,successSelector,'a[href]','input:not([type="hidden"]),textarea,select'].join(',');
 function mark(el){
  if(!(el instanceof Element)||prepared.has(el))return;
  prepared.add(el);
  if(el.matches(buttonSelector))el.classList.add('vz-kinetic-button');
  else if(el.matches(cardSelector))el.classList.add('vz-kinetic-card');
  if(el.matches('a[href]')&&!el.matches(buttonSelector))el.classList.add('vz-kinetic-link');
  if(el.matches('input:not([type="hidden"]),textarea,select'))el.classList.add('vz-kinetic-field');
  if(el.matches(revealSelector)&&!el.matches('.v4-success-check')&&sceneObserver)sceneObserver.observe(el);
 }
 function decorateTree(node){
  if(!(node instanceof Element))return;
  if(node.matches(rootSelector))mark(node);
  for(const el of node.querySelectorAll(rootSelector))mark(el);
 }
 function restartAnimation(el,className){
  if(!allowed()||!el?.isConnected)return;
  el.classList.remove(className);
  // Web Animations runs from a class on an added item, not by changing scroll positions.
  void el.offsetWidth;
  el.classList.add(className);
  el.addEventListener('animationend',()=>el.classList.remove(className),{once:true});
 }
 function handleNew(node){
  if(!(node instanceof Element))return;
  if(node.matches(chatSelector))restartAnimation(node,'vz-kinetic-chat-in');
  if(node.matches(errorSelector)&&!notified.has(node)){
   notified.add(node);restartAnimation(node,'vz-kinetic-failed');
  }
  if(node.matches(successSelector)&&!notified.has(node)){
   notified.add(node);restartAnimation(node,'vz-kinetic-confirm');
  }
  for(const el of node.querySelectorAll(chatSelector))restartAnimation(el,'vz-kinetic-chat-in');
  for(const el of node.querySelectorAll(errorSelector)){
   if(notified.has(el))continue;
   notified.add(el);restartAnimation(el,'vz-kinetic-failed');
  }
  for(const el of node.querySelectorAll(successSelector)){
   if(notified.has(el))continue;
   notified.add(el);restartAnimation(el,'vz-kinetic-confirm');
  }
 }
 function flush(){
  batch=0;
  const nodes=[...pending];pending.clear();
  for(const node of nodes){decorateTree(node);handleNew(node);}
 }
 function scheduleNode(node){pending.add(node);if(!batch)batch=requestAnimationFrame(flush);}
 function setupSceneObserver(){
  sceneObserver?.disconnect();
  if(typeof IntersectionObserver!=='function'||!allowed()){sceneObserver=null;return;}
  sceneObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    sceneObserver?.unobserve(entry.target);
    if(entered.has(entry.target))continue;
    entered.add(entry.target);
    restartAnimation(entry.target,'vz-kinetic-enter');
   }
  },{rootMargin:'0px 0px -5% 0px',threshold:.07});
 }
 function mount(){
  if(!doc.body)return;
  setupSceneObserver();
  decorateTree(doc.body);
  if(!domObserver){
   domObserver=new MutationObserver(records=>{
    for(const record of records){
     if(record.type==='childList'){
      for(const node of record.addedNodes){
       if(!(node instanceof Element)||node.classList.contains('vz-kinetic-ripple'))continue;
       scheduleNode(node);
      }
     }else if(record.target instanceof Element){
      const el=record.target;
      if(el.matches(errorSelector)&&!el.hidden)restartAnimation(el,'vz-kinetic-failed');
     }
    }
   });
   domObserver.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-invalid']});
  }
  if(allowed()&&!lite())ensureAmbient();
 }
 function ensureAmbient(){
  if(ambient||!doc.body)return;
  ambient=doc.createElement('div');ambient.className='vz-kinetic-ambient';ambient.setAttribute('aria-hidden','true');doc.body.append(ambient);
 }
 function ensurePointer(){
  if(!desktop()||halo||!doc.body)return;
  halo=doc.createElement('div');halo.className='vz-kinetic-halo';halo.setAttribute('aria-hidden','true');
  glow=doc.createElement('div');glow.className='vz-kinetic-glow';glow.setAttribute('aria-hidden','true');
  doc.body.append(glow,halo);
 }
 function pointerPaint(){
  pointerFrame=0;
  if(!point||!halo||!glow)return;
  const transform='translate3d('+point.x+'px,'+point.y+'px,0) translate(-50%,-50%)';
  halo.style.transform=transform;
  glow.style.transform=transform;
  halo.classList.toggle('is-visible',hovered&&desktop());
  halo.classList.toggle('is-down',down);
  glow.classList.toggle('is-visible',desktop());
 }
 function pointerSchedule(){if(!pointerFrame)pointerFrame=requestAnimationFrame(pointerPaint);}
 function burst(x,y){
  if(!allowed()||lite()||!doc.body)return;
  const el=doc.createElement('span');el.className='vz-kinetic-ripple';el.setAttribute('aria-hidden','true');
  el.style.setProperty('--vz-x',x+'px');el.style.setProperty('--vz-y',y+'px');
  doc.body.append(el);el.addEventListener('animationend',()=>el.remove(),{once:true});
  setTimeout(()=>el.remove(),600);
 }
 doc.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!desktop())return;
  point={x:e.clientX,y:e.clientY};
  if(!halo)ensurePointer();
  pointerSchedule();
 },{passive:true});
 doc.addEventListener('pointerover',e=>{
  if(e.pointerType!=='mouse'||!(e.target instanceof Element))return;
  const trigger=e.target.closest(buttonSelector+',a[href],.vz-kinetic-card');
  hovered=Boolean(trigger&&!trigger.closest('[inert]'));
  pointerSchedule();
 },{passive:true});
 doc.addEventListener('pointerout',e=>{
  if(e.pointerType!=='mouse')return;
  if(!(e.relatedTarget instanceof Element)||!e.relatedTarget.closest(buttonSelector+',a[href],.vz-kinetic-card'))hovered=false;
  pointerSchedule();
 },{passive:true});
 doc.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'){down=true;pointerSchedule();}
  if(e.button!==0||!(e.target instanceof Element))return;
  const trigger=e.target.closest(buttonSelector+',a[href],.v4-choice');
  if(!trigger||trigger.matches('[disabled],[aria-disabled="true"]')||trigger.closest('[inert]'))return;
  burst(e.clientX,e.clientY);
 },{passive:true,capture:true});
 for(const type of ['pointerup','pointercancel'])doc.addEventListener(type,()=>{down=false;pointerSchedule();},{passive:true});
 doc.addEventListener('keydown',e=>{
  if(!allowed()||(e.key!=='Enter'&&e.key!==' ')||!(e.target instanceof Element))return;
  const target=e.target.closest(buttonSelector);
  if(target)restartAnimation(target,'vz-kinetic-confirm');
 });
 doc.addEventListener('veloryz:creator-state',e=>{
  if(e.detail?.state==='success'){
   requestAnimationFrame(()=>restartAnimation(doc.querySelector('.v4-success-check'),'vz-kinetic-confirm'));
  }else if(e.detail?.state==='error'){
   requestAnimationFrame(()=>restartAnimation(doc.querySelector('.v4-root #v4-error:not([hidden])'),'vz-kinetic-failed'));
  }
 });
 doc.addEventListener('veloryz:creator-render',()=>scheduleNode(doc.querySelector('.v4-root')||doc.body));
 doc.addEventListener('studio:route',()=>{
  sceneObserver?.disconnect();
  setupSceneObserver();
  scheduleNode(doc.querySelector('#main')||doc.body);
 });
 function sync(){
  if(!doc.body)return;
  if(!allowed()){
   halo?.classList.remove('is-visible');glow?.classList.remove('is-visible');
   sceneObserver?.disconnect();sceneObserver=null;
   return;
  }
  if(!lite())ensureAmbient();
  setupSceneObserver();
  scheduleNode(doc.querySelector('#main')||doc.body);
 }
 doc.addEventListener('visibilitychange',sync);
 window.StudioMotion?.addEventListener?.('change',sync);
 reduced.addEventListener?.('change',sync);
 coarse.addEventListener?.('change',sync);
 network?.addEventListener?.('change',sync);
 window.addEventListener('pageshow',sync);
 window.addEventListener('blur',()=>{hovered=false;down=false;halo?.classList.remove('is-visible');glow?.classList.remove('is-visible');});
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.VeloryzKineticSite={refresh:sync,get enabled(){return allowed();},get decorated(){return Boolean(domObserver);}};
})();
