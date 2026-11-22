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
function add(el){
 if(!(el instanceof HTMLElement)||el.dataset.vzFx==='1'||nonVisual(el))return;
 if(el.matches('input')) {
  el.dataset.vzFx='1';el.classList.add('vz-fx-button');return;
 }
 // Measure the original state before adding any class; existing animated icons,
 // spinners or decorative pseudo-elements must never be replaced.
 const before=hasPseudo(el);
 const computed=getComputedStyle(el);
 const stylePosition=computed.position;
 const shadow=computed.boxShadow;
 const hasMenu=!!el.querySelector('[role="menu"],dialog,[popover],input,textarea,select,button');
 el.classList.add('vz-fx-button');
 if(!before&&!hasMenu){
  el.classList.add('vz-fx-fill');
  if(stylePosition==='static')el.classList.add('vz-fx-position');
 }
 if(shadow==='none')el.classList.add('vz-fx-new-shadow');
 el.dataset.vzFx='1';
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
