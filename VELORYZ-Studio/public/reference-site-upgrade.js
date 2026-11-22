/* VELORYZ reference-site upgrade: real CMS library, accessible overlays, safe navigation. */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const published=window.VELORYZ_REFERENCE_DATA?.state||window.VELORYZ_REFERENCE_DATA||{};
const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
const toText=v=>String(v??'').trim();
const money=n=>Number.isFinite(Number(n))&&Number(n)>0?'₹'+Number(n).toLocaleString('en-IN'):'Ask for a quote';
const truncate=(s,n)=>{s=toText(s);return s.length>n?s.slice(0,n-1).trimEnd()+'…':s};
const safeImg=u=>{
 try{const x=new URL(String(u),location.origin);return x.origin===location.origin||x.protocol==='https:'?x.href:'';}
 catch{return ''}
};
function buildGallery(){
 const track=$('#vz-home-library-track');
 const viewport=$('#vz-home-library-viewport');
 const section=$('#vz-home-library');
 const index=$('#vz-library-index');
 const count=$('#vz-library-count');
 const fill=$('#vz-library-progress-fill');
 if(!track||!viewport||!section)return;
 const items=Array.isArray(published.catalogue)?published.catalogue.filter(x=>x&&x.enabled!==false&&toText(x.name)):[];
 if(!items.length){
  const a=document.createElement('a');a.href='/design/';a.className='btn fill';a.textContent='Explore the available design directions ↗';
  track.replaceChildren(a);
  section.classList.add('is-static');
  if(index)index.textContent='Browse the full library ↗';
  if(count)count.textContent='Design library / Explore';
  return;
 }
 const createCard=(item,i)=>{
  const article=document.createElement('article');article.className='vz-home-design-card';
  const art=document.createElement('a');art.className='vz-home-design-art';art.href=item.id?'/design/'+encodeURIComponent(item.id)+'/':'/design/';
  art.setAttribute('aria-label','Explore '+toText(item.name)+' in the VELORYZ design library');
  const image=safeImg(item.image||item.cover);
  if(image){
   const img=document.createElement('img');img.src=image;img.loading=i<3?'eager':'lazy';img.decoding='async';
   img.alt=toText(item.name)+' published design preview';
   img.addEventListener('error',()=>{if(!img.dataset.retryOriginal&&safeImg(item.fallbackImage)){img.dataset.retryOriginal='1';img.src=safeImg(item.fallbackImage);return}img.hidden=true;art.classList.add('vz-art-unavailable')});
   art.append(img);
  }else art.classList.add('vz-art-unavailable');
  const body=document.createElement('div');body.className='vz-home-design-body';
  const tag=document.createElement('span');tag.className='tag';
  tag.textContent=toText(item.category||'Design direction')+' / '+String(i+1).padStart(2,'0');
  const title=document.createElement('h3');title.textContent=toText(item.name);
  const desc=document.createElement('p');
  desc.textContent=truncate(item.description||'Explore this design direction and its project requirements in the published VELORYZ library.',185);
  const foot=document.createElement('div');foot.className='vz-home-design-meta';
  const info=document.createElement('div');info.className='vz-home-design-byline';
  const studio=document.createElement('strong');studio.textContent='VELORYZ Studio / Curated design';
  info.append(studio);
  const link=document.createElement('a');link.href=item.id?'/design/'+encodeURIComponent(item.id)+'/':'/design/';link.textContent='Explore design ↗';
  link.setAttribute('aria-label','View published library details for '+toText(item.name));
  foot.append(info,link);body.append(tag,title,desc,foot);article.append(art,body);return article;
 };
 track.replaceChildren(...items.map(createCard)); // one complete set, no duplicate artificial items
 track.setAttribute('aria-label',items.length+' real website design directions, presented through scrolling');
 let travel=0,lastW=0,lastViewW=0;
 const motionIsFull=()=>!window.StudioMotion||window.StudioMotion.level==='full';
 const clamp=v=>Math.max(0,Math.min(1,v));
 const update=()=>{
  if(!section.isConnected||!viewport.clientWidth)return;
  const full=motionIsFull();
  section.classList.toggle('is-static',!full);
  if(!full){
   track.style.transform='none';
   if(fill)fill.style.transform='scaleX(0)';
   if(index)index.textContent='Swipe designs horizontally ↔';
   return;
  }
  if(track.scrollWidth!==lastW||viewport.clientWidth!==lastViewW)recalc();
  const range=Math.max(1,section.offsetHeight-window.innerHeight);
  const progress=clamp(-section.getBoundingClientRect().top/range);
  track.style.transform='translate3d('+(-travel*progress).toFixed(2)+'px,0,0)';
  if(fill)fill.style.transform='scaleX('+progress.toFixed(4)+')';
  if(index){
   const nearest=Math.min(items.length,Math.max(1,Math.round(progress*(items.length-1))+1));
   index.textContent=String(nearest).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
  }
 };
 const recalc=()=>{
  const viewWidth=viewport.clientWidth; if(!viewWidth)return;
  lastW=track.scrollWidth;lastViewW=viewWidth;
  travel=Math.max(0,lastW-viewWidth);
  section.style.setProperty('--vz-library-scroll-distance',Math.max(1,Math.ceil(travel*1.12))+'px');
  if(count)count.textContent=String(items.length).padStart(2,'0')+' VELORYZ selected designs';
  if(index&&!section.classList.contains('is-static'))index.textContent='01 / '+String(items.length).padStart(2,'0');
 };
 window.VeloryzReferenceGallery={update,refresh:recalc,get count(){return items.length}};
 // Same scroll clock as the original horizontally pinned services sequence.
 // The existing page tick calls update(); no independent high-frequency animation loop.
 requestAnimationFrame(()=>{recalc();update();});
 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(()=>{recalc();update();});
  observer.observe(viewport);observer.observe(track);
 }else window.addEventListener('resize',()=>{recalc();update();},{passive:true});
 document.addEventListener('DOMContentLoaded',()=>{
  window.StudioMotion?.addEventListener?.('change',()=>{recalc();update();});
  recalc();update();
 },{once:true});
 window.addEventListener('pageshow',()=>{recalc();update();});
 window.addEventListener('hashchange',()=>requestAnimationFrame(()=>{recalc();update();}));
}
function menuFocus(){
 const menu=$('#mn'),button=$('#mb');
 if(!menu||!button)return;
 let lastFocus=null;
 const sync=()=>{
  const open=menu.classList.contains('open');
  document.body.classList.toggle('vz-menu-open',open);
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-controls','mn');
  menu.setAttribute('aria-hidden',String(!open));
  if(open&&!lastFocus){lastFocus=document.activeElement;menu.querySelector('a')?.focus({preventScroll:true});}
  if(!open&&lastFocus){const old=lastFocus;lastFocus=null;if(old?.isConnected)old.focus({preventScroll:true});}
 };
 new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
 // Keep the first/last link in the fullscreen overlay while it is open.
 document.addEventListener('keydown',e=>{
  if(!menu.classList.contains('open')||e.key!=='Tab')return;
  const targets=$$('a[href],button:not([disabled])',menu).filter(x=>x.getClientRects().length);
  const first=targets[0],last=targets[targets.length-1];
  if(!first||!last)return;
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 sync();
}
function documentLinks(){
 // The canonical doc URLs are all real server routes. Never invent a client-only docs screen.
 const docs=$('#vz-reference-guides');
 if(!docs)return;
 docs.querySelectorAll('a').forEach(a=>{
  if(!a.getAttribute('href')?.startsWith('/'))a.href='/docs/';
 });
}
let crossing=false;
function curtainNavigate(destination){
 if(crossing)return;
 crossing=true;
 const backdrop=$('#curt');
 if(backdrop&&!reduce){backdrop.className='up';setTimeout(()=>location.assign(destination),560);}
 else location.assign(destination);
}
function crossPageCurtain(){
 document.addEventListener('click',ev=>{
  if(ev.defaultPrevented||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
  const a=ev.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
  if(a.href.startsWith('mailto:')||a.href.startsWith('tel:'))return;
  let url;try{url=new URL(a.href,location.href)}catch{return}
  if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;
  ev.preventDefault();curtainNavigate(url.href);
 },true);
}
function directCreator(){
 // All links that say Start/Create/Make your project go to real /create/ and preserve the existing
 // validated submission, official reference number and private portal onboarding workflow.
 document.addEventListener('click',ev=>{
  const a=ev.target.closest('a[href="#create"],a[href="#client"]');
  if(!a||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
  ev.preventDefault();
  curtainNavigate(a.getAttribute('href')==='#client'?'/client/':'/create/');
 },true);
}
function hydrateContact(){
 const fm=$('.pg[data-p="contact"] .fm');if(!fm)return;
 const p=document.createElement('p');p.className='vz-contact-explainer tag';
 p.textContent='Contact / We reply via your chosen channel';fm.prepend(p);
 const inputs=$$('input,textarea',fm);
 for(const input of inputs){
  if(input.id==='fn'){input.setAttribute('aria-label','Your name');input.required=true;}
  if(input.id==='fx'){input.setAttribute('aria-label','Describe your project');input.required=true;}
 }
 const wa=$('#fw');wa?.addEventListener('click',e=>{
  if(!($('#fn')?.value||'').trim()||!($('#fx')?.value||'').trim()){
   e.preventDefault();$('#fx')?.focus();
   const status=$('#vz-contact-validation')||document.createElement('p');
   status.id='vz-contact-validation';status.setAttribute('role','alert');status.textContent='Please add your name and a short description before sending.';
   fm.append(status);
  }
 });
}
buildGallery();menuFocus();directCreator();crossPageCurtain();documentLinks();hydrateContact();
})();
