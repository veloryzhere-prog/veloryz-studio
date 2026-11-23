/* VELORYZ / Public Experience R20
 * Public-route accessibility, progressive enhancement and light performance work.
 */
(()=>{
 'use strict';
 const body=document.body;
 if(!body||body.dataset.vzR20==='1')return;
 body.dataset.vzR20='1';
 body.classList.add('vz-r20');

 const main=document.querySelector('main,#main');
 if(main&&!main.id)main.id='main-content';
 const target=main?.id||'main';
 if(!document.querySelector('.vz-r20-skip')){
  const skip=document.createElement('a');
  skip.className='vz-r20-skip';
  skip.href='#'+target;
  skip.textContent='Skip to main content';
  document.body.prepend(skip);
 }

 const route=location.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/').replace(/\/+$/,'/')||'/';
 body.dataset.vzRoute=route;

 let frame=0;
 const syncScroll=()=>{
  frame=0;
  body.classList.toggle('vz-r20-scrolled',scrollY>18);
 };
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(syncScroll)},{passive:true});
 addEventListener('pageshow',syncScroll);
 syncScroll();

 // Home 3D: keep four useful controls visible, move secondary controls behind one disclosure.
 const controls=document.querySelector('.vz-reference-site .vz-3d-controls');
 if(controls&&!controls.querySelector('[data-vz-r20-3d-more]')){
  const buttonBox=controls.querySelector('.vz-3d-control-buttons');
  const advanced=['gentle','spin','left','right'];
  advanced.forEach(action=>buttonBox?.querySelector('[data-logo-action="'+action+'"]')?.setAttribute('data-vz-r20-advanced',''));
  const more=document.createElement('button');
  more.type='button';more.className='vz-3d-more';more.dataset.vzR203dMore='';
  more.setAttribute('aria-expanded','false');more.textContent='More controls +';
  buttonBox?.append(more);
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-vz-r20-3d-more]');
  if(!button)return;
  const panel=button.closest('.vz-3d-controls');
  const open=panel.classList.toggle('is-expanded');
  button.setAttribute('aria-expanded',String(open));
  button.textContent=open?'Fewer controls −':'More controls +';
 });

 // Improve current-route semantics for public SPA links and home fixed links.
 document.querySelectorAll('a[href]').forEach(a=>{
  try{
   const url=new URL(a.href,location.href);
   if(url.origin!==location.origin)return;
   const p=url.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/').replace(/\/+$/,'/')||'/';
   if(p===route&&!url.hash)a.setAttribute('aria-current','page');
  }catch{}
 });

 // Progressive image defaults below the critical first viewport.
 const markImages=()=>{
  const cutoff=innerHeight*1.15;
  document.querySelectorAll('img:not([loading])').forEach(img=>{
   const rect=img.getBoundingClientRect();
   if(rect.top>cutoff){img.loading='lazy';img.decoding='async';}
  });
 };
 requestAnimationFrame(markImages);
 addEventListener('studio:route',()=>requestAnimationFrame(markImages));

 // Idle prefetch only the highest-intent internal routes.
 const prefetch=()=>{
  ['/create/','/design/','/docs/','/contact/'].forEach(href=>{
   if(document.head.querySelector('link[rel=prefetch][href="'+href+'"]'))return;
   const link=document.createElement('link');link.rel='prefetch';link.href=href;document.head.append(link);
  });
 };
 if('requestIdleCallback'in window)requestIdleCallback(prefetch,{timeout:2400});
 else setTimeout(prefetch,1800);
})();
