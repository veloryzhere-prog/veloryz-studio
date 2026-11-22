/* VELORYZ real-source design library: original repo screenshots, original HTML preview,
   source attribution, and reduced-motion-aware native scroll animation. No generated design imagery. */
(()=>{'use strict';
const previous=window.VeloryzExternalDesignLibrary||{};
const legacy=typeof previous.entries==='function'?previous.entries.bind(previous):()=>[];
let imported=Array.isArray(window.VELORYZ_OPEN_DESIGNS)?window.VELORYZ_OPEN_DESIGNS:[],
category='All',rights='All',query='',sort='featured',page=1;
const perPage=24;
let observer=null,loadStarted=false;
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=p=>'/design/'+encodeURIComponent(p.id)+'/';
const createPath=p=>p.originalTemplateId?'/create/?template='+encodeURIComponent(p.originalTemplateId):'/create/?reference='+encodeURIComponent(p.id);
const categoryMap={
 'Ecommerce · Shopify':'Ecommerce & B2B','Ecommerce · Fashion':'Ecommerce & B2B',
 'Ecommerce · Furniture':'Ecommerce & B2B','Ecommerce · Motion':'Ecommerce & B2B',
 'Ecommerce · Product':'Ecommerce & B2B','Ecommerce · Home':'Ecommerce & B2B',
 'Ecommerce · Marketplace':'Ecommerce & B2B','Fintech & SaaS':'SaaS & Dashboards',
 'SaaS & Dashboard':'SaaS & Dashboards','Motion & Interactive':'Motion & Components',
 'Motion & Agency':'Portfolio & Agency','Social & Community':'Community & Nonprofit',
 'Portfolio & Creative':'Portfolio & Agency','Editorial & Publishing':'Editorial & Publishing',
 'Gaming':'Gaming & Entertainment'
};
function entries(){
 // Former CMS inspiration cards are removed from the refreshed public library.
 // Their records remain untouched in Admin for optional re-publishing later.
 const cms=[];
 const found=new Map();
 for(const item of [...imported,...cms])if(item?.id&&!found.has(item.id))found.set(item.id,item);
 return [...found.values()];
}
const prettyStatus=p=>p.sourceType==='original-veloryz'?['VELORYZ Original','original']:
 p.importStatus==='real-upstream-html'?['Interactive','imported']:
 p.rights==='restricted'?['Creative Reference','restricted']:['Studio Collection','review'];
const screenshotKind=p=>p.sourceType==='original-veloryz'?'Original first-party cover':
 p.previewImageKind==='upstream-screenshot'?'Original screenshot':
 p.previewImageKind==='published-reference-image'?'Published reference image':
 p.previewImageKind==='github-repository-cover'?'GitHub repository cover': 'Source image unavailable';
function art(p){
 const screenshot=p.previewImage&&p.sourceType!=='original-veloryz'?'/studio-preview-images/'+encodeURIComponent(p.id):(p.previewImage||p.image||(p.originalTemplateId?'/template-covers/'+p.originalTemplateId+'.svg':''));
 const isTrueScreenshot=['upstream-screenshot','published-reference-image'].includes(p.previewImageKind);
 return '<a class="vz-source-shot" href="'+path(p)+'" aria-label="Explore '+escape(p.name)+' in the VELORYZ source viewer">'+
 (screenshot?'<img class="vz-source-image" src="'+escape(screenshot)+'" data-fallback-src="'+escape(p.previewImage||'')+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="'+escape(p.name)+' — '+escape(screenshotKind(p))+'">':
 '<span class="vz-source-noimage"><span>PREVIEW COMING SOON</span><strong>'+escape(p.name)+'</strong></span>')+
 '<span class="vz-source-image-top"><span>VELORYZ / DESIGN STUDIO</span><span>↗</span></span>'+
 '<span class="vz-source-image-label">EXPLORE WITH VELORYZ</span></a>';
}
function card(p,i){
 const [label,tone]=prettyStatus(p),source=String(p.source||'');
 return '<article class="vz-source-card" data-source-card style="--source-order:'+(i%6)+'">'+art(p)+
 '<div class="vz-source-meta"><span>'+escape(p.category)+'</span><span class="vz-source-pill '+tone+'">'+escape(label)+'</span></div>'+
 '<div class="vz-source-card-body"><h3><a href="'+path(p)+'">'+escape(p.name)+'</a></h3><p>'+escape(p.description||'Open the source gallery for details.')+'</p>'+
 '<div class="vz-source-credit">The VELORYZ design collection</div>'+
 '<div class="vz-source-card-actions"><a href="'+path(p)+'">Explore design ↗</a><a href="'+createPath(p)+'">Create with VELORYZ +</a></div></div></article>';
}
function score(p){
 return p.importStatus==='real-upstream-html'?400:
 (p.previewImageKind==='upstream-screenshot'?290:0)+
 (p.sourceType==='original-veloryz'?200:0)+
 (p.previewImageKind==='published-reference-image'?90:0);
}
function filtered(items){
 const q=query.toLowerCase();
 const res=items.filter(p=>(category==='All'||p.category===category)&&
  (rights==='All'||(rights==='imported'?p.importStatus==='real-upstream-html':
  rights==='original'?p.sourceType==='original-veloryz':p.rights===rights))&&
  (!q||[p.name,p.category,p.description,p.author,p.license].join(' ').toLowerCase().includes(q)));
 if(sort==='name')res.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sort==='motion')res.sort((a,b)=>Number(/very high|high/i.test(b.motion||''))-Number(/very high|high/i.test(a.motion||'')));
 else res.sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name));
 return res;
}
function stats(items){return{
 total:items.length,live:items.filter(p=>p.importStatus==='real-upstream-html').length,
 originals:items.filter(p=>p.sourceType==='original-veloryz').length,
 candidates:items.filter(p=>p.rights==='candidate').length
}}
function showcase(){
 const picks=entries().filter(p=>p.importStatus==='real-upstream-html').slice(0,3);
 return '<div class="vz-source-home-showcase">'+picks.map(p=>
 '<article class="vz-source-home-card">'+art(p)+'<div><span class="vz-source-home-category">'+escape(p.category)+' / VELORYZ STUDIO</span>'+
 '<h3>'+escape(p.name)+'</h3><p>'+escape(p.description)+'</p><a href="'+path(p)+'">Explore design ↗</a></div></article>'
 ).join('')+'</div><p class="vz-source-home-note">Made for exploring ideas with VELORYZ Studio.</p>';
}
function featured(items){
 const preferred=items.filter(p=>p.importStatus==='real-upstream-html'&&p.previewImage).slice(0,3);
 return '<div class="vz-source-feature-images" aria-label="Real source design screenshots">'+
 preferred.map((p,i)=>'<a class="vz-source-feature-card vz-feature-'+i+'" href="'+path(p)+'">'+
 '<img class="vz-source-image" src="/studio-preview-images/'+encodeURIComponent(p.id)+'" data-fallback-src="'+escape(p.previewImage)+'" alt="Original preview of '+escape(p.name)+'" decoding="async">'+
 '<span>'+escape(p.name)+'</span></a>').join('')+'</div>';
}
function render(){
 const items=entries(),s=stats(items),categories=['All',...new Set(items.map(p=>p.category))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b));
 const list=filtered(items),visible=list.slice(0,page*perPage);
 return '<section class="vz-real-library container" id="vz-real-library">'+
 '<div class="vz-source-hero"><div class="vz-source-hero-text"><span class="vz-source-eyebrow">VELORYZ / INDEPENDENT CREATIVE STUDIO / DESIGN COLLECTION</span>'+
 '<h1>Designs with<br><em>a point of view.</em></h1>'+
 '<p>A considered collection of distinctive websites, interactive experiences and digital ideas. Explore the visuals, experience the motion and turn your chosen direction into a tailored VELORYZ project.</p>'+
 '<div class="vz-source-hero-actions"><a href="#vz-source-collection">Explore the collection ↗</a><a href="/create/">Create with VELORYZ +</a></div>'+
 '<div class="vz-source-counts"><span><b>'+s.total+'</b> Design directions</span><span><b>'+s.live+'</b> Interactive previews</span><span><b>'+s.originals+'</b> Studio originals</span></div></div>'+
 featured(items)+'</div>'+
 '<div class="vz-source-ribbon" aria-hidden="true"><div>THE VELORYZ DESIGN COLLECTION <span>✳</span> IDEAS IN MOTION <span>✳</span> CREATE WITH VELORYZ <span>✳</span> THE VELORYZ DESIGN COLLECTION <span>✳</span></div></div>'+
 '<section class="vz-source-collection" id="vz-source-collection"><div class="vz-source-section-head"><span class="vz-source-eyebrow">01 / EXPLORE BY INDUSTRY</span>'+
 '<div><h2>Find your<br><em>next direction.</em></h2><p>Explore a carefully curated set of website experiences, portfolios, storefronts, dashboards and motion systems. Every project begins with a direction worth making your own.</p></div></div>'+
 '<div class="vz-source-toolbar"><label><span>Search</span><input type="search" data-source-search placeholder="Explore brands, portfolios, commerce, motion..." value="'+escape(query)+'" autocomplete="off"></label>'+
 '<label><span>Niche</span><select data-source-category>'+categories.map(c=>'<option value="'+escape(c)+'"'+(c===category?' selected':'')+'>'+escape(c)+'</option>').join('')+'</select></label>'+
 '<label><span>Sort</span><select data-source-sort><option value="featured"'+(sort==='featured'?' selected':'')+'>Studio featured</option><option value="name"'+(sort==='name'?' selected':'')+'>A to Z</option><option value="motion"'+(sort==='motion'?' selected':'')+'>Motion rich first</option></select></label></div>'+
 '<div class="vz-source-filters" role="group" aria-label="Experience type">'+[
 ['All','All designs ('+s.total+')'],['imported','Interactive ('+s.live+')'],['original','Studio originals ('+s.originals+')'],['candidate','More designs'],['restricted','Creative ideas']
 ].map(([value,label])=>'<button type="button" data-source-rights="'+value+'" aria-pressed="'+(rights===value)+'">'+label+'</button>').join('')+'</div>'+
 '<div class="vz-source-list-head"><span id="vz-source-result-count" aria-live="polite">'+list.length+' design directions</span><span>VELORYZ / CURATED DIGITAL EXPERIENCES</span></div>'+
 '<div class="vz-source-grid" id="vz-source-grid">'+visible.map(card).join('')+'</div>'+
 (!list.length?'<div class="vz-source-empty">No matching source designs. Try another search or category.</div>':'')+
 (visible.length<list.length?'<div class="vz-source-load"><button type="button" data-source-more>Load more designs ('+(list.length-visible.length)+' remaining) ↓</button></div>':'')+
 '<div class="vz-source-legal"><span>VELORYZ Studio — designed to help you find a direction.</span><a href="/legal/design-notices/">Legal acknowledgements</a></div></section></section>';
}
function animateCards(root=document){
 observer?.disconnect();observer=null;
 const gallery=root.id==='vz-real-library'?root:root.querySelector?.('#vz-real-library');
 if(!gallery)return;
 const cards=[...gallery.querySelectorAll('.vz-source-card')];
 const reduced=window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;
 if(reduced||!('IntersectionObserver' in window)){cards.forEach(x=>x.classList.add('is-visible'));return}
 gallery.classList.add('vz-reveal-enabled');
 observer=new IntersectionObserver(list=>list.forEach(({target,isIntersecting})=>{
  if(!isIntersecting)return;
  target.classList.add('is-visible');observer.unobserve(target)
 }),{rootMargin:'0px 0px -32px 0px',threshold:.07});
 cards.forEach(c=>observer.observe(c));
}
function refresh(){
 const root=document.getElementById('vz-real-library');if(!root)return;
 const all=entries(),list=filtered(all),visible=list.slice(0,page*perPage);
 const grid=root.querySelector('#vz-source-grid');if(!grid)return;
 grid.innerHTML=visible.map(card).join('');
 root.querySelector('#vz-source-result-count').textContent=list.length+' designs';
 let more=root.querySelector('.vz-source-load');
 if(visible.length<list.length){
  if(!more){more=document.createElement('div');more.className='vz-source-load';more.innerHTML='<button type="button" data-source-more></button>';grid.after(more)}
  more.querySelector('button').textContent='Load more authentic designs ('+(list.length-visible.length)+' remaining) ↓';
 }else more?.remove();
 let empty=root.querySelector('.vz-source-empty');if(empty)empty.hidden=list.length!==0;
 animateCards(root);
}
function bootstrap(){
 const root=document.getElementById('vz-real-library');
 if(root)animateCards(root);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-source-rights],[data-source-more]');
 if(!b||!b.closest('#vz-real-library'))return;
 e.preventDefault();
 if(b.dataset.sourceRights!==undefined){rights=b.dataset.sourceRights;page=1;document.querySelectorAll('[data-source-rights]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh()}
 if(b.hasAttribute('data-source-more')){page++;refresh()}
});
document.addEventListener('input',e=>{
 if(e.target.matches('[data-source-search]')){query=e.target.value.trim();page=1;refresh()}
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-source-category]')){category=e.target.value;page=1;refresh()}
 if(e.target.matches('[data-source-sort]')){sort=e.target.value;page=1;refresh()}
});
document.addEventListener('error',e=>{
 const el=e.target;
 if(!(el instanceof HTMLImageElement)||!el.classList.contains('vz-source-image'))return;
 if(!el.dataset.fallbackTried&&el.dataset.fallbackSrc&&el.src!==el.dataset.fallbackSrc){
  el.dataset.fallbackTried='true';el.src=el.dataset.fallbackSrc;return;
 }
 const art=el.closest('.vz-source-shot');if(!art){el.hidden=true;return}
 el.remove();
 const div=document.createElement('span');div.className='vz-source-noimage';div.textContent='Source image unavailable — open details for the original repository';
 art.prepend(div);
},{capture:true});
document.addEventListener('studio:route',bootstrap);
window.addEventListener('pageshow',bootstrap);
document.addEventListener('DOMContentLoaded',bootstrap);
function renderWithMotion(){
 const page=render();
 // The SPA inserts the HTML after this callback: wait until it is committed.
 requestAnimationFrame(()=>requestAnimationFrame(()=>animateCards(document)));
 return page;
}
window.designPage=renderWithMotion;
window.VeloryzOpenDesigns={render:renderWithMotion,entries,showcase};
window.VeloryzExternalDesignLibrary={...previous,render:renderWithMotion,entries,showcase};
if(window.VeloryzTemplateStore)window.VeloryzTemplateStore.render=renderWithMotion;
})();
