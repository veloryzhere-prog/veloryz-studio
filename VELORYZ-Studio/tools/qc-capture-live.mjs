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
 {name:'client-login',path:'/client/'}
];
const screens=[
 {name:'desktop',width:1440,height:900},
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
   headline:box(document.querySelector('#h1,.hero h1,.page-intro h1')),
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
   menuRelease:$('link[href*="reference-menu-morph-r6.css"]')?.href||'not found',
   qcStyle:$('link[href*="reference-qc-layout-r7.css"]')?.href||'not found'};
 });
}
try {
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
    if(responseIssues.length)row.issues.push('HTTP asset errors: '+responseIssues.length);
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
