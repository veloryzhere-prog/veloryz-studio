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
 const root=$('#vz-home-library-track'),pause=$('#vz-library-pause');
 if(!root)return;
 const items=Array.isArray(published.catalogue)?published.catalogue.filter(x=>x?.enabled!==false&&x?.name):[];
 if(!items.length){
  root.innerHTML='';
  const a=document.createElement('a');a.href='/design/';a.className='btn fill';a.textContent='Explore the published design collection ↗';root.append(a);
  if(pause)pause.hidden=true;
  return;
 }
 const createCard=(item,index)=>{
  const article=document.createElement('article');article.className='vz-home-design-card';
  const art=document.createElement('a');art.className='vz-home-design-art';art.href='/design/';
  art.setAttribute('aria-label','Explore '+toText(item.name)+' in the VELORYZ design library');
  const image=safeImg(item.image||item.cover);
  if(image){
   const img=document.createElement('img');img.src=image;img.loading='lazy';img.decoding='async';
   img.alt=toText(item.name)+' website reference preview';
   img.addEventListener('error',()=>{img.hidden=true;art.classList.add('vz-art-unavailable')},{once:true});
   art.append(img);
  }else art.classList.add('vz-art-unavailable');
  const body=document.createElement('div');body.className='vz-home-design-body';
  const tag=document.createElement('span');tag.className='tag';tag.textContent=toText(item.category||'Design direction')+' / '+String(index+1).padStart(2,'0');
  const title=document.createElement('h3');title.textContent=toText(item.name);
  const desc=document.createElement('p');desc.textContent=truncate(item.description||'Explore the full design direction and associated licensing details.',156);
  const foot=document.createElement('div');foot.className='vz-home-design-meta';
  const price=document.createElement('strong');price.textContent='From '+money(item.price);
  const link=document.createElement('a');link.href='/design/';link.textContent='Details ↗';
  link.setAttribute('aria-label','View library details for '+toText(item.name));
  foot.append(price,link);body.append(tag,title,desc,foot);article.append(art,body);
  return article;
 };
 const group=document.createElement('div');group.className='vz-home-library-set';
 items.forEach((p,i)=>group.append(createCard(p,i)));
 // Enough cards for small datasets and ultra-wide viewports; same-width groups guarantee seam-free looping.
 if(items.length<4){items.forEach((p,i)=>group.append(createCard(p,i+items.length)));}
 const second=group.cloneNode(true);second.setAttribute('aria-hidden','true');second.inert=true;
 root.replaceChildren(group,second);
 const recalc=()=>{
  if(!root.isConnected)return;
  const gap=parseFloat(getComputedStyle(root).gap)||18;
  const width=group.getBoundingClientRect().width;
  root.style.setProperty('--vz-home-library-gap',gap/2+'px');
  root.style.setProperty('--vz-home-library-duration',Math.max(28,width/50).toFixed(2)+'s');
 };
 requestAnimationFrame(recalc);
 if(typeof ResizeObserver==='function')new ResizeObserver(recalc).observe(group);
 if(reduce){root.classList.add('is-paused');if(pause){pause.textContent='Reduced motion';pause.disabled=true;pause.setAttribute('aria-pressed','true');}}
 else pause?.addEventListener('click',()=>{
  const paused=!root.classList.contains('is-paused');
  root.classList.toggle('is-paused',paused);
  pause.setAttribute('aria-pressed',String(paused));
  pause.textContent=paused?'Resume motion ▶':'Pause motion ‖';
 });
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
function directCreator(){
 // All links that say Start/Create/Make your project go to real /create/ and preserve the existing
 // validated submission, official reference number and private portal onboarding workflow.
 document.addEventListener('click',ev=>{
  const a=ev.target.closest('a[href="#create"],a[href="#client"]');
  if(!a||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
  ev.preventDefault();
  location.assign(a.getAttribute('href')==='#client'?'/client/':'/create/');
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
buildGallery();menuFocus();directCreator();documentLinks();hydrateContact();
})();
