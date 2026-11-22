/* Universal VELORYZ button feedback.
   Event listeners only observe; they leave native actions and other handlers
   untouched and never rewrite, wrap, move, or replace button contents.
   Dynamic AI, creator, admin and portal controls are discovered as they appear. */
(()=>{
'use strict';
if(window.__vzButtonFeedbackReady)return;
window.__vzButtonFeedbackReady=true;
const selector=[
 'button','input[type="button"]','input[type="submit"]','input[type="reset"]',
 '[role="button"]','a.btn','a.button','a[class*="btn"]',
 'a[class*="button"]','a[class*="cta"]','a[class*="quick"]',
 'a.whatsapp-float','.vz-footer-help-actions a','.vz-bug-head-actions a'
].join(',');
const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
const nonVisual=(el)=>el.matches('[data-vz-fx-off],.vz-fx-opt-out')||
 el.closest('[data-vz-fx-off],template,noscript')||
 el.getAttribute('type')==='hidden';
const isEnabled=(el)=>!el.matches(':disabled,[disabled],[aria-disabled="true"],[inert]')&&!el.closest('[inert]');
const motionOK=()=>{
 const level=document.documentElement.dataset.motion;
 return !document.hidden&&level!=='paused'&&level!=='reduced'&&!media?.matches;
};
const hasPseudo=el=>{
 const content=selector=>{
  try{return getComputedStyle(el,selector).content;}catch{return 'normal';}
 };
 return !['none','normal',''].includes(content('::before'))||
        !['none','normal',''].includes(content('::after'));
};
/* Context-sensitive variants. Audited against the VELORYZ reference
   homepage, native creator/help pages, Studio AI, 3D controls, private portal,
   and admin controls. No two button roles are forced into one visual style. */
function family(el){
 const href=(el.getAttribute('href')||'').toLowerCase();
 const cls=el.className&&typeof el.className==='string'?el.className.toLowerCase():'';
 const role=(el.getAttribute('role')||'').toLowerCase();
 const label=(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,110).toLowerCase();
 const danger=/\b(delete|remove|revoke|discard|destructive)\b/.test(label+' '+cls)||
  /\bdanger\b|\bdelete\b/.test(cls);
 if(el.closest('#admin-root,.admin-shell,.admin-layout,[data-admin-page]')){
  if(danger)return 'danger';
  if(/icon-button|icon-btn/.test(cls)||label==='close')return 'icon';
  return 'admin';
 }
 if(el.closest('.cp-body,#cp-app,.cp-app,.cp-portal,.cp-auth,.cp-dashboard')){
  if(danger)return 'danger';
  return /approve|submit|primary|dark-button/.test(cls+' '+label)?'portal-primary':'portal';
 }
 if(el.matches('[data-logo-action]'))return 'sculpture';
 if(el.closest('.vz-ai-dock,.vz-ai-drawer,.vz-chat-shell,.chat-panel,[data-ai-chat]')||
   /vz-ai-|chat-send|chat-prompt|chat-action|ai-launch|ai-send|support-chat/.test(cls)){
  return /submit|send|primary/.test(cls+' '+label)||el.getAttribute('type')==='submit'?'ai-send':'ai';
 }
 if(el.matches('[data-motion-control],#mb,[data-vz-menu],.mbtn,.vz-shared-menu-trigger,.vz-home-motion-button')||
    el.closest('.vz-header-actions,.vz-shared-chrome,.site-header,.header-nav,nav[aria-label="Main navigation"]')){
  return /header-create|quick-create/.test(cls)?'primary':'navigation';
 }
 if(el.matches('[data-bug-example],[data-filter],[data-sort],[role="tab"],[aria-pressed],.chip,.filter-chip')||
    el.closest('.vz-3d-control-buttons,.vz-bug-template-list,.vz-ai-personas,.filter-bar,.tabs,[role="tablist"]')){
  return 'toggle';
 }
 if(el.getAttribute('type')==='submit'||el.matches('input[type="submit"],.vz-bug-submit,.v4-submit,.submit-button,.form-submit')){
  return 'submit';
 }
 if(danger)return 'danger';
 if(el.matches('.vz-header-create,.vz-shared-quick-create,.btn.fill,.v4-primary,.button.primary,.button-primary,.primary-button,.vz-bug-submit')||
   /(^|\/)create\/?$|(^|\/)book\/?$/.test(href)||/\b(start project|quick create|create project|request consultation|get started)\b/.test(label)){
  return 'primary';
 }
 if(el.matches('.cp-button,.cp-dark-button,.cp-approve-button,.cp-refresh-button,.cp-secondary-button')){
  return /approve|dark-button/.test(cls)?'portal-primary':'portal';
 }
 if(el.matches('.admin-button,.icon-button'))return /icon-button/.test(cls)?'icon':'admin';
 if(el.matches('button[aria-label],button[title],.icon-button,[data-close],.vz-ai-close')){
  if(!label||/^(close|back|next|previous|search|refresh|open|collapse|expand)/.test(label)||cls.includes('icon'))return 'icon';
 }
 if(el.matches('a.btn,a.button,button.btn,button.button,.v4-secondary,.btn.mag,.button.secondary,.vz-bug-head-actions a')){
  return 'secondary';
 }
 if(el.matches('a')&&(/footer|link/.test(cls)||el.closest('footer,.vz-reference-policies,.vz-bug-head-actions'))){
  return 'text-link';
 }
 return 'neutral';
}
function add(el){
 if(!(el instanceof HTMLElement)||el.dataset.vzFx==='1'||nonVisual(el))return;
 const variant=family(el);
 el.dataset.vzFx='1';
 el.dataset.vzFxVariant=variant;
 el.classList.add('vz-fx-button','vz-fx-'+variant);
 if(el.matches('input'))return;
 // Existing native pseudo-element icons/spinners are sacrosan. A family may use
 // a pseudo-element only when none exists and the control has no nested inputs.
 const canOverlay=!hasPseudo(el)&&!el.querySelector('[role="menu"],dialog,[popover],input,textarea,select,button');
 const computed=getComputedStyle(el);
 if(canOverlay){
  el.classList.add('vz-fx-layer');
  if(['primary','submit'].includes(variant))el.classList.add('vz-fx-fill');
  if(computed.position==='static')el.classList.add('vz-fx-position');
 }
 if(computed.boxShadow==='none'&&!['danger','text-link'].includes(variant)){
  el.classList.add('vz-fx-new-shadow');
 }
}
const pending=new Set();
let frame=0;
function visit(root){
 if(!root)return;
 if(root.nodeType===1&&root.matches?.(selector))add(root);
 root.querySelectorAll?.(selector).forEach(add);
}
function flush(){
 frame=0;
 for(const node of pending){if(node.isConnected||node===document)visit(node);}
 pending.clear();
}
function queue(node){
 if(!node)return;pending.add(node);
 if(!frame)frame=requestAnimationFrame(flush);
}
function press(el){
 if(!isEnabled(el)||!motionOK()||typeof el.animate!=='function')return;
 // Individual CSS scale is independent of legacy magnetic "transform" motion.
 // No permanent will-change, new canvas, listener per button or layout reads.
 try{
  el.animate([{scale:'1'},{scale:'.978',offset:.36},{scale:'1'}],
   {duration:230,easing:'cubic-bezier(.22,1,.36,1)',iterations:1});
 }catch{}
}
function pick(target){
 if(!(target instanceof Element))return null;
 const el=target.closest(selector);
 if(!(el instanceof HTMLElement)||nonVisual(el))return null;
 if(el.dataset.vzFx!=='1')add(el);
 return el;
}
document.addEventListener('pointerdown',event=>{
 if(event.button!==0)return;
 const el=pick(event.target);if(el)press(el);
 },{capture:true,passive:true});
document.addEventListener('click',event=>{
 // Keyboard activation has detail 0; make Enter/Space just as expressive.
 if(event.detail!==0)return;
 const el=pick(event.target);if(el)press(el);
 },{capture:true,passive:true});
function boot(){
 queue(document);
 if(typeof MutationObserver!=='function')return;
 const observer=new MutationObserver(records=>{
  for(const record of records){
   if(record.type!=='childList')continue;
   // Redrawn SPA, CMS, AI and admin controls are all covered without polling.
   for(const node of record.addedNodes){if(node.nodeType===1&&(node.matches?.(selector)||node.querySelector?.(selector)))queue(node);}
   if(record.target?.nodeType===1&&record.target.matches?.(selector))queue(record.target);
  }
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
