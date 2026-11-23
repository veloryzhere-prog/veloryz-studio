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
 const fill=$('#vz-library-progress-fill');
 if(!track||!viewport||!section)return;
 const all=Array.isArray(published.catalogue)?published.catalogue.filter(x=>x&&x.enabled!==false&&toText(x.name)):[];
 if(!all.length){
  const a=document.createElement('a');a.href='/design/';a.className='btn fill';a.textContent='Explore the available design directions ↗';
  track.replaceChildren(a);section.classList.add('is-static');
  return;
 }
 const motionWeight=value=>{
  const t=toText(value).toLowerCase();
  return t.includes('very high')?5:t.includes('high')?4:t.includes('medium')?3:t.includes('low')?2:1;
 };
 const eligible=all.filter(item=>safeImg(item.image||item.cover||item.previewImage)&&Number(item.price||0)>0&&item.rights!=='restricted');
 eligible.sort((a,b)=>
  Number(b.previewType==='real-upstream-site')-Number(a.previewType==='real-upstream-site')||
  motionWeight(b.motion)-motionWeight(a.motion)||
  Number(a.price||0)-Number(b.price||0)
 );
 const picked=[],seen=new Set();
 for(const item of eligible){
  const cat=toText(item.category||'Design direction');
  if(seen.has(cat))continue;
  picked.push(item);seen.add(cat);
  if(picked.length===7)break;
 }
 for(const item of eligible)if(picked.length<7&&!picked.includes(item))picked.push(item);
 const items=(picked.length?picked:all).slice(0,7);
 const money=value=>Number(value||0)>0?'₹'+Number(value).toLocaleString('en-IN'):'Project quote';
 const rights=value=>value==='candidate'?'Studio reviewed':value==='review'?'Source review required':'Rights check';
 const createCard=(item,i)=>{
  const article=document.createElement('article');article.className='vz-home-design-card';article.dataset.vzLibraryStage=String(i);article.setAttribute('aria-hidden',i?'true':'false');
  const art=document.createElement('a');art.className='vz-home-design-art';art.href=item.id?'/design/'+encodeURIComponent(item.id)+'/':'/design/';
  art.setAttribute('aria-label','Explore '+toText(item.name)+' in the VELORYZ design library');
  const image=safeImg(item.image||item.cover||item.previewImage);
  if(image){
   const img=document.createElement('img');img.src=image;img.loading=i<2?'eager':'lazy';img.decoding='async';
   img.alt=toText(item.name)+' published design preview';
   img.addEventListener('error',()=>{if(!img.dataset.retryOriginal&&safeImg(item.fallbackImage)){img.dataset.retryOriginal='1';img.src=safeImg(item.fallbackImage);return}img.hidden=true;art.classList.add('vz-art-unavailable')});
   art.append(img);
  }else art.classList.add('vz-art-unavailable');
  const body=document.createElement('div');body.className='vz-home-design-body';
  const kicker=document.createElement('div');kicker.className='vz-home-design-kicker';
  const tag=document.createElement('span');tag.className='tag';tag.textContent=toText(item.category||'Design direction');
  const price=document.createElement('strong');price.className='vz-home-design-price';price.textContent='From '+money(item.price);
  kicker.append(tag,price);
  const title=document.createElement('h3');title.textContent=toText(item.name);
  const desc=document.createElement('p');desc.textContent=truncate(item.description||'A selected website direction ready to be adapted around your brand, content and product goals.',185);
  const signals=document.createElement('div');signals.className='vz-home-design-signals';
  for(const label of [rights(item.rights),toText(item.motion||'Responsive')+' motion','VELORYZ adaptation']){
   const chip=document.createElement('span');chip.textContent=label;signals.append(chip);
  }
  const foot=document.createElement('div');foot.className='vz-home-design-meta';
  const by=document.createElement('div');by.className='vz-home-design-byline';
  const studio=document.createElement('strong');studio.textContent='VELORYZ Studio / curated direction';by.append(studio);
  const links=document.createElement('div');links.className='vz-home-design-links';
  const detail=document.createElement('a');detail.href=item.id?'/design/'+encodeURIComponent(item.id)+'/':'/design/';detail.textContent='View details ↗';
  const create=document.createElement('a');create.href='/create/?reference='+encodeURIComponent(item.id||'design');create.textContent='Use this direction ↗';
  links.append(detail,create);foot.append(by,links);
  body.append(kicker,title,desc,signals,foot);article.append(art,body);return article;
 };
 const cards=items.map(createCard);
 track.replaceChildren(...cards);
 track.setAttribute('aria-label','Curated design directions controlled by vertical scrolling');
 viewport.querySelector('.vz-library-rail')?.remove();
 const rail=document.createElement('nav');rail.className='vz-library-rail';rail.setAttribute('aria-label','Featured design positions');
 items.forEach((item,i)=>{
  const b=document.createElement('button');b.type='button';b.dataset.vzLibraryGo=String(i);b.setAttribute('aria-label','Show '+toText(item.name));b.textContent='';
  if(i===0)b.setAttribute('aria-current','true');rail.append(b);
 });
 viewport.append(rail);
 let step=620,active=-1;
 const motionIsFull=()=>!window.StudioMotion||window.StudioMotion.level==='full';
 const clamp=v=>Math.max(0,Math.min(1,v));
 const setActive=next=>{
  if(next===active&&cards[next])return
  active=next;
  cards.forEach((card,i)=>{
   card.classList.toggle('is-active',i===next);
   card.classList.toggle('is-before',i<next);
   card.classList.toggle('is-after',i>next);
   card.setAttribute('aria-hidden',String(i!==next));
   card.inert=i!==next;
  });
  rail.querySelectorAll('button').forEach((b,i)=>i===next?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current'));
 };
 const recalc=()=>{
  step=Math.round(Math.max(500,Math.min(760,innerHeight*.7)));
  const distance=Math.max(step,(items.length-1)*step);
  section.style.setProperty('--vz-library-scroll-distance',distance+'px');
 };
 const update=()=>{
  if(!section.isConnected)return;
  const full=motionIsFull();
  section.classList.toggle('is-static',!full);
  if(!full){
   active=-1;
   cards.forEach(card=>{card.classList.add('is-active');card.classList.remove('is-before','is-after');card.setAttribute('aria-hidden','false');card.inert=false});
   if(fill)fill.style.transform='scaleX(0)';
   return;
  }
  const range=Math.max(1,section.offsetHeight-innerHeight);
  const progress=clamp(-section.getBoundingClientRect().top/range);
  const scaled=progress*Math.max(1,items.length-1);
  const next=Math.min(items.length-1,Math.floor(scaled+0.00001));
  setActive(next);
  if(fill)fill.style.transform='scaleX('+progress.toFixed(4)+')';
 };
 rail.addEventListener('click',event=>{
  const button=event.target.closest('[data-vz-library-go]');if(!button)return;
  const n=Number(button.dataset.vzLibraryGo)||0;
  if(!motionIsFull()){cards[n]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});return}
  const top=section.getBoundingClientRect().top+scrollY+n*step;
  scrollTo({top,behavior:'smooth'});
 });
 window.VeloryzReferenceGallery={update,refresh:()=>{recalc();update()},get count(){return all.length},get featuredCount(){return items.length}};
 requestAnimationFrame(()=>{recalc();setActive(0);update()});
 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(()=>{recalc();update()});observer.observe(viewport);observer.observe(section);
 }else window.addEventListener('resize',()=>{recalc();update()},{passive:true});
 document.addEventListener('DOMContentLoaded',()=>{window.StudioMotion?.addEventListener?.('change',()=>{recalc();update()});recalc();update()},{once:true});
 window.addEventListener('pageshow',()=>{recalc();update()});
 window.addEventListener('hashchange',()=>requestAnimationFrame(()=>{recalc();update()}));
}
function menuFocus(){
 const menu=$('#mn'),button=$('#mb');
 if(!menu||!button)return;
 let lastFocus=null;
 const updateOrigin=()=>{
  // Match the original HTML reference's circular reveal, but calculate the real
  // button centre instead of assuming a fixed desktop offset.
  const rect=button.getBoundingClientRect();
  menu.style.setProperty('--vz-menu-origin-x',(rect.left+rect.width/2).toFixed(1)+'px');
  menu.style.setProperty('--vz-menu-origin-y',(rect.top+rect.height/2).toFixed(1)+'px');
 };
 const sync=()=>{
  const open=menu.classList.contains('open');
  updateOrigin();
  document.body.classList.toggle('vz-menu-open',open);
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Close menu':'Open menu');
  button.setAttribute('aria-controls','mn');
  menu.setAttribute('aria-hidden',String(!open));
  menu.inert=!open;
  if(open&&!lastFocus){lastFocus=document.activeElement;menu.querySelector('a')?.focus({preventScroll:true});}
  if(!open&&lastFocus){const old=lastFocus;lastFocus=null;if(old?.isConnected)old.focus({preventScroll:true});}
 };
 new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',()=>{if(menu.classList.contains('open'))updateOrigin();},{passive:true});
 menu.addEventListener('click',event=>{
  // Existing hash routing still performs navigation; close on destination click.
  if(event.target.closest('a[href]'))menu.classList.remove('open');
 });
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!menu.classList.contains('open'))return;
  event.preventDefault();
  menu.classList.remove('open');
  button.focus({preventScroll:true});
 });
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
