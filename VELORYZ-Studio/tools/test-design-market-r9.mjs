/* R9 Design Market + motion regression gate.
 * Protects the actual /design renderer, the finite home scroll story, project
 * journey routes, VELORYZ-only feedback language and private-page isolation.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const decode=p=>{const raw=read(p),i=raw.indexOf('export default ');assert(i>=0,'encoded shell missing: '+p);return JSON.parse(raw.slice(i+15).trim().replace(/;$/,''));};

const home=decode('lib/claude-reference-shell.ts');
const homeJs=read('public/reference-site-upgrade.js');
const homeCss=read('public/reference-site-upgrade.css');
const actualMarket=read('public/veloryz-open-library.js');
const actualMarketCss=read('public/veloryz-open-library.css');
const compatibilityMarket=read('public/external-design-library.js');
const compatibilityCss=read('public/external-design-library.css');
const brandJs=read('public/veloryz-brand-motion-r9.js');
const brandCss=read('public/veloryz-brand-motion-r9.css');
const app=read('public/app.js');
const journeyCss=read('public/reference-restored-features.css');
const security=read('lib/response-security.ts');
const shell=read('lib/site-shell.ts');

/* The blank-scroll bug: home may curate the large catalogue, never size the
   sticky story from the full horizontal track width. */
assert(homeJs.includes("if(picked.length===7)break"),'Home design story must cap itself to seven curated directions');
assert(homeJs.includes("items=(picked.length?picked:all).slice(0,7)"),'Only seven designs belong in the pinned home story');
assert(!homeJs.includes("travel*1.12"),'Never derive vertical travel from the giant catalogue track');
assert(!homeJs.includes("travel=Math.max(0,lastW-viewWidth)"),'Old entire-catalogue horizontal travel must stay removed');
assert(homeJs.includes("data.vzLibraryStage")||homeJs.includes("dataset.vzLibraryStage"),'Featured designs need stage identity');
assert(homeJs.includes("const setActive=next=>"),'Scroll progression must change the active preview');
assert(homeCss.includes('HOME DESIGN STAGE R9')&&homeCss.includes('.vz-home-design-card.is-active'),'Pinned one-design-at-a-time stage CSS missing');
assert(homeCss.includes('#vz-home-library.is-static'),'Reduced-motion/static library fallback missing');
assert(!home.includes('id="vz-library-count"')&&!home.includes('id="vz-library-index"'),'Homepage design showcase must not expose numeric count/index labels');
assert(home.includes('Curated directions / scroll to reveal'),'Homepage design intro must use non-numeric curation language');
assert(!homeJs.includes("data-vz-library-go")&&!homeJs.includes("createElement('nav')"),'Homepage design showcase must not recreate the old numbered nav rail');
assert(homeJs.includes('function removeLegacyLibraryChrome('),'Runtime cleanup must remove any stale rail/count nodes');
assert(home.includes('vz-home-library-clean-r14'),'Homepage shell needs inline hard-stop no-blur/no-counter CSS');
assert(!homeCss.includes('position:absolute;right:clamp(9px,1.2vw,18px);top:50%'),'Obsolete rail styling must be physically removed from CSS');

assert(!homeJs.includes("padStart(2,'0')+' / '+String(items.length)"),'Current design counter must remain removed');
assert(!homeCss.includes('scale(1.025)')&&!homeCss.includes('scale(.985)'),'Homepage design preview must not use GPU resampling scales that can blur screenshots');
assert(homeCss.includes('filter:none!important')&&homeCss.includes('backdrop-filter:none!important'),'Preview surface must explicitly stay sharp');
assert(homeCss.includes(':is(#vz-library-count,#vz-library-index)')&&homeCss.includes('.vz-home-library-intro>.tag'),'CSS must suppress stale R9 counting if old HTML/JS is mixed with the R11 stylesheet during rollout');
assert(homeCss.includes('#vz-home-library .vz-library-rail')&&homeCss.includes('display:none!important'),'Stale cached rail must be suppressed so no blur band can render');
assert(home.includes('body>nav{position:fixed')&&!home.includes('\nnav{position:fixed'),'Fixed header navigation CSS must be scoped to the top-level nav, never nested component navs');


/* The REAL /design renderer is veloryz-open-library.js, which intentionally
   overwrites window.designPage after the compatibility marketplace loads. */
assert(actualMarket.includes('window.designPage=renderWithMotion'),'R9 tests must cover the actual /design renderer');
assert(actualMarket.includes('VELORYZ / CURATED DESIGN MARKET'),'Actual design library hero not upgraded');
for(const token of ['data-source-search','data-source-category','data-source-motion','data-source-price','data-source-rights','data-source-sort'])
 assert(actualMarket.includes(token),'Actual marketplace filter missing: '+token);
assert(actualMarket.includes("fetch('/api/reviews'"),'Design marketplace trust must use real moderated reviews');
assert(actualMarket.includes('VELORYZ does not invent per-template ratings'),'Marketplace must explicitly reject fabricated template ratings');
assert(actualMarket.includes('RIGHTS REVIEW BEFORE BUILD'),'Rights review must be visible before purchase handoff');
assert(actualMarket.includes('VELORYZ BUILD FROM'),'Starting build pricing must be explicit');
assert(actualMarketCss.includes('ACTUAL DESIGN LIBRARY R9'),'Actual marketplace R9 CSS missing');
assert(actualMarketCss.includes('.vz-r9-toolbar')&&actualMarketCss.includes('.vz-r9-review-trust'),'Filters/review surfaces must be styled');
assert(actualMarketCss.includes('@media(prefers-reduced-motion:reduce)'),'Actual market motion must respect reduced motion');
assert(!actualMarket.includes('THE VELORYZ DESIGN COLLECTION <span>✳'),'Generic star marquee must not return');

assert(compatibilityMarket.includes('Find a direction.')&&compatibilityMarket.includes('data-ext-motion')&&compatibilityMarket.includes('data-ext-price'),'Compatibility market should match R9 structure');
assert(compatibilityMarket.includes("fetch('/api/reviews'"),'Compatibility market must also use real review data');
assert(compatibilityCss.includes('DESIGN MARKET R9'),'Compatibility marketplace R9 CSS missing');

/* Exact journey destinations requested by product owner. */
const journeyBlock=home.slice(home.indexOf('id="vz-reference-journey"'),home.indexOf('id="vz-home-reviews"',home.indexOf('id="vz-reference-journey"')));
for(const [stage,href] of [['Sketch','/design/'],['Structure','/design/'],['Design','/design/'],['Build','/create/'],['Review','/reviews.html']]){
 assert(journeyBlock.includes('>'+stage+'<'),'Journey stage missing: '+stage);
 assert(journeyBlock.includes('href="'+href+'"'),'Journey route missing for '+stage+': '+href);
}
assert(!journeyBlock.includes('✳'),'Generic journey star marker must be removed');
assert(journeyBlock.includes('class="vz-stage-mark" src="/assets/brand/veloryz-mark.svg"'),'Journey stage uses official V mark');
assert(journeyCss.includes('CLICKABLE PROJECT JOURNEY R9')&&journeyCss.includes('color:#191512!important'),'Journey card contrast must be explicit');
assert(app.includes("const href=i===3?'/create/':i===4?'/reviews.html':'/design/'"),'SPA journey chapters need the same real route mapping');
assert(!app.includes('<span class="teaser-star" aria-hidden="true">✳</span>'),'SPA teaser generic star must stay removed');
assert(app.includes('class="teaser-star" src="/assets/brand/veloryz-mark.svg"'),'SPA teaser should use VELORYZ mark');

/* Public interaction feedback is branded; it is not another dot/particle engine. */
assert(brandJs.includes("mark.src='/assets/brand/veloryz-mark.svg'")&&brandJs.includes('vz-click-mark'),'Click response must use the VELORYZ mark');
assert(!brandCss.includes('border-radius:50%'),'R9 brand-motion layer must not create circular decorative feedback');
assert(brandCss.includes('.vz-brand-backdrop')&&brandCss.includes('linear-gradient'),'Background motion uses angular/linear brand fields');
assert(brandCss.includes('position:absolute;inset:0;z-index:-1'),'Brand backdrop must stack behind authored content');
assert(!brandCss.includes('>:not(.vz-brand-backdrop){position:relative'),'Brand decoration must never overwrite sticky/absolute child positioning');
assert(brandJs.includes("addEventListener('scroll',requestPaint"),'Background parallax must be scroll-driven');
assert(!brandJs.includes('setInterval('),'Brand background motion must not add a perpetual interval');
assert(brandCss.includes('prefers-reduced-motion')&&brandJs.includes("['reduced','paused']"),'Brand feedback must respect motion settings');

/* Correct assets must be shipped, cache-busted, and never injected into private pages. */
assert(security.includes("const silkUiAssets=!privatePage&&status===200"),'Public motion assets must remain isolated from private pages');
assert(security.includes('/veloryz-brand-motion-r9.css?v=20261123-brand-motion-r9')&&security.includes('/veloryz-brand-motion-r9.js?v=20261123-brand-motion-r9'),'R9 public brand-motion assets missing');
assert(shell.includes('/veloryz-open-library.css?v=20261123-market-r9')&&shell.includes('/veloryz-open-library.js?v=20261123-market-r9'),'Actual design library R9 cache key missing');
assert(shell.includes('/external-design-library.css?v=20261123-market-r9')&&shell.includes('/external-design-library.js?v=20261123-market-r9'),'Compatibility library R9 cache key missing');
assert(home.includes('/reference-site-upgrade.css?v=20261123-clean-r14')&&home.includes('/reference-site-upgrade.js?v=20261123-clean-r14'),'Homepage finite design stage needs the sharp R11 cache key');
assert(home.includes('/reference-restored-features.css?v=20261123-journey-r9'),'Clickable Journey CSS needs an R9 cache key');
assert(shell.includes('/app.js?v=20261123-r9-journey-market'),'Standard SPA Journey/market shell must bypass pre-R9 app cache');
const liveGate=read('tools/check-live-ui-release.mjs'),visualQc=read('tools/qc-capture-live.mjs');
assert(liveGate.includes('VELORYZ / CURATED DESIGN MARKET')&&liveGate.includes("$"+"$('#mn a').forEach(function(a,i)"),'Production gate must verify actual R9 market and correct list-based menu initializer');
assert(visualQc.includes('waitForR9Deployment')&&visualQc.includes('-design-stage-mid.png')&&visualQc.includes('-marketplace.png'),'Visual QC must wait for R9 and capture the repaired surfaces');

/* Syntax and stylesheet integrity. */
for(const p of ['public/reference-site-upgrade.js','public/veloryz-open-library.js','public/external-design-library.js','public/veloryz-brand-motion-r9.js','public/app.js'])
 assert.doesNotThrow(()=>new vm.Script(read(p)),p+' must parse');
for(const p of ['public/reference-site-upgrade.css','public/veloryz-open-library.css','public/external-design-library.css','public/veloryz-brand-motion-r9.css','public/reference-restored-features.css']){
 const css=read(p);assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'CSS braces must balance: '+p);
}
console.log('PASS: R9 finite home design scroll, actual marketplace redesign, real review trust, clickable journey, VELORYZ feedback and private isolation.');
