/* VELORYZ real-source design library: original repo screenshots, original HTML preview,
   source attribution, and reduced-motion-aware native scroll animation. No generated design imagery. */
(()=>{'use strict';
const previous=window.VeloryzExternalDesignLibrary||{};
const legacy=typeof previous.entries==='function'?previous.entries.bind(previous):()=>[];
let imported=Array.isArray(window.VELORYZ_OPEN_DESIGNS)?window.VELORYZ_OPEN_DESIGNS:[],
category='All',rights='All',motion='All',price='All',query='',sort='featured',page=1;
const perPage=24;
let observer=null,loadStarted=false,searchTimer=0;
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=p=>'/design/'+encodeURIComponent(p.id)+'/';
const money=n=>'₹'+Math.max(6000,Math.min(50000,Math.round(Number(n)||6000))).toLocaleString('en-IN');
const createPath=p=>'/create/?reference='+encodeURIComponent(p.id)+'&estimate='+Math.round(Number(p.price)||6000);
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
 for(const item of [...imported,...cms])if(item?.id&&item.enabled!==false&&item.sourceType!=='original-veloryz'&&!found.has(item.id))found.set(item.id,item);
 return [...found.values()];
}
const prettyStatus=p=>p.sourceType==='original-veloryz'?['VELORYZ Original','original']:
 p.importStatus==='real-upstream-html'?['Interactive','imported']:
 p.rights==='restricted'?['Creative Reference','restricted']:['Studio Collection','review'];
const screenshotKind=p=>p.sourceType==='original-veloryz'?'Original first-party cover':
 p.previewImageKind==='upstream-screenshot'?'Original screenshot':
 p.previewImageKind==='published-reference-image'?'Published reference image':
 p.previewImageKind==='github-repository-cover'?'Repository cover — not a screenshot':p.previewImageKind==='upstream-preview-graphic'?'Source preview graphic':'Source image unavailable';
function art(p){
 const screenshot=p.previewImage&&p.sourceType!=='original-veloryz'?'/studio-preview-images/'+encodeURIComponent(p.id):(p.previewImage||p.image||(p.originalTemplateId?'/template-covers/'+p.originalTemplateId+'.svg':''));
 const isTrueScreenshot=['upstream-screenshot','published-reference-image'].includes(p.previewImageKind);
 return '<a class="vz-source-shot" href="'+path(p)+'" aria-label="Explore '+escape(p.name)+' in the VELORYZ source viewer">'+
 (screenshot?'<img class="vz-source-image" src="'+escape(screenshot)+'" data-fallback-src="'+escape(p.previewImage||'')+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="'+escape(p.name)+' — '+escape(screenshotKind(p))+'">':
 '<span class="vz-source-noimage"><span>PREVIEW COMING SOON</span><strong>'+escape(p.name)+'</strong></span>')+
 '<span class="vz-source-image-top"><span>'+escape(screenshotKind(p))+'</span><span aria-hidden="true">↗</span></span>'+
 '</a>';
}
function card(p,i){
 const [label,tone]=prettyStatus(p);
 const trust=p.rights==='candidate'?'Source candidate · verification pending':p.rights==='review'?'Source review needed':p.rights==='restricted'?'Reference only':'Confirm usage terms before delivery';
 return '<article class="vz-source-card" data-source-card data-price="'+Number(p.price||6000)+'" data-motion="'+motionLevel(p)+'" style="--source-order:'+(i%6)+'">'+art(p)+
 '<div class="vz-source-meta"><span>'+escape(p.category)+'</span><span class="vz-source-pill '+tone+'">'+escape(label)+'</span></div>'+
 '<div class="vz-source-card-body"><div class="vz-r9-card-title"><h3><a href="'+path(p)+'">'+escape(p.name)+'</a></h3></div><p>'+escape(p.description||'Open the source gallery for details.')+'</p>'+
 '<div class="vz-r9-card-signals"><span><img src="/assets/brand/veloryz-mark.svg" alt="">'+escape(trust)+'</span><span>'+escape(motionLevel(p))+' motion</span><span>'+escape(p.license||'Source terms')+'</span></div>'+
 '<div class="vz-source-price"><span>VELORYZ BUILD FROM</span><strong>'+money(p.price)+'</strong></div>'+
 '<div class="vz-source-card-actions"><a href="'+path(p)+'">Details ↗</a><a href="'+path(p)+'preview/">'+(p.previewType==='real-upstream-site'?'Interactive preview':'Concept preview')+' ↗</a><a href="'+createPath(p)+'">Use this direction ↗</a></div></div></article>';
}
function score(p){
 return p.importStatus==='real-upstream-html'?400:
 (p.previewImageKind==='upstream-screenshot'?290:0)+
 (p.sourceType==='original-veloryz'?200:0)+
 (p.previewImageKind==='published-reference-image'?90:0);
}
function motionLevel(p){const t=String(p.motion||'').toLowerCase();return /very high|high/.test(t)?'High':/medium/.test(t)?'Medium':/low/.test(t)?'Low':'Varies'}
function priceMatch(p){const n=Number(p.price||6000);return price==='All'||price==='Under ₹15k'&&n<15000||price==='₹15k–₹30k'&&n>=15000&&n<=30000||price==='₹30k+'&&n>30000}
function filtered(items){
 const q=query.toLowerCase();
 const res=items.filter(p=>p.sourceType!=='original-veloryz'&&(category==='All'||p.category===category)&&
  (rights==='All'||(rights==='imported'?p.importStatus==='real-upstream-html':
  rights==='original'?p.sourceType==='original-veloryz':p.rights===rights))&&
  (motion==='All'||motionLevel(p)===motion)&&priceMatch(p)&&
  (!q||[p.name,p.category,p.description,p.author,p.license,p.motion].join(' ').toLowerCase().includes(q)));
 if(sort==='name')res.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sort==='motion')res.sort((a,b)=>({High:4,Medium:3,Low:2,Varies:1}[motionLevel(b)]||0)-({High:4,Medium:3,Low:2,Varies:1}[motionLevel(a)]||0));
 else if(sort==='price-asc')res.sort((a,b)=>(a.price||6000)-(b.price||6000));
 else if(sort==='price-desc')res.sort((a,b)=>(b.price||6000)-(a.price||6000));
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
 '<h3>'+escape(p.name)+'</h3><p>'+escape(p.description)+'</p><strong>From '+money(p.price)+'</strong><a href="'+path(p)+'">Explore design ↗</a></div></article>'
 ).join('')+'</div><p class="vz-source-home-note">Made for exploring ideas with VELORYZ Studio.</p>';
}
function curated(items,count=6){
 const pool=items.filter(p=>p.previewImage&&p.rights!=='restricted').slice().sort((a,b)=>
  score(b)-score(a)||
  Number(/very high|high/i.test(b.motion||''))-Number(/very high|high/i.test(a.motion||''))||
  (a.price||6000)-(b.price||6000));
 const out=[],seen=new Set();
 for(const p of pool){if(seen.has(p.category))continue;seen.add(p.category);out.push(p);if(out.length===count)break}
 for(const p of pool)if(out.length<count&&!out.includes(p))out.push(p);
 return out.slice(0,count);
}
function featured(items){
 const preferred=curated(items,3);
 return '<div class="vz-source-feature-images" aria-label="Curated VELORYZ design directions">'+
 preferred.map((p,i)=>'<a class="vz-source-feature-card vz-feature-'+i+'" href="'+path(p)+'">'+
 '<img class="vz-source-image" src="/studio-preview-images/'+encodeURIComponent(p.id)+'" data-fallback-src="'+escape(p.previewImage)+'" alt="Preview of '+escape(p.name)+'" decoding="async">'+
 '<span><b>'+String(i+1).padStart(2,'0')+'</b>'+escape(p.name)+'</span></a>').join('')+
 '<img class="vz-r9-hero-mark" src="/assets/brand/veloryz-mark.svg" alt="" aria-hidden="true"></div>';
}
function featuredGrid(items){
 return '<div class="vz-r9-feature-grid">'+curated(items,6).map((p,i)=>
  '<article>'+art(p)+'<div><span>'+String(i+1).padStart(2,'0')+' / '+escape(p.category)+'</span>'+
  '<h3><a href="'+path(p)+'">'+escape(p.name)+'</a></h3>'+
  '<p>'+escape(p.description||'A selected direction ready for deeper review.')+'</p>'+
  '<footer><strong>From '+money(p.price)+'</strong><a href="'+createPath(p)+'">Start with this ↗</a></footer></div></article>'
 ).join('')+'</div>';
}
function render(){
 const items=entries(),s=stats(items),categories=['All',...new Set(items.map(p=>p.category))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b));
 const list=filtered(items),visible=list.slice(0,page*perPage);
 const prices=items.map(p=>Number(p.price||0)).filter(Boolean),lowest=prices.length?Math.min(...prices):6000;
 return '<section class="vz-real-library container vz-r9-market" id="vz-real-library">'+
 '<section class="vz-r9-market-hero"><div class="vz-source-hero-text"><span class="vz-source-eyebrow">VELORYZ / CURATED DESIGN MARKET</span>'+
 '<h1>Find a design.<br>Make it yours.</h1>'+
 '<p>Browse curated website and product design references. Compare styles, starting build estimates and preview types, then choose a direction for your project.</p>'+
 '<div class="vz-source-hero-actions"><a href="#vz-source-collection">Browse designs ↗</a><a href="/create/">Start from scratch ↗</a></div>'+
 '<dl class="vz-r9-market-stats"><div><dt>'+s.total+'</dt><dd>published directions</dd></div><div><dt>'+s.live+'</dt><dd>interactive previews</dd></div><div><dt>'+money(lowest)+'</dt><dd>lowest starting build</dd></div></dl></div>'+
 '</section>'+
 '<section class="vz-source-collection" id="vz-source-collection"><div class="vz-source-section-head"><span class="vz-source-eyebrow">FULL DESIGN MARKETPLACE</span>'+
 '<div><h2>All design references</h2><p>Filter by industry, motion, source status or starting budget.</p></div></div>'+
 '<div class="vz-source-toolbar vz-r9-toolbar"><label><span>Search</span><input type="search" data-source-search placeholder="SaaS, ecommerce, editorial, motion..." value="'+escape(query)+'" autocomplete="off"></label>'+
 '<label><span>Industry</span><select data-source-category>'+categories.map(c=>'<option value="'+escape(c)+'"'+(c===category?' selected':'')+'>'+escape(c)+'</option>').join('')+'</select></label>'+
 '<label><span>Motion level</span><select data-source-motion>'+['All','High','Medium','Low','Varies'].map(v=>'<option'+(v===motion?' selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label><span>Starting budget (INR)</span><select data-source-price>'+['All','Under ₹15k','₹15k–₹30k','₹30k+'].map(v=>'<option'+(v===price?' selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label><span>Sort</span><select data-source-sort><option value="featured"'+(sort==='featured'?' selected':'')+'>Studio featured</option><option value="price-asc"'+(sort==='price-asc'?' selected':'')+'>Price: low to high</option><option value="price-desc"'+(sort==='price-desc'?' selected':'')+'>Price: high to low</option><option value="name"'+(sort==='name'?' selected':'')+'>Name A–Z</option><option value="motion"'+(sort==='motion'?' selected':'')+'>Motion rich first</option></select></label></div>'+
 '<p class="vz-r20-price-note">Starting build estimates are shown in INR. Final scope, licensing and billing currency are confirmed before work begins.</p><div class="vz-source-filters" role="group" aria-label="Source availability and usage context">'+[
  ['All','All ('+s.total+')'],['imported','Interactive source ('+s.live+')'],['candidate','Source candidate · verification pending'],['review','Source review needed'],['restricted','Reference only']
 ].map(([value,label])=>'<button type="button" data-source-rights="'+value+'" aria-pressed="'+(rights===value)+'">'+label+'</button>').join('')+'</div>'+
 '<div class="vz-source-list-head"><span id="vz-source-result-count" role="status" aria-live="polite">'+visible.length+' of '+list.length+' matching designs</span><button type="button" data-source-reset>Clear filters</button></div><p class="vz-filter-summary" id="vz-filter-summary"></p>'+
 '<div class="vz-source-grid" id="vz-source-grid">'+visible.map(card).join('')+'</div>'+
 '<div class="vz-source-empty"'+(list.length?' hidden':'')+'><strong>No matching designs.</strong><p>Try another search or remove filters.</p><button type="button" data-source-reset>Clear all filters</button></div>'+
 (visible.length<list.length?'<div class="vz-source-load"><button type="button" data-source-more>Load more designs ('+(list.length-visible.length)+' remaining) ↓</button></div>':'')+
 '</section>'+
 '<section class="vz-r9-review-trust"><div><span class="vz-source-eyebrow">REAL PROJECT FEEDBACK</span><h2>Trust belongs<br><em>beside the price.</em></h2><p>VELORYZ does not invent per-template ratings. This section uses the existing moderated review system and shows only approved visitor feedback.</p><a href="/reviews.html">Read or leave a review ↗</a></div><div class="vz-r9-review-data" data-source-review-trust><strong>Loading published review signal…</strong><p>Only approved, human-submitted reviews appear here.</p></div></section>'+
 '<div class="vz-source-legal vz-r9-legal"><span>VELORYZ sells its own design adaptation and development service. Third-party source code, media and trademarks retain their applicable rights. Scope, licenses and dependencies are reviewed before delivery.</span><a href="/legal/design-notices/">Read design notices ↗</a><a href="/create/">Create your project ↗</a></div></section>';
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
 root.querySelector('#vz-source-result-count').textContent=visible.length+' of '+list.length+' matching designs';
 const summary=root.querySelector('#vz-filter-summary');if(summary){const active=[query?'Search: '+query:'',category!=='All'?category:'',motion!=='All'?motion+' motion':'',price!=='All'?price:'',rights!=='All'?({imported:'Interactive source',candidate:'Source candidate',review:'Source review needed',restricted:'Reference only'}[rights]||rights):''].filter(Boolean);summary.textContent=active.length?'Active filters: '+active.join(' · '):'No filters applied';}
 let more=root.querySelector('.vz-source-load');
 if(visible.length<list.length){
  if(!more){more=document.createElement('div');more.className='vz-source-load';more.innerHTML='<button type="button" data-source-more></button>';grid.after(more)}
  more.querySelector('button').textContent='Load more designs ('+(list.length-visible.length)+' remaining) ↓';
 }else more?.remove();
 let empty=root.querySelector('.vz-source-empty');if(empty)empty.hidden=list.length!==0;
 animateCards(root);
}
function loadReviewTrust(){
 const host=document.querySelector('[data-source-review-trust]');if(!host||host.dataset.reviewLoaded==='1')return;host.dataset.reviewLoaded='1';
 fetch('/api/reviews',{credentials:'same-origin',cache:'no-store'}).then(r=>{if(!r.ok)throw Error('review api');return r.json()}).then(data=>{
  const rows=Array.isArray(data.reviews)?data.reviews.filter(x=>x&&typeof x.body==='string'&&x.body.trim()):[];
  const count=Math.max(rows.length,Number(data.summary?.count)||0),avg=Number(data.summary?.average)||0;
  if(!rows.length){host.innerHTML='<strong>No approved reviews yet.</strong><p>The review system is active. VELORYZ will not manufacture ratings to fill this space.</p><a href="/reviews.html#share-review">Be the first to review ↗</a>';return}
  const sample=rows.slice(0,2).map(r=>{const stars=Math.max(1,Math.min(5,Number(r.rating)||1));return '<blockquote><span aria-label="'+stars+' out of 5 stars">'+'★'.repeat(stars)+'</span><p>'+escape(((r.headline?r.headline+' — ':'')+r.body).slice(0,220))+'</p><footer>'+escape(r.display_name||'Community member')+'</footer></blockquote>'}).join('');
  host.innerHTML='<div class="vz-r9-review-score"><strong>'+(avg>0&&avg<=5?avg.toFixed(1):'—')+'</strong><span>'+(avg>0&&avg<=5?'average rating':'published feedback')+'<br>'+count+' approved '+(count===1?'review':'reviews')+'</span></div>'+sample;
 }).catch(()=>{host.innerHTML='<strong>Review service temporarily unavailable.</strong><p>No fallback rating is fabricated when the live review service cannot be reached.</p><a href="/reviews.html">Open reviews ↗</a>'});
}
function bootstrap(){
 const root=document.getElementById('vz-real-library');
 if(root){animateCards(root);loadReviewTrust();}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-source-rights],[data-source-more],[data-source-reset]');
 if(!b||!b.closest('#vz-real-library'))return;
 e.preventDefault();
 if(b.dataset.sourceRights!==undefined){rights=b.dataset.sourceRights;page=1;document.querySelectorAll('[data-source-rights]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh()}
 if(b.hasAttribute('data-source-reset')){clearTimeout(searchTimer);category=rights=motion=price='All';query='';sort='featured';page=1;const root=b.closest('#vz-real-library');for(const key of ['category','motion','price'])root.querySelector('[data-source-'+key+']').value='All';root.querySelector('[data-source-search]').value='';root.querySelector('[data-source-sort]').value='featured';root.querySelectorAll('[data-source-rights]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.sourceRights==='All')));refresh();root.querySelector('[data-source-search]').focus({preventScroll:true});}
 if(b.hasAttribute('data-source-more')){const oldCount=page*perPage;page++;refresh();const next=document.querySelectorAll('#vz-source-grid .vz-source-card')[oldCount];next?.querySelector('a')?.focus({preventScroll:true});}
});
document.addEventListener('input',e=>{
 if(e.target.matches('[data-source-search]')){query=e.target.value.trim();page=1;clearTimeout(searchTimer);searchTimer=setTimeout(refresh,120)}
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-source-category]')){category=e.target.value;page=1;refresh()}
 if(e.target.matches('[data-source-motion]')){motion=e.target.value;page=1;refresh()}
 if(e.target.matches('[data-source-price]')){price=e.target.value;page=1;refresh()}
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
 const div=document.createElement('span');div.className='vz-source-noimage';div.textContent='Preview image unavailable — view project details';
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
