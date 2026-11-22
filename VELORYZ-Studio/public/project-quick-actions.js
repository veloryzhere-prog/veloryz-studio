'use strict';
/* VELORYZ / project quick access, deliberately link-only.
 * Submitting a new brief does not create a private client account. */
(()=>{
 const ROUTES_WITH_INLINE=new Set(['/','/work/','/design/','/designs/','/services/','/pricing/','/process/','/studio/','/contact/']);
 const clean=()=>{let p=location.pathname;if(!p.endsWith('/'))p+='/';return p;};
 const excluded=()=>/^\/(?:admin|client|create)(?:\/|$)/.test(location.pathname);
 const accessibleLinks=()=>[
   '<a class="vz-qa-action vz-qa-action--start" href="/create/" aria-label="Create a new project with VELORYZ Studio">',
    '<span class="vz-qa-icon" aria-hidden="true">✳</span><span class="vz-qa-action-copy"><strong>Create a project</strong><small>Start a new project brief</small></span><span class="vz-qa-arrow" aria-hidden="true">↗</span></a>',
   '<a class="vz-qa-action" href="/client/" aria-label="Already have a project? Open your VELORYZ Client Portal">',
    '<span class="vz-qa-icon" aria-hidden="true">◈</span><span class="vz-qa-action-copy"><strong>Already have a project?</strong><small>Open your Client Portal</small></span><span class="vz-qa-arrow" aria-hidden="true">↗</span></a>',
   '<a class="vz-qa-action" href="/client/" aria-label="Track your project through the VELORYZ Client Portal">',
    '<span class="vz-qa-icon" aria-hidden="true">↗</span><span class="vz-qa-action-copy"><strong>Track your project</strong><small>View progress and milestones</small></span><span class="vz-qa-arrow" aria-hidden="true">↗</span></a>'
 ].join('');
 function motionIn(section){
  if(!section||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ||
     ['paused','reduced'].includes(window.StudioMotion?.level) ||
     typeof section.animate!=='function')return;
  const reveal=()=>{
   if(!section.isConnected)return;
   section.animate([{opacity:.65,transform:'translate3d(0,14px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],
    {duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
  };
  if(typeof IntersectionObserver==='undefined'){reveal();return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();reveal();}
  },{rootMargin:'0px 0px -9% 0px',threshold:.08});
  observer.observe(section);
 }
 function inlineBar(route){
  if(!ROUTES_WITH_INLINE.has(route))return;
  const main=document.querySelector('#main');
  if(!main||main.querySelector('#vz-quick-actions-inline'))return;
  const anchor=route==='/'?main.querySelector('.hero'):main.querySelector('.page-intro');
  if(!anchor)return;
  const bar=document.createElement('section');
  bar.id='vz-quick-actions-inline';
  bar.className='vz-quick-actions vz-quick-actions--inline container';
  bar.setAttribute('aria-label','Project quick actions');
  bar.innerHTML=[
   '<div class="vz-qa-heading"><span class="vz-qa-eyebrow"><i aria-hidden="true"></i> YOUR NEXT STEP / VELORYZ</span>',
   '<span class="vz-qa-heading-note">Start something new, or pick up where you left off.</span></div>',
   '<nav class="vz-qa-actions" aria-label="Create and track projects">',accessibleLinks(),'</nav>'
  ].join('');
  anchor.insertAdjacentElement('afterend',bar);
  motionIn(bar);
 }
 function footerBar(){
  const footer=document.querySelector('#footer');
  if(!footer||footer.querySelector('#vz-quick-actions-footer'))return;
  const bar=document.createElement('section');
  bar.id='vz-quick-actions-footer';
  bar.className='vz-quick-actions vz-quick-actions--footer';
  bar.setAttribute('aria-label','Quick access to project creation and client tracking');
  bar.innerHTML=[
   '<div class="vz-qa-footer-inner"><div class="vz-qa-footer-title"><span class="vz-qa-eyebrow">VELORYZ STUDIO / PROJECT ACCESS</span>',
   '<h2>Your project.<br><em>Your next move.</em></h2>',
   '<p>New here? Start a brief. Already working with us? Your private project space is one tap away.</p></div>',
   '<nav class="vz-qa-actions" aria-label="Quick project links">',accessibleLinks(),'</nav></div>'
  ].join('');
  footer.prepend(bar);
  motionIn(bar);
 }
 function mount(){
  if(excluded())return;
  const route=clean();
  inlineBar(route);footerBar();
 }
 document.addEventListener('studio:route',mount);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();
