/** Live production verification: success means the public domain serves the tested build.
 * This is separate from CI compilation and requires a real deployment.
 * All probes are read-only and cache-busted. No secrets or project data are queried.
 */
const origin=(process.env.VELORYZ_LIVE_URL||'https://veloryz.online').replace(/\/$/,'');
const release=process.env.VELORYZ_UI_RELEASE||'silk-ui-20261123-r5';
const maxAttempts=Math.max(1,Number(process.env.VELORYZ_PROBE_ATTEMPTS)||16);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const load=async path=>{
 const url=new URL(path,origin);
 url.searchParams.set('vz_ui_release_probe',release);
 url.searchParams.set('attempt',String(Date.now()));
 const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(15000)});
 return {status:response.status,header:response.headers.get('x-veloryz-ui-release'),menuHeader:response.headers.get('x-veloryz-menu-release'),body:await response.text(),url:url.href};
};
let lastError='';
for(let attempt=1;attempt<=maxAttempts;attempt++){
 try{
  const [home,creator,design]=await Promise.all([
   load('/'),load('/create/'),load('/design/os-portfolio-and-agencies-8b-creative-agency/')
  ]);
  const publicOK=[home,creator].every(p=>p.status===200&&p.header===release&&p.body.includes('name="veloryz-ui-release" content="'+release+'"'));
  const designOK=design.status===200&&design.body.includes('name="veloryz-ui-release" content="'+release+'"');
  if(publicOK&&designOK){
   const assets=['/veloryz-silk-2026.css','/veloryz-ui-2026.css','/veloryz-silk-2026.js'];
   const pagesLinked=[home,creator,design].every(page=>assets.every(asset=>
    page.body.includes(asset+'?v=20261123-route-r5')));
   const editorialLinked=home.body.includes('vz-editorial-r5')
    &&home.body.includes('class="vz-hero-practices"')
    &&home.body.includes('/reference-elegance-r5.css?v=20261123-editorial-r5');
   // A release marker alone once passed while the live homepage still loaded
   // an older broken singleton '$().forEach' Menu controller.
   const liveControllerFixed=home.body.includes("$('#mn a').forEach(function(a,i)");
   const menuLinked=home.menuHeader==='reference-menu-20261123-r6'
    &&home.body.includes('id="mb" class="mbtn vz-menu-morph"')
    &&home.body.includes('data-vz-menu-version="reference-r6"')
    &&home.body.includes('/reference-menu-morph-r6.css?v=20261123-reference-menu-r6')
    &&home.body.includes('/reference-site-upgrade.js?v=20261123-reference-menu-r6')
    &&liveControllerFixed;
   const [silkCss,uiCss,js,editorial,menuCss]=await Promise.all([
    ...assets.map(load),load('/reference-elegance-r5.css'),load('/reference-menu-morph-r6.css')
   ]);
   const menuOK=menuCss.status===200
    &&menuCss.body.includes('clip-path: circle(150vmax')
    &&menuCss.body.includes('vz-menu-label-close')
    &&menuCss.body.includes('vz-menu-glyph i:first-child')
    &&menuCss.body.includes('vz-menu-stagger');
   const editorialOK=editorial.status===200
    &&editorial.body.includes('body.vz-reference-site .vz-material-hero')
    &&editorial.body.includes('#mn a::before')
    &&editorial.body.includes('vz-hero-edition')
    &&editorial.body.includes('vz-hero-practices')
    &&editorial.body.includes('#vz-hero-particles');
   const assetsOK=silkCss.status===200&&uiCss.status===200&&js.status===200
    &&silkCss.body.includes('@property --vz-r')&&silkCss.body.includes('.vz-burst')
    &&silkCss.body.includes('animation-timeline: --vz-scrub')
    &&uiCss.body.includes('body.v4-creator-page .v4-root .v4-welcome')
    &&uiCss.body.includes('body.vz-market-body:not(.vz-market-immersive)')
    &&uiCss.body.includes(':is(#main, .site-header) .button')
    &&uiCss.body.includes('#main :is(.project-link, .process-card, .feature-card')
    &&uiCss.body.includes('--vz-r: 160%')
    &&js.body.includes("version: 'silk-2026.4'")
    &&js.body.includes('function burst(')&&js.body.includes('function scrubParagraphs()')
    &&js.body.includes("getElementById('site-progress')")
    &&js.body.includes("const BTN = '.btn,.button");
   if(pagesLinked&&assetsOK&&editorialLinked&&editorialOK&&menuLinked&&menuOK){
    console.log('PASS: production '+origin+' serves '+release+' on homepage, creator and design detail, all linked assets, active editorial hero, R6 circular Menu/Close morph, all assets, selectors and runtime.');
    process.exit(0);
   }
   lastError='HTML release marker found but the active R5 homepage or assets failed verification. Core linked '+pagesLinked+', editorial linked '+editorialLinked+', editorial valid '+editorialOK+', menu linked '+menuLinked+', menu valid '+menuOK+', live controller fixed '+liveControllerFixed+'; Silk CSS '+silkCss.status+', UI CSS '+uiCss.status+', JS '+js.status+', editorial CSS '+editorial.status+'.';
  }else{
   lastError='Live HTML not at '+release+': homepage '+home.status+' ('+(home.header||'no release')+'), create '+creator.status+' ('+(creator.header||'no release')+'), design '+design.status+' (marker '+designOK+').';
  }
 }catch(error){lastError=String(error);}
 console.log('Live release attempt '+attempt+'/'+maxAttempts+': '+lastError);
 if(attempt<maxAttempts)await sleep(10000);
}
console.error('FAIL: GitHub source may be built, but the PUBLIC DOMAIN did not serve the expected release. Ensure the hosting service deploys main at the VELORYZ-Studio subdirectory/build output and the veloryz.online domain points to that deployment. '+lastError);
process.exit(1);
