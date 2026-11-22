/* VELORYZ source-aware internal design explorer.
   All gallery/preview clicks stay on VELORYZ; upstream credits live in details.
   This catalogue does not install or claim ownership of upstream repositories. */
(function(){
'use strict';
const previous=window.VeloryzExternalDesignLibrary||{};
const legacyEntries=typeof previous.entries==='function'?previous.entries.bind(previous):()=>[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let open=Array.isArray(window.VELORYZ_OPEN_DESIGNS)?window.VELORYZ_OPEN_DESIGNS:[],
category='All',status='All',term='',sort='featured',page=1;
const PAGE_SIZE=24;
let loading=false;
function categoryFor(c){
 const v=String(c||'').toLowerCase();
 if(/grocery|delivery|food/.test(v))return 'Grocery & Delivery';
 if(/restaurant|hotel|travel|hospitality|tourism/.test(v))return 'Travel & Hospitality';
 if(/logistic|courier|transport/.test(v))return 'Logistics & Transport';
 if(/fashion|shopify|furniture|ecommerce|home|commerce|marketplace|product/.test(v))return 'Ecommerce & B2B';
 if(/project management|task|kanban/.test(v))return 'Project Management';
 if(/saas|fintech|dashboard/.test(v))return 'SaaS & Dashboards';
 if(/agency|portfolio|creative/.test(v))return 'Portfolio & Agency';
 if(/education|learning/.test(v))return 'Education & Learning';
 if(/editorial|publish|magazine/.test(v))return 'Editorial & Publishing';
 if(/community|social|membership/.test(v))return 'Community & Nonprofit';
 if(/gaming/.test(v))return 'Gaming & Entertainment';
 if(/motion|interactive/.test(v))return 'Motion & Components';
 return 'Independent Inspiration';
}
function entries(){
 const cms=legacyEntries().filter(p=>p&&p.enabled!==false).map(p=>({
  ...p,category:categoryFor(p.category),originalCategory:p.category,
  rights:'restricted',importStatus:'reference-only',
  sourceType:'curated-inspiration',previewType:'veloryz-original-concept',
  demo:'/design/'+encodeURIComponent(p.id)+'/',
  license:p.license||'External source; independent rights check required'
 }));
 const unique=new Map();
 for(const item of [...open,...cms]){if(item&&item.id&&!unique.has(item.id)){const p={...item,demo:local(item)};unique.set(p.id,p)}}
 return [...unique.values()];
}
const local=p=>'/design/'+encodeURIComponent(p.id)+'/';
const imageClass=p=>{let a=0;for(const c of p.id)a=(a*31+c.charCodeAt(0))%360;return a};
function badge(p){
 if(p.rights==='candidate')return ['Source candidate','candidate'];
 if(p.rights==='restricted')return ['Reference only','restricted'];
 return ['Needs license review','review'];
}
function card(p,i){
 const [state,kind]=badge(p),hue=imageClass(p);
 const isCode=/^https:\/\/github\.com\//i.test(p.source||'');
 const motion=/high|3d|very/i.test(p.motion||'');
 const detail=p.description||'Original design concept and custom project direction.';
 return '<article class="vz-open-card" style="--os-hue:'+hue+'" data-kind="'+esc(kind)+'">'+
 '<a class="vz-open-art" href="'+local(p)+'" aria-label="Preview '+esc(p.name)+' inside VELORYZ">'+
 '<span class="vz-open-art-top"><span>V / STUDIO PREVIEW</span><span>↗</span></span>'+
 '<span class="vz-open-art-symbol" aria-hidden="true"><i></i><b></b><em></em></span>'+
 '<span class="vz-open-art-word">'+esc(p.name)+'</span>'+
 '<span class="vz-open-art-bottom">MADE WITH VELORYZ · CONCEPT VIEW</span></a>'+
 '<div class="vz-open-info"><div class="vz-open-tags"><span class="vz-open-kind '+kind+'">'+esc(state)+'</span>'+(motion?'<span class="vz-open-motion">Motion-rich</span>':'')+'</div>'+
 '<div class="vz-open-meta">'+esc(p.category)+'</div>'+
 '<h3><a href="'+local(p)+'">'+esc(p.name)+'</a></h3><p>'+esc(detail)+'</p>'+
 '<div class="vz-open-credit">Source: '+esc(p.author||'Independent creator')+(isCode?' · GitHub':' · External')+'</div>'+
 '<div class="vz-open-actions"><a href="'+local(p)+'">Open VELORYZ preview ↗</a><a href="/create/?reference='+encodeURIComponent(p.id)+'">Create with VELORYZ +</a></div></div></article>';
}
function counts(all){return{
 total:all.length,candidate:all.filter(p=>p.rights==='candidate').length,
 review:all.filter(p=>p.rights==='review').length,restricted:all.filter(p=>p.rights==='restricted').length
}}
function render(){
 const all=entries(),c=counts(all),categories=['All',...new Set(all.map(p=>p.category))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b));
 const rows=filtered(all),limit=page*PAGE_SIZE,visible=rows.slice(0,limit);
 return '<section class="vz-open-library container" id="vz-open-library">'+
 '<header class="vz-open-hero"><div><div class="vz-open-eyebrow">VELORYZ / THE COMPLETE DESIGN LIBRARY / 2026</div>'+
 '<h1>Find your next<br><em>big beginning.</em></h1>'+
 '<p>Discover original VELORYZ concepts, independently developed templates, open-source project references and motion systems. Every preview opens here inside VELORYZ—not on somebody else’s website.</p>'+
 '<div class="vz-open-hero-buttons"><a href="#vz-open-collection">Explore all designs ↗</a><a href="/create/">Create your project +</a></div>'+
 '<div class="vz-open-hero-foot"><span><b>'+all.length+'</b> design sources</span><span><b>'+c.candidate+'</b> permissive-license candidates</span><span><b>16+</b> specialist categories</span></div></div>'+
 '<div class="vz-open-feature-art" aria-label="VELORYZ original illustrated design collection"><div class="vz-open-window window-a"><span>V / PORTFOLIO</span><strong>Design in motion.</strong><div class="vz-open-window-art"></div><small>CREATIVE / ORIGINAL CONCEPT</small></div><div class="vz-open-window window-b"><span>V / COMMERCE</span><strong>Objects with character.</strong><div class="vz-open-window-circle"></div><small>SHOP / ORIGINAL CONCEPT</small></div><div class="vz-open-feature-watermark">CREATED WITH VELORYZ</div></div></header>'+
 '<div class="vz-open-bar"><span>CURATED, CODE-READY & CONCEPTUAL DESIGNS</span><span>STUDIO ARCHIVE / VOL. 01 — 2026</span></div>'+
 '<section id="vz-open-collection" class="vz-open-catalogue">'+
 '<div class="vz-open-section-head"><div><span class="vz-open-eyebrow">PICK A DIRECTION / THE COLLECTION</span><h2>Different ideas.<br><em>One creative home.</em></h2></div><p>Choose an industry, inspect the VELORYZ-built concept dashboard, then use Create with VELORYZ to plan your own production website or app.</p></div>'+
 '<div class="vz-open-toolbar"><label class="vz-open-search"><span class="sr-only">Search the design library</span><input id="vz-open-search" data-open-search type="search" autocomplete="off" placeholder="Search niches, templates, tools..." value="'+esc(term)+'"></label>'+
 '<label class="vz-open-select"><span>Category</span><select data-open-category>'+categories.map(x=>'<option value="'+esc(x)+'"'+(x===category?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>'+
 '<label class="vz-open-select"><span>Sort</span><select data-open-sort><option value="featured"'+(sort==='featured'?' selected':'')+'>Featured</option><option value="name"'+(sort==='name'?' selected':'')+'>Name A–Z</option><option value="motion"'+(sort==='motion'?' selected':'')+'>Motion-rich first</option></select></label></div>'+
 '<div class="vz-open-status" aria-label="Source rights filter">'+[
 ['All','All ('+c.total+')'],['candidate','Source candidates ('+c.candidate+')'],['review','License review ('+c.review+')'],['restricted','Reference only ('+c.restricted+')']
 ].map(([value,label])=>'<button type="button" data-open-status="'+value+'" aria-pressed="'+(status===value)+'">'+label+'</button>').join('')+'</div>'+
 '<div class="vz-open-result-bar"><span id="vz-open-count" aria-live="polite">'+rows.length+' matching design sources</span><span>LOCAL VELORYZ PREVIEWS / ORIGINAL SOURCE CREDIT RETAINED</span></div>'+
 '<div class="vz-open-grid" id="vz-open-grid">'+visible.map(card).join('')+'</div>'+
 (visible.length<rows.length?'<div class="vz-open-more"><button type="button" data-open-more>Show more designs ('+(rows.length-visible.length)+' remaining) ↓</button></div>':'')+
 (!rows.length?'<div class="vz-open-empty">No designs match. Clear your search or choose another category.</div>':'')+
 '<p class="vz-open-disclaimer">Source entries are a research catalogue, not a promise that upstream repositories are installed or commercially redistributable. Branded previews are original VELORYZ demonstrations. Upstream creators, software licenses and asset rights are credited in each design’s details.</p>'+
 '</section></section>';
}
function filtered(all){
 let result=all.filter(p=>(category==='All'||p.category===category)&&
  (status==='All'||p.rights===status)&&
  (!term||[p.name,p.category,p.description,p.author,p.license].join(' ').toLowerCase().includes(term)));
 if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sort==='motion')result.sort((a,b)=>(/very high|high/i.test(b.motion||'')?1:0)-(/very high|high/i.test(a.motion||'')?1:0));
 else result.sort((a,b)=>Number(b.rights==='candidate')-Number(a.rights==='candidate'));
 return result;
}
function syncResults(){
 const root=document.querySelector('#vz-open-library');if(!root)return;
 const all=entries(),list=filtered(all),visible=list.slice(0,page*PAGE_SIZE),grid=root.querySelector('#vz-open-grid');
 if(grid)grid.innerHTML=visible.map(card).join('');
 const counter=root.querySelector('#vz-open-count');if(counter)counter.textContent=list.length+' matching design sources';
 let more=root.querySelector('.vz-open-more');
 if(visible.length<list.length){if(!more){more=document.createElement('div');more.className='vz-open-more';more.innerHTML='<button type="button" data-open-more></button>';grid.after(more)}more.querySelector('button').textContent='Show more designs ('+(list.length-visible.length)+' remaining) ↓';}
 else more?.remove();
 const empty=root.querySelector('.vz-open-empty');if(empty)empty.hidden=list.length!==0;
}
function refreshIfPresent(){
 const root=document.getElementById('vz-open-library');if(!root)return;
 root.outerHTML=render();
}
function syncOpenSource(){
 if(open.length||loading)return;loading=true;
 fetch('/veloryz-open-designs.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Catalogue unavailable');return r.json()})
 .then(data=>{if(!Array.isArray(data.items))throw Error('Invalid catalogue');open=data.items;window.VELORYZ_OPEN_DESIGNS=open;refreshIfPresent();document.dispatchEvent(new CustomEvent('veloryz:open-designs-ready'));})
 .catch(()=>{/* Keep published CMS references visible while static catalogue is unavailable. */}).finally(()=>{loading=false});
}
document.addEventListener('click',function(e){
 const b=e.target.closest('[data-open-status],[data-open-more]');
 if(!b||!b.closest('#vz-open-library'))return;
 e.preventDefault();
 if(b.dataset.openStatus!==undefined){status=b.dataset.openStatus;page=1;document.querySelectorAll('[data-open-status]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));syncResults();}
 if(b.hasAttribute('data-open-more')){page++;syncResults();}
});
document.addEventListener('input',function(e){if(e.target.matches('[data-open-search]')){term=e.target.value.trim().toLowerCase();page=1;syncResults();}});
document.addEventListener('change',function(e){
 if(e.target.matches('[data-open-category]')){category=e.target.value;page=1;syncResults();}
 if(e.target.matches('[data-open-sort]')){sort=e.target.value;page=1;syncResults();}
});
function showcase(){
 const cms=entries().filter(p=>p.sourceType==='curated-inspiration').slice(0,3);
 const picks=cms.length>=3?cms:entries().filter(p=>p.rights==='candidate').slice(0,3);
 return '<div class="vz-home-featured">'+picks.map((p,i)=>
  '<article><a href="'+local(p)+'"><div class="vz-os-feature-cover" style="--os-hue:'+imageClass(p)+'"><span>VELORYZ / CONCEPT '+(i+1)+'</span><strong>'+esc(p.name)+'</strong><small>VIEW ON VELORYZ ↗</small></div><div><span>0'+(i+1)+' / '+esc(p.category)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><strong>Open VELORYZ preview ↗</strong></div></a><a class="vz-home-create-link" href="/create/?reference='+encodeURIComponent(p.id)+'">Create with VELORYZ ↗</a></article>'
 ).join('')+'</div><p class="vz-ext-credit">VELORYZ original concept views of third-party design directions · Source credits on detail pages.</p>';
}
window.designPage=render;
window.VeloryzOpenDesigns={entries,render,get total(){return entries().length}};
window.VeloryzExternalDesignLibrary={...previous,render,entries,showcase};
if(window.VeloryzTemplateStore)window.VeloryzTemplateStore.render=render;
if(!open.length)syncOpenSource();
})();
