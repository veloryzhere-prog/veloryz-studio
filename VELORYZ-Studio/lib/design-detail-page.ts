/**
 * Branded VELORYZ preview shell for catalogue records.
 * These previews are original studio concept demonstrations; upstream repository
 * code/assets are NOT mounted or represented as VELORYZ-authored work.
 */
import openDesigns from '../public/veloryz-open-designs.json' with { type: 'json' };

export type DesignPreviewRecord={
 id:string;name:string;category:string;description:string;source:string;
 author:string;license:string;rights:string;motion?:string;caution?:string;
 sourceType?:string;importStatus?:string;previewType?:string;originalTemplateId?:string;price?:number;
};

const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]||c));

export function findDesignPreview(id:string,cms:any[]=[]):DesignPreviewRecord|null{
 if(!/^[a-z0-9-]{2,100}$/.test(id))return null;
 const firstParty=openDesigns.originals.find(p=>p.id===id);
 if(firstParty)return firstParty;
 const open=openDesigns.items.find(p=>p.id===id);
 if(open)return open;
 const curated=cms.find(p=>p?.id===id&&p.enabled!==false);
 if(!curated)return null;
 return {
  id:curated.id,name:curated.name,category:curated.category,
  description:curated.description||'Explore a VELORYZ project concept.',
  source:curated.source||'',author:curated.author||'External designer',
  license:curated.license||'Independent work; rights verification required',
  rights:'restricted',sourceType:'curated-inspiration',importStatus:'reference-only',
  previewType:'veloryz-original-concept'
 };
}
export function renderDesignPreview(design:DesignPreviewRecord):string{
 const record=JSON.stringify(design).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 const title=escape(design.name),category=escape(design.category);
 const createUrl=design.originalTemplateId?'/create/?template='+encodeURIComponent(design.originalTemplateId):'/create/?reference='+encodeURIComponent(design.id);
 const desc=escape(design.description).slice(0,320);
 return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width, initial-scale=1">'+
 '<meta name="theme-color" content="#101419">'+
 '<meta name="robots" content="noindex, nofollow">'+
 '<title>'+title+' — Create with VELORYZ Studio</title>'+
 '<meta name="description" content="Preview '+title+' as an original VELORYZ studio concept. Create a tailored project with rights-conscious source attribution.">'+
 '<link rel="icon" href="/assets/favicon.svg">'+
 '<link rel="stylesheet" href="/veloryz-design-preview.css?v=20261123-1">'+
 '<script id="vz-design-data" type="application/json">'+record+'</script>'+
 '<script src="/veloryz-design-preview.js?v=20261123-1" defer></script></head>'+
 '<body><a class="vz-skip" href="#vz-preview-main">Skip to the design</a>'+
 '<div class="vz-shell" id="vz-preview-main">'+
 '<header class="vz-head"><a class="vz-logo" href="/" aria-label="VELORYZ Studio home"><span class="vz-mark">V</span><span>VELORYZ<span class="vz-logo-sub">STUDIO / CREATE</span></span></a>'+
 '<nav aria-label="Preview navigation"><a href="/design/">All designs</a><a href="/create/?reference='+encodeURIComponent(design.id)+'" class="vz-nav-create">Create with VELORYZ ↗</a></nav></header>'+
 '<div class="vz-summary"><div><span class="vz-eyebrow">VELORYZ / DESIGN EXPLORER / '+category+'</span>'+
 '<h1>'+title+'</h1><p>'+desc+'</p><div class="vz-pills"><span>Original VELORYZ concept preview</span><span>Responsive study</span><span>Source credit retained</span></div></div>'+
 '<div class="vz-summary-action"><a class="vz-btn" href="/create/?reference='+encodeURIComponent(design.id)+'">Create with VELORYZ <span aria-hidden="true">↗</span></a><a class="vz-text-link" href="#vz-provenance">Licensing & source details ↓</a></div></div>'+
 '<section class="vz-workspace" aria-label="Interactive website concept preview"><div class="vz-tools"><div class="vz-tools-title"><span class="vz-live-dot"></span> LOCAL STUDIO PREVIEW <small>/ conceptual interface, not the upstream website</small></div>'+
 '<div class="vz-device-switch" role="group" aria-label="Preview width"><button type="button" data-vz-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-vz-device="tablet" aria-pressed="false">Tablet</button><button type="button" data-vz-device="mobile" aria-pressed="false">Mobile</button></div></div>'+
 '<div class="vz-stage-shell"><div class="vz-stage" id="vz-stage" data-vz-device="desktop"><div class="vz-stage-mast"><div class="vz-stage-dots"><i></i><i></i><i></i></div><span>veloryz.online / design / '+escape(design.id)+'</span><span>STUDIO CONCEPT</span></div>'+
 '<div id="vz-concept" aria-live="polite"><div class="vz-loading">Preparing your VELORYZ concept preview...</div></div><div class="vz-watermark"><span class="vz-watermark-v">V</span><span>Made with <b>VELORYZ</b></span></div></div></div></section>'+
 '<section class="vz-bottom"><div class="vz-bottom-main"><span class="vz-eyebrow">FROM REFERENCE TO YOUR OWN PRODUCT</span><h2>Make a concept<br><em>entirely yours.</em></h2><p>Browse the studio’s original interactive direction, choose the pages and features that matter, and share a detailed project brief. Code, integrations and commercial licensing are reviewed before delivery.</p><a class="vz-btn" href="/create/?reference='+encodeURIComponent(design.id)+'">Start your project ↗</a></div>'+
 '<aside class="vz-rights" id="vz-provenance"><h3>Source & rights</h3>'+
 '<dl><dt>Design idea</dt><dd>'+title+'</dd><dt>Original source author</dt><dd>'+escape(design.author)+'</dd><dt>Upstream license / terms</dt><dd>'+escape(design.license)+'</dd><dt>Catalogue status</dt><dd>'+escape(design.rights==='original'?'Original VELORYZ source template; one end-product license':design.rights==='candidate'?'Candidate for licensed adaptation; assets not cleared':design.rights==='restricted'?'Reference only / separate permission required':'Independent review required')+'</dd></dl>'+
 '<p>The interactive preview above is VELORYZ-created demonstration UI. It is not a white-labelled copy of the linked repository or its original assets. VELORYZ branding identifies this showcase and customization service, not ownership of third-party work.</p>'+
 (String(design.source).startsWith('https://')?'<a href="'+escape(design.source)+'" target="_blank" rel="noopener noreferrer">View original credited source ↗</a>':'')+
 '</aside></section></div><div class="vz-toast" id="vz-toast" role="status" aria-live="polite"></div></body></html>';
}
