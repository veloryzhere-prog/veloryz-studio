/* VELORYZ / Brand Motion R9
 * Adds brand-specific feedback without another perpetual animation engine.
 * Background parallax updates only on scroll and click marks use the official V.
 */
(()=>{'use strict';
if(document.documentElement.dataset.vzBrandMotionR9)return;
document.documentElement.dataset.vzBrandMotionR9='1';
const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||['reduced','paused'].includes(document.documentElement.dataset.motion||'');
const surfaces=[...document.querySelectorAll('main>section,#main>section,.pg>section,.vz-external-store')].filter((el,i)=>i<18&&!el.matches('.vz-ext-modal,.vz-ext-cart'));
for(const [i,section] of surfaces.entries()){
 section.dataset.vzBrandSurface=String((i%4)+1);
 if(!section.querySelector(':scope > .vz-brand-backdrop')){
  const bg=document.createElement('span');bg.className='vz-brand-backdrop';bg.setAttribute('aria-hidden','true');section.prepend(bg);
 }
}
const selector='a.btn,a.button,button:not(:disabled),[role="button"],.project-link,.vz-external-card,.vz-journey-stage';
const syncTargets=(root=document)=>{
 for(const el of root.querySelectorAll(selector)){
  if(el.closest('.vz-privacy-layer')||el.matches('input,select,textarea'))continue;
  el.classList.add('vz-feedback-target');
 }
};
syncTargets();
if(typeof MutationObserver==='function')new MutationObserver(rows=>{for(const row of rows)for(const node of row.addedNodes)if(node.nodeType===1)syncTargets(node.matches?.(selector)?node.parentNode||node:node)}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('pointerdown',e=>{const t=e.target.closest?.('.vz-feedback-target');if(t)t.classList.add('vz-touching')},{passive:true});
for(const type of ['pointerup','pointercancel','pointerleave'])document.addEventListener(type,e=>{e.target.closest?.('.vz-feedback-target')?.classList.remove('vz-touching')},{passive:true,capture:true});
document.addEventListener('click',e=>{
 const target=e.target.closest?.('.vz-feedback-target');if(!target||reduce()||e.detail===0)return;
 const x=e.clientX,y=e.clientY;
 [[-25,-18,-16],[22,-12,12],[4,26,3]].forEach(([dx,dy,r],i)=>{
  const mark=document.createElement('img');mark.className='vz-click-mark';mark.src='/assets/brand/veloryz-mark.svg';mark.alt='';mark.setAttribute('aria-hidden','true');
  mark.style.setProperty('--vz-click-x',(x-9)+'px');mark.style.setProperty('--vz-click-y',(y-9)+'px');mark.style.setProperty('--vz-click-dx',dx+'px');mark.style.setProperty('--vz-click-dy',dy+'px');mark.style.setProperty('--vz-click-r',(r+i*5)+'deg');
  document.body.append(mark);mark.addEventListener('animationend',()=>mark.remove(),{once:true});
 });
},{passive:true});
let ticking=false;
const paint=()=>{
 ticking=false;if(reduce())return;
 const h=Math.max(1,innerHeight);
 for(const bg of document.querySelectorAll('.vz-brand-backdrop')){
  const r=bg.parentElement.getBoundingClientRect();
  if(r.bottom<-h*.2||r.top>h*1.2)continue;
  const shift=Math.max(-44,Math.min(44,(r.top-h*.45)*-.045));
  bg.style.setProperty('--vz-brand-shift',shift.toFixed(1)+'px');
 }
};
const requestPaint=()=>{if(!ticking){ticking=true;requestAnimationFrame(paint)}};
addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint,{passive:true});window.StudioMotion?.addEventListener?.('change',requestPaint);requestPaint();
})();