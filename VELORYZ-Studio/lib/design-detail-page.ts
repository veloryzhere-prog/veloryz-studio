/**
 * VELORYZ Studio product-detail + immersive real-site preview.
 * The preview wrapper, price and custom work are Studio services;
 * original third-party source retains upstream authorship and licenses.
 * All source notices remain reachable at /legal/design-notices/.
 */
import catalog from '../public/veloryz-open-designs.json' with {type:'json'};
export type DesignPreviewRecord={
 id:string;name:string;category:string;description:string;source:string;author:string;license:string;rights:string;
 price?:number;currency?:string;priceModel?:string;studioDeliverable?:string;studioLicense?:string;
 motion?:string;caution?:string;sourceType?:string;importStatus?:string;previewType?:string;
 originalTemplateId?:string;previewImage?:string;previewImageKind?:string;
 localSource?:string;liveDemo?:string;assetMode?:string;image?:string;enabled?:boolean;
};
const map:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>map[c]||c);
const https=(v:unknown)=>{try{const u=new URL(String(v));return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
const money=(n:number)=>'₹'+Math.round(n).toLocaleString('en-IN');
const sourcePath=(design:DesignPreviewRecord)=>{
 if(design.importStatus==='real-upstream-html'&&/^[a-z0-9-]+$/.test(design.id)&&
  design.localSource==='/design-source-previews/'+design.id+'/index.html')
  return design.localSource;
 return '';
};
const publicImage=(design:DesignPreviewRecord)=>{
 const publisher=https(design.previewImage||design.image);
 return {image:publisher?'/studio-preview-images/'+design.id:'',fallbackImage:publisher};
};
const head=(name:string,description:string,mode:'detail'|'immersive')=>
 '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,follow"><meta name="theme-color" content="#17151a">'+
 '<title>'+esc(name)+' — '+(mode==='immersive'?'Immersive Live Preview':'Website Design')+' | VELORYZ Studio</title>'+
 '<meta name="description" content="'+esc(description)+'">'+
 '<link rel="icon" href="/assets/favicon.svg">'+
 '<link rel="stylesheet" href="/veloryz-design-preview.css?v=20261126-layout-repair">'+
 // Apply UI 2026 polish to the VELORYZ-owned detail wrapper, never the
 // third-party interactive website or the immersive preview iframe.
 (mode==='detail'?'<meta name="veloryz-ui-release" content="silk-ui-20261123-r5">'+
  '<link rel="stylesheet" href="/veloryz-ui-2026.css?v=20261123-route-r5">'+
  '<link rel="stylesheet" href="/veloryz-silk-2026.css?v=20261123-route-r5">'+
  '<script src="/veloryz-silk-2026.js?v=20261123-route-r5" defer></script>'+ 
  '<link rel="stylesheet" href="/reference-elegance-r5.css?v=20261123-editorial-r5">':'')+
 '<script src="/veloryz-design-preview.js?v=20261126-layout-repair" defer></script></head>';
const brand=()=>'<a class="vz-market-brand" href="/" aria-label="VELORYZ Studio home"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" width="128" height="46" alt="VELORYZ Studio" decoding="async"><span class="vz-market-brand-text">VELORYZ<small>CREATIVE & TECHNOLOGY STUDIO</small></span></a>';
const projectUrl=(p:DesignPreviewRecord)=>'/create/?reference='+encodeURIComponent(p.id)+'&estimate='+Math.round(p.price||6000);
const info=(p:DesignPreviewRecord)=>({
 id:p.id,name:p.name,localSource:sourcePath(p),...publicImage(p),isRunnable:Boolean(sourcePath(p)),
 fullPreviewUrl:'/design/'+p.id+'/preview/',price:p.price||6000,
 demo:https(p.liveDemo),previewKind:p.previewImageKind||'',mode:p.importStatus==='real-upstream-html'?'interactive':'visual'
});
const dataScript=(p:DesignPreviewRecord,mode:string)=>{
 const json=JSON.stringify({...info(p),mode}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return '<script id="vz-design-data" type="application/json">'+json+'</script>';
};
const headings:Record<string,string>={
 'Template Collections':'Ready for a stronger first impression.',
 'Ecommerce & B2B':'Built around better buying journeys.',
 'Grocery & Delivery':'A more memorable way to order.',
 'Logistics & Transport':'Move your brand forward.',
 'Project Management':'Clarity for complex workflows.',
 'SaaS & Dashboards':'Turn useful software into a great experience.',
 'Portfolio & Agency':'Let the work speak.',
 'Editorial & Publishing':'Stories worth spending time with.',
 'Education & Learning':'Make learning feel effortless.',
 'Travel & Hospitality':'An invitation to explore.',
 'Real Estate':'Give every property its own presence.',
 'Jobs & Hiring':'Great opportunities, thoughtfully presented.',
 'Community & Nonprofit':'A place for people to connect.',
 'Healthcare & Forms':'Useful experiences built on trust.',
 'Motion & Components':'Interaction with intention.',
 'Inspiration Only':'A direction worth discovering.'
};
const catalogue=catalog.items as DesignPreviewRecord[];
export function findDesignPreview(id:string,_cms:any[]=[]):DesignPreviewRecord|null{
 if(!/^[a-z0-9-]{2,100}$/.test(id))return null;
 const design=catalogue.find(p=>p.id===id&&p.enabled!==false);
 return design||null; // Retired originals and the old CMS gallery are not published.
}
function card(p:DesignPreviewRecord){
 const image=publicImage(p);
 const preview='/design/'+p.id+'/';
 return '<a class="vz-market-related-card" href="'+preview+'">'+
 (image.image?'<img src="'+esc(image.image)+'" alt="'+esc(p.name)+' preview" loading="lazy" decoding="async" data-fallback-src="'+esc(image.fallbackImage)+'">':'<span class="vz-market-noart">VELORYZ / DESIGN</span>')+
 '<span class="vz-market-related-meta"><span>'+esc(p.category)+'</span><b>From '+money(p.price||6000)+'</b></span>'+
 '<strong>'+esc(p.name)+'</strong><span class="vz-market-related-arrow" aria-hidden="true">↗</span></a>';
}
function modal(p:DesignPreviewRecord){
 return '<dialog id="vz-studio-about" class="vz-market-dialog" aria-labelledby="vz-studio-about-title">'+
 '<button class="vz-market-close" type="button" data-vz-close aria-label="Close Studio information">×</button>'+
 '<span class="vz-market-dialog-mark">V.</span><span class="vz-market-eyebrow">THE VELORYZ STUDIO EXPERIENCE</span>'+
 '<h2 id="vz-studio-about-title">Previewed with VELORYZ.</h2>'+
 '<p>Discover, preview and customize a digital experience with the VELORYZ team. The preview controls and project service are provided by VELORYZ. Some design source may be independently authored and is subject to its own terms.</p>'+
 '<div class="vz-market-dialog-actions"><a class="vz-market-btn" href="'+projectUrl(p)+'">Start your project ↗</a><a href="/studio/">About VELORYZ Studio ↗</a></div>'+
 '</dialog>';
}
function deviceControls(){
 return '<div class="vz-market-devices" role="group" aria-label="Choose preview device">'+
 '<button type="button" data-vz-device="desktop" aria-pressed="true" title="Desktop preview">▤ <span>Desktop</span></button>'+
 '<button type="button" data-vz-device="tablet" aria-pressed="false" title="Tablet preview">▥ <span>Tablet</span></button>'+
 '<button type="button" data-vz-device="mobile" aria-pressed="false" title="Mobile preview">▯ <span>Mobile</span></button></div>';
}
function previewStage(p:DesignPreviewRecord,immersive=false){
 return '<div class="vz-market-device-shell" id="vz-stage" data-vz-device="desktop">'+
 '<div class="vz-market-browser"><div class="vz-market-dots" aria-hidden="true"><i></i><i></i><i></i></div>'+
 '<span class="vz-market-browser-address">veloryz.online / design / '+esc(p.id)+'</span><span>VELORYZ VIEW</span></div>'+
 '<div class="vz-market-display" id="vz-concept" aria-label="Actual design preview" aria-live="polite"><div class="vz-market-loading">Opening the experience…</div></div>'+
 '<button id="vz-made-with" class="vz-market-watermark" type="button" aria-haspopup="dialog" aria-controls="vz-studio-about" title="About the VELORYZ preview experience">'+
 '<strong>V.</strong><span>Preview by <b>VELORYZ</b></span><span aria-hidden="true">↗</span></button>'+
 '</div>';
}
export function renderDesignPreview(p:DesignPreviewRecord):string{
 const image=publicImage(p),price=money(p.price||6000),url='/design/'+p.id+'/preview/';
 const related=catalogue.filter(x=>x.enabled!==false&&x.id!==p.id).sort((a,b)=>Number(b.category===p.category)-Number(a.category===p.category)||a.name.localeCompare(b.name)).slice(0,3);
 const isLive=Boolean(sourcePath(p));
 const slug=esc(p.id),name=esc(p.name);
 const imageHTML=image.image?'<img class="vz-market-cover" src="'+esc(image.image)+'" data-fallback-src="'+esc(image.fallbackImage)+'" alt="Original visual reference for '+name+'" decoding="async">':'<div class="vz-market-cover-none">VELORYZ / '+name+'</div>';
 const title=head(p.name,p.description,'detail');
 return title+'<body class="vz-market-body"><a class="vz-market-skip" href="#main">Skip to main content</a><div class="vz-market-site">'+
 '<header class="vz-market-nav">'+brand()+'<nav aria-label="Primary navigation"><a href="/design/">All designs</a><a href="/studio/">Studio</a><a class="vz-market-nav-cta" href="'+projectUrl(p)+'">Start a project ↗</a></nav></header>'+
 '<main id="main"><div class="vz-market-breadcrumb"><a href="/design/">Design Collection</a><span>/</span><span>'+esc(p.category)+'</span><span>/</span><strong>'+name+'</strong></div>'+
 '<section class="vz-market-project-hero"><div class="vz-market-project-lead"><span class="vz-market-eyebrow"><i></i> VELORYZ STUDIO / CURATED EXPERIENCE · '+esc(p.category)+'</span>'+
 '<h1>'+name+'</h1><p>'+esc(p.description)+'</p>'+
 '<div class="vz-market-hero-tags"><span>'+esc(isLive?'Interactive original-site preview':'Visual design reference')+'</span><span>Customizable with VELORYZ</span><span>Responsive project scope</span></div>'+
 '<div class="vz-market-hero-actions"><a class="vz-market-btn" href="'+url+'">View full-site preview <span>↗</span></a><a class="vz-market-textbtn" href="#vz-market-overview">Project overview ↓</a></div></div>'+
 '<aside class="vz-market-pricebox" aria-label="Starting project pricing"><span>STARTING FROM</span><div>'+price+'<small>INR</small></div><p>Estimated starting price for a VELORYZ Studio customization project.</p>'+
 '<a class="vz-market-btn" href="'+projectUrl(p)+'">Customize this design ↗</a><span class="vz-market-price-note">No payment taken here · Final scope & rights confirmed before agreement</span></aside></section>'+
 '<section class="vz-market-hero-image">'+imageHTML+'<a href="'+url+'" class="vz-market-image-play"><span>↗</span> Open immersive preview</a>'+
 '<div class="vz-market-image-credit"><span>VELORYZ DESIGN COLLECTION</span><span>PROJECT '+slug.toUpperCase()+'</span></div></section>'+
 '<section class="vz-market-editorial" id="vz-market-overview"><div class="vz-market-editorial-head"><span class="vz-market-eyebrow">01 / THE CONCEPT</span><h2>'+esc(headings[p.category]||'Build something distinctive.')+'</h2></div>'+
 '<div class="vz-market-editorial-copy"><p>'+esc(p.description)+' This design is part of a collection of real digital references selected by VELORYZ for custom website and interface projects.</p>'+
 '<div class="vz-market-specs"><div><span>Discipline</span><strong>'+esc(p.category)+'</strong></div><div><span>Experience</span><strong>'+esc(isLive?'Live interactive website':'Visual design exploration')+'</strong></div><div><span>Studio starting estimate</span><strong>'+price+'</strong></div><div><span>Delivery</span><strong>Scoped with the VELORYZ team</strong></div></div></div></section>'+
 '<section class="vz-market-preview-section" id="vz-preview"><div class="vz-market-section-heading"><div><span class="vz-market-eyebrow">02 / EXPLORE THE EXPERIENCE</span><h2>A closer look.<br><em>Every interaction.</em></h2></div><a href="'+url+'" class="vz-market-outline-btn">Launch full website preview <span>↗</span></a></div>'+
 '<div class="vz-market-toolbar"><span class="vz-market-toolbar-title"><i></i> PREVIEW / VELORYZ</span>'+deviceControls()+
 '<a href="'+url+'" class="vz-market-preview-launch">View site in immersive mode ↗</a></div>'+
 '<div class="vz-market-stage-wrap">'+previewStage(p)+'</div>'+
 '<div class="vz-market-preview-foot"><span id="vz-preview-caption">Scroll inside the preview, or launch the full experience.</span><div><button type="button" data-vz-reload>Reload ↻</button><a href="'+url+'">Full page ↗</a></div></div></section>'+
 '<section class="vz-market-services"><span class="vz-market-eyebrow">03 / MAKE IT YOURS</span><div class="vz-market-services-grid"><h2>Designed for your idea.<br><em>Built by our studio.</em></h2>'+
 '<div><p>Start with this direction and work with VELORYZ on the structure, content, motion, responsiveness and integrations that matter for your project.</p>'+
 '<div class="vz-market-include"><span>01 — Discovery and scope</span><span>02 — Visual customization</span><span>03 — Responsive implementation</span><span>04 — Performance and interaction review</span><span>05 — Deployment and handoff planning</span></div>'+
 '<a class="vz-market-btn" href="'+projectUrl(p)+'">Discuss this project <span>↗</span></a></div></div></section>'+
 '<section class="vz-market-related"><div class="vz-market-related-head"><div><span class="vz-market-eyebrow">04 / KEEP DISCOVERING</span><h2>More to explore.</h2></div><a href="/design/">View entire collection ↗</a></div>'+
 '<div class="vz-market-related-grid">'+related.map(card).join('')+'</div></section>'+
 '</main><footer class="vz-market-footer">'+brand()+'<span>Independent creative & technology studio.</span><div><a href="/design/">Design Collection</a><a href="/legal/design-notices/">Legal notices</a></div></footer></div>'+
 dataScript(p,'detail')+modal(p)+'</body></html>';
}
export function renderDesignFullPreview(p:DesignPreviewRecord):string{
 const price=money(p.price||6000),back='/design/'+p.id+'/',name=esc(p.name);
 return head(p.name,'Explore the complete website within the VELORYZ Studio preview viewer.','immersive')+
 '<body class="vz-market-body vz-market-immersive"><a class="vz-market-skip" href="#vz-concept">Skip to design preview</a>'+
 '<div class="vz-market-immersive-app"><header class="vz-market-immersive-head">'+
 brand()+'<div class="vz-market-immersive-title"><span>PREVIEWING</span><strong>'+name+'</strong></div>'+
 '<nav><a href="'+back+'">← Project details</a><a class="vz-market-preview-start" href="'+projectUrl(p)+'">From '+price+' · Create with VELORYZ ↗</a></nav></header>'+
 '<div class="vz-market-immersive-tools"><div class="vz-market-immersive-left"><span class="vz-market-live-dot"></span><span>DESIGN PREVIEW</span><span class="vz-market-preview-scroll-label">Interactive or visual reference</span></div>'+
 deviceControls()+'<div class="vz-market-actions"><button data-vz-restart type="button" title="Back to top">↑ Top</button><button data-vz-reload type="button" title="Reload website">↻ Reload</button>'+
 '<button data-vz-fullscreen type="button" title="Fullscreen preview">⛶ Expand</button></div></div>'+
 '<main class="vz-market-immersive-canvas" id="vz-immersive-canvas">'+previewStage(p,true)+'</main>'+
 '<footer class="vz-market-immersive-bottom"><span id="vz-preview-caption">Checking preview availability…</span><div class="vz-market-progress" aria-label="Website scroll progress"><span id="vz-progress-fill"></span></div><span id="vz-progress-text">0%</span><a href="'+back+'">Close preview ✕</a></footer></div>'+
 dataScript(p,'immersive')+modal(p)+'</body></html>';
}
