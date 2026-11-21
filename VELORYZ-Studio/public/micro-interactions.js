'use strict';
/**
 * First-party lightweight interaction layer for VELORYZ.
 * No external animation runtime, no layout rewrites, no scroll engine.
 * Decorative effects never signify a successful server action by themselves.
 */
(()=>{
 if(window.VeloryzMicroMotion||window.VeloryzKineticSite)return; // New global layer supersedes this legacy controller.
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse=matchMedia('(pointer: coarse)');
 const root=document.documentElement;
 const motionOK=()=>root.dataset.motion==='full'&&!reduced.matches&&!document.hidden;
 const selector='button:not([disabled]),a[href],.v4-choice,[data-v4-action],[data-v4-pick],[data-chat-agent],[data-chat-prompt],[data-chat-action],summary';
 const animated='button,.v4-choice,.v4-primary,.v4-secondary,.chat-action-button,.vz-chat-send,[data-v4-action]';
 const arrival='.chat-message.assistant,.vz-chat-message.is-assistant,.vz-chat-messages .is-assistant,.v4-success-check,.vz-chat-error:not([hidden]),.chat-error,.v4-error:not([hidden]),#v4-error:not([hidden])';
 const seen=new WeakSet();
 let cursor=null,cursorFrame=0,point=null,hovered=false,down=false;
 const event=(name,detail={})=>document.dispatchEvent(new CustomEvent('veloryz:micro-'+name,{detail}));
 function animate(el,kind){
  if(!el||!el.isConnected||!motionOK())return;
  const name=kind==='error'?'vz-micro-error-flash':kind==='success'?'vz-micro-success-mark':'vz-micro-arrival';
  el.classList.remove(name);
  void el.offsetWidth;
  el.classList.add(name);
  el.addEventListener('animationend',()=>el.classList.remove(name),{once:true});
 }
 function process(node){
  if(!(node instanceof Element))return;
  const candidates=node.matches(arrival)?[node]:[];
  if(node.querySelectorAll)candidates.push(...node.querySelectorAll(arrival));
  for(const el of candidates){
   if(seen.has(el))continue;
   seen.add(el);
   if(el.matches('.v4-success-check'))animate(el,'success');
   else if(el.matches('.chat-error,.vz-chat-error,.v4-error,#v4-error'))animate(el,'error');
   else animate(el,'arrival');
  }
 }
 function pulseError(){
  const el=document.querySelector('.v4-root #v4-error:not([hidden]),.v4-root .v4-error:not([hidden])');
  if(el)animate(el,'error');
 }
 function ripple(target,x,y){
  if(!motionOK()||target.closest('.chat-log,.chat-scroll-area,.vz-chat-messages,textarea,[contenteditable]'))return;
  const rect=target.getBoundingClientRect();
  if(rect.width<8||rect.height<8)return;
  const computed=getComputedStyle(target);
  if(computed.position==='static')target.style.position='relative';
  const dot=document.createElement('span');
  dot.className='vz-micro-ripple';
  dot.setAttribute('aria-hidden','true');
  dot.style.left=(x-rect.left)+'px';
  dot.style.top=(y-rect.top)+'px';
  dot.style.setProperty('--vz-ripple-scale',String(Math.max(7,Math.min(28,Math.max(rect.width,rect.height)/11))));
  target.append(dot);
  dot.addEventListener('animationend',()=>dot.remove(),{once:true});
  setTimeout(()=>dot.remove(),650);
 }
 function setupCursor(){
  if(cursor||coarse.matches||reduced.matches||!('PointerEvent' in window))return;
  cursor=document.createElement('div');
  cursor.className='vz-micro-cursor';
  cursor.setAttribute('aria-hidden','true');
  document.body.append(cursor);
 }
 function renderCursor(){
  cursorFrame=0;
  if(!cursor||!point)return;
  cursor.style.transform='translate3d('+point.x+'px,'+point.y+'px,0) translate(-50%,-50%)';
  cursor.classList.toggle('is-active',hovered&&motionOK());
  cursor.classList.toggle('is-press',down);
 }
 function scheduleCursor(){if(!cursorFrame)cursorFrame=requestAnimationFrame(renderCursor);}
 document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||coarse.matches)return;
  point={x:e.clientX,y:e.clientY};
  // Avoid an expensive DOM closest() lookup on every raw mousemove;
  // hover targeting is maintained by pointerover/out.
  if(cursor)scheduleCursor();
 },{passive:true});
 document.addEventListener('pointerover',e=>{
  if(e.pointerType!=='mouse'||coarse.matches||!(e.target instanceof Element))return;
  const el=e.target.closest(selector);
  hovered=Boolean(el&&!el.closest('[inert]'));
  if(hovered&&!cursor)setupCursor();
  if(cursor)scheduleCursor();
 },{passive:true});
 document.addEventListener('pointerout',e=>{
  if(e.pointerType!=='mouse'||coarse.matches)return;
  // If leaving a clickable element, hide the halo until the next pointerover.
  if(!(e.relatedTarget instanceof Element)||!e.relatedTarget.closest(selector)){
   hovered=false;if(cursor)scheduleCursor();
  }
 },{passive:true});
 document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'){down=true;scheduleCursor();}
  if(e.button!==0||!(e.target instanceof Element))return;
  const target=e.target.closest(selector);
  if(!target||target.matches('[disabled],[aria-disabled="true"]')||target.closest('[inert]'))return;
  if(motionOK())ripple(target,e.clientX,e.clientY);
 },{capture:true,passive:true});
 for(const name of ['pointerup','pointercancel'])document.addEventListener(name,()=>{down=false;scheduleCursor();},{passive:true});
 document.addEventListener('pointerleave',()=>{hovered=false;scheduleCursor();},{passive:true});
 document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target instanceof Element&&e.target.matches(animated)&&motionOK())animate(e.target,'arrival');
 });
 document.addEventListener('veloryz:creator-state',e=>{
  const state=e.detail?.state;
  if(state==='success')requestAnimationFrame(()=>{
   animate(document.querySelector('.v4-success-check'),'success');
   document.querySelector('.v4-success')?.classList.add('vz-micro-arrival');
  });
  if(state==='error')requestAnimationFrame(pulseError);
 });
 document.addEventListener('veloryz:creator-render',()=>requestAnimationFrame(()=>{
  process(document.querySelector('.v4-root'));
  pulseError();
 }));
 // Mutation events are batched: new messages, error notices, success symbols only.
 let pending=new Set(),batch=0;
 const flush=()=>{batch=0;for(const node of pending)process(node);pending.clear();};
 const observer=new MutationObserver(records=>{
  for(const record of records)for(const node of record.addedNodes){
   if(!(node instanceof Element)||node.matches('.vz-micro-ripple,.vz-micro-cursor'))continue;
   if(node.matches(arrival)||node.querySelector?.(arrival))pending.add(node);
  }
  if(pending.size&&!batch)batch=requestAnimationFrame(flush);
 });
 function mount(){
  if(!document.body)return;
  observer.observe(document.body,{childList:true,subtree:true});
  // Initial content is not animated, except a genuinely confirmed creator success.
  document.querySelectorAll(arrival).forEach(el=>seen.add(el));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.addEventListener('blur',()=>{hovered=false;down=false;scheduleCursor();});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){hovered=false;scheduleCursor();}
 });
 window.VeloryzMicroMotion={animate,event,get enabled(){return motionOK();}};
})();
