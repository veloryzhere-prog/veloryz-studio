/** Live production verification: success means the PUBLIC domain serves the
 * tested build, including the active R9 design-market renderer and finite home
 * design stage. Read-only, cache-busted probes only.
 */
const origin=(process.env.VELORYZ_LIVE_URL||'https://veloryz.online').replace(/\/$/,'');
const release=process.env.VELORYZ_UI_RELEASE||'silk-ui-20261123-r5';
const expectedCommit=process.env.VELORYZ_EXPECTED_COMMIT||process.env.GITHUB_SHA;
if(!/^[a-f0-9]{40}$/.test(expectedCommit||''))throw Error('Set VELORYZ_EXPECTED_COMMIT to the full deployed Git SHA');
const r9='design-market-20261123-r9';
const maxAttempts=Math.max(1,Number(process.env.VELORYZ_PROBE_ATTEMPTS)||20);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const load=async path=>{
 const url=new URL(path,origin);
 url.searchParams.set('vz_ui_release_probe',release);
 url.searchParams.set('vz_design_release',r9);
 url.searchParams.set('attempt',String(Date.now()));
 const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(15000)});
 return {status:response.status,commit:response.headers.get('x-veloryz-commit'),header:response.headers.get('x-veloryz-ui-release'),menuHeader:response.headers.get('x-veloryz-menu-release'),experienceHeader:response.headers.get('x-veloryz-experience-release'),body:await response.text(),url:url.href};
};
let lastError='';
for(let attempt=1;attempt<=maxAttempts;attempt++){
 try{
  const [home,creator,designPage,designDetail,docsPage]=await Promise.all([
   load('/'),load('/create/'),load('/design/'),load('/design/os-portfolio-and-agencies-8b-creative-agency/'),load('/docs/')
  ]);
  const exact=[home,creator,designPage,docsPage,designDetail].every(p=>p.status===200&&p.commit===expectedCommit&&p.body.includes('/veloryz-design-system-r45.css?v=20261126-r45'));
  const publicOK=exact&&[home,creator,designPage].every(p=>p.header===release&&p.body.includes('name="veloryz-ui-release"'));
  const detailOK=designDetail.body.includes('/veloryz-design-preview.js?v=20261126-r43')&&docsPage.body.includes('<main');
  if(publicOK&&detailOK){
   const silkAssets=['/veloryz-silk-2026.css','/veloryz-ui-2026.css','/veloryz-silk-2026.js'];
   const pagesLinked=[home,creator,designDetail].every(page=>silkAssets.every(asset=>page.body.includes(asset+'?v=20261123-route-r5')));
   const editorialLinked=home.body.includes('vz-editorial-r5')
    &&home.body.includes('class="vz-hero-eyebrow"')
    &&home.body.includes('/reference-elegance-r5.css?v=20261123-editorial-r5');
   const liveControllerFixed=home.body.includes("$$('#mn a').forEach(function(a,i)");
   const menuLinked=home.menuHeader==='reference-menu-20261123-r6'
    &&home.body.includes('id="mb" class="mbtn vz-menu-morph"')
    &&home.body.includes('data-vz-menu-version="reference-r6"')
    &&home.body.includes('/reference-menu-morph-r6.css?v=20261123-reference-menu-r6')
    &&liveControllerFixed;
   const r9HomeLinked=home.body.includes('/reference-site-upgrade.css?v=20261123-simple-scroll-r15')
    &&home.body.includes('/reference-site-upgrade.js?v=20261123-simple-scroll-r15')
    &&home.body.includes('/reference-restored-features.css?v=20261123-journey-r9')
    &&home.body.includes('/veloryz-brand-motion-r9.css?v=20261123-brand-motion-r9')
    &&home.body.includes('/veloryz-brand-motion-r9.js?v=20261123-brand-motion-r9');
   const brandFlowLinked=home.body.includes('/reference-brand-flow-r17.css?v=20261123-header-footer-r19')
    &&home.body.includes('/reference-brand-flow-r17.js?v=20261123-header-footer-r19');
   const r20Linked=[home,creator,designPage].every(page=>page.body.includes('/veloryz-experience-r20.css?v=20261124-r29')&&page.body.includes('/veloryz-experience-r20.js?v=20261126-r42'));
   const creatorAssetsFresh=creator.body.includes('/creator-v4.css?v=20261126-v2-workspaces')&&creator.body.includes('/creator-v4.js?v=20261126-r42');
   const r9DesignLinked=designPage.body.includes('/veloryz-open-library.css?v=20261126-r45')
    &&designPage.body.includes('/veloryz-open-library.js?v=20261126-v2-workspaces')
    &&designPage.body.includes('/external-design-library.css?v=20261123-market-r9')
    &&designPage.body.includes('/app.js?v=20261126-r42');
   const [silkCss,uiCss,silkJs,editorial,menuCss,homeStageJs,homeStageCss,actualMarketJs,actualMarketCss,brandJs,brandCss,journeyCss,appJs,flowCss,flowJs,smoothJs,r20Css,r20Js,creatorJs,docsJs,knowledgeJs,knowledgeCss]=await Promise.all([
    ...silkAssets.map(load),load('/reference-elegance-r5.css'),load('/reference-menu-morph-r6.css'),
    load('/reference-site-upgrade.js'),load('/reference-site-upgrade.css'),
    load('/veloryz-open-library.js'),load('/veloryz-open-library.css'),
    load('/veloryz-brand-motion-r9.js'),load('/veloryz-brand-motion-r9.css'),
    load('/reference-restored-features.css'),load('/app.js'),
    load('/reference-brand-flow-r17.css'),load('/reference-brand-flow-r17.js'),load('/smooth-scroll.js'),
    load('/veloryz-experience-r20.css'),load('/veloryz-experience-r20.js'),load('/creator-v4.js'),load('/docs-hub.js'),
    load('/knowledge-v4.js'),load('/knowledge-v4.css')
   ]);
   const menuOK=menuCss.status===200
    &&menuCss.body.includes('clip-path: circle(150vmax')
    &&menuCss.body.includes('vz-menu-label-close')
    &&menuCss.body.includes('vz-menu-glyph i:first-child')
    &&menuCss.body.includes('vz-menu-stagger');
   const editorialOK=editorial.status===200
    &&editorial.body.includes('body.vz-reference-site .vz-material-hero')
    &&editorial.body.includes('vz-hero-edition')
    &&editorial.body.includes('vz-hero-practices');
   const silkOK=silkCss.status===200&&uiCss.status===200&&silkJs.status===200
    &&silkCss.body.includes('@property --vz-r')
    &&uiCss.body.includes(':is(#main, .site-header) .button')
    &&silkJs.body.includes("version: 'silk-2026.4'")
    &&silkJs.body.includes("getElementById('site-progress')");
   const r9HomeOK=homeStageJs.status===200&&homeStageCss.status===200
    &&homeStageJs.body.includes("items=(picked.length?picked:all).slice(0,7)")
    &&homeStageJs.body.includes('const setActive=next=>')
    &&!homeStageJs.body.includes('travel*1.12')
    &&homeStageCss.body.includes('HOME DESIGN STAGE R9')
    &&homeStageCss.body.includes('.vz-home-design-card.is-active');
   const r11SharpOK=!homeStageCss.body.includes('scale(1.025)')
    &&!homeStageCss.body.includes('scale(.985)')
    &&homeStageCss.body.includes('filter:none!important')
    &&homeStageCss.body.includes('backdrop-filter:none!important')
    &&!home.body.includes('id="vz-library-count"')
    &&!home.body.includes('id="vz-library-index"')
    &&!homeStageJs.body.includes("data-vz-library-go")
    &&homeStageCss.body.includes('nav.vz-library-rail')
    &&homeStageCss.body.includes('display:none!important');
   const r15SimpleScrollOK=homeStageJs.body.includes("addEventListener('scroll',requestLibraryUpdate")
    &&homeStageJs.body.includes("libraryFrame=requestAnimationFrame")
    &&!homeStageJs.body.includes('motionIsFull');
   const markup=home.body.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
   const r14ChromeGone=!markup.includes('vz-library-rail')
    &&!markup.includes('vz-library-index')
    &&!home.body.includes('Featured design positions')
    &&!home.body.includes('01 / 07');
   const r9MarketOK=actualMarketJs.status===200&&actualMarketCss.status===200
    &&actualMarketJs.body.includes('VELORYZ / CURATED DESIGN MARKET')
    &&actualMarketJs.body.includes('data-source-motion')
    &&actualMarketJs.body.includes('data-source-price')
    &&actualMarketJs.body.includes("fetch('/api/reviews'")
    &&actualMarketCss.body.includes('ACTUAL DESIGN LIBRARY R9');
   const r9BrandOK=brandJs.status===200&&brandCss.status===200
    &&brandJs.body.includes("mark.src='/assets/brand/veloryz-mark.svg'")
    &&brandCss.body.includes('position:absolute;inset:0;z-index:-1')
    &&!brandCss.body.includes('>:not(.vz-brand-backdrop){position:relative');
   const brandFlowOK=flowCss.status===200&&flowJs.status===200&&smoothJs.status===200
    &&flowCss.body.includes('--vz-brand-scroll-opacity')
    &&flowCss.body.includes('footer.vz-footer-in')
    &&flowJs.body.includes("addEventListener('scroll',requestSync,{passive:true})")
    &&flowJs.body.includes("setProperty('--vz-brand-scroll-opacity'")
    &&flowJs.body.includes('const end=Math.max(96,Math.min(150,innerHeight*.16))')
    &&flowCss.body.includes('visibility:hidden')
    &&flowCss.body.includes('filter:brightness(0) invert(96%)')
    &&smoothJs.body.includes('lerp:0.09')
    &&smoothJs.body.includes('wheelMultiplier:0.9');
   const r20OK=r20Linked&&creatorAssetsFresh&&r20Css.status===200&&r20Js.status===200&&creatorJs.status===200&&docsJs.status===200&&knowledgeJs.status===200&&knowledgeCss.status===200
    &&r20Js.body.includes("skip.textContent='Skip to main content'")
    &&r20Js.body.includes("data-vz-r20-3d-more")
    &&r20Js.body.includes("const advanced=['continue','left','right','front']")
    &&r20Js.body.includes('vz-r20-assistant-actions')
    &&r20Css.body.includes('::view-transition-old(root)')
    &&r20Css.body.includes('body.vz-r20-assistant-route .vz-chat-page')
    &&r20Css.body.includes('.docs-r20-start')
    &&home.body.includes('class="vz-home-primary-links"')
    &&home.body.includes('vz-hero-cta-main" href="/create/"')
    &&creatorJs.body.includes("const steps=['Discover','Business','Design','Features','Scope','Investment','Send']")
    &&creatorJs.body.includes('businessName')
    &&creatorJs.body.includes('window.VeloryzCreatorV4')
    &&docsJs.body.includes('Choose the outcome, not the entire library.')
    &&docsPage.body.includes('/knowledge-v8.css')
    &&knowledgeJs.body.includes('Start with the outcome.')
    &&knowledgeJs.body.includes('/docs/overview.html')
    &&knowledgeJs.body.includes('/docs/pricing.html')
    &&knowledgeJs.body.includes('/docs/client-portal.html')
    &&knowledgeJs.body.includes('/docs/copyright.html')
    &&knowledgeCss.body.includes('.kb-feature-grid.kb-r20-outcomes')
    &&actualMarketJs.body.includes('Starting budget (INR)')
    &&actualMarketJs.body.includes('Starting build estimates are shown in INR.')
    &&appJs.body.includes("['/contact/','Contact']")
    &&appJs.body.includes("label:'Help & knowledge'")
    &&appJs.body.includes("title:'Help Centre — VELORYZ Studio'")
    &&appJs.body.includes("title:'Support — VELORYZ Studio'")
    &&appJs.body.includes("duration:480,easing:'cubic-bezier(.22,1,.36,1)'");
   const journeyOK=journeyCss.status===200&&appJs.status===200
    &&journeyCss.body.includes('CLICKABLE PROJECT JOURNEY R9')
    &&appJs.body.includes("const href=i===3?'/create/':i===4?'/reviews.html':'/design/'")
    &&appJs.body.includes('class="teaser-star" src="/assets/brand/veloryz-mark.svg"');
   if(pagesLinked&&silkOK&&editorialLinked&&editorialOK&&menuLinked&&menuOK&&r9HomeLinked&&r9DesignLinked&&brandFlowLinked&&brandFlowOK&&r20OK&&r9HomeOK&&r9MarketOK&&r9BrandOK&&journeyOK&&r11SharpOK&&r14ChromeGone&&r15SimpleScrollOK){
    console.log('PASS: production '+origin+' serves '+release+' plus R9 finite home design stage, actual design-market renderer, VELORYZ feedback, clickable Journey and cache-busted public assets.');
    process.exit(0);
   }
   lastError='Release HTML exists but active assets are stale/mismatched. Silk '+silkOK+', editorial '+editorialOK+', menu '+menuOK+', menu controller '+liveControllerFixed+', R9 home links '+r9HomeLinked+', R9 design links '+r9DesignLinked+', R17 links '+brandFlowLinked+', R17 brand flow '+brandFlowOK+', R29 public experience '+r20OK+', Creator cache '+creatorAssetsFresh+', R9 home '+r9HomeOK+', R9 market '+r9MarketOK+', R9 brand '+r9BrandOK+', R9 journey '+journeyOK+', R14 clean showcase '+r11SharpOK+', R14 rail/counter removal '+r14ChromeGone+'.';
  }else{
   lastError='Live HTML not at expected commit '+expectedCommit+' (observed '+home.commit+'): homepage '+home.status+', create '+creator.status+', design page '+designPage.status+', docs '+docsPage.status+', detail '+designDetail.status+'.';
  }
 }catch(error){lastError=String(error);}
 console.log('Live release attempt '+attempt+'/'+maxAttempts+': '+lastError);
 if(attempt<maxAttempts)await sleep(10000);
}
console.error('FAIL: source is merged but the PUBLIC DOMAIN did not serve the expected R9 build. Ensure hosting deploys current main from VELORYZ-Studio and invalidates public assets. '+lastError);
process.exit(1);
