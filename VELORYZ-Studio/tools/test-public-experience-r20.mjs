import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const repoRoot=new URL('../../',root);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');

const css=read('public/veloryz-experience-r20.css');
const js=read('public/veloryz-experience-r20.js');
const shellRaw=read('lib/claude-reference-shell.ts');
const shell=JSON.parse(shellRaw.slice(shellRaw.indexOf('export default ')+15).trim().replace(/;$/,''));
const security=read('lib/response-security.ts');
const app=read('public/app.js');
const creator=read('public/creator-v4.js');
const docs=read('public/docs-hub.js');
const market=read('public/veloryz-open-library.js');
const siteShell=read('lib/site-shell.ts');

assert(security.includes("experienceRelease='public-experience-20261123-r20'"),'R20 public release header marker missing');
assert(security.includes('/veloryz-experience-r20.css?v=20261123-r20')&&security.includes('/veloryz-experience-r20.js?v=20261123-r20'),'R20 public assets are not injected');
assert(security.includes("const silkUiAssets=!privatePage&&status===200"),'R20 must remain behind the existing public/private isolation boundary');

assert(js.includes("skip.textContent='Skip to main content'"),'Accessible skip link missing');
assert(js.includes("addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(syncScroll)"),'R20 scroll state must be passive/rAF throttled');
assert(js.includes("requestIdleCallback"),'High-intent route prefetch should stay idle-time only');
assert(!js.includes('new Lenis'),'R20 must reuse the existing Lenis runtime, never create another scroll engine');
assert(!js.includes('setInterval('),'R20 must not add permanent animation loops');
assert(js.includes("data-vz-r20-3d-more")&&js.includes("data-vz-r20-advanced"),'3D advanced-control disclosure missing');
assert(js.includes("vz-r20-assistant-route"),'Help/support route identity state missing');

assert(css.includes('.vz-r20-skip'),'Skip-link styling missing');
assert(css.includes('@media(max-width:720px)'),'Mobile R20 hardening missing');
assert(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced-motion R20 fallback missing');
assert(css.includes('overflow-x:clip')||css.includes('overflow-x:hidden'),'Public overflow hardening missing');
assert(css.includes('.docs-r20-start'),'Outcome-first documentation layout missing');
assert(css.includes('.v4-r20-roadmap'),'Creator roadmap styling missing');
assert(css.includes('.vz-r20-price-note'),'Marketplace pricing-context styling missing');

assert(shell.includes('class="vz-home-topbar"'),'Homepage top bar must expose high-signal desktop navigation');
for(const label of ['Work','Design','Services','Pricing','Docs','Contact'])assert(shell.includes('>'+label+'</a>'),'Homepage visible link missing: '+label);
assert(shell.includes('id="main-content"'),'Homepage main content target missing');
const createAt=shell.indexOf('vz-hero-cta-main" href="/create/"');
const workAt=shell.indexOf('vz-hero-cta-alt" href="#work"');
assert(createAt>=0&&workAt>createAt,'Create project must be the primary hero CTA');
assert(shell.includes('data-logo-source="official-glb"'),'Official homepage 3D V source must remain untouched');
assert(shell.includes('/assets/brand/veloryz-mark.svg'),'Official VELORYZ mark must remain present');

assert(app.includes("['/contact/','Contact']"),'Public SPA desktop navigation needs direct Contact access');
assert(app.includes("['/pricing/','Pricing']"),'Public SPA desktop navigation needs Pricing');
for(const group of ['Explore','Build with us','Help & knowledge','Policies & reference'])assert(app.includes("label:'"+group+"'"),'Simplified footer group missing: '+group);
assert(!app.includes("title:'The Studio, Aryan & Our Team"),'Public Studio title must remain team-first');

for(const stage of ['01 Discover','02 Inspiration','03 Capabilities','04 Investment','05 Send brief'])assert(creator.includes(stage),'Creator roadmap stage missing: '+stage);
assert(creator.includes('Your brief stays available for this browser session'),'Creator session persistence copy must remain truthful');

assert(docs.includes('Choose the outcome, not the entire library.'),'Docs outcome-first start layer missing');
for(const path of ['/docs/overview.html','/docs/pricing.html','/docs/client-portal.html','/docs/copyright.html'])assert(docs.includes(path),'Docs start path missing: '+path);

assert(market.includes('Motion level'),'Marketplace motion filter needs plain language');
assert(market.includes('Starting budget (INR)'),'Marketplace budget must identify INR');
assert(market.includes('Starting build estimates are shown in INR.'),'Marketplace currency context missing');
assert(market.includes('Source availability and usage context'),'Marketplace rights filter needs plain-language context');
assert(market.includes('Studio-reviewed source')&&market.includes('Source review needed')&&market.includes('Reference only'),'Marketplace source labels are incomplete');
assert(market.includes('STARTING VELORYZ BUILD ESTIMATES / INR'),'Marketplace result heading must identify INR');

assert(!siteShell.includes('"founder": {"@type": "Person"'),'Public Organization schema should stay studio-first rather than single-owner-first');

new Function(js);
console.log('PASS: R20 public experience improves navigation, conversion, docs, marketplace, creator onboarding, accessibility, mobile resilience and public/private isolation.');
