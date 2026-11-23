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
   const [css,js]=await Promise.all([load('/veloryz-ui-2026.css'),load('/veloryz-silk-2026.js')]);
   const assetsOK=css.status===200&&js.status===200&&css.body.includes('body.v4-creator-page .v4-root .v4-welcome')&&css.body.includes('body.vz-market-body:not(.vz-market-immersive)')&&css.body.includes('--vz-r: 150%')&&css.body.includes('--vz-spot, 0')&&js.body.includes("version: 'silk-2026.2'")&&js.body.includes('function burst(')&&js.body.includes('function scrubParagraphs()');
   if(assetsOK){
    console.log('PASS: production VELORYZ origin='+origin+' serves '+release+' on homepage, creator and design detail, including live styles and motion script.');
    process.exit(0);
   }
   lastError='HTML has release marker, but linked CSS/JS is missing or stale. Stylesheet status '+css.status+', script status '+js.status+'.';
  }else{
   lastError='Live HTML not at '+release+': homepage '+home.status+' ('+(home.header||'no release')+'), create '+creator.status+' ('+(creator.header||'no release')+'), design '+design.status+' (marker '+designOK+').';
  }
 }catch(error){lastError=String(error);}
 console.log('Live release attempt '+attempt+'/'+maxAttempts+': '+lastError);
 if(attempt<maxAttempts)await sleep(10000);
}
console.error('FAIL: GitHub source may be built, but the PUBLIC DOMAIN did not serve the expected release. Ensure the hosting service deploys main at the VELORYZ-Studio subdirectory/build output and the veloryz.online domain points to that deployment. '+lastError);
process.exit(1);
