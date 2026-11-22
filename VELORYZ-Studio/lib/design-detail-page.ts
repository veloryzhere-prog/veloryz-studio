/**
 * VELORYZ source-based design preview:
 * - real upstream source HTML when locally staged and license-checked;
 * - otherwise an authentic upstream screenshot/repository cover;
 * - optional original public live demo inside a sandboxed iframe.
 *
 * Never reconstructs external designs with generated mockups.
 * "Made with VELORYZ" describes the explorer/customization service only.
 */
import designs from '../public/veloryz-open-designs.json' with { type:'json' };
export type DesignPreviewRecord={
 id:string; name:string; category:string; description:string; source:string;
 author:string; license:string; rights:string; motion?:string; caution?:string;
 sourceType?:string; importStatus?:string; previewType?:string;
 originalTemplateId?:string; previewImage?:string; previewImageKind?:string;
 localSource?:string; liveDemo?:string; assetMode?:string; price?:number;
 image?:string;
};
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as Record<string,string>)[ch]||ch);
const legalURL=(v:unknown)=>{
 try{const u=new URL(String(v));return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}
 catch{return ''}
};
const localSourcePath=(design:DesignPreviewRecord)=>{
 if(design.sourceType==='original-veloryz'&&design.originalTemplateId&&/^[a-z0-9-]+$/.test(design.originalTemplateId))
  return '/template-previews/'+design.originalTemplateId+'.html';
 if(design.importStatus==='real-upstream-html'&&/^[a-z0-9-]+$/.test(design.id)&&design.localSource==='/design-source-previews/'+design.id+'/index.html')
  return design.localSource;
 return '';
};
export function findDesignPreview(id:string,cms:any[]=[]):DesignPreviewRecord|null{
 if(!/^[a-z0-9-]{2,100}$/.test(id))return null;
 const original=designs.originals.find(p=>p.id===id);
 if(original)return original;
 const upstream=designs.items.find(p=>p.id===id);
 if(upstream)return upstream;
 const item=cms.find(p=>p?.id===id&&p.enabled!==false);
 if(!item)return null;
 return {
  id:item.id,name:item.name,category:item.category,description:item.description||'Published VELORYZ design reference',
  source:item.source||'',author:item.author||'Original independent creator',license:item.license||'Source terms require verification',
  rights:'restricted',sourceType:'curated-inspiration',importStatus:'reference-only',
  previewImage:legalURL(item.image)||'',previewImageKind:'published-reference-image',
  previewType:'reference-image'
 };
}
export function renderDesignPreview(design:DesignPreviewRecord):string{
 const name=escape(design.name),cat=escape(design.category);
 const source=legalURL(design.source),image=legalURL(design.previewImage||design.image),demo=legalURL(design.liveDemo);
 const local=localSourcePath(design);
 const create=design.originalTemplateId?'/create/?template='+encodeURIComponent(design.originalTemplateId):'/create/?reference='+encodeURIComponent(design.id);
 const hasSource=Boolean(local),hasDemo=Boolean(demo),hasImage=Boolean(image);
 const isOriginal=design.sourceType==='original-veloryz',isUpstream=design.importStatus==='real-upstream-html';
 const mode=isOriginal?'Original VELORYZ working source':isUpstream?'Actual upstream HTML, locally staged':hasDemo?'Original live demo available':'Upstream media / source reference';
 const imageLabel=design.previewImageKind==='github-repository-cover'?'GitHub repository cover — not a website screenshot':(hasImage?'Screenshot or media from the original source':'No website screenshot provided by this repository');
 const previewData={
  name:design.name,id:design.id,localSource:local,liveDemo:demo,
  image:image,imageLabel,mode,
  hasDemo,hasSource,isOriginal,isUpstream,assetMode:design.assetMode||''
 };
 const payload=JSON.stringify(previewData).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#141719">'+
 '<title>'+name+' | VELORYZ Original Source Explorer</title>'+
 '<meta name="description" content="Explore authentic upstream design media and real open-source website previews in the VELORYZ design explorer.">'+
 '<link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/veloryz-design-preview.css?v=20261123-real-v2">'+
 '<script id="vz-design-data" type="application/json">'+payload+'</script>'+
 '<script src="/veloryz-design-preview.js?v=20261123-real-v2" defer></script></head>'+
 '<body><a class="vz-skip" href="#design-main">Skip to the design</a><div class="vz-real-explorer" id="design-main">'+
 '<header class="vz-real-header"><a class="vz-real-wordmark" href="/design/"><span class="vz-real-monogram">V.</span><span>VELORYZ<small>STUDIO / OPEN SOURCE</small></span></a>'+
 '<nav aria-label="Design explorer"><a href="/design/">All designs</a><a class="vz-real-cta" href="'+create+'">Create with VELORYZ <span>↗</span></a></nav></header>'+
 '<section class="vz-real-intro"><div><span class="vz-real-kicker">VELORYZ / VERIFIED SOURCE EXPLORER / '+cat+'</span>'+
 '<h1>'+name+'</h1><p>'+escape(design.description)+'</p><div class="vz-real-tags"><span>'+escape(mode)+'</span>'+
 (isUpstream?'<span>Real source HTML — not a recreation</span>':'')+
 (hasImage?'<span>'+escape(imageLabel)+'</span>':'')+'</div></div>'+
 '<div class="vz-real-intro-actions"><a class="vz-real-cta" href="'+create+'">Use this design — Create with VELORYZ ↗</a>'+
 '<a href="#source-rights">Source & license information ↓</a></div></section>'+
 '<section class="vz-real-viewer" aria-label="Original website preview"><div class="vz-real-tools">'+
 '<div class="vz-real-tools-left"><i aria-hidden="true"></i><b>'+escape(mode)+'</b></div>'+
 '<div class="vz-real-tools-right" role="group" aria-label="Preview device size"><button data-vz-device="desktop" aria-pressed="true">Desktop</button><button data-vz-device="tablet" aria-pressed="false">Tablet</button><button data-vz-device="mobile" aria-pressed="false">Mobile</button></div></div>'+
 '<div class="vz-real-stage" id="vz-stage" data-vz-device="desktop"><div class="vz-real-browser"><span class="vz-real-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>veloryz.online/design/'+escape(design.id)+'</span><span>AUTHENTIC SOURCE</span></div>'+
 '<div class="vz-real-frame-content" id="vz-concept"><div class="vz-real-preview-loading">Loading original source preview…</div></div>'+
 '<div class="vz-real-watermark"><span>V.</span><strong>Made with VELORYZ</strong><small>Explorer · Source: '+escape(design.author)+'</small></div></div>'+
 '<div class="vz-real-bottom-tools"><p id="vz-preview-caption" aria-live="polite">'+escape(imageLabel)+'</p><div><button type="button" data-vz-show-image>Show source image</button>'+
 (hasDemo?'<button type="button" data-vz-launch-demo>Try original live demo</button>':'')+
 (hasSource?'<button type="button" data-vz-reload>Reload local source</button>':'')+'</div></div></section>'+
 '<section class="vz-real-info" id="source-rights"><div><span class="vz-real-kicker">THE ORIGINAL SOURCE / RIGHTS / PROVENANCE</span>'+
 '<h2>The real work.<br><em>Properly credited.</em></h2><p>VELORYZ provides the gallery, hosted preview wrapper and project-building service. The original designer retains all original authorship, code licensing rights and media credits. The mark is not a claim that VELORYZ created the underlying upstream website.</p>'+
 '<a class="vz-real-cta" href="'+create+'">Build a customized version with VELORYZ ↗</a></div>'+
 '<aside class="vz-real-provenance"><h3>Source details</h3><dl>'+
 '<dt>Design</dt><dd>'+name+'</dd><dt>Author</dt><dd>'+escape(design.author)+'</dd>'+
 '<dt>License statement</dt><dd>'+escape(design.license)+'</dd>'+
 '<dt>Repository status</dt><dd>'+escape(design.importStatus||'catalogued')+'</dd>'+
 '<dt>Asset handling</dt><dd>'+escape(design.assetMode||'Original assets remain with the source; verify separately')+'</dd>'+
 '<dt>Review classification</dt><dd>'+escape(design.rights)+'</dd></dl>'+
 '<p>Applications requiring accounts, databases, paid APIs or proprietary services are not presented as working static templates. These need a separately deployed and configured source build.</p>'+
 (source?'<a href="'+escape(source)+'" rel="noopener noreferrer" target="_blank">Original repository & license ↗</a>':'')+
 '</aside></section></div></body></html>';
}
