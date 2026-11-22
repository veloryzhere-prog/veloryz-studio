/* VELORYZ Studio design collection regression and security checks. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const file=path=>readFileSync(resolve(root,path),'utf8');
const includes=(src,fragment,reason)=>assert.ok(src.includes(fragment),reason||'Missing '+fragment);
const data=JSON.parse(file('public/veloryz-open-designs.json'));
const original=data.originals,external=data.items,all=[...original,...external];
assert.equal(external.length,110,'All 110 external designs must remain indexed');
assert.equal(original.length,12,'Keep the original twelve VELORYZ templates');
assert.equal(new Set(all.map(p=>p.id)).size,all.length,'Every design needs a unique URL');
assert.equal(new Set(external.map(p=>p.category)).size,16,'Keep all source categories');
for(const item of all){
 assert.match(item.id,/^[a-z0-9-]{2,100}$/,'Invalid studio design URL');
 assert.ok(item.name&&item.description&&item.category&&item.license&&item.author,'Metadata incomplete: '+item.id);
 assert.ok(['original','candidate','review','restricted'].includes(item.rights),'Invalid rights metadata');
 assert.ok(['original','catalogued','real-upstream-html'].includes(item.importStatus),'Invalid code import state');
 if(item.importStatus==='real-upstream-html'){
  const dir='public/design-source-previews/'+item.id+'/';
  assert.equal(item.localSource,'/design-source-previews/'+item.id+'/index.html');
  assert.ok(existsSync(resolve(root,dir+'index.html')),'Missing original website HTML');
  assert.ok(existsSync(resolve(root,dir+'LICENSE')),'MIT source license must be retained');
  assert.ok(existsSync(resolve(root,dir+'README.md')),'Original README must be retained');
  const html=file(dir+'index.html');
  assert.match(html,/<html\b/i);
  assert.ok(html.length>5000,'Do not replace original project with a generated placeholder');
  if(item.assetMode==='upstream-hosted-assets'){
   assert.ok(!/<base\s+href=["']https?:\/\//i.test(html),'Original menu hashes must not redirect to external site');
   includes(html,'/studio-preview-assets/'+item.id+'/','Relative CSS/JS/images must use local asset gateway');
  }
 }
}
const imported=external.filter(p=>p.importStatus==='real-upstream-html');
assert.equal(imported.length,11,'Eleven real imported HTML sites must stay accessible');
assert.ok(external.filter(p=>p.previewImageKind==='upstream-screenshot').length>=20,'Keep original design screenshots');
const gallery=file('public/veloryz-open-library.js');
const galleryCss=file('public/veloryz-open-library.css');
const viewer=file('lib/design-detail-page.ts');
const viewerClient=file('public/veloryz-design-preview.js');
const viewerCss=file('public/veloryz-design-preview.css');
const notices=file('lib/design-notices-page.ts');
const assets=file('lib/design-asset-proxy.ts');
const images=file('lib/design-image-proxy.ts');
const home=file('public/reference-site-upgrade.js');
const homeAdapter=file('public/claude-reference-enhancements.js');
const shell=file('lib/claude-reference-shell.ts');
const handler=file('lib/page-handler.ts');
const creator=file('public/creator-v4.js');

includes(gallery,'const cms=[];','Old CMS inspirations must not appear in refreshed main library');
includes(gallery,"'/design/'+encodeURIComponent(p.id)+'/'",'All cards must remain on VELORYZ paths');
includes(gallery,'window.designPage=renderWithMotion','Initialize gallery after route render');
includes(gallery,'requestAnimationFrame(()=>requestAnimationFrame','Defer entry animation after DOM insertion');
includes(gallery,'IntersectionObserver','Smooth on-scroll card reveals');
includes(gallery,"'/studio-preview-images/'+encodeURIComponent(p.id)",'Studio design cards use same-origin images');
includes(gallery,'Create with VELORYZ','Creator handoff preserved');
assert.ok(!gallery.includes('Original source: '),'No prominent source-credit lines in the card UI');
assert.ok(!gallery.includes('Licensing review ('),'No technical licensing filters in main UX');
includes(galleryCss,'.vz-real-library .vz-source-card{opacity:1;transform:none}', 'Accessible visible fallback');
includes(galleryCss,'prefers-reduced-motion','Accessible reduced motion');

includes(viewer,'id="vz-made-with"','Clickable VELORYZ watermark');
includes(viewer,'<dialog class="vz-studio-dialog"','Studio information panel');
includes(viewer,'/legal/design-notices/','Keep required acknowledgements separately available');
includes(viewer,'const local=localPath(design)','Actual local source HTML only');
assert.ok(!viewer.includes('Try original live demo'),'Remove external live demo button');
assert.ok(!viewer.includes('Source details</h3>'),'Remove prominent source panel');
assert.ok(!viewer.includes('Original repository & license ↗'),'Do not show raw GitHub link in main preview');
includes(viewerClient,'design.localSource','Load imported source, not fabricated UI');
includes(viewerClient,"setAttribute('sandbox','allow-scripts allow-forms allow-modals allow-pointer-lock')",'Interactive but isolated browser iframe');
assert.ok(!/setAttribute\(['"]sandbox['"],[^)]*allow-same-origin/.test(viewerClient),'Do not give third-party scripts same-origin privileges');
includes(viewerClient,"dialog.showModal()",'Watermark opens usable brand dialog');
includes(viewerClient,"requestFullscreen",'Native full-screen website preview');
assert.ok(!viewerClient.includes('function dashboard('),'No AI-generated synthetic dashboards');
includes(viewerCss,'prefers-reduced-motion','Reduced-motion viewer support');

includes(notices,'catalog.items','Notices page must keep all indexed creator information');
includes(notices,'LICENSE','Original MIT license linked, not deleted');
includes(assets,'raw.githubusercontent.com','Allowlisted original CSS/JS/media source');
includes(assets,'const sources:Record<string,Source>','No open proxy for arbitrary addresses');
includes(assets,"if(!src||",'Deny unlisted directories');
includes(images,'hostAllowed','Image gateway must use explicit host safelist');
includes(images,'image/svg+xml','Original README SVG previews supported');
includes(handler,'const assetResponse=await serveDesignAsset(request)','Proxy route must run before page catch-all');
includes(handler,'const designImage=await serveDesignImage(request)','Source images must work on same origin');
includes(handler,"path==='/legal/design-notices'",'Legal notices route must open');
includes(handler,"'os-portfolio-and-agencies-8b-creative-agency'",'Homepage shows actual imported designs');
assert.ok(!handler.includes('catalogue:(published.state.catalogue||[]).filter'),'Legacy CMS cards must not remain homepage showcase');
includes(home,'item.fallbackImage','Homepage image fallback when proxy provider is unreachable');
includes(home,'window.VeloryzReferenceGallery','Preserve the original homepage scroll clock');
includes(homeAdapter,'vz-lib-live-image','Homepage design story slides show actual website images');
includes(shell,'VELORYZ STUDIO / THE DESIGN COLLECTION','Studio branding updated in homepage');
includes(creator,'Explore studio preview','Creator has same design previews');
for(const path of ['public/veloryz-open-library.js','public/veloryz-design-preview.js','public/creator-v4.js','public/reference-site-upgrade.js','public/claude-reference-enhancements.js']){
 assert.doesNotThrow(()=>new Function(file(path)),'Invalid public JS in '+path);
}
console.log('PASS: authentic 122-entry VELORYZ collection, old designs hidden, 11 original source HTML sites, first-party media/asset routing, studio attribution dialog, accessible motion and legal notices.');
