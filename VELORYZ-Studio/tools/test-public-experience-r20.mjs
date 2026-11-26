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
const knowledge=read('public/knowledge-v4.js');
const knowledgeCss=read('public/knowledge-v4.css');
const market=read('public/veloryz-open-library.js');
const siteShell=read('lib/site-shell.ts');
const creatorCss=read('public/creator-v4.css');

assert(security.includes("experienceRelease='public-experience-20261124-r29'"),'R20 public release header marker missing');
assert(security.includes('/veloryz-experience-r20.css?v=20261124-r29')&&security.includes('/veloryz-experience-r20.js?v=20261126-r42'),'R20 public assets are not injected');
assert(security.includes("const silkUiAssets=!privatePage&&status===200"),'R20 must remain behind the existing public/private isolation boundary');

assert(js.includes("skip.textContent='Skip to main content'"),'Accessible skip link missing');
assert(js.includes("addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(syncScroll)"),'R20 scroll state must be passive/rAF throttled');
assert(js.includes("requestIdleCallback"),'High-intent route prefetch should stay idle-time only');
assert(!js.includes('new Lenis'),'R20 must reuse the existing Lenis runtime, never create another scroll engine');
assert(!js.includes('setInterval('),'R20 must not add permanent animation loops');
assert(js.includes("data-vz-r20-3d-more")&&js.includes("data-vz-r20-advanced"),'3D advanced-control disclosure missing');
assert(js.includes("const advanced=['continue','left','right','front']"),'R20.2 must keep the four useful 3D controls visible and tuck secondary controls away');
assert(js.includes('vz-r20-assistant-actions'),'Help/support shortcut navigation missing');
assert(js.includes("metricKey='vz:r21:experience'")&&js.includes("'veloryz:experience-metric'"),'R21 privacy-safe local experience measurement missing');
assert(js.includes("emitMetric('scroll_depth'")&&js.includes("vz-r22-depth-50"),'R22 scroll-depth refinement signal missing');
assert(js.includes("aria-current','location'")&&js.includes('initHomeSectionNav'),'R22 homepage section-aware navigation missing');
assert(js.includes("emitMetric('journey_click'")&&js.includes("emitMetric('route_view'"),'R21 funnel/route instrumentation missing');
assert(js.includes("metric:'LCP'")&&js.includes("metric:'CLS'")&&js.includes("metric:'INP'"),'R21 Core Web Vitals observation missing');
assert(js.includes("connection?.saveData")&&js.includes("effectiveType"),'R21 prefetch must respect data-saver/slow connections');
assert(js.includes("className='vz-r21-status'")&&js.includes("setAttribute('aria-live','polite')"),'R21 route announcer missing');
assert(css.includes('::view-transition-old(root)')&&css.includes('::view-transition-new(root)'),'R20.2 route transition polish missing');
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'R20.2 mobile 3D control grid missing');
assert(css.includes('@media(prefers-contrast:more)')&&css.includes('@media(forced-colors:active)'),'R21 high-contrast accessibility hardening missing');
assert(css.includes('scrollbar-gutter:stable'),'R21 layout-shift stability hint missing');
assert(css.includes('/* R22 / premium visual refinement */')&&css.includes('.vz-reference-site #load{transition-duration:.82s!important}'),'R22 premium motion refinement missing');
assert(css.includes('/* R23 / performance and interaction hardening */')&&css.includes('content-visibility:auto'),'R23 deferred card rendering missing');
assert(css.includes('font-size:16px!important')&&css.includes('::view-transition-old(root),'),'R23 mobile form/reduced-motion hardening missing');
assert(js.includes('const prefetchHref=href=>')&&js.includes("document.addEventListener('pointerover'")&&js.includes("document.addEventListener('focusin'"),'R23 intent prefetch missing');
assert(js.includes('const syncChoiceStates=()=>')&&js.includes("'aria-pressed'"),'R24 Creator accessible selected-state sync missing');
assert(js.includes("event.key==='/'")&&js.includes("'Search focused'")&&js.includes("event.key==='Escape'"),'R24 Docs/Design search keyboard shortcut missing');
assert(css.includes('/* R24 / interaction-state and finish polish */')&&css.includes('text-wrap:balance')&&css.includes('scale(.985)'),'R24 tactile/typographic finish layer missing');
assert(css.includes('/* R25 / product-finish layer */')&&css.includes('vz-r25-route-pending')&&css.includes('vz-r25-reveal'),'R25 product-finish CSS missing');
assert(js.includes('const beginRoutePending=anchor=>')&&js.includes('const initSectionReveals=()=>')&&js.includes('const syncMenuState=()=>'),'R25 route/reveal/menu polish missing');
assert(css.includes('/* R26 / spatial editorial system')&&css.includes('@supports (animation-timeline:view())')&&css.includes('@keyframes vz26-v-drift'),'R26 native scroll-driven spatial system missing');
assert(js.includes('const initR26SpatialSystem=()=>')&&js.includes('vz-r26-fast-scroll')&&js.includes('vz-r26-section-index'),'R26 editorial indexing/velocity context missing');
assert(css.includes('/* R27 / cinematic chapter composition */')&&css.includes('.vz-r27-chapter-rail')&&css.includes('@keyframes vz27-deck-cinema'),'R27 cinematic composition CSS missing');
assert(js.includes('const initR27Chapters=()=>')&&js.includes('vz-r27-chapter-rail')&&js.includes('vzR27Chapters'),'R27 chapter navigation missing');
assert(css.includes('/* R29 / public layout containment and collision hardening */')&&css.includes('overflow-x:clip!important'),'R29 public layout stabilization missing');
assert(creatorCss.includes('/* R29 / responsive layout stabilization')&&creatorCss.includes('@media(min-width:1381px)'),'R29 Creator responsive stabilization missing');
assert(siteShell.includes('/creator-v4.js?v=20261126-r42')&&siteShell.includes('/creator-v4.css?v=20261126-v2-workspaces'),'R29 Creator cache identity missing');
assert(app.includes('Dream boldly.<br>Build with purpose.')&&!app.includes('Study Smarter.<br>Build Better.'),'R22 footer brand copy refinement missing');

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
assert(app.includes("title:'Help Centre — VELORYZ Studio'"),'Help route needs clear product identity');
assert(app.includes("title:'Support — VELORYZ Studio'"),'Support route needs clear product identity');
assert(app.includes("'/design/':'Browse VELORYZ design directions"),'Design route needs explicit search metadata');
assert(app.includes("duration:480,easing:'cubic-bezier(.22,1,.36,1)'"),'SPA fallback transitions must use the smoother R20.2 profile');

for(const group of ['Explore','Build with us','Help & knowledge','Policies & reference'])assert(app.includes("label:'"+group+"'"),'Simplified footer group missing: '+group);
assert(!app.includes("title:'The Studio, Aryan & Our Team"),'Public Studio title must remain team-first');

for(const stage of ['01 Discover','02 Inspiration','03 Capabilities','04 Investment','05 Send brief'])assert(creator.includes(stage),'Creator roadmap stage missing: '+stage);
assert(creator.includes('Your brief stays available for this browser session'),'Creator session persistence copy must remain truthful');

assert(docs.includes('Choose the outcome, not the entire library.'),'Docs outcome-first start layer missing');
assert(knowledge.includes('Start with the outcome.'),'Authoritative Knowledge V4 Docs start heading missing');
for(const path of ['/docs/overview.html','/docs/pricing.html','/docs/client-portal.html','/docs/copyright.html'])assert(knowledge.includes(path),'Knowledge V4 R20 outcome path missing: '+path);
assert(knowledge.includes('kb-r20-outcomes')&&knowledgeCss.includes('.kb-feature-grid.kb-r20-outcomes'),'Knowledge V4 four-card R20 outcome layout missing');
assert(siteShell.includes('/docs-hub.js?v=20261123-r20-1')&&siteShell.includes('/knowledge-v4.js?v=20261123-r20-1')&&siteShell.includes('/knowledge-v4.css?v=20261123-r20-1'),'Active Docs assets need R20.1 cache keys');
for(const path of ['/docs/overview.html','/docs/pricing.html','/docs/client-portal.html','/docs/copyright.html'])assert(docs.includes(path),'Docs start path missing: '+path);

assert(market.includes('Motion level'),'Marketplace motion filter needs plain language');
assert(market.includes('Starting budget (INR)'),'Marketplace budget must identify INR');
assert(market.includes('Starting build estimates are shown in INR.'),'Marketplace currency context missing');
assert(market.includes('Source availability and usage context'),'Marketplace rights filter needs plain-language context');
assert(market.includes('Studio-reviewed source')&&market.includes('Source review needed')&&market.includes('Reference only'),'Marketplace source labels are incomplete');
assert(market.includes('STARTING VELORYZ BUILD ESTIMATES / INR'),'Marketplace result heading must identify INR');

assert(!siteShell.includes('\\\"founder\\\"'),'Public Organization schema should stay studio-first rather than single-owner-first');

new Function(js);
console.log('PASS: R29 preserves the cinematic public experience while stabilizing responsive layout, Creator panel sizing and cache-consistent Creator assets.');
