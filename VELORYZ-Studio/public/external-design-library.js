/* VELORYZ curated, independently sourced design references.
   Each card resolves to its OWN real external website, not a shared generated demo.
   Published CMS catalogue drives the public UI; edit it in Studio Control. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=()=>window.STUDIO_STATE?.state||window.STUDIO_STATE||{};
const entries=()=>Array.isArray(state().catalogue)?state().catalogue.filter(x=>x.enabled!==false&&(x.demo||x.liveDemo||x.localSource)&&x.source):[];
const image=p=>p.image||p.previewImage||p.cover||'';
const fmt=v=>'₹'+Number(v||0).toLocaleString('en-IN');
const link=(p)=>p.demo||p.liveDemo||p.localSource||p.source;
const motionBucket=p=>{const t=String(p?.motion||'').toLowerCase();return t.includes('high')?'high':t.includes('medium')?'medium':t.includes('low')?'low':'varies'};
const motionWeight=p=>({high:4,medium:3,low:2,varies:1}[motionBucket(p)]||1);
const reviewLabel=p=>p?.rights==='candidate'?'Source candidate — verification pending':p?.rights==='review'?'Source review required':p?.rights==='restricted'?'Restricted source':'Rights check';
const featured=()=>{
 const pool=entries().filter(p=>image(p)&&Number(p.price||0)>0&&p.rights!=='restricted').sort((a,b)=>
  Number(b.previewType==='real-upstream-site')-Number(a.previewType==='real-upstream-site')||
  motionWeight(b)-motionWeight(a)||
  Number(a.price||0)-Number(b.price||0)
 );
 const out=[],seen=new Set();
 for(const p of pool){const key=p.category||'Other';if(seen.has(key))continue;seen.add(key);out.push(p);if(out.length===6)break}
 for(const p of pool)if(out.length<6&&!out.includes(p))out.push(p);
 return out.slice(0,6);
};
let search='',category='All',sort='featured',motionBand='all',priceBand='all',active=null,limit=24,reviewsLoaded=false;
const bagKey='veloryz.external.design.bag.v2';
let bag=[];
try { bag=[...new Set(JSON.parse(localStorage.getItem(bagKey)||'[]'))].filter(x=>typeof x==='string').slice(0,20); }catch{}
const basket=()=>bag.map(id=>entries().find(p=>p.id===id)).filter(Boolean);
const total=()=>basket().reduce((v,p)=>v+Number(p.price||0),0);
const persist=()=>{try{localStorage.setItem(bagKey,JSON.stringify(bag));}catch{}};
function bagButtons(p){return '<div class="vz-ext-buybar"><div><span>VELORYZ build from</span><strong>'+fmt(p.price)+'</strong></div><button type="button" data-ext-add="'+esc(p.id)+'">Shortlist +</button><button type="button" data-ext-buy="'+esc(p.id)+'">Request this build ↗</button></div>';}
function cartContents(){
 const chosen=basket();
 return '<div class="vz-ext-cart-list">'+(chosen.length?chosen.map(p=>'<div class="vz-ext-cart-line"><img src="'+esc(image(p))+'" alt="" loading="lazy"><div><strong>'+esc(p.name)+'</strong><small>Custom website development · from '+fmt(p.price)+'</small></div><button type="button" data-ext-remove="'+esc(p.id)+'" aria-label="Remove '+esc(p.name)+'">×</button></div>').join(''):'<p>Your cart is empty. Select a design to begin.</p>')+'</div>'+
 '<div class="vz-ext-cart-total"><span>Estimated starting total</span><strong>'+fmt(total())+'</strong></div>'+
 '<p class="vz-ext-checkout-note">A purchase request is not a payment. Final scope, availability, third-party rights, pricing and any required licenses will be confirmed before invoicing. You are commissioning VELORYZ services, not purchasing ownership of another creator’s website.</p>'+
 '<form class="vz-ext-cart-form" data-enquiry data-summary="VELORYZ website design purchase request" data-request-id="'+esc(crypto.randomUUID?.()||'design-'+Date.now())+'"><input type="hidden" name="kind" value="project"><input type="hidden" name="message" value="'+esc('Design purchase request. Selected: '+chosen.map(p=>p.id+' / '+p.name+' / '+fmt(p.price)+' / reference '+p.source).join(' | ')+'. Starting total '+fmt(total())+'. Scope and licensing review required; not a completed payment.')+'"><div class="enquiry-error" hidden role="alert"></div><label>Your name<input name="name" autocomplete="name" maxlength="100" required></label><label>Email<input type="email" name="email" autocomplete="email" required maxlength="180"></label><label>Phone (optional)<input name="phone" autocomplete="tel" maxlength="20"></label><label class="vz-ext-consent"><input type="checkbox" name="consent" required> I agree to send my request to VELORYZ and understand this is not an online payment.</label><button type="submit" '+(!chosen.length?'disabled':'')+'>Request purchase ↗</button><div class="book-preview" role="status" hidden></div></form>';
}
function syncBag(){
 document.querySelectorAll('[data-ext-cart-count]').forEach(n=>n.textContent=String(basket().length));
 document.querySelectorAll('[data-ext-add]').forEach(b=>{b.textContent=bag.includes(b.dataset.extAdd)?'Shortlisted ✓':'Shortlist +';});
 const body=document.querySelector('#vz-ext-cart-body');if(body)body.innerHTML=cartContents();
}
function openBag(){const panel=document.querySelector('#vz-ext-cart');if(!panel)return;panel.hidden=false;syncBag();document.body.classList.add('vz-ext-lock');panel.querySelector('.vz-ext-cart-dialog').focus();}
function closeBag(){const panel=document.querySelector('#vz-ext-cart');if(panel)panel.hidden=true;document.body.classList.remove('vz-ext-lock');}
function addBag(id,open=true,replaceAll=false){if(!entries().some(x=>x.id===id))return;if(replaceAll)bag=[];if(!bag.includes(id))bag.push(id);persist();syncBag();if(open)openBag();}
window.VeloryzExternalCart={add:addBag,open:openBag,get items(){return basket()},get total(){return total()}};

function card(p,i){
 const labels=[p.category,p.author].filter(Boolean).map(esc).join(' · ');
 const motion=motionBucket(p);
 const price=Number(p.price||0);
 return `<article class="vz-external-card" data-extern-id="${esc(p.id)}" data-index="${i}" data-price="${price}" data-motion="${motion}" data-category="${esc(p.category)}" data-search="${esc((p.name+' '+p.category+' '+p.description+' '+p.author+' '+p.motion).toLowerCase())}">
 <a class="vz-external-visual" href="${esc(link(p))}" target="_blank" rel="noopener noreferrer" aria-label="Open source website for ${esc(p.name)}">
  <img src="${esc(image(p))}" alt="Design reference for ${esc(p.name)}" loading="${i<4?'eager':'lazy'}" referrerpolicy="no-referrer" decoding="async">
  <span class="vz-ext-open">Explore source ↗</span><span class="vz-ext-visual-price">From ${fmt(p.price)}</span>
 </a>
 <div class="vz-external-detail">
  <div class="vz-ext-card-head"><div><span class="vz-ext-category">${labels}</span><h3>${esc(p.name)}</h3></div><span class="vz-ext-card-index">${String(i+1).padStart(2,'0')}</span></div>
  <p>${esc(p.description)}</p>
  <div class="vz-ext-signals"><span class="is-reviewed"><img src="/assets/brand/veloryz-mark.svg" alt="">${esc(reviewLabel(p))}</span><span>${esc(p.motion||'Responsive')} motion</span><span>VELORYZ adaptation</span></div>
  <div class="vz-ext-actions"><button type="button" data-ext-preview="${esc(p.id)}">Live preview</button><a href="/design/${encodeURIComponent(p.id)}/">Details ↗</a><a href="/create/?reference=${encodeURIComponent(p.id)}">Start with this ↗</a></div>
  ${bagButtons(p)}
 </div></article>`;
}
function featureCard(p,i){
 return `<article class="vz-ext-feature-card"><a href="/design/${encodeURIComponent(p.id)}/"><div class="vz-ext-feature-media"><img src="${esc(image(p))}" alt="${esc(p.name)} design preview" loading="${i<2?'eager':'lazy'}" referrerpolicy="no-referrer"><span>0${i+1}</span></div><div class="vz-ext-feature-copy"><small>${esc(p.category)} · ${esc(p.motion||'Responsive')} motion</small><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div><strong>From ${fmt(p.price)}</strong><span>${esc(reviewLabel(p))} ↗</span></div></div></a></article>`;
}
function showcase(){
const picks=featured();if(!picks.length)return '<p>Explore our curated design library for independent real-world website references.</p>';
return `<div class="vz-home-featured">${picks.map((p,i)=>`<article><a href="${esc(link(p))}" target="_blank" rel="noopener noreferrer"><img src="${esc(image(p))}" alt="${esc(p.name)} — actual external design reference" loading="lazy" referrerpolicy="no-referrer"><div><span>0${i+1} / ${esc(p.category)} · EXTERNAL REFERENCE</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><strong>Explore live design ↗</strong></div></a><div class="vz-home-purchase"><span>From <b>${fmt(p.price)}</b></span><button type="button" data-ext-add="${esc(p.id)}">Add to cart +</button><button type="button" data-ext-buy="${esc(p.id)}">Buy now ↗</button><a class="vz-home-create-link" href="/create/?reference=${encodeURIComponent(p.id)}">Create your project ↗</a></div></article>`).join('')}</div><p class="vz-ext-credit">Curated design references · <a href="/design/">Browse the complete library ↗</a></p><div class="vz-home-cart-link"><button type="button" data-ext-open-cart>View cart (<span data-ext-cart-count>0</span>) ↗</button></div>${cartDialog()}`;
}
function cartDialog(){return '<div class="vz-ext-cart" id="vz-ext-cart" hidden><div class="vz-ext-backdrop" data-ext-close-cart></div><section class="vz-ext-cart-dialog" role="dialog" aria-modal="true" aria-label="Your design cart" tabindex="-1"><header><div><small>VELORYZ / DESIGN REQUEST</small><h2>Your shortlist <span data-ext-cart-count>0</span></h2></div><button type="button" data-ext-close-cart aria-label="Close cart">×</button></header><div id="vz-ext-cart-body">'+cartContents()+'</div></section></div>';}
function render(){
 const items=entries();const picks=featured();const categories=['All',...new Set(items.map(x=>x.category))];
 const prices=items.map(x=>Number(x.price||0)).filter(Boolean);const floor=prices.length?Math.min(...prices):0;
 return `<section class="vz-external-store container" id="vz-external-store">
 <section class="vz-ext-market-hero" aria-labelledby="vz-design-market-title">
  <div class="vz-ext-hero-copy"><span class="eyebrow">VELORYZ / DESIGN LIBRARY</span><h1 id="vz-design-market-title">Find a direction.<br><em>Make it unmistakably yours.</em></h1><p>A curated marketplace of source-backed web directions, motion references and proven interface patterns. Choose a starting point; VELORYZ adapts the system around your brand, content and real product requirements.</p><div class="vz-ext-hero-actions"><a href="#external-gallery" class="button">Explore all designs ↗</a><a href="/create/" class="button is-quiet">Start from scratch ↗</a></div>
  <dl class="vz-ext-market-stats"><div><dt>${items.length}</dt><dd>published directions</dd></div><div><dt>${categories.length-1}</dt><dd>specialist categories</dd></div><div><dt>${floor?fmt(floor):'Quote'}</dt><dd>lowest starting build</dd></div></dl></div>
  <div class="vz-ext-hero-stack" aria-label="Featured design previews">${picks.slice(0,3).map((p,i)=>`<a href="/design/${encodeURIComponent(p.id)}/" style="--vz-stack:${i}"><img src="${esc(image(p))}" alt="${esc(p.name)} preview"><span>${esc(p.name)}</span></a>`).join('')}<img class="vz-ext-hero-mark" src="/assets/brand/veloryz-mark.svg" alt="" aria-hidden="true"></div>
 </section>
 <div class="vz-external-disclaimer"><span><img src="/assets/brand/veloryz-mark.svg" alt="">VELORYZ CURATED / SOURCE-BACKED</span><span>Transparent starting prices · Human review before build · <button class="vz-ext-cart-trigger" type="button" data-ext-open-cart>Shortlist (<b data-ext-cart-count>0</b>)</button></span></div>
 <section class="vz-ext-market-values" aria-label="How the design library works"><article><span>01</span><h2>Choose for fit, not fashion.</h2><p>Filter by industry, motion intensity and budget. A strong starting point should fit the job before it impresses the eye.</p></article><article><span>02</span><h2>Know the starting cost.</h2><p>Every card shows a VELORYZ starting build price. Final scope is confirmed before any invoice or license commitment.</p></article><article><span>03</span><h2>Review before we build.</h2><p>Source rights, dependencies, responsive behaviour and delivery risk are checked before a design becomes a project.</p></article></section>
 <section class="vz-ext-featured-drop" aria-labelledby="vz-ext-featured-title"><header><div><span class="eyebrow">CURATED DROP / HIGH-SIGNAL DIRECTIONS</span><h2 id="vz-ext-featured-title">Six starting points worth studying.</h2></div><p>Selected for diversity of category, stronger motion or useful structure—not because they all look alike.</p></header><div class="vz-ext-feature-grid">${picks.map(featureCard).join('')}</div></section>
 <section id="external-gallery" class="vz-ext-gallery"><div class="vz-ext-head"><div><span class="eyebrow">FULL MARKETPLACE</span><h2>Browse the complete library.</h2></div><p>Search  by purpose, narrow by motion and budget, then preview the original direction before you shortlist it.</p></div>
 <div class="vz-ext-toolbar"><div class="vz-ext-filters">${categories.map(c=>`<button type="button" data-ext-cat="${esc(c)}" aria-pressed="${c===category}">${esc(c)}</button>`).join('')}</div><div class="vz-ext-find"><input aria-label="Search website designs" type="search" data-ext-search placeholder="Search SaaS, commerce, editorial…"><select data-ext-motion aria-label="Filter by motion"><option value="all">All motion</option><option value="high">High motion</option><option value="medium">Medium motion</option><option value="low">Low motion</option></select><select data-ext-price aria-label="Filter by starting price"><option value="all">All prices</option><option value="under15">Under ₹15k</option><option value="15to30">₹15k–₹30k</option><option value="over30">₹30k+</option></select><select data-ext-sort aria-label="Sort designs"><option value="featured">Curated order</option><option value="name">Name A–Z</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div></div>
 <div class="vz-ext-results-head"><p class="vz-ext-count" aria-live="polite">${items.length} design directions</p><span>Pricing is a starting build estimate, not checkout.</span></div><div class="vz-ext-grid">${items.map(card).join('')}</div><p class="vz-ext-empty" hidden>No matching designs. Try another search, category, motion level or price range.</p><button class="vz-ext-load-more" type="button" data-ext-more>Load more designs ↓</button></section>
 <section class="vz-ext-review-trust" aria-labelledby="vz-ext-review-title"><div><span class="eyebrow">REAL PROJECT FEEDBACK</span><h2 id="vz-ext-review-title">Trust belongs beside the price.</h2><p>Marketplace ratings only help when they are real. VELORYZ shows published visitor reviews from the existing moderated review system rather than inventing ratings for individual templates.</p><a href="/reviews.html" class="button">Read all reviews ↗</a></div><div class="vz-ext-review-summary" data-ext-review-summary><strong>Loading published review signal…</strong><p>Only approved, human-submitted reviews are used here.</p></div></section>
 <div class="vz-ext-legal"><div><span class="eyebrow">FROM REFERENCE TO REAL PRODUCT</span><h2>Use the direction. Build your own system.</h2></div><p>VELORYZ does not sell ownership of somebody else’s website. We use the selected direction as a starting reference, verify rights and dependencies, then deliver approved custom work under your project agreement.</p><a href="/create/" class="button">Create your project ↗</a></div>
 <div class="vz-ext-modal" hidden><div class="vz-ext-backdrop" data-ext-close></div><section class="vz-ext-dialog" role="dialog" aria-modal="true" aria-label="Live external design preview" tabindex="-1"><header><strong data-ext-title>Live preview</strong><div><button type="button" data-ext-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-ext-device="mobile" aria-pressed="false">Mobile</button><a data-ext-original href="#" target="_blank" rel="noopener noreferrer">Open source ↗</a><button type="button" data-ext-close aria-label="Close preview">×</button></div></header><div class="vz-ext-frame-wrap"><iframe title="External live website preview" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe></div><footer>Some source sites block embedded previews. “Open source” remains available when the frame cannot load.</footer></section></div>
 <div class="vz-ext-cart" id="vz-ext-cart" hidden><div class="vz-ext-backdrop" data-ext-close-cart></div><section class="vz-ext-cart-dialog" role="dialog" aria-modal="true" aria-label="Your design shortlist" tabindex="-1"><header><div><small>VELORYZ / DESIGN REQUEST</small><h2>Your shortlist <span data-ext-cart-count>0</span></h2></div><button type="button" data-ext-close-cart aria-label="Close shortlist">×</button></header><div id="vz-ext-cart-body">${cartContents()}</div></section></div>
 </section>`;
}
function refresh(){
 const root=document.querySelector('#vz-external-store');if(!root)return;
 const cards=[...root.querySelectorAll('.vz-external-card')];
 const priceOK=c=>{const p=Number(c.dataset.price||0);return priceBand==='all'||priceBand==='under15'&&p<15000||priceBand==='15to30'&&p>=15000&&p<=30000||priceBand==='over30'&&p>30000};
 const matched=cards.filter(c=>(category==='All'||c.dataset.category===category)&&c.dataset.search.includes(search)&&(motionBand==='all'||c.dataset.motion===motionBand)&&priceOK(c));
 if(sort==='name')matched.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent));
 else if(sort==='low')matched.sort((a,b)=>Number(a.dataset.price)-Number(b.dataset.price));
 else if(sort==='high')matched.sort((a,b)=>Number(b.dataset.price)-Number(a.dataset.price));
 else matched.sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index));
 const grid=root.querySelector('.vz-ext-grid');cards.forEach(c=>c.hidden=true);
 matched.forEach(c=>grid.append(c));
 const shown=matched.slice(0,limit);shown.forEach(c=>c.hidden=false);
 root.querySelector('.vz-ext-count').textContent=shown.length+' shown · '+matched.length+' matching · '+cards.length+' total';
 root.querySelector('.vz-ext-empty').hidden=matched.length!==0;
 const more=root.querySelector('[data-ext-more]');if(more){more.hidden=matched.length<=limit;more.textContent='Load '+Math.min(24,matched.length-limit)+' more designs ↓'}
 root.querySelectorAll('[data-ext-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.extCat===category)));
}
function loadReviewTrust(){
 const host=document.querySelector('[data-ext-review-summary]');if(!host||reviewsLoaded)return;reviewsLoaded=true;
 fetch('/api/reviews',{credentials:'same-origin',cache:'no-store'}).then(r=>{if(!r.ok)throw Error('review API');return r.json()}).then(data=>{
  const rows=Array.isArray(data.reviews)?data.reviews.filter(x=>x&&typeof x.body==='string'&&x.body.trim()):[];
  const count=Math.max(rows.length,Number(data.summary?.count)||0);const avg=Number(data.summary?.average)||0;
  if(!rows.length){host.innerHTML='<strong>No approved reviews yet.</strong><p>The review system is live; ratings will appear here only after real visitor feedback is approved.</p><a href="/reviews.html#share-review">Be the first to review ↗</a>';return}
  const sample=rows.slice(0,2).map(r=>'<blockquote><div aria-label="'+esc(Math.max(1,Math.min(5,Number(r.rating)||1)))+' out of 5 stars">'+'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||1)))+'</div><p>'+esc((r.headline?r.headline+' — ':'')+r.body).slice(0,220)+'</p><footer>'+esc(r.display_name||'Community member')+'</footer></blockquote>').join('');
  host.innerHTML='<div class="vz-ext-review-score"><strong>'+(avg>0&&avg<=5?avg.toFixed(1):'—')+'</strong><span>'+(avg>0&&avg<=5?'average rating':'published feedback')+'<br>'+count+' approved '+(count===1?'review':'reviews')+'</span></div>'+sample;
 }).catch(()=>{host.innerHTML='<strong>Review service temporarily unavailable.</strong><p>We do not replace unavailable review data with fabricated ratings.</p><a href="/reviews.html">Open the review page ↗</a>'});
}
function close(){const root=document.querySelector('#vz-external-store'),m=root?.querySelector('.vz-ext-modal');if(m){m.hidden=true;m.querySelector('iframe').removeAttribute('src');document.body.classList.remove('vz-ext-lock');active=null;}}
document.addEventListener('click',ev=>{const root=document.querySelector('#vz-external-store');if(!root&&!document.querySelector('.vz-home-featured'))return;const b=ev.target.closest('[data-ext-cat],[data-ext-preview],[data-ext-close],[data-ext-device],[data-ext-add],[data-ext-buy],[data-ext-open-cart],[data-ext-remove],[data-ext-close-cart],[data-ext-more]');if(!b)return;
if(b.dataset.extAdd){ev.preventDefault();addBag(b.dataset.extAdd);}
if(b.dataset.extBuy){ev.preventDefault();addBag(b.dataset.extBuy,true,false);}
if(b.hasAttribute('data-ext-open-cart')){ev.preventDefault();openBag();}
if(b.dataset.extRemove){ev.preventDefault();bag=bag.filter(id=>id!==b.dataset.extRemove);persist();syncBag();}
if(b.hasAttribute('data-ext-close-cart')){ev.preventDefault();closeBag();}
if(b.dataset.extCat!==undefined){category=b.dataset.extCat;limit=24;refresh();}
if(b.hasAttribute('data-ext-more')){limit+=24;refresh();}
if(b.dataset.extClose!==undefined){close();}
if(b.dataset.extPreview){const p=entries().find(x=>x.id===b.dataset.extPreview);if(!p)return;active=p;const m=root.querySelector('.vz-ext-modal');m.querySelector('[data-ext-title]').textContent=p.name+' · '+p.author;m.querySelector('[data-ext-original]').href=link(p);m.querySelector('iframe').src=link(p);m.hidden=false;document.body.classList.add('vz-ext-lock');m.querySelector('.vz-ext-dialog').focus();m.querySelector('.vz-ext-frame-wrap').classList.remove('mobile');}
if(b.dataset.extDevice){root.querySelector('.vz-ext-frame-wrap').classList.toggle('mobile',b.dataset.extDevice==='mobile');root.querySelectorAll('[data-ext-device]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-ext-search]')){search=e.target.value.toLowerCase().trim();limit=24;refresh();}});
document.addEventListener('change',e=>{if(e.target.matches('[data-ext-sort]')){sort=e.target.value;refresh();}if(e.target.matches('[data-ext-motion]')){motionBand=e.target.value;limit=24;refresh();}if(e.target.matches('[data-ext-price]')){priceBand=e.target.value;limit=24;refresh();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(active)close();closeBag();}});
document.addEventListener('studio:route',()=>{if(!document.querySelector('#vz-external-store')){close();closeBag();reviewsLoaded=false}else requestAnimationFrame(()=>{refresh();syncBag();loadReviewTrust()})});
requestAnimationFrame(()=>{if(document.querySelector('#vz-external-store')){refresh();syncBag();loadReviewTrust()}});
window.VeloryzExternalDesignLibrary={render,showcase,entries};
if(window.VeloryzTemplateStore)window.VeloryzTemplateStore.render=render;
})();