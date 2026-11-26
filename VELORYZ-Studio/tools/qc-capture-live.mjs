/**
 * VELORYZ public-site QC screenshot inspector.
 * Visits public pages as an unauthenticated guest. No forms submitted, no
 * credentials, no mutation calls, no private/admin content and no tracking.
 * Produces viewport screenshots + a human-readable defect matrix and JSON.
 *
 * Run: QC_PLAYWRIGHT_MODULE=/tmp/veloryz-qc/node_modules/playwright/index.mjs
 *      node tools/qc-capture-live.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
const root=(process.env.QC_SITE_URL||'https://veloryz.online').replace(/\/$/,'');
const output=path.resolve(process.env.QC_OUTPUT_DIR||'qc-artifacts');
const mod=process.env.QC_PLAYWRIGHT_MODULE||'playwright';
const { chromium }=await import(mod);
const routes=[
 {name:'home',path:'/'},
 {name:'create',path:'/create/'},
 {name:'design',path:'/design/'},
 {name:'work',path:'/work/'},
 {name:'services',path:'/services/'},
 {name:'studio',path:'/studio/'},
 {name:'docs',path:'/docs/'},
 {name:'help-ai',path:'/help/assistant/'},
 {name:'support',path:'/support/'},
 {name:'client-login',path:'/client/'}
];
const screens=[
 {name:'wide-desktop',width:1920,height:1080},
 {name:'desktop',width:1440,height:900},
 {name:'small-desktop',width:1024,height:768},
 {name:'tablet',width:768,height:1024},
 {name:'mobile',width:390,height:844},
 {name:'small-mobile',width:320,height:700}
];
await fs.mkdir(output,{recursive:true});
const result={
 generated_at:new Date().toISOString(),
 source:root,
 note:'Captured from the PUBLIC HTTPS deployment, not from the repository source.',
 pages:[], errors:[]
};
let browser=null;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForR9Deployment(){
 let last='not checked';
 for(let attempt=1;attempt<=20;attempt++){
  try{
   const bust='?vz_r9_qc='+Date.now();
   const [market,homeStage,brand,designHtml,r20Css,r20Js,homeHtml,creatorHtml]=await Promise.all([
    fetch(root+'/veloryz-open-library.js'+bust,{cache:'no-store'}),
    fetch(root+'/reference-site-upgrade.js'+bust,{cache:'no-store'}),
    fetch(root+'/veloryz-brand-motion-r9.css'+bust,{cache:'no-store'}),
    fetch(root+'/design/'+bust,{cache:'no-store'}),
    fetch(root+'/veloryz-experience-r20.css'+bust,{cache:'no-store'}),
    fetch(root+'/veloryz-experience-r20.js'+bust,{cache:'no-store'}),
    fetch(root+'/'+bust,{cache:'no-store'}),
    fetch(root+'/create/'+bust,{cache:'no-store'})
   ]);
   const [marketText,homeText,brandText,designText,r20CssText,r20JsText,homeHtmlText,creatorHtmlText]=await Promise.all([market.text(),homeStage.text(),brand.text(),designHtml.text(),r20Css.text(),r20Js.text(),homeHtml.text(),creatorHtml.text()]);
   const expected=process.env.VELORYZ_EXPECTED_COMMIT||process.env.GITHUB_SHA;
   const exact=/^[a-f0-9]{40}$/.test(expected||'')&&[homeHtml,creatorHtml,designHtml].every(r=>r.headers.get('x-veloryz-commit')===expected);
   const ready=exact&&[homeHtmlText,creatorHtmlText,designText].every(html=>html.includes('/veloryz-design-system-r45.css?v=20261126-r45'))&&market.ok&&homeStage.ok&&brand.ok&&designHtml.ok&&r20Css.ok&&r20Js.ok&&homeHtml.ok&&creatorHtml.ok
    &&marketText.includes('VELORYZ / CURATED DESIGN MARKET')
    &&marketText.includes('data-source-motion')
    &&marketText.includes('Starting budget (INR)')
    &&homeText.includes("items=(picked.length?picked:all).slice(0,7)")
    &&homeText.includes('const setActive=next=>')
    &&brandText.includes('position:absolute;inset:0;z-index:-1')
    &&r20CssText.includes('.vz-r20-skip')
    &&r20JsText.includes("skip.textContent='Skip to main content'")
    &&homeHtmlText.includes('name="veloryz-experience-release" content="public-experience-20261124-r29"')
    &&designText.includes('/veloryz-open-library.js?v=20261126-r47')
    &&designText.includes('/veloryz-experience-r20.js?v=20261126-r42')
    &&creatorHtmlText.includes('/creator-v4.css?v=20261126-r48')
    &&creatorHtmlText.includes('/creator-v4.js?v=20261126-r48');
   if(ready){result.deployment={release:'R51.3',commit:expected,attempt};return}
   last='expected commit '+expected+', observed home '+homeHtml.headers.get('x-veloryz-commit')+', observed Creator '+creatorHtml.headers.get('x-veloryz-commit')+', observed design '+designHtml.headers.get('x-veloryz-commit')+', market '+market.status+', home stage '+homeStage.status+', brand '+brand.status+', R20 CSS '+r20Css.status+', R20 JS '+r20Js.status+', design HTML '+designHtml.status+', R20 markers '+ready;
  }catch(error){last=String(error)}
  if(attempt<20)await sleep(10000);
 }
 throw new Error('R9 public deployment not ready after release probes: '+last);
}
const visible=(rect,innerWidth,innerHeight)=>rect.width>0&&rect.height>0
 &&rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth;
async function snapshot(page,filename) {
 await page.screenshot({path:path.join(output,filename),animations:'disabled',timeout:25000});
}
async function check(page){
 return page.evaluate(()=>{
  const $=s=>document.querySelector(s);
  const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}};
  const overlap=(a,b)=>!a||!b?0:Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));
  const viewport={width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight};
  const layout={
   overflowX:Math.max(0,document.documentElement.scrollWidth-innerWidth),
   main:box(document.querySelector('main,#main')),
   headline:box(document.querySelector('#h1,.hero h1,.page-intro h1,.vz-r9-market-hero h1')),
   v3d:box(document.querySelector('#bigV')),
   controls:box(document.querySelector('.vz-3d-controls')),
   brand:box(document.querySelector('body.vz-reference-site > nav .vz-official-header-brand, .site-header .brand')),
   headerActions:box(document.querySelector('.vz-header-actions')),
   menuTrigger:box(document.querySelector('#mb,.menu-toggle'))
  };
  layout.brandActionsOverlap=Math.round(overlap(layout.brand,layout.headerActions));
  layout.headingVOverlap=Math.round(overlap(layout.headline,layout.v3d));
  layout.headingVRatio=layout.headline&&layout.v3d?Math.round(100*layout.headingVOverlap/
    Math.max(1,Math.min(layout.headline.w*layout.headline.h,layout.v3d.w*layout.v3d.h))):0;
  const brokenImages=[...document.images].filter(im=>{
   const r=im.getBoundingClientRect();
   return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0&&im.complete&&im.naturalWidth===0;
  }).slice(0,12).map(im=>im.currentSrc||im.src);
  const invalidTargets=[...document.querySelectorAll('a[href]')].filter(a=>{
   const h=a.getAttribute('href');return !h||h==='#'||h==='javascript:void(0)';
  }).slice(0,20).map(a=>({text:(a.textContent||'').trim().slice(0,50),href:a.getAttribute('href')}));
  return {viewport,layout,brokenImages,invalidTargets,
   release:$('meta[name="veloryz-ui-release"]')?.content||'not found',
   experienceRelease:$('meta[name="veloryz-experience-release"]')?.content||'not found',
   r20Body:document.body.classList.contains('vz-r20'),
   skipLink:Boolean(document.querySelector('.vz-r20-skip[href^="#"]')),
   menuRelease:$('link[href*="reference-menu-morph-r6.css"]')?.href||'not found',
   qcStyle:$('link[href*="reference-qc-layout-r7.css"]')?.href||'not found'};
 });
}
try {
 await waitForR9Deployment();
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const screen of screens){
  const context=await browser.newContext({
   viewport:{width:screen.width,height:screen.height},
   deviceScaleFactor:1,
   reducedMotion:'no-preference',
   colorScheme:'light',
   locale:'en-IN',
   serviceWorkers:'block'
  });
  for(const route of routes){
   const name=route.name+'-'+screen.name;
   const row={route:route.path,viewport:screen.name,screenshots:[],status:0,issues:[],consoleErrors:[],requestErrors:[]};
   const page=await context.newPage();
   const responseIssues=[];
   page.on('pageerror',e=>row.consoleErrors.push(String(e.stack||e).slice(0,640)));
   page.on('console',msg=>{if(msg.type()==='error')row.consoleErrors.push(msg.text().slice(0,260));});
   page.on('requestfailed',req=>{const u=req.url();if(u.startsWith(root))row.requestErrors.push({url:u.slice(0,200),reason:req.failure()?.errorText});});
   page.on('response',resp=>{
    // No logged-in session is expected in this public-only QC session.
    if(route.path==='/client/'&&resp.status()===401&&/\/api\/client-portal\/session/.test(resp.url()))return;
    if(resp.status()>=400&&resp.url().startsWith(root)&&responseIssues.length<30)
     responseIssues.push({status:resp.status(),url:resp.url().slice(0,180)});
   });
   try{
    const response=await page.goto(root+route.path,{waitUntil:'domcontentloaded',timeout:35000});
    row.status=response?.status()||0;
    // The privacy dialog legitimately blocks underlying controls until a
    // choice is made. Choose 'Reject optional' in this DISPOSABLE guest
    // browser context; never turn on tracking or submit any project data.
    await page.waitForTimeout(600);
    const reject=page.getByRole('button',{name:/^Reject optional$/i});
    if(await reject.count()) {
      try{
        await reject.click({timeout:4200});
        row.consentChoice='Reject optional (temporary QC session)';
      }catch(e){row.issues.push('Could not dismiss privacy dialog: '+String(e.message||e).slice(0,140));}
    }
    if(route.path==='/') {
      try{await page.locator('#skip').click({timeout:1500});}catch{}
    }
    // A scripted intro, SPA route restoration or the consent modal can move
    // scroll before the page is ready. Take TOP evidence at the real top.
    await page.waitForTimeout(1600);
    await page.evaluate(()=>{
      try{window.VeloryzScroll?.scrollTo?.(0,{immediate:true,force:true});}catch{}
      window.scrollTo({top:0,left:0,behavior:'instant'});
      document.scrollingElement.scrollTop=0;
    });
    await page.waitForTimeout(350);
    row.url=page.url();
    row.probe=await check(page);
    row.probe.scrollY=await page.evaluate(()=>window.scrollY);
    if(route.path==='/'){
      row.probe.activeView=await page.evaluate(()=>document.querySelector('.pg.act')?.getAttribute('data-p')||'none');
      row.probe.homeInitializerFixed=await page.evaluate(()=>{
        const script=[...document.scripts].find(s=>s.textContent?.includes('--vz-menu-stagger'));
        return Boolean(script?.textContent?.includes("$$('#mn a').forEach(function(a,i)"));
      });
      if(!row.probe.homeInitializerFixed)row.issues.push('Production homepage serves obsolete broken menu JS (single-element forEach)');
      if(row.probe.scrollY>24)row.issues.push('Could not reset homepage scroll to top: '+row.probe.scrollY+' px');
      row.probe.homeDesignR9=await page.evaluate(()=>({
        stages:document.querySelectorAll('[data-vz-library-stage]').length,
        active:document.querySelector('.vz-home-design-card.is-active h3')?.textContent?.trim()||'none',
        rail:document.querySelectorAll('[data-vz-library-go],.vz-library-rail').length
      }));
      if(row.probe.homeDesignR9.stages<3)row.issues.push('R9 homepage design stage did not hydrate');
      if(row.probe.homeDesignR9.rail!==0)row.issues.push('Homepage design showcase still contains the obsolete navigation rail');
      row.probe.homeDesignSharp=await page.evaluate(()=>({
        visibleCounters:Boolean(document.querySelector('#vz-library-count,#vz-library-index')),
        scaledPreview:getComputedStyle(document.querySelector('.vz-home-design-card.is-active img')).transform,
        railBlur:(()=>{const rail=document.querySelector('.vz-library-rail');return rail?getComputedStyle(rail).backdropFilter:'none'})()
      }));
      if(row.probe.homeDesignSharp.visibleCounters)row.issues.push('Homepage design showcase still exposes count/index UI');
      if(row.probe.homeDesignSharp.scaledPreview!=='none'&&row.probe.homeDesignSharp.scaledPreview!=='matrix(1, 0, 0, 1, 0, 0)')row.issues.push('Homepage design preview still has a transform that may soften it: '+row.probe.homeDesignSharp.scaledPreview);
      if(row.probe.homeDesignSharp.railBlur&&row.probe.homeDesignSharp.railBlur!=='none')row.issues.push('Homepage design rail still uses backdrop blur');

    }
    if(route.path==='/docs/'){
      const knowledge=await page.evaluate(()=>({root:!!document.querySelector('.k8-shell'),skip:!!document.querySelector('.k8-skip[href="#main"]'),main:!!document.querySelector('main#main'),design:!!document.querySelector('link[href*="veloryz-design-system-r45.css"]')}));
      if(!knowledge.root||!knowledge.skip||!knowledge.main||!knowledge.design)row.issues.push('Knowledge V8 shell, skip link or design system missing');
    }else if(route.path!=='/client/'){
      if(!row.probe.r20Body)row.issues.push('R20 public experience body class missing');
      if(row.probe.experienceRelease!=='public-experience-20261124-r29')row.issues.push('R20 release marker missing or stale: '+row.probe.experienceRelease);
      if(!row.probe.skipLink)row.issues.push('Accessible R20 skip link missing');
    }else if(row.probe.r20Body){
      row.issues.push('R20 public layer leaked into isolated client route');
    }
    if(route.path==='/'){
      row.probe.r20Home=await page.evaluate(()=>({
        primaryLinks:document.querySelectorAll('.vz-home-primary-links a').length,
        createHref:document.querySelector('.vz-hero-cta-main')?.getAttribute('href')||'',
        moreControls:Boolean(document.querySelector('.vz-3d-controls details>summary'))&&['gentle','spin','pause','continue','left','right','front','reset'].every(action=>document.querySelector('.vz-3d-controls [data-logo-action="'+action+'"]')),
        footerCopy:document.querySelector('.footer-living-intro>p')?.textContent?.trim()||'',
        r26Indices:document.querySelectorAll('.vz-r26-section-index').length,
        r27Rail:document.querySelectorAll('.vz-r27-chapter-rail [data-r27-chapter]').length
      }));
      if(row.probe.r20Home.primaryLinks<6||row.probe.r20Home.createHref!=='/create/'||!row.probe.r20Home.moreControls)row.issues.push('R20 homepage navigation/primary CTA/compact 3D controls missing');
      if(row.probe.r20Home.footerCopy.includes('Study Smarter'))row.issues.push('R22 footer still contains stale Study Smarter copy');
      if(row.probe.r20Home.r26Indices<4)row.issues.push('R26 editorial section indexing did not hydrate');
      if(row.probe.r20Home.r27Rail>0)row.issues.push('Retired chapter rail unexpectedly restored');
    }
    if(route.path==='/create/'){
      row.probe.r20Create=await page.evaluate(()=>({
        roadmap:document.querySelectorAll('.v2-create-overview ol>li').length,
        note:document.querySelector('.v4-r20-session-note')?.textContent.includes('browser session')===true
      }));
      if(row.probe.r20Create.roadmap!==5||!row.probe.r20Create.note)row.issues.push('R20 Project Creator roadmap/session guidance missing');
    }
    if(route.path==='/docs/'){
      row.probe.r20Docs=await page.evaluate(()=>({
        outcomes:document.querySelectorAll('.k8-grid .k8-task').length,
        outcomeHrefs:[...document.querySelectorAll('.k8-grid .k8-task')].map(a=>new URL(a.href).pathname.replace(/\.html$|\/$/g,'')),
        search:Boolean(document.querySelector('form[method="get"] .k8-search input[name="q"]'))
      }));
      const expectedDocs=['/help/studio/getting-started','/help/studio/create-project','/docs/pricing','/docs/client-portal','/help/studio/troubleshooting','/trust'];
      if(row.probe.r20Docs.outcomes!==6||JSON.stringify(row.probe.r20Docs.outcomeHrefs)!==JSON.stringify(expectedDocs)||!row.probe.r20Docs.search)row.issues.push('Knowledge V8 task links/search missing');
    }
    if(route.path==='/help/assistant/'||route.path==='/support/'){
      row.probe.r20Help=await page.evaluate(()=>({
        context:Boolean(document.querySelector('.vz-chat-page-head h1'))&&Boolean(document.querySelector('.vz-chat [data-vz-form]')),
        shortcuts:[...document.querySelectorAll('.vz-chat-page-head nav a')].filter(a=>['/docs/','/contact/','/'].includes(a.getAttribute('href'))).length,
        title:document.title
      }));
      if(!row.probe.r20Help.context||row.probe.r20Help.shortcuts<3)row.issues.push('R20.2 Help/Support route identity or shortcuts missing');
      if(route.path==='/help/assistant/'&&!row.probe.r20Help.title.startsWith('Help Centre'))row.issues.push('Help route title is unclear: '+row.probe.r20Help.title);
      if(route.path==='/support/'&&!row.probe.r20Help.title.startsWith('Support'))row.issues.push('Support route title is unclear: '+row.probe.r20Help.title);
    }
    if(route.path==='/design/'){
      row.probe.designR9=await page.evaluate(()=>({
        root:Boolean(document.querySelector('.vz-real-library.vz-r9-market')),
        cards:document.querySelectorAll('.vz-source-card').length,
        motion:Boolean(document.querySelector('[data-source-motion]')),
        price:Boolean(document.querySelector('[data-source-price]')),
        reviews:Boolean(document.querySelector('[data-source-review-trust]')),
        priceNote:Boolean(document.querySelector('.vz-r20-price-note')),
        budgetLabel:[...document.querySelectorAll('.vz-source-toolbar label>span')].some(x=>x.textContent.trim()==='Starting budget (INR)'),
        rightsLabel:document.querySelector('.vz-source-filters')?.getAttribute('aria-label')||''
      }));
      if(!row.probe.designR9.root||row.probe.designR9.cards<12||!row.probe.designR9.motion||!row.probe.designR9.price)row.issues.push('R9 Design Market missing expected renderer/cards/filters');
      if(!row.probe.designR9.priceNote||!row.probe.designR9.budgetLabel||row.probe.designR9.rightsLabel!=='Source availability and usage context')row.issues.push('R20 Design Market language/context missing');
    }
    if(row.status!==200)row.issues.push('HTTP status '+row.status);
    if(row.probe.layout.overflowX>8)row.issues.push('Horizontal overflow: '+row.probe.layout.overflowX+' px');
    if(row.probe.layout.brandActionsOverlap>48)row.issues.push('Header brand overlaps fixed controls: '+row.probe.layout.brandActionsOverlap+' px²');
    if(row.probe.layout.headingVRatio>20)row.issues.push('Headline intersects 3D artwork: '+row.probe.layout.headingVRatio+'% of smaller area');
    if(row.probe.brokenImages.length)row.issues.push('Visible broken image(s): '+row.probe.brokenImages.length);
    const top=name+'-top.png';await snapshot(page,top);row.screenshots.push(top);
    if(route.path==='/'||route.path==='/create/'||route.path==='/design/'){
      await page.evaluate(()=>scrollTo({top:Math.round(innerHeight*.88),behavior:'instant'}));
      await page.waitForTimeout(500);
      const mid=name+'-scroll.png';await snapshot(page,mid);row.screenshots.push(mid);
    }
    if(route.path==='/'){
      const lib=page.locator('#vz-home-library');
      if(await lib.count()){
       await page.evaluate(()=>{const el=document.querySelector('#vz-home-library');scrollTo({top:el.getBoundingClientRect().top+scrollY+20,behavior:'instant'})});
       await page.waitForTimeout(700);
       const first=name+'-design-stage.png';await snapshot(page,first);row.screenshots.push(first);
       const stage=await page.evaluate(()=>{const el=document.querySelector('#vz-home-library');const range=Math.max(1,el.offsetHeight-innerHeight);scrollTo({top:el.getBoundingClientRect().top+scrollY+range*.55,behavior:'instant'});return range});
       await page.waitForTimeout(700);
       row.homeDesignMid=await page.evaluate(()=>document.querySelector('.vz-home-design-card.is-active h3')?.textContent?.trim()||'none');
       const later=name+'-design-stage-mid.png';await snapshot(page,later);row.screenshots.push(later);
       if(stage<1200)row.issues.push('Homepage design-stage scroll range unexpectedly short: '+Math.round(stage)+' px');
      }
      const journey=page.locator('#vz-reference-journey');
      if(await journey.count()){
       await journey.scrollIntoViewIfNeeded();
       await page.waitForTimeout(650);
       row.journey=await page.evaluate(()=>({
        cards:document.querySelectorAll('#vz-reference-journey .vz-journey-stage').length,
        links:[...document.querySelectorAll('#vz-reference-journey .vz-journey-stage')].map(a=>a.getAttribute('href')),
        contrast:getComputedStyle(document.querySelector('#vz-reference-journey .vz-journey-stage:nth-child(2)')).color
       }));
       const journeyShot=name+'-journey.png';await snapshot(page,journeyShot);row.screenshots.push(journeyShot);
       const expected=['/design/','/design/','/design/','/create/','/reviews.html'];
       if(row.journey.cards!==5||JSON.stringify(row.journey.links)!==JSON.stringify(expected))row.issues.push('Project Journey routes/stages differ from R9 contract');
      }
    }
    if(route.path==='/design/'){
      const market=page.locator('#vz-source-collection');
      if(await market.count()){
       await market.scrollIntoViewIfNeeded();
       await page.waitForTimeout(650);
       const marketShot=name+'-marketplace.png';await snapshot(page,marketShot);row.screenshots.push(marketShot);
      }
    }
    if(route.path==='/'){
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(180);
      const menu=page.locator('#mb');
      if(await menu.count()){
        try{
          await menu.click({timeout:5000});
          await page.waitForTimeout(1150);
          row.menu={opened:await menu.getAttribute('aria-expanded'),focusBefore:await page.evaluate(()=>document.activeElement?.tagName)};
          const menuScreenshot=name+'-menu-open.png';
          await snapshot(page,menuScreenshot);row.screenshots.push(menuScreenshot);
          if(row.menu.opened!=='true')row.issues.push('Menu does not set aria-expanded=true');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1050);
          row.menu.closed=await menu.getAttribute('aria-expanded');
          if(row.menu.closed!=='false')row.issues.push('Escape failed to close menu');
        }catch(e){row.issues.push('Menu interaction: '+String(e.message||e).slice(0,150));}
      }else row.issues.push('Home menu button #mb missing');
    }
    row.httpErrors=responseIssues.slice();
    const receiptErrors=responseIssues.filter(e=>new URL(e.url).pathname==='/api/privacy/consent');
    const otherErrors=responseIssues.filter(e=>new URL(e.url).pathname!=='/api/privacy/consent');
    if(receiptErrors.length)row.issues.push('Consent receipt service HTTP '+receiptErrors.map(e=>e.status).join(', '));
    if(otherErrors.length)row.issues.push('HTTP asset/API errors: '+otherErrors.length);
   }catch(error){
    row.issues.push('Page capture failed: '+String(error.message||error).slice(0,350));
    try{await snapshot(page,name+'-failure.png');row.screenshots.push(name+'-failure.png');}catch{}
   }finally{
    result.pages.push(row);
    await page.close().catch(()=>{});
   }
  }
  await context.close();
 }
}catch(e){result.errors.push(String(e.stack||e));}
finally{await browser?.close().catch(()=>{});}
const issueCount=result.pages.reduce((n,p)=>n+p.issues.length,0);
const captured=result.pages.reduce((n,p)=>n+p.screenshots.length,0);
const livePages=result.pages.filter(p=>p.status===200).length;
if(!livePages)result.errors.push('Public site could not be fetched: no page returned HTTP 200. Failure frames are NOT live-site screenshots.');
const report=[
 '# VELORYZ — Public Site Visual QC',
 '',
 'Generated: '+result.generated_at,
 'Public origin: '+root,
 '',
 '> This report contains unauthenticated public-site screenshots only. It does not inspect protected admin screens or database state.',
 '',
 'Pages checked: '+result.pages.length,
 'Screenshots saved: '+captured,
 'Flagged issues: '+issueCount,
 '',
 '| Route | Viewport | HTTP | Horizontal overflow | Heading–V overlap | Header overlap | Findings |',
 '|---|---|---:|---:|---:|---:|---|',
 ...result.pages.map(p=>{
  const l=p.probe?.layout||{};
  return [p.route,p.viewport,p.status,l.overflowX??'-',String(l.headingVRatio??'-')+'%',l.brandActionsOverlap??'-',(p.issues.join('; ')||'No detected issue').replace(/\|/g,'/')].join(' | ').replace(/^/,'| ').replace(/$/,' |');
 }),
 '',
 '## Browser and asset errors',
 ...result.pages.filter(p=>p.consoleErrors.length||p.requestErrors.length).map(p=>
  '- '+p.route+' ('+p.viewport+'): '+p.consoleErrors.slice(0,4).join('; ')+' '+p.requestErrors.slice(0,4).map(e=>e.url).join('; ')
 ),
 ...result.errors.map(e=>'- Fatal capture error: '+e),
 '',
 'The checks are heuristics; screenshot review is needed before accepting a layout as visually correct.'
].join('\n');
await fs.writeFile(path.join(output,'qc-report.md'),report);
await fs.writeFile(path.join(output,'qc-results.json'),JSON.stringify(result,null,2));
console.log('VELORYZ QC: '+result.pages.length+' page/viewport combinations, '+captured+' screenshots, '+issueCount+' flagged issues.');
if(!result.pages.length||result.errors.length)process.exitCode=1;
