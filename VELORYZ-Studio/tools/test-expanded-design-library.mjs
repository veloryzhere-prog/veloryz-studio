/* Regression: the current VELORYZ Studio library contains 110 priced source designs,
   no outdated original mockup products, full-site scroll motion and a safe iframe. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=f=>readFileSync(resolve(root,f),'utf8');
const has=(s,q,reason)=>assert.ok(s.includes(q),reason||'Missing: '+q);

const collection=JSON.parse(read('public/veloryz-open-designs.json'));
const retired=JSON.parse(read('public/veloryz-retired-original-templates.json'));
const items=collection.items;
assert.equal(items.length,110,'Retain all 110 researched source design records');
assert.equal(collection.originals.length,0,'Remove outdated studio originals from public collection');
assert.equal(retired.items.length,12,'Archive old in-house data for existing purchases and maintenance');
assert.equal(retired.publiclyListed,false);
assert.equal(new Set(items.map(x=>x.id)).size,110);
assert.equal(new Set(items.map(x=>x.category)).size,16);
assert.equal(Math.min(...items.map(x=>x.price)),6000,'Starting service estimate must reach INR 6,000');
assert.equal(Math.max(...items.map(x=>x.price)),50000,'Premium service estimate must reach INR 50,000');
assert.ok(new Set(items.map(x=>x.price)).size>=20,'Designs need individualized pricing');
for(const item of items){
 assert.match(item.id,/^[a-z0-9-]{2,100}$/,'Safe local slug');
 assert.ok(item.name&&item.category&&item.description&&item.author&&item.license,'Preserve provenance');
 assert.ok(Number.isSafeInteger(item.price)&&item.price>=6000&&item.price<=50000,'Invalid INR quote '+item.id);
 assert.equal(item.currency,'INR');
 assert.equal(item.priceModel,'starting_customization_quote','Prices are VELORYZ services, not upstream source relicensing');
 assert.ok(item.studioLicense.includes('upstream code'),'Third-party licensing must be preserved');
 assert.ok(['candidate','review','restricted'].includes(item.rights));
 assert.ok(['catalogued','real-upstream-html'].includes(item.importStatus));
 if(item.importStatus==='real-upstream-html'){
  const dir='public/design-source-previews/'+item.id+'/';
  assert.equal(item.localSource,'/design-source-previews/'+item.id+'/index.html');
  assert.ok(existsSync(resolve(root,dir+'LICENSE')),'Required original license: '+item.id);
  assert.ok(existsSync(resolve(root,dir+'README.md')),'Required README '+item.id);
  const html=read(dir+'index.html');
  assert.match(html,/<html\b/i);
  assert.ok(html.length>5000,'No empty placeholder instead of real source HTML');
  has(html,'/veloryz-preview-motion-bridge.js','The real site must report scroll position: '+item.id);
  if(item.assetMode==='upstream-hosted-assets'){
   assert.ok(!/<base\s+href=["']https?:\/\//i.test(html),'Internal hashes must stay local');
   has(html,'/studio-preview-assets/'+item.id+'/','Assets must have a same-origin preview path');
  }
 }
}
assert.equal(items.filter(x=>x.importStatus==='real-upstream-html').length,11);
assert.ok(items.filter(x=>x.previewImageKind==='upstream-screenshot').length>=20);
const gallery=read('public/veloryz-open-library.js');
const galleryCss=read('public/veloryz-open-library.css');
const detail=read('lib/design-detail-page.ts');
const preview=read('public/veloryz-design-preview.js');
const bridge=read('public/veloryz-preview-motion-bridge.js');
const previewCss=read('public/veloryz-design-preview.css');
const server=read('lib/page-handler.ts');
const creator=read('public/creator-v4.js');
const notices=read('lib/design-notices-page.ts');
const assetProxy=read('lib/design-asset-proxy.ts');
const imageProxy=read('lib/design-image-proxy.ts');
const home=read('public/reference-site-upgrade.js');
const shell=read('lib/claude-reference-shell.ts');

has(gallery,'window.designPage=renderWithMotion','SPA gallery remains registered');
has(gallery,"'/design/'+encodeURIComponent(p.id)+'/'",'Source product detail routes stay same origin');
has(gallery,'function entries()','Public gallery has an explicit public source resolver');
has(gallery,"item.sourceType!=='original-veloryz'",'Old studio originals are not rendered');
has(gallery,'STUDIO SERVICE FROM','Gallery shows real service starting estimates');
has(gallery,'STUDIO SERVICE FROM','All cards show INR pricing');
has(gallery,'price-asc','Price ascending sort');
has(gallery,'price-desc','Price descending sort');
has(gallery,"path(p)+'preview/",'Every design has VELORYZ full preview link');
has(gallery,'IntersectionObserver','Genuine motion-rich scrolling gallery');
has(galleryCss,'prefers-reduced-motion','Respect reduced-motion');
has(galleryCss,'.vz-source-price','Studio pricing visual design');

has(detail,'export function renderDesignPreview','Project detail server renderer');
has(detail,'export function renderDesignFullPreview','Dedicated full-site preview server renderer');
has(detail,'/assets/brand/official/Main-Transparent.webp','Use original studio logo asset');
has(detail,'vz-market-pricebox','Price card on every detail');
has(detail,'vz-market-related-grid','Real related projects');
has(detail,"'/design/'+p.id+'/preview/'",'Same-domain live preview');
has(detail,'id="vz-made-with"','Interactive watermark');
has(detail,'/legal/design-notices/','Legal notices remain accessible');
assert.ok(!detail.includes('Try original live demo'));
assert.ok(!detail.includes('Original repository & license ↗'));
assert.ok(!detail.includes('const original=designs.originals.find'),'Retired originals must not remain routable');
has(detail,'findDesignPreview','Direct route lookup remains static and reliable');
has(detail,"isRunnable:Boolean(sourcePath(p))",'Do not claim an actual site exists for screenshot-only entries');

has(preview,"setAttribute('sandbox','allow-scripts allow-forms allow-modals allow-pointer-lock')",'Opaque-origin real-site isolation');
assert.ok(!/setAttribute\(['"]sandbox['"],[^)]*allow-same-origin/.test(preview),'Do not permit third-party code access to Studio origin');
has(preview,"event.source!==frame.contentWindow",'Verify postMessage comes from current preview frame');
has(preview,"msg.id!==id",'Reject foreign preview identifiers');
has(preview,"type:'veloryz:preview-command'",'Forward scroll to real iframe document');
has(preview,"command('wheel',event.deltaY)",'Scrolling over viewer overlay scrolls actual site');
has(preview,"requestFullscreen",'Full-screen controls');
has(preview,"dlg?.showModal",'Made with Studio modal');
has(preview,"updateProgress(percent)",'Full-page motion progress');
has(bridge,"window.parent.postMessage",'Return real site position to parent');
has(bridge,"event.source!==window.parent",'Motion bridge only accepts parent commands');
has(bridge,"window.scrollTo({top:0",'Real site restart');
has(previewCss,'body.vz-market-immersive{overflow:hidden','Outer preview page must not scroll');
has(previewCss,'.vz-market-immersive-canvas','Dedicated viewport for original site');
has(previewCss,'iframe{width:100%;height:100%','Full original website scroll area');
has(previewCss,'prefers-reduced-motion','Motion accessibility');

has(server,'renderDesignFullPreview','The preview route is server-rendered');
has(server,"const previewMatch=path.match",'Direct full-site preview URLs must work after refresh');
has(server,'serialise(openDesigns.items.filter','Inject only current design collection, excluding retired 12');
has(server,"const staticDesign=findDesignPreview",'Direct details independent of CMS');
has(server,'item.price,enabled:true','Homepage design previews carry a real price');
has(server,"path==='/legal/design-notices'",'Open-source rights are still discoverable');
has(notices,'catalog.items','Attribution index');
has(notices,'LICENSE','Original software license access preserved');
has(assetProxy,'raw.githubusercontent.com','No generic arbitrary URL proxy');
has(imageProxy,'hostAllowed','Media fetch uses allowlist');
has(home,'window.VeloryzReferenceGallery','Original homepage scroll clock unaffected');
has(shell,'VELORYZ STUDIO / THE DESIGN COLLECTION','Homepage collection remains integrated');
has(creator,'minBudget=()=>data.external?6000:20000','Creator supports INR 6,000 source customization');
has(creator,'Studio service from','Creator displays price');
has(creator,'selectedReference&&data.external','Avoid reset loops in template selection');
const quickActions=read('public/project-quick-actions.js');
const quickActionsCss=read('public/project-quick-actions.css');
const headerCss=read('public/reference-header-interactions.css');
const referenceShell=read('lib/claude-reference-shell.ts');
const appShell=read('lib/site-shell.ts');
has(quickActions,"(?:admin|client|create|design|designs)",'Quick project panels excluded from Create and both Design routes');
assert.ok(!quickActions.includes("'/design/','/designs/'"),'Do not inject inline shortcuts into the Design library');
has(quickActions,"document.querySelector('#vz-quick-actions-inline')?.remove?.()", 'Remove obsolete shortcuts when SPA enters an excluded page');
has(quickActions,"document.querySelector('#vz-quick-actions-footer')?.remove?.()", 'Remove footer shortcuts when SPA enters an excluded page');
has(headerCss,'.pg[data-p="design"].act','Show no Quick Create header button on active hash-routed design page');
has(headerCss,'.vz-header-create','Scope rule to the redundant header control, not normal per-design CTAs');
has(referenceShell,'reference-header-interactions.css?v=20261123-router-quick-create-v3','Bust previous header CSS cache');
has(referenceShell,'reference-restored-features.js?v=20261123-router-quick-create-v3','Bust previous footer quick-create script cache');
has(appShell,'project-quick-actions.js?v=20261123-quick-cta-visibility-v2','Bust previous Quick Actions JS cache');
has(quickActionsCss,'.vz-quick-actions--footer','Keep the Quick Actions presentation available for unaffected routes');

for(const name of ['public/veloryz-open-library.js','public/veloryz-design-preview.js','public/veloryz-preview-motion-bridge.js','public/creator-v4.js','public/reference-site-upgrade.js']){
 assert.doesNotThrow(()=>new Function(read(name)),'Invalid browser JS '+name);
}
console.log('PASS: 110 individually priced VELORYZ customization references (INR 6000–50000), 12 outdated originals archived, 11 working upstream HTML previews, true iframe scroll motion and controls, original brand, responsive details and license safety.');
