/* VELORYZ reference-site real-data adapter.
   Runs after the supplied prototype's inline animation controller, so its scroll engine,
   timing, sticky layouts, page curtains and circular navigation remain unchanged. */
(()=>{
'use strict';
const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const safeText=v=>String(v??'').trim();
const trim=(v,n=250)=>{const s=safeText(v);return s.length>n?s.slice(0,n-1).trimEnd()+'…':s;};
const safeUrl=v=>{try{const u=new URL(String(v),location.origin);return (u.protocol==='https:'||u.origin===location.origin&&u.protocol==='http:')?u.href:'';}catch{return '';}};
const data=window.VELORYZ_REFERENCE_DATA||{};
const published=data.state||data;
function updateServices(){
 const services=Array.isArray(published.services)?published.services.filter(x=>x&&x.name):[];
 if(!services.length)return;
 $$('#trk .pan').forEach((card,i)=>{
  const s=services[i];if(!s)return;
  const name=$('h3',card),description=$('p',card);
  if(name)name.textContent=s.name;
  if(description)description.textContent=trim(s.short||s.description,175);
 });
 $$('.pg[data-p="services"] .rows .row').forEach((card,i)=>{
  const s=services[i];if(!s)return;
  const name=$('h3',card),description=$('p',card);
  if(name)name.textContent=s.name;
  if(description)description.textContent=trim(s.description||s.short,335);
  const tags=$('.dl',card);
  if(tags&&Array.isArray(s.tags)){
   tags.replaceChildren(...s.tags.slice(0,4).map(label=>{
    const t=document.createElement('i');t.textContent=safeText(label);return t;
   }));
  }
 });
}
function updateLibrary(){
 // Operate on the existing card nodes. The uploaded reference's requestAnimationFrame
 // controller holds these DOM references for its exact scroll-driven stacking effect.
 const catalogue=Array.isArray(published.catalogue)?published.catalogue.filter(x=>x&&x.enabled!==false&&x.name):[];
 if(!catalogue.length)return;
 const slides=$$('.pg[data-p="design"] .dk'),details=$$('.pg[data-p="design"] .dt');
 slides.forEach((slide,i)=>{
  const item=catalogue[i];if(!item)return;
  const screen=$('.scr',slide);if(!screen)return;
  const title=$('h4',screen);
  if(title)title.textContent=safeText(item.name);
  screen.style.setProperty('--h',String(([215,18,160,42][i%4])));
  const url=safeUrl(item.image||item.cover||item.previewImage);
  if(url){
   const img=document.createElement('img');
   img.className='vz-lib-cover';img.alt='';
   img.loading='lazy';img.decoding='async';img.src=url;
   img.addEventListener('error',()=>img.remove(),{once:true});
   screen.prepend(img);
  }
 });
 details.forEach((detail,i)=>{
  const item=catalogue[i];if(!item)return;
  const title=$('h3',detail),description=$('p',detail);
  if(title)title.textContent=safeText(item.name);
  if(description)description.textContent=trim(item.description,270);
  const tag=$('.tag',detail);if(tag)tag.textContent=safeText(item.category)||'Design reference';
  const detailsList=$('ul',detail);
  if(detailsList){
   detailsList.replaceChildren();
   const attrs=[
    ['Category',safeText(item.category)||'Design'],
    ['Source',safeText(item.author)||'Original creator credited in library'],
    ['Starting estimate',Number.isFinite(Number(item.price))?'₹'+Number(item.price).toLocaleString('en-IN'):'Scope on request']
   ];
   for(const [label,value]of attrs){
    const li=document.createElement('li'),caption=document.createElement('span');
    li.append(document.createTextNode(label));caption.textContent=value;li.append(caption);detailsList.append(li);
   }
  }
  const a=$('a.btn',detail);if(a)a.href=item.id?'/design/'+encodeURIComponent(item.id)+'/':'/design/';
 });
}
function updateStudioAgents(){
 // These names come from the existing functional public AI registry.
 const personalities=[
  ['Happy','Creative direction','H'],
  ['Nikhil','Planning & analysis','N'],
  ['Milky','Visual explorations','M'],
  ['Ritik','Technical solutions','R'],
  ['ARYAN','Strategy & review','A']
 ];
 $$('.pg[data-p="studio"] .ag .ad').forEach((card,i)=>{
  const info=personalities[i];if(!info)return;
  const mark=$('i',card),heading=$('b',card),description=$('span',card),tag=$('em',card);
  if(mark){
   const portrait=document.createElement('img');
   portrait.src='/assets/ai-avatars/'+['happy','nikhil','milky','ritik','aryan'][i]+'.webp';
   portrait.alt=info[0]+' AI portrait';
   portrait.width=80;portrait.height=80;portrait.decoding='async';portrait.loading='lazy';
   mark.classList.add('vz-studio-agent-portrait');mark.replaceChildren(portrait);
  }
  if(heading)heading.textContent=info[0];
  if(description)description.textContent=info[1];
  if(tag)tag.textContent='AI persona';
  card.tabIndex=0;card.setAttribute('role','link');
  card.setAttribute('aria-label','Open studio to chat with '+info[0]);
  card.style.cursor='pointer';
  card.addEventListener('click',()=>{if(window.VeloryzReferenceAI?.open)window.VeloryzReferenceAI.open(personalities[i]===undefined?'happy':['happy','nikhil','milky','ritik','aryan'][i]);else location.href='/?classic=1';});
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(window.VeloryzReferenceAI?.open)window.VeloryzReferenceAI.open(['happy','nikhil','milky','ritik','aryan'][i]);else location.href='/?classic=1';}});
 });
 const intro=$('.pg[data-p="studio"] .ag')?.parentElement;
 if(intro&&!intro.querySelector('.vz-reference-ai-access')){
  const p=document.createElement('p');p.className='vz-fallback-note vz-reference-ai-access';
  p.textContent='These five AI advisers are available through the Studio conversation interface.';
  const a=document.createElement('button');a.type='button';a.className='btn mag';a.textContent='Open AI conversations ↗';a.addEventListener('click',()=>window.VeloryzReferenceAI?.open?.('happy'));
  intro.append(p,a);
 }
}
function updateContact(){
 const site=published.site||{};
 const email=safeText(site.email),digits=safeText(site.phone).replace(/\D/g,'');
 const contact=$('.pg[data-p="contact"]');
 if(email&&email.includes('@')){
  const anchors=$$('a[href^="mailto:"]',contact);
  if(anchors[0]){anchors[0].textContent=email;anchors[0].href='mailto:'+email;}
 }
 if(digits.length>=10){
  const anchor=$('a[href^="https://wa.me/"]',contact);
  if(anchor){anchor.href='https://wa.me/'+digits;anchor.textContent='+'+digits.replace(/^91/,'91 ');}
 }
}
function card(kicker,quote,byline,url){
 const el=document.createElement('article');el.className='vz-live-review-card';
 const k=document.createElement('span');k.className='vz-review-kicker';k.textContent=kicker;
 const q=document.createElement('p');q.className='vz-review-quote';q.textContent=quote;
 const foot=document.createElement('div');foot.className='vz-review-byline';
 const by=document.createElement('span');by.textContent=byline;foot.append(by);
 if(url){const a=document.createElement('a');a.href=url;a.textContent='Read reviews ↗';foot.append(a);}
 el.append(k,q,foot);return el;
}
function createReviews(items){
 const track=$('#vz-live-reviews-track'),status=$('#vz-review-feed-status');
 if(!track)return;
 let source=items.map(x=>card(
  '★'.repeat(Math.max(1,Math.min(5,Number(x.rating)||1)))+' / Approved review',
  trim(x.headline?(x.headline+' — '+safeText(x.body)):x.body,250),
  safeText(x.display_name)||'Community member','/reviews.html'
 ));
 if(!source.length){
  if(status)status.textContent='Community / Your perspective matters';
  source=[
   card('VELORYZ / COMMUNITY','The next story could be yours.','An invitation, not a customer review','/reviews.html#share-review'),
   card('VELORYZ / COMMUNITY','Real feedback shapes better work.','Share a thoughtful experience','/reviews.html#share-review'),
   card('VELORYZ / COMMUNITY','No fictional testimonials. Only real voices.','Reviews are moderated before publication','/reviews.html#share-review'),
   card('VELORYZ / COMMUNITY','Tell us what worked — and what could be better.','Your perspective matters','/reviews.html#share-review')
  ];
 }else if(status)status.textContent=items.length+' published visitor '+(items.length===1?'review':'reviews')+' / Moderated';
 const group=document.createElement('div');group.className='vz-live-review-group';
 let px=0,count=0;
 const estimated=Math.max(298,Math.min(428,innerWidth*.31))+18;
 while(px<innerWidth+estimated&&count<16){
  for(const element of source){
   const clone=element.cloneNode(true);
   if(count>0){clone.setAttribute('aria-hidden','true');clone.inert=true;}
   group.append(clone);
  }
  count++;px+=source.length*estimated;
 }
 const twin=group.cloneNode(true);twin.setAttribute('aria-hidden','true');twin.inert=true;
 track.replaceChildren(group,twin);
 const update=()=>{
  if(!track.isConnected)return;
  const pixels=group.getBoundingClientRect().width;
  track.style.setProperty('--vz-review-speed',Math.max(22,pixels/58).toFixed(2)+'s');
 };
 requestAnimationFrame(update);
 if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(update);observer.observe(group);}
}
function mountReviews(){
 createReviews([]);
 fetch('/api/reviews',{cache:'no-store',credentials:'same-origin'})
  .then(r=>{if(!r.ok)throw Error('Reviews temporarily unavailable');return r.json();})
  .then(result=>createReviews(Array.isArray(result.reviews)?result.reviews:[]))
  .catch(()=>{const state=$('#vz-review-feed-status');if(state)state.textContent='Community / Review service temporarily unavailable';});
 const pause=$('#vz-reference-reviews-pause'),track=$('#vz-live-reviews-track');
 pause?.addEventListener('click',()=>{
  const next=!track.classList.contains('is-paused');
  track.classList.toggle('is-paused',next);
  pause.setAttribute('aria-pressed',String(next));
  pause.textContent=next?'Resume motion ▶':'Pause motion ‖';
 });
}
function menuAccess(){
 const button=$('#mb'),menu=$('#mn');if(!button||!menu)return;
 button.setAttribute('aria-controls','mn');
 const sync=()=>{const open=menu.classList.contains('open');button.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-hidden',String(!open));};
 new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){menu.classList.remove('open');button.textContent='Menu';button.focus();sync();}});
 sync();
}
updateServices();updateLibrary();updateStudioAgents();updateContact();mountReviews();menuAccess();
})();
