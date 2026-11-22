/* VELORYZ heritage restoration.
   Keep the supplied editorial UI. Reuse the ORIGINAL motion + 3D engines;
   add missing first-party features without replacing customer data or APIs. */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const motion=()=>window.StudioMotion?.level||((matchMedia('(prefers-reduced-motion: reduce)').matches)?'reduced':'full');
const reduce=()=>motion()!=='full';
const live=window.VELORYZ_REFERENCE_DATA||{};
window.StudioMotion?.addEventListener?.('change',()=>window.dispatchEvent(new Event('vz:reference-motion-change')));
const short=(s,n=260)=>{s=String(s??'').trim();return s.length>n?s.slice(0,n-1)+'…':s;};
const safeUrl=(v)=>{try{const u=new URL(String(v),location.origin);return (u.origin===location.origin||u.protocol==='https:')?u.href:'';}catch{return '';}};
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;}
function chrome(){
 const motionButton=el('button','vz-home-motion-button');
 motionButton.type='button';motionButton.setAttribute('data-motion-control','');motionButton.setAttribute('aria-label','Open original VELORYZ motion settings');
 const waves=el('span','vz-home-motion-waves');waves.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)waves.append(el('i'));
 motionButton.append(waves,el('span','','Motion'));document.body.append(motionButton);
 const talk=el('a','whatsapp-float vz-original-whatsapp');
 talk.href='https://wa.me/919955326740?text='+encodeURIComponent('Hi VELORYZ Studio! I would like to discuss a project.');
 talk.target='_blank';talk.rel='noopener noreferrer';talk.setAttribute('aria-label',"Let's Talk with VELORYZ on WhatsApp");
 // Use the recognizable WhatsApp speech-bubble/handset mark, not a generic dot.
 const icon=el('span','vz-wa-symbol'),text=el('span','',"Let's Talk ↗");
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','21');svg.setAttribute('height','21');
 svg.setAttribute('fill','currentColor');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');
 path.setAttribute('d','M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.174.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.76-1.653-2.057-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.198-.298.298-.496.099-.198.05-.372-.025-.52-.075-.15-.67-1.612-.916-2.207-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.073c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.379h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.647-.235-.374a9.86 9.86 0 0 1-1.512-5.26C2.168 6.427 6.62 1.975 12.055 1.975c2.64 0 5.12 1.03 6.985 2.895a9.82 9.82 0 0 1 2.894 6.995c-.002 5.436-4.454 9.896-9.883 9.896M20.46 3.45A11.82 11.82 0 0 0 12.055 0C5.495 0 .161 5.334.158 11.893a11.84 11.84 0 0 0 1.583 5.937L0 24l6.335-1.663a11.9 11.9 0 0 0 5.715 1.455h.005c6.559 0 11.895-5.335 11.899-11.894A11.82 11.82 0 0 0 20.46 3.45');
 svg.append(path);icon.append(svg);
 talk.append(icon,text);document.body.append(talk);
 const root=$('.pg[data-p="home"]');
 if(root){
  const stage=$('#vz-reference-journey');stage?.setAttribute('aria-label','Scroll through Sketch, Structure, Design, Build and Review');
 }
 const footer=$('footer');if(footer){
  const more=el('div','vz-reference-support-links');
  const links=[['Book a consultation','/book/'],['Quick create project','/create/'],['Our studio and team','/studio/'],['Motion Playground','/motion/'],['Client Portal','/client/'],['Contact us','/contact/'],['Help Centre','/help/studio/'],['Support AI','/support/'],['Terms','/terms/'],['Cookies','/cookies/'],['Privacy','/privacy/']];
  links.forEach(([txt,url])=>{const a=el('a','',txt+' ↗');a.href=url;more.append(a);});
  footer.querySelector('.row')?.after(more);
 }
}
function kineticHeading(){
 const home=$('.pg[data-p="home"]'),head=$('#h1');
 if(!home||!head)return;
 const phase=['editorial','sculptural','outline','signature'];
 let index=0,timer=0;
 head.dataset.vzTypeStyle=phase[0];
 const stopped=()=>document.hidden||reduce()||!home.classList.contains('act');
 const refresh=()=>{
  clearInterval(timer);timer=0;
  if(stopped()){head.dataset.vzTypeStyle=phase[0];return;}
  timer=setInterval(()=>{
   if(stopped()){refresh();return;}
   index=(index+1)%phase.length;
   head.dataset.vzTypeStyle=phase[index];
   head.classList.remove('vz-font-changing');
   void head.offsetWidth;
   head.classList.add('vz-font-changing');
  },3900);
 };
 window.StudioMotion?.addEventListener?.('change',refresh);
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('hashchange',()=>setTimeout(refresh,750));
 window.addEventListener('pageshow',refresh);
 document.addEventListener('studio:motion-intro-complete',refresh);
 refresh();
}
function createHomeReviews(){
 const track=$('#vz-home-reviews-track'),label=$('#vz-home-reviews-status'),button=$('#vz-home-reviews-pause');
 if(!track)return;
 label?.setAttribute('role','status');
 const publishedDate=raw=>{
  const d=raw?new Date(raw):null;
  if(!d||Number.isNaN(d.getTime()))return '';
  return d.toLocaleDateString('en-IN',{month:'short',year:'numeric'});
 };
 const makeCard=(review)=>{
  const card=el('article','vz-live-review-card');
  const kicker=el('span','vz-review-kicker',review.kicker);
  card.append(kicker);
  if(review.rating){
   const stars=el('span','vz-review-stars','★'.repeat(review.rating)+'☆'.repeat(5-review.rating));
   stars.setAttribute('aria-label',review.rating+' out of 5 stars');
   card.append(stars);
  }
  const quote=el('p','vz-review-quote',review.quote);
  const details=el('div','vz-review-details');
  if(review.service)details.append(el('span','',short(review.service,44)));
  if(review.date)details.append(el('span','',review.date));
  const footer=el('div','vz-review-byline');
  footer.append(el('span','',review.name));
  const link=el('a','',review.rating?'Read full review ↗':'Share your thoughts ↗');
  link.href=review.link;footer.append(link);
  card.append(quote);
  if(details.childElementCount)card.append(details);
  card.append(footer);return card;
 };
 let manuallyPaused=false;
 const sync=()=>{
  const full=!reduce();
  track.classList.toggle('is-paused',manuallyPaused||!full);
  if(button){
   button.disabled=!full;
   button.setAttribute('aria-pressed',String(manuallyPaused||!full));
   button.textContent=!full?'Reduced motion':manuallyPaused?'Resume motion ▶':'Pause motion ‖';
  }
 };
 function render(rows,summary={}){
  const authentic=rows.filter(x=>x&&typeof x.body==='string'&&x.body.trim());
  const records=authentic.length?authentic.map(r=>{
   const rating=Math.max(1,Math.min(5,Number(r.rating)||1));
   return {
    quote:short((r.headline?String(r.headline)+' — ':'')+r.body,220),
    name:short(r.display_name||'Community member',60),
    kicker:'PUBLISHED VISITOR REVIEW',
    rating,service:r.service||'',date:publishedDate(r.created_at),link:'/reviews.html'
   };
  }):[
   {quote:'Your perspective can help shape what we make next.',name:'An invitation, not a customer review',kicker:'COMMUNITY / JOIN THE CONVERSATION',link:'/reviews.html#share-review'},
   {quote:'Tell us what worked well—and what could be clearer.',name:'Share your experience',kicker:'COMMUNITY / THOUGHTFUL FEEDBACK',link:'/reviews.html#share-review'},
   {quote:'Every published review is submitted by a visitor and approved before appearing here.',name:'VELORYZ review policy',kicker:'COMMUNITY / TRANSPARENCY',link:'/reviews.html#share-review'}
  ];
  const total=Math.max(authentic.length,Number(summary.count)||0);
  const avg=Number(summary.average);
  if(label)label.textContent=authentic.length?
   total+' published visitor '+(total===1?'review':'reviews')+(avg>0&&avg<=5?' · '+avg.toFixed(1)+' / 5 average rating':''):
   'Community / No approved reviews yet';
  const group=el('div','vz-live-review-group');
  const estimatedWidth=Math.max(285,Math.min(430,innerWidth*.31))+18;
  const repetitions=Math.max(2,Math.ceil((innerWidth+estimatedWidth)/(records.length*estimatedWidth)));
  for(let pass=0;pass<repetitions;pass++)for(const r of records){
   const card=makeCard(r);
   if(pass>0){card.setAttribute('aria-hidden','true');card.inert=true;}
   group.append(card);
  }
  const twin=group.cloneNode(true);twin.setAttribute('aria-hidden','true');twin.inert=true;
  track.replaceChildren(group,twin);
  track.style.setProperty('--vz-review-speed',Math.max(22,Math.round(group.childElementCount*7))+'s');
  sync();
 }
 render([]);
 fetch('/api/reviews',{credentials:'same-origin',cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Review API unavailable');return r.json();})
  .then(data=>render(Array.isArray(data.reviews)?data.reviews:[],data.summary||{}))
  .catch(()=>{if(label)label.textContent='Community / Review service temporarily unavailable';});
 button?.addEventListener('click',()=>{manuallyPaused=!manuallyPaused;sync();});
 window.StudioMotion?.addEventListener?.('change',sync);
}
function allDocumentation(){
 const holder=$('#vz-complete-doc-groups'),summary=$('#vz-total-docs');
 if(!holder)return;
 const docs=(Array.isArray(live.documentation)?live.documentation:[])
   .filter(x=>x&&typeof x.title==='string'&&typeof x.url==='string'&&x.url.startsWith('/'));
 if(!docs.length){holder.append(el('p','', 'Open the documentation home to browse the current published articles.'));return;}
 const map=new Map();
 for(const d of docs){
  const parts=d.url.split('/').filter(Boolean);
  const cat=parts[0]==='help'?'Help Centre · '+(parts[2]||'Getting started'):parts[0]==='docs'?'Studio documentation · '+(parts[2]||'Foundations'):'Other resources';
  if(!map.has(cat))map.set(cat,[]);
  map.get(cat).push(d);
 }
 const index=el('nav','vz-doc-category-index');index.setAttribute('aria-label','Documentation categories');
 const sections=el('div','vz-doc-group-list');
 for(const [name,pages]of map){
  const section=el('section','vz-full-doc-group');
  const title=el('h3','serif',name);
  const indicator=el('span','tag',String(pages.length)+' guides');
  const head=el('div','vz-full-doc-heading');head.append(title,indicator);
  const grid=el('div','vz-full-doc-grid');
  pages.forEach(({title,url})=>{
   const anchor=el('a','vz-full-doc-link');anchor.href=url;
   anchor.append(el('span','',title),el('i','', '↗'));grid.append(anchor);
  });
  section.append(head,grid);sections.append(section);
  const quick=el('a','',name+' ('+pages.length+')');quick.href='#'+slug(name);section.id=slug(name);index.append(quick);
 }
 holder.append(index,sections);summary.textContent=docs.length+' published guides in '+map.size+' categories';
 function slug(s){return 'vz-docs-'+s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
}
function journey(){
 const steps=$$('.vz-journey-stage');if(!steps.length)return;
 const refresh=()=>{if(reduce())steps.forEach(x=>x.classList.add('is-active'));};
 if(typeof IntersectionObserver==='undefined'){steps.forEach(x=>x.classList.add('is-active'));return;}
 const io=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting)e.target.classList.add('is-active');
 },{rootMargin:'-15% 0px -25% 0px',threshold:.12});
 steps.forEach(s=>io.observe(s));refresh();
 window.StudioMotion?.addEventListener?.('change',refresh);
}
chrome();kineticHeading();createHomeReviews();allDocumentation();journey();
})();
