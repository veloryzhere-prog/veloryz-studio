/* VELORYZ Motion Rhythm / purposefully paced scroll choreography.
 * Built for VELORYZ assets, not a copy of Agentura source or branded visuals.
 * One observer per route, no continuous per-element scroll handlers.
 */
(()=>{'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer: coarse)');
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const quality=()=>!reduced.matches&&!connection?.saveData&&(!navigator.deviceMemory||navigator.deviceMemory>2)&&window.StudioMotion?.level==='full'&&!document.hidden;
const selector=[
 '#selected-work .section-head',
 '#selected-work .vz-home-featured article',
 '.vz-external-store .vz-external-hero > *',
 '.vz-external-store .vz-ext-head',
 '.vz-external-store .vz-external-card',
 '.services-section .split-intro',
 '.services-section .service-item',
 '.studio-band .mini-facts',
 '.faq-section .faq-grid',
 '.journey-grid .journey-chapter'
 ].join(',');
let io=null, nodes=new Set(), raf=0;
function enter(node){
 if(!node.isConnected)return;
 node.dataset.vzMotionSeen='true';
 node.classList.remove('vz-motion-pending');
 node.classList.add('vz-motion-enter');
}
function enable(){
 const on=quality();
 root.dataset.vzRhythm=on?'on':'off';
 io?.disconnect();io=null;
 for(const n of nodes)if(!n.isConnected)nodes.delete(n);
 if(!on||typeof IntersectionObserver!=='function'){document.querySelectorAll('[data-vz-motion-seen="false"]').forEach(enter);return;}
 io=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){io.unobserve(e.target);enter(e.target);}}},{rootMargin:'0px 0px -7% 0px',threshold:.09});
 document.querySelectorAll(selector).forEach((node,i)=>{
  if(node.dataset.vzMotionSeen==='true')return;
  // Avoid hiding elements initially visible at page load.
  if(node.getBoundingClientRect().top<innerHeight*.89){node.dataset.vzMotionSeen='true';return;}
  node.dataset.vzMotionSeen='false';
  node.classList.add('vz-motion-pending');
  node.style.setProperty('--vz-stagger',Math.min(i%3,2)*75+'ms');
  nodes.add(node);io.observe(node);
 });
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enable()});}
document.addEventListener('studio:route',schedule);
window.addEventListener('pageshow',schedule);
document.addEventListener('visibilitychange',schedule);
window.StudioMotion?.addEventListener('change',schedule);
reduced.addEventListener?.('change',schedule);
coarse.addEventListener?.('change',schedule);
connection?.addEventListener?.('change',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.VeloryzMotionRhythm={refresh:schedule};
})();