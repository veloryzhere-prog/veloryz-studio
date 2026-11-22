/* Release regression: UI adaptation must never remove original VELORYZ capabilities. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const decode=path=>{const raw=read(path);const start=raw.indexOf('export default ');assert(start>=0);return JSON.parse(raw.slice(start+15).trim().replace(/;$/,''));};
const ref=decode('lib/claude-reference-shell.ts');
const legacy=decode('lib/site-shell.ts');
const page=read('lib/page-handler.ts'),app=read('public/app.js');
const styles=read('public/reference-restored-features.css'),integrity=read('public/reference-public-integrity.css');
const features=read('public/reference-restored-features.js'),ai=read('public/reference-ai-dock.js');
const menuCSS=read('public/reference-shared-menu.css'),menuJS=read('public/reference-shared-menu.js');
for(const f of ['public/reference-restored-features.js','public/reference-ai-dock.js','public/reference-site-upgrade.js','public/reference-shared-menu.js','public/claude-reference-enhancements.js'])
 assert.doesNotThrow(()=>new vm.Script(read(f)),f+' must be valid JavaScript');
const inline=[...ref.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
assert.equal(inline.length,1,'Original self-contained reference animation must stay intact');
assert.doesNotThrow(()=>new vm.Script(inline[0]),'Original reference animation + library must parse');
for(const route of ['/create/','/client/','/docs/','/terms/','/cookies/','/privacy/','/book/','/support/'])
 assert(ref.includes('href="'+route+'"'),'Missing original functional link '+route);
assert(ref.includes('id="bigV"')&&ref.includes('data-logo-scene'),'Authentic 3D sculpture must appear on new homepage');
assert(ref.includes('/assets/brand/official/Main-Dark-Ink-Transparent.webp'),'Original official header wordmark must appear');
assert(ref.includes('/motion-3d.js'),'Existing WebGL logo renderer must be loaded; flat placeholder alone is not enough');
assert(ref.includes('/motion.js')&&ref.includes('/motion-system.css'),'Restore the exact existing motion preference engine');
assert(ref.includes('data-motion-control'),'Existing motion controls must be operable on homepage');
assert(ref.includes('/privacy-center.js')&&ref.includes('data-privacy-settings'),'Cookie and privacy preference UI must remain available');
assert(ref.includes('id="vz-reference-journey"')&&ref.includes('Good work takes shape.'),'Original sketch-to-build scroll motion must be restored');
for(const part of ['Sketch','Structure','Design','Build','Review'])assert(ref.includes(part),'Missing journey step '+part);
assert(ref.includes('id="vz-home-reviews-track"'),'Real reviews must be visible and auto-animated on homepage');
assert(features.includes("fetch('/api/reviews'"),'Real approved reviews must come from the canonical API');
assert(features.includes('An invitation, not a customer review'),'Empty reviews must never be fabricated');
assert(ref.includes('id="vz-restore-quick"')&&ref.includes('Quick create a project'),'Project quick actions must be restored to homepage');
assert(ref.includes('Request a consultation')&&ref.includes('href="/book/"'),'Booking and consultation must be restored');
assert(features.includes('vz-original-whatsapp')&&features.includes('whatsapp-float'),'Restore original bottom-right Let’s Talk button');
assert(styles.includes('bottom:calc(83px')&&styles.includes('.vz-ai-dock'),'Keep original AI launcher stacked above WhatsApp on right');
assert(ai.includes("fetch('/api/adviser'"),'Keep all five real AI services working');
assert(ai.includes('firstName:visitorFirstName')&&ai.includes('firstNamed:Boolean(visitorFirstName)'),'Original name-sensitive AI flow must survive');
for(const name of ['happy','nikhil','milky','ritik','aryan'])assert(ai.includes("id:'"+name+"'"),'Missing existing AI '+name);
assert(!ai.includes('madherchod'),'Removed AI must not be recreated');
assert(ref.includes('var LIB=(function()')&&ref.includes('LIB.length*104'),'Every published catalogue design must participate in scroll-driven deck');
assert(page.includes('documentation:Object.entries(studioDocsRoutes)'),'Expose full published docs index rather than only 10-16 links');
assert(features.includes('vz-complete-doc-groups')&&features.includes('live.documentation'),'Full documentation index must render from server routes');
assert(ref.includes('id="vz-complete-doc-index"'),'Place all documentation links at bottom of reference design');
assert(app.includes("if(url.origin===location.origin&&url.pathname==='/'&&!url.hash)"),'Clicking official wordmark must load the reference homepage, not legacy SPA');
assert(menuJS.includes('e.stopPropagation();root.classList.add('),'Shared menu must not allow legacy SPA navigation interception');
assert(!menuCSS.includes('#header.site-header{display:none!important}'),'Never hide original header motion, creator and original site controls');
assert(integrity.includes('.vz-ref-public-route')&&legacy.includes('/reference-public-integrity.css'),'Real public subpages share the editorial design');
assert(menuJS.includes("wrap.remove();return;"),'Do not change approved documentation design');
assert(features.includes('vz:reference-motion-change')&&ref.includes('vzTickScheduled'),'Motion settings must pause and resume the reference animation loop');
for(const f of ['public/reference-restored-features.css','public/reference-public-integrity.css']){
 const src=read(f);assert.equal(src.split('{').length,src.split('}').length,'CSS braces must balance in '+f);
}
console.log('PASS: original AI, official logo and 3D, WhatsApp, motion preferences, reviews, all docs, process motion, quick actions, real homepage navigation and consistent pages.');
