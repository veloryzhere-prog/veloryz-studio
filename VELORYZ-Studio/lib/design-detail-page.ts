/**
 * VELORYZ Studio source preview. The public viewer focuses on design and actions.
 * Legally required third-party credits are preserved under /legal/design-notices/
 * and in unmodified original source LICENSE/CREDITS files.
 */
import designs from '../public/veloryz-open-designs.json' with { type:'json' };
export type DesignPreviewRecord={
 id:string;name:string;category:string;description:string;source:string;author:string;license:string;rights:string;
 motion?:string;caution?:string;sourceType?:string;importStatus?:string;previewType?:string;
 originalTemplateId?:string;previewImage?:string;previewImageKind?:string;
 localSource?:string;liveDemo?:string;assetMode?:string;price?:number;image?:string;
};
const htmlMap:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>htmlMap[c]||c);
const httpsURL=(v:unknown)=>{try{const u=new URL(String(v));return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
const localPath=(p:DesignPreviewRecord)=>{
 if(p.sourceType==='original-veloryz'&&p.originalTemplateId&&/^[a-z0-9-]+$/.test(p.originalTemplateId))
  return '/template-previews/'+p.originalTemplateId+'.html';
 if(p.importStatus==='real-upstream-html'&&/^[a-z0-9-]+$/.test(p.id)&&p.localSource==='/design-source-previews/'+p.id+'/index.html')
  return p.localSource;
 return '';
};
export function findDesignPreview(id:string,cms:any[]=[]):DesignPreviewRecord|null{
 if(!/^[a-z0-9-]{2,100}$/.test(id))return null;
 const original=designs.originals.find(p=>p.id===id);
 if(original)return original;
 const imported=designs.items.find(p=>p.id===id);
 if(imported)return imported;
 const item=cms.find(p=>p?.id===id&&p.enabled!==false);
 if(!item)return null;
 return {
  id:item.id,name:item.name,category:item.category,description:item.description||'Studio design reference',
  source:item.source||'',author:item.author||'Original creator',license:item.license||'Independent terms',
  rights:'restricted',sourceType:'curated-inspiration',importStatus:'reference-only',
  previewImage:httpsURL(item.image)||'',previewImageKind:'published-reference-image',previewType:'reference-image'
 };
}
export function renderDesignPreview(design:DesignPreviewRecord):string{
 const title=escape(design.name),category=escape(design.category),description=escape(design.description);
 const local=localPath(design),image=httpsURL(design.previewImage||design.image);
 const original=design.sourceType==='original-veloryz';
 const create=design.originalTemplateId?'/create/?template='+encodeURIComponent(design.originalTemplateId):'/create/?reference='+encodeURIComponent(design.id);
 const running=Boolean(local);
 const frame={
  id:design.id,name:design.name,localSource:local,image,
  imageKind:design.previewImageKind||'',isOriginal:original,isRunnable:running
 };
 const payload=JSON.stringify(frame).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,follow"><meta name="theme-color" content="#18171a">'+
 '<title>'+title+' | VELORYZ Studio — Design Preview</title>'+
 '<meta name="description" content="Explore '+title+' in the VELORYZ Studio design library and create your own version.">'+
 '<link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/veloryz-design-preview.css?v=20261123-studio-v4">'+
 '<script id="vz-design-data" type="application/json">'+payload+'</script>'+
 '<script src="/veloryz-design-preview.js?v=20261123-studio-v4" defer></script></head>'+
 '<body><a class="vz-skip" href="#vz-design-main">Skip to the design</a><div class="vz-studio-detail" id="vz-design-main">'+
 '<header class="vz-studio-header"><a class="vz-studio-brand" href="/"><span class="vz-studio-logo">V.</span><span>VELORYZ <small>CREATIVE STUDIO</small></span></a>'+
 '<nav aria-label="Studio navigation"><a href="/design/">Design Library</a><a href="/studio/">Our Studio</a><a class="vz-studio-button" href="'+create+'">Create with VELORYZ <span>↗</span></a></nav></header>'+
 '<main><section class="vz-studio-intro"><div><span class="vz-studio-eyebrow"><i></i> VELORYZ DESIGN COLLECTION <span class="vz-studio-dot">/</span> '+category+'</span>'+
 '<h1>'+title+'</h1><p>'+description+'</p><div class="vz-studio-facts"><span>'+escape(running?'Interactive website':'Design showcase')+'</span><span>Desktop & mobile</span><span>Customized for your project</span></div></div>'+
 '<div class="vz-studio-intro-right"><a class="vz-studio-button" href="'+create+'">Create a project <span>↗</span></a><a class="vz-studio-anchor" href="#vz-preview">Explore the preview ↓</a></div></section>'+
 '<section class="vz-studio-showcase" id="vz-preview"><div class="vz-studio-toolbar"><div class="vz-studio-toolbar-name"><span class="vz-studio-live"></span><span>VELORYZ / INTERACTIVE PREVIEW</span></div>'+
 '<div class="vz-studio-toolbar-controls" role="group" aria-label="Preview screen size"><button type="button" data-vz-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-vz-device="tablet" aria-pressed="false">Tablet</button><button type="button" data-vz-device="mobile" aria-pressed="false">Mobile</button></div></div>'+
 '<div class="vz-studio-stage-wrap"><div class="vz-studio-stage" id="vz-stage" data-vz-device="desktop"><div class="vz-studio-browser"><span class="vz-studio-dots"><i></i><i></i><i></i></span><span>veloryz.online / design / '+escape(design.id)+'</span><span>V. STUDIO VIEW</span></div>'+
 '<div class="vz-studio-frame" id="vz-concept" aria-label="Website preview" aria-live="polite"><span class="vz-studio-loading">Opening your preview...</span></div>'+
 '<button type="button" class="vz-studio-watermark" id="vz-made-with" aria-haspopup="dialog" aria-controls="vz-studio-about"><strong>V.</strong><span>Made with <b>VELORYZ</b></span><span aria-hidden="true">↗</span></button></div></div>'+
 '<div class="vz-studio-viewer-footer"><span id="vz-preview-caption" role="status" aria-live="polite">Preview ready</span><div><button type="button" data-vz-reload>Refresh preview <span>↻</span></button>'+
 '<button type="button" data-vz-fullscreen>Fullscreen <span>⛶</span></button></div></div></section>'+
 '<section class="vz-studio-next"><div><span class="vz-studio-eyebrow">DESIGN IS ONLY THE BEGINNING</span><h2>Make this direction<br><em>your own.</em></h2><p>Plan your pages, interactions, content and integrations with VELORYZ. Every production project is reviewed and tailored to your needs.</p></div>'+
 '<div class="vz-studio-next-actions"><a class="vz-studio-button" href="'+create+'">Create with VELORYZ <span>↗</span></a><a href="/design/">Explore more designs</a></div></section></main>'+
 '<footer class="vz-studio-footer"><a href="/">VELORYZ STUDIO</a><span>Digital experiences, thoughtfully made.</span><a href="/legal/design-notices/">Legal acknowledgements</a></footer></div>'+
 '<dialog class="vz-studio-dialog" id="vz-studio-about" aria-labelledby="vz-studio-about-title"><div class="vz-studio-dialog-inner">'+
 '<button class="vz-studio-dialog-close" type="button" aria-label="Close studio information" data-vz-close>×</button>'+
 '<span class="vz-studio-dialog-symbol">V.</span><span class="vz-studio-eyebrow">A VELORYZ STUDIO EXPERIENCE</span>'+
 '<h2 id="vz-studio-about-title">Made with<br><em>VELORYZ.</em></h2>'+
 '<p>Discover original creative direction, interactive previews and tailored website development in one studio. This preview is presented by VELORYZ; individual templates may include independently authored open-source work.</p>'+
 '<div class="vz-studio-dialog-links"><a class="vz-studio-button" href="'+create+'">Create your own <span>↗</span></a><a href="/studio/">Explore VELORYZ Studio ↗</a></div>'+
 '</div></dialog></body></html>';
}
