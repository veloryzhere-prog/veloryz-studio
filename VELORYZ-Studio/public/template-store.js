/* VELORYZ ORIGINAL TEMPLATE MARKET / Storefront + real previews + existing Studio order API. */
(()=>{'use strict';
const products=()=>Array.isArray(window.VELORYZ_TEMPLATE_PRODUCTS)?window.VELORYZ_TEMPLATE_PRODUCTS:[];
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
const byId=id=>products().find(p=>p.id===id);
const key='veloryz.template.store.cart.v1';
let items=[],category='All',query='',sort='featured',activeDialog=null;
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))items=[...new Set(saved.filter(x=>typeof x==='string'&&byId(x)))].slice(0,8)}catch{}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(items))}catch{}};
const total=()=>items.reduce((n,id)=>n+(byId(id)?.price||0),0);
const getURL=id=>'/template-previews/'+encodeURIComponent(id)+'.html';
function card(p,i){
 return '<article class="vz-product-card" data-vz-product="'+E(p.id)+'" data-vz-category="'+E(p.category)+'" data-vz-search="'+E([p.name,p.style,p.description,p.category].join(' ').toLowerCase())+'" data-vz-price="'+Number(p.price)+'">'+
 '<div class="vz-product-art"><a href="'+getURL(p.id)+'" target="_blank" rel="noopener" aria-label="Open '+E(p.name)+' full demo"><img src="'+E(p.cover)+'" loading="'+(i<2?'eager':'lazy')+'" decoding="async" alt="Original '+E(p.name)+' website template visual" width="1280" height="800"></a><span class="vz-product-badge">BY VELORYZ STUDIO</span><button class="vz-product-quick" data-vz-quick="'+E(p.id)+'" aria-label="Quick preview '+E(p.name)+'">Live preview ↗</button></div>'+
 '<div class="vz-product-info"><div class="vz-product-meta"><span>'+E(p.category)+' · '+E(p.style)+'</span><span>EDITION 2026</span></div><h3>'+E(p.name)+'</h3><p>'+E(p.description)+'</p><div class="vz-product-includes"><span>◌ '+p.pages+' page sections</span><span>✦ Responsive motion</span><span>◎ Original source</span></div>'+
 '<div class="vz-product-bottom"><div><small>FRONT-END TEMPLATE</small><strong>'+money(p.price)+'</strong></div><button data-vz-add="'+E(p.id)+'" aria-label="Add '+E(p.name)+' to order request" class="'+(items.includes(p.id)?'in-bag':'')+'">'+(items.includes(p.id)?'In your bag ✓':'Add to bag +')+'</button></div>'+
 '<div class="vz-product-links"><a href="'+getURL(p.id)+'" target="_blank" rel="noopener">Explore full live demo ↗</a><a href="/create/?template='+encodeURIComponent(p.id)+'">Customize in Create ↗</a></div></div></article>';
}
function render(){
 const p=products(),categories=['All',...new Set(p.map(x=>x.category))],featured=p.find(x=>x.id==='collective')||p[0];
 if(!p.length)return '<section class="container vz-store-loading"><h1>Original templates are loading.</h1><p>Explore our full collection soon or <a href="/contact/">contact the Studio</a>.</p></section>';
 return '<div class="vz-store" id="vz-template-store"><header class="vz-store-hero"><div class="vz-store-hero-copy"><div class="vz-store-eyebrow"><span>✳</span> ORIGINAL TEMPLATE COLLECTION / VELORYZ 2026</div><h1>Ready to make<br><em>an impression.</em></h1><p>Working websites with personality. Explore '+p.length+' original motion-ready VELORYZ templates, preview their real interactions, and request a commercial website license or a team-built adaptation.</p><div class="vz-store-hero-actions"><a href="#vz-template-gallery" class="vz-store-button">Explore templates <span>↗</span></a><button data-vz-bag-open class="vz-store-ghost">Your bag <span data-vz-bag-count>'+items.length+'</span> ↗</button></div><div class="vz-store-hero-note"><span>01 / ORIGINAL CODE & ARTWORK</span><span>02 / REAL RESPONSIVE SHOWCASES</span><span>03 / COMMERCIAL LICENSE OPTIONS</span></div></div><div class="vz-store-hero-art"><a href="'+getURL(featured.id)+'" target="_blank" rel="noopener" aria-label="Explore '+E(featured.name)+' showcase"><div class="vz-store-hero-window"><div class="vz-store-window-rail"><span>● &nbsp; ● &nbsp; ●</span><span>veloryz.online / designs / preview</span><span>↗</span></div><img src="'+E(featured.cover)+'" alt="'+E(featured.name)+' original template showcase" decoding="async" fetchpriority="high"></div><div class="vz-store-float-label"><strong>FEATURED ORIGINAL / '+E(featured.name)+'</strong><span>Explore real motion and interaction ↗</span></div></a></div></header>'+
 '<div class="vz-store-bar"><span>VELORYZ / DESIGN SYSTEMS</span><span>'+p.length+' ORIGINAL TEMPLATES &nbsp; ✳ &nbsp; WORKING PREVIEWS &nbsp; ✳ &nbsp; MADE FOR YOUR BRAND</span></div>'+
 '<section class="vz-store-gallery container" id="vz-template-gallery"><div class="vz-store-section-head"><div><span class="vz-store-eyebrow">THE COLLECTION / CURATED & ORIGINAL</span><h2>Find your next<br><em>starting point.</em></h2></div><p>Every preview is a working front-end design, not an imported screenshot. Select your style, explore the site and customize it with our team.</p></div>'+
 '<div class="vz-store-toolbar"><div class="vz-store-filters" role="group" aria-label="Filter templates">'+categories.map(c=>'<button type="button" data-vz-filter="'+E(c)+'" aria-pressed="'+(c===category)+'" class="'+(c===category?'active':'')+'">'+E(c)+'</button>').join('')+'</div><div class="vz-store-tools"><label><span class="sr-only">Search templates</span><input type="search" data-vz-search placeholder="Search designs…" autocomplete="off"></label><label><span class="sr-only">Sort templates</span><select data-vz-sort><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name A–Z</option></select></label><button data-vz-bag-open>Bag (<b data-vz-bag-count>'+items.length+'</b>) ↗</button></div></div>'+
 '<p class="vz-store-count" aria-live="polite">'+p.length+' original templates found</p><div class="vz-store-grid" id="vz-product-grid">'+p.map(card).join('')+'</div><p class="vz-store-empty" hidden>No matching templates. Try a different category or search term.</p>'+
 '<div class="vz-store-license"><div><span class="vz-store-eyebrow">YOUR PROJECT, YOUR RIGHTS</span><h2>Original design.<br>Clear licensing.</h2><p>These are VELORYZ-created front-end website templates—not third-party marketplace resales. The template price is for a one-project commercial source license, with an optional Studio customization service. A live payment gateway, hosting, CMS, client-specific integrations and premium assets are not included unless agreed separately.</p></div><div><h3>Every front-end package includes</h3><ul><li>Responsive HTML, CSS and JavaScript</li><li>Original vector visuals and interactive layouts</li><li>Mobile navigation and reduced-motion support</li><li>Original demo content ready to replace</li><li>Usage documentation and license handover</li></ul><a href="/docs/">Documentation ↗</a></div></div>'+
 '<div class="vz-store-help"><div><span class="vz-store-eyebrow">NEED A FULL WEBSITE?</span><h2>Make it yours.</h2><p>Select a template, then tell us your brand, pages, features and desired launch. We can discuss a complete production build.</p></div><div><a href="/create/" class="vz-store-button">Start your project ↗</a><a href="/support/" class="vz-store-ghost">Ask Studio Support ↗</a></div></div></section>'+
 '<div class="vz-store-cart-overlay" id="vz-store-cart" hidden><div class="vz-store-cart-scrim" data-vz-cart-close></div><aside class="vz-store-cart-panel" role="dialog" aria-modal="true" aria-labelledby="vz-cart-title" tabindex="-1"><header><div><span>VELORYZ / YOUR SELECTION</span><h2 id="vz-cart-title">Your template bag.</h2></div><button type="button" data-vz-cart-close aria-label="Close bag">×</button></header><div id="vz-cart-body"></div></aside></div>'+
 '<div class="vz-store-preview-overlay" id="vz-store-preview" hidden><div class="vz-store-preview-scrim" data-vz-preview-close></div><section class="vz-store-preview-panel" role="dialog" aria-modal="true" aria-labelledby="vz-preview-title" tabindex="-1"><header><div><span>LIVE FRONT-END SHOWCASE</span><h2 id="vz-preview-title"></h2></div><div class="vz-preview-controls"><button type="button" data-vz-preview-size="desktop" aria-pressed="true">Desktop</button><button type="button" data-vz-preview-size="mobile" aria-pressed="false">Mobile</button><a id="vz-preview-newtab" target="_blank" rel="noopener">Full page ↗</a><button type="button" data-vz-preview-close aria-label="Close preview">×</button></div></header><div class="vz-preview-frame-wrap"><iframe id="vz-preview-frame" loading="lazy" title="Original VELORYZ template preview" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" referrerpolicy="no-referrer"></iframe></div><footer><p>Working design showcase. Demo forms and carts do not create bookings or payments.</p><a id="vz-preview-create">Customize this template ↗</a></footer></section></div></div>';
}
function updateGrid(){
 const grid=document.querySelector('#vz-product-grid');if(!grid)return;
 let filtered=products().filter(p=>(category==='All'||p.category===category)&&([p.name,p.description,p.style,p.category].join(' ').toLowerCase().includes(query)));
 if(sort==='low')filtered.sort((a,b)=>a.price-b.price);else if(sort==='high')filtered.sort((a,b)=>b.price-a.price);else if(sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name));
 grid.innerHTML=filtered.map(card).join('');
 const empty=document.querySelector('.vz-store-empty');if(empty)empty.hidden=filtered.length>0;
 const count=document.querySelector('.vz-store-count');if(count)count.textContent=filtered.length+' original template'+(filtered.length===1?'':'s')+' found';
}
function refreshCounters(){document.querySelectorAll('[data-vz-bag-count]').forEach(el=>el.textContent=String(items.length));}
function checkoutText(){return 'VELORYZ Template purchase request (NOT PAID)\n'+items.map(id=>{const p=byId(id);return p?p.name+' ('+p.id+') — '+money(p.price):''}).filter(Boolean).join('\n')+'\nTotal displayed license prices: '+money(total())+'\nPlease confirm licensing, availability, delivery, payment and any customization in writing before collecting payment.';}
function cartBody(){
 if(!items.length)return '<div class="vz-bag-empty"><span>✳</span><h3>Your next idea starts here.</h3><p>Add one or more VELORYZ templates to request a license or discuss a full website build.</p><button type="button" data-vz-cart-close>Explore the collection ↗</button></div>';
 return '<div class="vz-cart-lines">'+items.map(id=>{const p=byId(id);return '<article><img src="'+E(p.cover)+'" alt="" loading="lazy"><div><span>'+E(p.category)+'</span><strong>'+E(p.name)+'</strong><small>Commercial front-end template license</small><b>'+money(p.price)+'</b></div><button data-vz-remove="'+E(id)+'" aria-label="Remove '+E(p.name)+'">×</button></article>'}).join('')+'</div>'+
 '<div class="vz-cart-totals"><div><span>'+items.length+' template'+(items.length===1?'':'s')+'</span><b>'+money(total())+'</b></div><p>Displayed license prices are an order-request estimate, not a payment or guaranteed quotation. No charges are made on this site.</p></div>'+
 '<form class="purchase-form vz-template-order" data-enquiry data-summary="VELORYZ original template license enquiry" data-request-id="'+(crypto.randomUUID?.()||('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2).padEnd(12,'0').slice(0,12)))+'">'+
 '<input type="hidden" name="kind" value="project"><input type="hidden" name="message" value="'+E(checkoutText())+'">'+
 '<div class="enquiry-error" hidden role="alert"></div><h3>Request your template order</h3><p>A team member will confirm price, license, handover terms and the payment method. Your order is not paid or fulfilled at this step.</p>'+
 '<label>Your name<input name="name" autocomplete="name" maxlength="100" required></label><label>Email for the order reply<input type="email" name="email" autocomplete="email" maxlength="180" required></label><label>WhatsApp (optional)<input name="phone" autocomplete="tel" maxlength="20" type="tel"></label>'+
 '<label>Business name (optional)<input name="company" autocomplete="organization" maxlength="200"></label><label class="purchase-consent"><input name="consent" type="checkbox" required> I agree to send my order enquiry and contact details to VELORYZ Studio. I understand this is not a payment.</label>'+
 '<button class="vz-store-button" type="submit">Request purchase & contact Studio ↗</button><div class="book-preview" role="status" hidden></div></form>';
}
function openCart(){const box=document.querySelector('#vz-store-cart');if(!box)return;document.querySelector('#vz-cart-body').innerHTML=cartBody();box.hidden=false;document.body.classList.add('vz-store-modal-open');box.querySelector('.vz-store-cart-panel').focus();}
function closeCart(){const el=document.querySelector('#vz-store-cart');if(el)el.hidden=true;document.body.classList.remove('vz-store-modal-open');document.querySelector('[data-vz-bag-open]')?.focus({preventScroll:true});}
function preview(id){const p=byId(id),box=document.querySelector('#vz-store-preview');if(!p||!box)return;box.querySelector('#vz-preview-title').textContent=p.name+' / Original VELORYZ design';box.querySelector('#vz-preview-frame').src=p.preview;box.querySelector('#vz-preview-newtab').href=p.preview;box.querySelector('#vz-preview-create').href='/create/?template='+encodeURIComponent(id);box.querySelector('.vz-preview-frame-wrap').classList.remove('mobile');box.querySelectorAll('[data-vz-preview-size]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.vzPreviewSize==='desktop')));box.hidden=false;document.body.classList.add('vz-store-modal-open');activeDialog='preview';box.querySelector('.vz-store-preview-panel').focus();}
function closePreview(){const el=document.querySelector('#vz-store-preview');if(!el)return;el.hidden=true;el.querySelector('#vz-preview-frame').removeAttribute('src');document.body.classList.remove('vz-store-modal-open');activeDialog=null;document.querySelector('[data-vz-quick]')?.focus({preventScroll:true});}
function add(id){if(!byId(id))return;if(!items.includes(id))items.push(id);persist();refreshCounters();updateGrid();openCart();}
document.addEventListener('click',event=>{
 if(!document.querySelector('#vz-template-store'))return;
 const el=event.target.closest('button,a');if(!el)return;
 if(el.hasAttribute('data-vz-add')){event.preventDefault();add(el.dataset.vzAdd);}
 else if(el.hasAttribute('data-vz-remove')){event.preventDefault();items=items.filter(id=>id!==el.dataset.vzRemove);persist();refreshCounters();document.querySelector('#vz-cart-body').innerHTML=cartBody();updateGrid();}
 else if(el.hasAttribute('data-vz-bag-open')){event.preventDefault();openCart();}
 else if(el.hasAttribute('data-vz-cart-close')){event.preventDefault();closeCart();}
 else if(el.hasAttribute('data-vz-quick')){event.preventDefault();preview(el.dataset.vzQuick);}
 else if(el.hasAttribute('data-vz-preview-close')){event.preventDefault();closePreview();}
 else if(el.hasAttribute('data-vz-preview-size')){event.preventDefault();const isMobile=el.dataset.vzPreviewSize==='mobile';document.querySelector('.vz-preview-frame-wrap').classList.toggle('mobile',isMobile);document.querySelectorAll('[data-vz-preview-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));}
 else if(el.hasAttribute('data-vz-filter')){event.preventDefault();category=el.dataset.vzFilter;document.querySelectorAll('[data-vz-filter]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',String(b===el))});updateGrid();}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-vz-search]')){query=e.target.value.trim().toLowerCase();updateGrid();}});
document.addEventListener('change',e=>{if(e.target.matches('[data-vz-sort]')){sort=e.target.value;updateGrid();}});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(document.querySelector('#vz-store-preview:not([hidden])'))closePreview();else if(document.querySelector('#vz-store-cart:not([hidden])'))closeCart();});
const openedPurchaseLinks=new Set();
function acceptPurchaseLink(){
 if(!document.querySelector('#vz-template-store'))return;
 const id=new URL(location.href).searchParams.get('buy');
 if(!id||!byId(id)||openedPurchaseLinks.has(id))return;
 openedPurchaseLinks.add(id);
 add(id); // Purchase request, never a payment: show exact item in bag.
}
document.addEventListener('studio:route',acceptPurchaseLink);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',acceptPurchaseLink,{once:true});
else queueMicrotask(acceptPurchaseLink);
window.VeloryzTemplateStore={render,products,preview,add,get items(){return [...items]}};
})();
