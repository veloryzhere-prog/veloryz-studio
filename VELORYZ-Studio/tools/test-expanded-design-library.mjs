/* Source fidelity, rights, security and navigation regression suite. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

const base=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(base,p),'utf8');
const data=JSON.parse(read('public/veloryz-open-designs.json'));
const original=data.originals,sources=data.items,all=[...original,...sources];
const contain=(hay,needle,label)=>assert.ok(hay.includes(needle),label||'Missing '+needle);
assert.equal(sources.length,110,'Research list must retain all 110 GitHub/external resources');
assert.equal(original.length,12,'Original Studio templates must remain available');
assert.equal(new Set(sources.map(x=>x.category)).size,16,'Retain all researched niche categories');
assert.equal(new Set(all.map(x=>x.id)).size,all.length,'Unique internal URLs for every source');
for(const p of all){
 assert.match(p.id,/^[a-z0-9-]{2,100}$/,'Invalid /design/:slug ID');
 assert.ok(p.name&&p.category&&p.author&&p.license&&p.description,'Missing provenance metadata '+p.id);
 assert.ok(['original','candidate','review','restricted'].includes(p.rights),'Unknown rights state '+p.id);
 assert.ok(['original','catalogued','real-upstream-html'].includes(p.importStatus),'Unknown import state '+p.id);
 if(p.source)assert.match(p.source,/^https:\/\//);
 if(p.rights==='restricted')assert.notEqual(p.importStatus,'real-upstream-html','Restricted sources must never be imported as owned/clear code');
 if(p.importStatus==='real-upstream-html'){
  const path='public/design-source-previews/'+p.id+'/index.html';
  assert.equal(p.localSource,'/design-source-previews/'+p.id+'/index.html','Local source route must match ID');
  assert.ok(existsSync(resolve(base,path)),'Missing genuine upstream HTML: '+path);
  assert.ok(existsSync(resolve(base,'public/design-source-previews/'+p.id+'/LICENSE')),'Missing upstream license: '+p.id);
  const html=read(path);
  assert.match(html,/<html\b/i,'Upstream template must include real HTML');
  assert.ok(html.length>5000,'A dummy HTML placeholder is not an upstream implementation: '+p.id);
  assert.ok(p.previewImage,'Genuine imported template must have a source-supplied preview image '+p.id);
 }
}
assert.ok(sources.filter(p=>p.importStatus==='real-upstream-html').length>=11,'Eleven upstream sites must be staged');
assert.ok(sources.filter(p=>p.previewImageKind==='upstream-screenshot').length>=20,'Authentic screenshots must be used');
assert.ok(sources.filter(p=>p.liveDemo).length>=20,'Official upstream live demos must be discoverable');
assert.ok(sources.filter(p=>p.previewImage).length>=105,'Repository-supplied graphics/covers need broad coverage');
const gallery=read('public/veloryz-open-library.js');
const detailJS=read('public/veloryz-design-preview.js');
const detailTS=read('lib/design-detail-page.ts');
const handler=read('lib/page-handler.ts');
const shell=read('lib/site-shell.ts');
const creator=read('public/creator-v4.js');
const galleryCSS=read('public/veloryz-open-library.css');
const previewCSS=read('public/veloryz-design-preview.css');
contain(gallery,'window.designPage=render','Keep SPA design route registration');
contain(gallery,"'/design/'+encodeURIComponent(p.id)+'/'",'Internal detail pages, not outbound gallery clicks');
contain(gallery,'p.previewImage','Show upstream images, not generated mockups');
contain(gallery,'previewImageKind','Disclose real screenshot vs GitHub repository cover');
contain(gallery,'IntersectionObserver','Motion-rich scrolling must be viewport-aware');
contain(gallery,'showcase','Keep homepage design showcases working');
contain(detailJS,'entry.localSource','Source viewer must load authentic locally staged source');
contain(detailJS,"setAttribute('sandbox','allow-scripts allow-forms')",'Keep imported code in an opaque-origin sandbox');
assert.ok(!detailJS.includes('allow-same-origin'),'Avoid untrusted source code accessing VELORYZ origin');
assert.ok(!detailJS.includes('function marketing('),'No generic AI-made marketing templates');
assert.ok(!detailJS.includes('function dashboard('),'No generic AI-made dashboard templates');
contain(detailTS,'Original website','Original source metadata must be shown');
contain(detailTS,'Made with VELORYZ','Show VELORYZ preview service watermark');
contain(detailTS,'localSourcePath','Local source must be gated by a server-side allowlist');
contain(handler,'const designMatch=path.match','Direct /design/:slug route required');
contain(handler,'renderDesignPreview(design)','Serve real-source detail HTML');
contain(handler,'serialise([...openDesigns.originals,...openDesigns.items])','Hydrate complete library before SPA');
contain(shell,'/veloryz-open-library.js','Load real design gallery assets');
contain(creator,'v4-veloryz-realshot','Project creator must show actual upstream screenshots');
contain(creator,'window.createPage=creatorPage','Creator SPA handler stays registered');
contain(galleryCSS,'prefers-reduced-motion','Respect accessibility in gallery animation');
contain(previewCSS,'prefers-reduced-motion','Respect reduced motion in source preview');
for(const f of ['public/veloryz-open-library.js','public/veloryz-design-preview.js','public/creator-v4.js']){
 try{new Function(read(f))}catch(e){throw Error('Browser JS syntax invalid '+f+': '+e.message)}
}
console.log('PASS: authentic GitHub source library: 110 source entries, 12 originals, 11 local source websites, 20+ real screenshots, 20+ official demos, same-origin routes, sandbox isolation, credits and scroll motion.');
