/* VELORYZ curated, independently sourced design references.
   Each card resolves to its OWN real external website, not a shared generated demo.
   Published CMS catalogue drives the public UI; edit it in Studio Control. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=()=>window.STUDIO_STATE?.state||window.STUDIO_STATE||{};
const entries=()=>Array.isArray(state().catalogue)?state().catalogue.filter(x=>x.enabled!==false&&x.demo&&x.source):[];
const image=p=>p.image||'';
const fmt=v=>'₹'+Number(v||0).toLocaleString('en-IN');
const featuredIds=['agentura-motion','linear-platform','anon-retail'];
const featured=()=>featuredIds.map(id=>entries().find(x=>x.id===id)).filter(Boolean);
const link=(p)=>p.demo||p.source;
let search='',category='All',sort='featured',active=null;
const bagKey='veloryz.external.design.bag.v2';
let bag=[];
try { bag=[...new Set(JSON.parse(localStorage.getItem(bagKey)||'[]'))].filter(x=>typeof x==='string').slice(0,20); }catch{}
const basket=()=>bag.map(id=>entries().find(p=>p.id===id)).filter(Boolean);
const total=()=>basket().reduce((v,p)=>v+Number(p.price||0),0);
const persist=()=>{try{localStorage.setItem(bagKey,JSON.stringify(bag));}catch{}};
function bagButtons(p){return '<div class="vz-ext-buybar"><div><span>Starting at</span><strong>'+fmt(p.price)+'</strong></div><button type="button" data-ext-add="'+esc(p.id)+'">Add to cart +</button><button type="button" data-ext-buy="'+esc(p.id)+'">Buy now ↗</button></div>';}
function cartContents(){
 const chosen=basket();
 return '<div class="vz-ext-cart-list">'+(chosen.length?chosen.map(p=>'<div class="vz-ext-cart-line"><img src="'+esc(image(p))+'" alt="" loading="lazy"><div><strong>'+esc(p.name)+'</strong><small>Custom website development · from '+fmt(p.price)+'</small></div><button type="button" data-ext-remove="'+esc(p.id)+'" aria-label="Remove '+esc(p.name)+'">×</button></div>').join(''):'<p>Your cart is empty. Select a design to begin.</p>')+'</div>'+
 '<div class="vz-ext-cart-total"><span>Estimated starting total</span><strong>'+fmt(total())+'</strong></div>'+
 '<p class="vz-ext-checkout-note">A purchase request is not a payment. Final scope, availability, third-party rights, pricing and any required licenses will be confirmed before invoicing. You are commissioning VELORYZ services, not purchasing ownership of another creator’s website.</p>'+
 '<form class="vz-ext-cart-form" data-enquiry data-summary="VELORYZ website design purchase request" data-request-id="'+esc(crypto.randomUUID?.()||'design-'+Date.now())+'"><input type="hidden" name="kind" value="project"><input type="hidden" name="message" value="'+esc('Design purchase request. Selected: '+chosen.map(p=>p.id+' / '+p.name+' / '+fmt(p.price)+' / reference '+p.source).join(' | ')+'. Starting total '+fmt(total())+'. Scope and licensing review required; not a completed payment.')+'"><div class="enquiry-error" hidden role="alert"></div><label>Your name<input name="name" autocomplete="name" maxlength="100" required></label><label>Email<input type="email" name="email" autocomplete="email" required maxlength="180"></label><label>Phone (optional)<input name="phone" autocomplete="tel" maxlength="20"></label><label class="vz-ext-consent"><input type="checkbox" name="consent" required> I agree to send my request to VELORYZ and understand this is not an online payment.</label><button type="submit" '+(!chosen.length?'disabled':'')+'>Request purchase ↗</button><div class="book-preview" role="status" hidden></div></form>';
}
function syncBag(){
 document.querySelectorAll('[data-ext-cart-count]').forEach(n=>n.textContent=String(basket().length));
 document.querySelectorAll('[data-ext-add]').forEach(b=>{b.textContent=bag.includes(b.dataset.extAdd)?'Added ✓':'Add to cart +';});
 const body=document.querySelector('#vz-ext-cart-body');if(body)body.innerHTML=cartContents();
}
function openBag(){const panel=document.querySelector('#vz-ext-cart');if(!panel)return;panel.hidden=false;syncBag();document.body.classList.add('vz-ext-lock');panel.querySelector('.vz-ext-cart-dialog').focus();}
function closeBag(){const panel=document.querySelector('#vz-ext-cart');if(panel)panel.hidden=true;document.body.classList.remove('vz-ext-lock');}
function addBag(id,open=true,replaceAll=false){if(!entries().some(x=>x.id===id))return;if(replaceAll)bag=[];if(!bag.includes(id))bag.push(id);persist();syncBag();if(open)openBag();}
window.VeloryzExternalCart={add:addBag,open:openBag,get items(){return basket()},get total(){return total()}};

function card(p,i){
const labels=[p.category,p.author].filter(Boolean).map(esc).join(' · ');
return `<article class="vz-external-card" data-extern-id="${esc(p.id)}" data-category="${esc(p.category)}" data-search="${esc((p.name+' '+p.category+' '+p.description+' '+p.author).toLowerCase())}">
<a class="vz-external-visual" href="${esc(link(p))}" target="_blank" rel="noopener noreferrer" aria-label="Open actual website: ${esc(p.name)}"><img src="${esc(image(p))}" alt="Screenshot reference for ${esc(p.name)}; opens the original live website" loading="${i<3?'eager':'lazy'}" referrerpolicy="no-referrer" decoding="async"><span class="vz-ext-open">Open real website ↗</span></a>
<div class="vz-external-detail"><span class="vz-ext-category">${labels}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="vz-ext-actions"><button type="button" data-ext-preview="${esc(p.id)}">Live preview</button><a href="${esc(link(p))}" target="_blank" rel="noopener noreferrer">Original ↗</a><a href="/create/?reference=${encodeURIComponent(p.id)}">Request adaptation ↗</a></div>${bagButtons(p)}</div></article>`;
}
function showcase(){
const picks=featured();if(!picks.length)return '<p>Explore our curated design library for independent real-world website references.</p>';
return `<div class="vz-home-featured">${picks.map((p,i)=>`<article><a href="${esc(link(p))}" target="_blank" rel="noopener noreferrer"><img src="${esc(image(p))}" alt="${esc(p.name)} — actual external design reference" loading="lazy" referrerpolicy="no-referrer"><div><span>0${i+1} / ${esc(p.category)} · EXTERNAL REFERENCE</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><strong>Explore live design ↗</strong></div></a><div class="vz-home-purchase"><span>From <b>${fmt(p.price)}</b></span><button type="button" data-ext-add="${esc(p.id)}">Add to cart +</button><button type="button" data-ext-buy="${esc(p.id)}">Buy now ↗</button></div></article>`).join('')}</div><p class="vz-ext-credit">Independent design examples shown for inspiration; not projects authored or owned by VELORYZ. <a href="/design/">Browse the complete design library ↗</a></p>`;
}
function render(){
const items=entries();const categories=['All',...new Set(items.map(x=>x.category))];
return `<section class="vz-external-store container" id="vz-external-store"><div class="vz-external-hero"><div><span class="eyebrow">VELORYZ / REAL DESIGN REFERENCES</span><h1>Real websites.<br><em>Different worlds.</em></h1><p>Explore real, independently created templates across commerce, social platforms, service businesses, motion studios and more. Every card has its own source and opens the original design—not a duplicated VELORYZ demo.</p><a href="#external-gallery" class="button">Explore the collection ↗</a></div><div class="vz-external-hero-image">${featured()[0]?`<a href="${esc(link(featured()[0]))}" target="_blank" rel="noopener"><img src="${esc(image(featured()[0]))}" alt="Featured motion website reference"></a>`:''}</div></div>
<div class="vz-external-disclaimer">CURATED WEBSITE DESIGNS <span>Transparent starting prices · Customized delivery by VELORYZ <button class="vz-ext-cart-trigger" type="button" data-ext-open-cart>Cart (<b data-ext-cart-count>0</b>)</button></span></div>
<section id="external-gallery"><div class="vz-ext-head"><h2>Browse the design library.</h2><p>Compare different page structures and real interactions. Previews may be blocked by a source site's security settings; the original site link always remains available.</p></div>
<div class="vz-ext-toolbar"><div class="vz-ext-filters">${categories.map(c=>`<button type="button" data-ext-cat="${esc(c)}" aria-pressed="${c===category}">${esc(c)}</button>`).join('')}</div><div class="vz-ext-find"><input aria-label="Search external website designs" type="search" data-ext-search placeholder="Search by platform, style or purpose…"><select data-ext-sort aria-label="Sort designs"><option value="featured">Featured</option><option value="name">Name A–Z</option><option value="low">Estimate: low to high</option></select></div></div><p class="vz-ext-count" aria-live="polite">${items.length} individually sourced designs</p><div class="vz-ext-grid">${items.map(card).join('')}</div><p class="vz-ext-empty" hidden>No matching designs. Try another search or category.</p></section>
<div class="vz-ext-legal"><h2>Make a design your own.</h2><p>Choose an experience you like and tell us how it should work for your business. Final development scope, total cost, delivery terms and design permissions are reviewed in the purchase request.</p><a href="/create/" class="button">Create your project ↗</a></div>
<div class="vz-ext-modal" hidden><div class="vz-ext-backdrop" data-ext-close></div><section class="vz-ext-dialog" role="dialog" aria-modal="true" aria-label="Live external design preview" tabindex="-1"><header><strong data-ext-title>Live preview</strong><div><button type="button" data-ext-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-ext-device="mobile" aria-pressed="false">Mobile</button><a data-ext-original href="#" target="_blank" rel="noopener noreferrer">Open original ↗</a><button type="button" data-ext-close aria-label="Close preview">×</button></div></header><div class="vz-ext-frame-wrap"><iframe title="External live website preview" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" ></iframe></div><footer>External sites may prevent embedded previews. Use “Open original” when the frame is blank or unavailable.</footer></section></div><div class="vz-ext-cart" id="vz-ext-cart" hidden><div class="vz-ext-backdrop" data-ext-close-cart></div><section class="vz-ext-cart-dialog" role="dialog" aria-modal="true" aria-label="Your design cart" tabindex="-1"><header><div><small>VELORYZ / DESIGN REQUEST</small><h2>Your cart <span data-ext-cart-count>0</span></h2></div><button type="button" data-ext-close-cart aria-label="Close cart">×</button></header><div id="vz-ext-cart-body">${cartContents()}</div></section></div></section>`;
}
function refresh(){
const root=document.querySelector('#vz-external-store');if(!root)return;
const cards=[...root.querySelectorAll('.vz-external-card')];let count=0;for(const c of cards){let found=(category==='All'||c.dataset.category===category)&&c.dataset.search.includes(search);c.hidden=!found;if(found)count++;}
const grid=root.querySelector('.vz-ext-grid');const sorted=cards.filter(c=>!c.hidden);
if(sort==='name')sorted.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent));
if(sort==='low')sorted.sort((a,b)=>(entries().find(p=>p.id===a.dataset.externId)?.price||0)-(entries().find(p=>p.id===b.dataset.externId)?.price||0));
sorted.forEach(c=>grid.append(c));
root.querySelector('.vz-ext-count').textContent=count+' individually sourced designs';root.querySelector('.vz-ext-empty').hidden=count!==0;
root.querySelectorAll('[data-ext-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.extCat===category)));
}
function close(){const root=document.querySelector('#vz-external-store'),m=root?.querySelector('.vz-ext-modal');if(m){m.hidden=true;m.querySelector('iframe').removeAttribute('src');document.body.classList.remove('vz-ext-lock');active=null;}}
document.addEventListener('click',ev=>{const root=document.querySelector('#vz-external-store');if(!root)return;const b=ev.target.closest('[data-ext-cat],[data-ext-preview],[data-ext-close],[data-ext-device],[data-ext-add],[data-ext-buy],[data-ext-open-cart],[data-ext-remove],[data-ext-close-cart]');if(!b)return;
if(b.dataset.extAdd){ev.preventDefault();addBag(b.dataset.extAdd);}
if(b.dataset.extBuy){ev.preventDefault();addBag(b.dataset.extBuy,true,true);}
if(b.hasAttribute('data-ext-open-cart')){ev.preventDefault();openBag();}
if(b.dataset.extRemove){ev.preventDefault();bag=bag.filter(id=>id!==b.dataset.extRemove);persist();syncBag();}
if(b.hasAttribute('data-ext-close-cart')){ev.preventDefault();closeBag();}
if(b.dataset.extCat!==undefined){category=b.dataset.extCat;refresh();}
if(b.dataset.extClose!==undefined){close();}
if(b.dataset.extPreview){const p=entries().find(x=>x.id===b.dataset.extPreview);if(!p)return;active=p;const m=root.querySelector('.vz-ext-modal');m.querySelector('[data-ext-title]').textContent=p.name+' · '+p.author;m.querySelector('[data-ext-original]').href=link(p);m.querySelector('iframe').src=link(p);m.hidden=false;document.body.classList.add('vz-ext-lock');m.querySelector('.vz-ext-dialog').focus();m.querySelector('.vz-ext-frame-wrap').classList.remove('mobile');}
if(b.dataset.extDevice){root.querySelector('.vz-ext-frame-wrap').classList.toggle('mobile',b.dataset.extDevice==='mobile');root.querySelectorAll('[data-ext-device]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-ext-search]')){search=e.target.value.toLowerCase().trim();refresh();}});
document.addEventListener('change',e=>{if(e.target.matches('[data-ext-sort]')){sort=e.target.value;refresh();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(active)close();closeBag();}});
document.addEventListener('studio:route',()=>{if(!document.querySelector('#vz-external-store')){close();closeBag();}});
window.VeloryzExternalDesignLibrary={render,showcase,entries};
if(window.VeloryzTemplateStore)window.VeloryzTemplateStore.render=render;
})();