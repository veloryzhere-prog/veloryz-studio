/** Live production verification: success means the public domain serves the tested build.
 * This is separate from CI compilation and requires a real deployment.
 * All probes are read-only and cache-busted. No secrets or project data are queried.
 */
const origin=(process.env.VELORYZ_LIVE_URL||'https://veloryz.online').replace(/\/$/,'');
const release=process.env.VELORYZ_UI_RELEASE||'silk-ui-20261123-r4';
const maxAttempts=Math.max(1,Number(process.env.VELORYZ_PROBE_ATTEMPTS)||16);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const load=async path=>{
 const url=new URL(path,origin);
 url.searchParams.set('vz_ui_release_probe',release);
 url.searchParams.set('attempt',String(Date.now()));
 const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(15000)});
 return {status:response.status,header:response.headers.get('x-veloryz-ui-release'),body:await response.text(),url:url.href};
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
    page.body.includes(asset+'?v=20261123-route-r4')));
   const [silkCss,uiCss,js]=await Promise.all(assets.map(load));
   const assetsOK=silkCss.status===200&&uiCss.status===200&&js.status===200
    &&silkCss.body.includes('@property --vz-r')&&silkCss.body.includes('.vz-burst')
    &&silkCss.body.includes('animation-timeline: --vz-scrub')
    &&uiCss.body.includes('body.v4-creator-page .v4-root .v4-welcome')
    &&uiCss.body.includes('body.vz-market-body:not(.vz-market-immersive)')
    &&uiCss.body.includes(':is(#main, .site-header) .button')
    &&uiCss.body.includes('#main :is(.project-link, .process-card, .feature-card')
    &&uiCss.body.includes('--vz-r: 160%')
    &&js.body.includes("version: 'silk-2026.3'")
    &&js.body.includes('function burst(')&&js.body.includes('function scrubParagraphs()')
    &&js.body.includes("getElementById('site-progress')")
    &&js.body.includes("const BTN = '.btn,.button");
   if(pagesLinked&&assetsOK){
    console.log('PASS: production '+origin+' serves '+release+' on homepage, creator and design detail, all three linked assets, real homepage button/card selectors and runtime.');
    process.exit(0);
   }
   lastError='HTML release marker found but real-site asset links/current JS or CSS failed verification. Linked '+pagesLinked+'; silk CSS '+silkCss.status+', UI CSS '+uiCss.status+', JS '+js.status+'.';
  }else{
   lastError='Live HTML not at '+release+': homepage '+home.status+' ('+(home.header||'no release')+'), create '+creator.status+' ('+(creator.header||'no release')+'), design '+design.status+' (marker '+designOK+').';
  }
 }catch(error){lastError=String(error);}
 console.log('Live release attempt '+attempt+'/'+maxAttempts+': '+lastError);
 if(attempt<maxAttempts)await sleep(10000);
}
console.error('FAIL: GitHub source may be built, but the PUBLIC DOMAIN did not serve the expected release. Ensure the hosting service deploys main at the VELORYZ-Studio subdirectory/build output and the veloryz.online domain points to that deployment. '+lastError);
process.exit(1);
