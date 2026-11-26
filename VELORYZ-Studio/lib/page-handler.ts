import { env } from 'cloudflare:workers';
import siteShell from './site-shell';
import claudeReferenceShell from './claude-reference-shell';
import {renderIndexableBody} from './search-index-content';
import {renderHtmlDocument} from './docs-server-html';
import {knowledgeResponse,knowledgeRoutes,knowledgeCanonical} from './knowledge-v8';
import clientPortalShell from './client-portal-shell';
import adminShell from './admin-shell';
import {findDesignPreview,renderDesignPreview,renderDesignFullPreview} from './design-detail-page';
import {renderDesignNoticesPage} from './design-notices-page';
import {serveDesignAsset} from './design-asset-proxy';
import {serveDesignImage} from './design-image-proxy';
import openDesigns from '../public/veloryz-open-designs.json' with { type: 'json' };
import { renderReviewsPage } from './reviews-page';
import { renderRoadmapPage } from './roadmap-page';
import { secureHtml,pageMetadata } from './response-security';
import { publicOrigin,canonicalPath } from './site-origin.mjs';
import { getPublished, handleApi } from './cms-api.mjs';
import { studioDocsRoutes, studioDocsSummaries, studioDocsCategories } from './studio-docs-routes.mjs';
export const dynamic = 'force-dynamic';
const isDocumentPath=(p:string)=>p==='/docs'||p.startsWith('/docs/')||p==='/help/studio'||p.startsWith('/help/studio/');
const htmlDocumentPath=(p:string)=>{
 const base=canonicalPath(p);
 return Object.hasOwn(knowledgeRoutes,base)?knowledgeCanonical(base):isDocumentPath(base)?(base==='/docs'||base==='/docs/studio'||base==='/help/studio'?base+'/index.html':base+'.html'):base;
};
const serialise = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export async function GET(request: Request) {
 const path=new URL(request.url).pathname;
 const assetResponse=await serveDesignAsset(request);
 if(assetResponse)return assetResponse;
 const designImage=await serveDesignImage(request);
 if(designImage)return designImage;
 if(path==='/legal/design-notices'||path==='/legal/design-notices/')return secureHtml(renderDesignNoticesPage(),200,true);
 // Owner-supplied editorial reference experience becomes the public homepage.
 // Keep the existing SPA available with ?classic=1 for account/project workflows.
 // All admin, documentation, client, pricing and creator endpoints retain their original handlers.
 if(path==='/'&&new URL(request.url).searchParams.get('classic')!=='1'){
  const published=await getPublished(env,request.url);
  const site=published.state.site;
  const appearance={
   site:{name:site.name,email:site.email,phone:site.phone,location:site.location,description:site.description,showScarf:site.showScarf},
   services:(published.state.services||[]).filter((x:any)=>x&&x.name).slice(0,5)
    .map((x:any)=>({name:x.name,short:x.short,description:x.description,tags:x.tags})),
   // Public #design is a VELORYZ-curated gallery of REAL local upstream templates.
   // The old CMS inspiration cards remain editable in Admin but no longer fill this section.
   catalogue:[
    'os-portfolio-and-agencies-8b-creative-agency',
    'os-portfolio-and-agencies-8b-design-studio',
    'os-grocery-and-delivery-8b-restaurant-site',
    'os-dashboards-and-saas-lumen-cinematic-ai-saas',
    'os-portfolio-and-agencies-8b-architecture',
    'os-grocery-and-delivery-grilli-restaurant',
    'os-publishing-and-blogs-wren-editorial',
    'os-dashboards-and-saas-volt-arc-product-landing',
    'os-portfolio-and-agencies-8b-coworking',
    'os-template-libraries-start-bootstrap-agency',
    'os-template-libraries-start-bootstrap-freelancer'
   ].map(id=>openDesigns.items.find(item=>item.id===id)).filter((item):item is (typeof openDesigns.items)[number]=>Boolean(item))
    .map(item=>({id:item.id,name:item.name,description:item.description,category:item.category,
      image:item.previewImage?'/studio-preview-images/'+item.id:'',fallbackImage:item.previewImage||'',price:item.price,enabled:true,author:item.author})),
   documentation:Object.entries(studioDocsRoutes).map(([url,title])=>({url:htmlDocumentPath(url),title}))
  };
  const base=publicOrigin(env.PUBLIC_SITE_URL||env.STUDIO_PUBLIC_URL,new URL(request.url).origin,import.meta.env.DEV);
  let html=claudeReferenceShell.replace('</head>',`<script>window.VELORYZ_REFERENCE_DATA=${serialise(appearance)};</script></head>`);
  // Respect the existing CMS switch for the original scarf without showing an unwanted film.
  if(site.showScarf===false)html=html.replace(/<section class="vz-reference-scarf"[\s\S]*?<\/section>/,'');
  html=pageMetadata(html,{title:'VELORYZ Studio | Website Design, Development & Creative Technology',
   description:'VELORYZ Studio builds thoughtful websites, visual identities, digital products and creative motion experiences.',
   url:base+'/',image:base+'/assets/brand/official/Main-Transparent.webp',site});
  const response=secureHtml(html,200);
  if(!import.meta.env.DEV&&base!==new URL(request.url).origin)response.headers.set('X-Robots-Tag','noindex, nofollow');
  return response;
 }
 // Google Search Console ownership token. Respond with the uploaded file's exact
 // content before the site CMS / SPA fallback, without redirecting or wrapping it.
 if(path==='/googleb802659617480672.html')return new Response('google-site-verification: googleb802659617480672.html',{
  status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}
 });
 if(path==='/reviews.html'||path==='/reviews'||path==='/reviews/')return secureHtml(renderReviewsPage(),200);
 if(path==='/roadmap.html'||path==='/roadmap'||path==='/roadmap/')return secureHtml(renderRoadmapPage(),200);
 if(path==='/.well-known/security.txt')return new Response('Contact: mailto:veloryz.here@gmail.com\nExpires: 2027-11-22T00:00:00Z\nPreferred-Languages: en\nCanonical: https://veloryz.online/.well-known/security.txt\n',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public,max-age=86400','X-Content-Type-Options':'nosniff'}});
 if(path==='/admin/reviews.html')return new Response(null,{status:302,headers:{Location:new URL('/admin/#/reviews',request.url).toString(),'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});
 if(path==='/client'||path==='/client/')return secureHtml(clientPortalShell,200,true);
 // Immersive first-party VELORYZ preview: no outer-page scrolling, so original
 // scroll-driven motion runs inside the actual source site's own document.
 const previewMatch=path.match(/^\/design\/([a-z0-9-]+)\/preview\/?$/);
 if(previewMatch){
  const design=findDesignPreview(previewMatch[1]);
  if(!design)return new Response('Preview not available',{status:404});
  return secureHtml(renderDesignFullPreview(design),200,true);
 }
 // Full VELORYZ project detail page with independent real-site preview.
 const designMatch=path.match(/^\/design\/([a-z0-9-]+)(?:\/|\/index\.html)?$/);
 if(designMatch){
  // The 110 indexed sites and 12 Studio originals must never depend on CMS availability.
  const staticDesign=findDesignPreview(designMatch[1]);
  if(staticDesign)return secureHtml(renderDesignPreview(staticDesign),200,true);
  // Retain historic CMS links without publishing the old inspirations in the new catalogue.
  try{
   const published=await getPublished(env,request.url);
   const design=findDesignPreview(designMatch[1],published.state.catalogue||[]);
   if(design)return secureHtml(renderDesignPreview(design),200,true);
  }catch{/* A temporary CMS outage must not affect static design routes. */}
  return new Response('Design not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
 }

 if(import.meta.env.DEV&&path==='/_studio_preview/production'){
  const data=await getPublished(env),view=new URL(request.url).searchParams.get('view')||'home';
  const views:Record<string,string>={home:'/',work:'/work/',design:'/design/',studio:'/studio/',book:'/book/',create:'/create/',pricing:'/pricing/',developers:'/developers/'};
  const route=views[view]||'/';
  const html=siteShell.replace(/<script src="\/app\.js(?:\?[^"]*)?" defer><\/script>/,match=>`<script>window.STUDIO_STATE=${serialise({...data,preview:true})};window.STUDIO_PREVIEW_ROUTE=${serialise(route)};</script>${match}`);
  return secureHtml(html,200,true,true);
 }

 if(import.meta.env.DEV&&path==='/_studio_preview/mobile'){
  const params=new URL(request.url).searchParams,width=params.get('width')==='320'?320:390;
  const pages:Record<string,string>={home:'/',work:'/work/',live:'/_studio_preview/production',design:'/design/',create:'/create/',book:'/book/',pricing:'/pricing/',payments:'/payments/',developers:'/developers/',admin:'/_studio_preview/admin'};
  const src=pages[params.get('page')||'design']||pages.design;
  return secureHtml(`<!doctype html><html><head><title>Responsive studio preview</title><style>body{margin:0;background:#ddd8cd;display:grid;place-items:center;padding:25px;font-family:system-ui}p{font-size:12px}iframe{width:${width}px;height:780px;border:1px solid #bbb3a4;background:#faf9f6;box-shadow:0 12px 50px #6b5d3833}</style></head><body><p>LOCAL RESPONSIVE QA / ${width}px / ${src}</p><iframe id="responsive-preview" title="Responsive site preview" src="${src}"></iframe></body></html>`,200,true);
 }
 if(import.meta.env.DEV&&path==='/_studio_preview/unlock')return secureHtml(adminShell.replace(/<script src="\/admin\.js(?:\?[^"]*)?" defer><\/script>/,'<script>window.ADMIN_UNLOCK_PREVIEW=true;</script><script src="/admin.js" defer></script>'),200,true);
 if(path==='/admin/preview'){
  const apiRequest=new Request(new URL('/api/admin/state',request.url),{headers:request.headers});
  const result=await handleApi(apiRequest,env,'password');
  if(!result.ok)return secureHtml(adminShell,200,true);
  const data=await result.json() as {state:unknown};
  return secureHtml(siteShell.replace(/<script src="\/app\.js(?:\?[^"]*)?" defer><\/script>/,match=>`<script>window.STUDIO_STATE=${serialise({state:data.state,version:-1,preview:true})};</script>${match}`).replace(/<body[^>]*>/,match=>match+'<a href="/admin" class="draft-preview-note">DRAFT PREVIEW · Return to Studio Control ↗</a>'),200,true);
 }
 if(path==='/admin'||path.startsWith('/admin/'))return secureHtml(adminShell,200,true);
 if(import.meta.env.DEV&&path==='/_studio_preview/admin'){
  const data=await getPublished(env);
  return secureHtml(adminShell.replace(/<script src="\/admin\.js(?:\?[^"]*)?" defer><\/script>/,()=>`<script>window.ADMIN_VISUAL_PREVIEW=true;window.ADMIN_INITIAL_STATE=${serialise({state:data.state,draftVersion:0,publishedVersion:0,user:{name:'Aryan Raj Singh'},hasDraft:false})};</script><script src="/admin.js" defer></script>`),200,true);
 }
 if(import.meta.env.DEV&&path==='/_studio_preview/campaign'){
  const data=await getPublished(env);
  data.state.offers=[{id:'visual-preview',title:'Your next idea deserves a good beginning.',eyebrow:'STUDIO CAMPAIGN PREVIEW',body:'A clean introduction for your next launch, announcement or offer. This campaign is a local design preview.',kind:'announcement',media:'',mediaType:'none',buttonLabel:'Talk to the studio',buttonUrl:'/contact/',enabled:true,startAt:'',endAt:'',priority:50}];
  data.state.offers.push({...data.state.offers[0],id:'preview-pin',title:'A new chapter, pinned above everything.',body:'This is a local preview of a site-wide message.',placement:'pinned',logo:'/assets/favicon.svg',logoLink:'/',theme:'gold',priority:100,buttonLabel:'Explore designs',buttonUrl:'/design/'},{...data.state.offers[0],id:'preview-ad',title:'Consider your next direction.',body:'A composed advertisement with original motion, your logo and two destinations. Local design preview.',kind:'ad',placement:'inline',theme:'dark',animation:'ribbon',logo:'/assets/favicon.svg',buttonLabel:'Discover the designs',buttonUrl:'/design/',secondaryLabel:'Book a conversation',secondaryUrl:'/book/'});
  data.state.offers.push({...data.state.offers[0],id:'preview-slider',kind:'ad',placement:'slider',title:'Explore the studio’s design directions',buttonLabel:'Browse designs',buttonUrl:'/design/'},{...data.state.offers[0],id:'preview-slider-two',kind:'ad',placement:'slider',title:'Meet the people behind the work',buttonLabel:'Meet the team',buttonUrl:'/teamjob/'});
  return secureHtml(siteShell.replace(/<script src="\/app\.js(?:\?[^"]*)?" defer><\/script>/,match=>`<script>window.STUDIO_STATE=${serialise({...data,preview:true})};</script>${match}`),200,true);
 }
 const data=await getPublished(env,request.url);
 const base=publicOrigin(env.PUBLIC_SITE_URL||env.STUDIO_PUBLIC_URL,new URL(request.url).origin,import.meta.env.DEV),normal=path.replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/+$/,'')||'/';
 const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const people=[{name:data.state.site.founderName,slug:slug(data.state.site.founderName)},...data.state.team];
 const pages:Record<string,string>={'/':'Built to be remembered.','/docs':'Documentation & studio guides','/sitemap':'Site map','/help/assistant':'Help Centre AI','/support':'Contact Support AI','/report-bug':'Report a Bug','/design':'Design library','/designs':'Design library','/pricing':'Pricing & scope','/create':'Create a project','/book':'Book a discovery call','/developers':'APIs & integrations','/veloryz':'The VELORYZ platform','/payments':'Project payments','/work':'Selected work','/journey':'From idea to experience','/motion':'Interactive motion playground','/motion-hub':'Motion Hub','/founder':'Founder — Aryan Raj','/process':'Project process & delivery standards','/services':'Design & development services','/studio':'The studio','/velori':'VELORI — A VELORYZ product','/contact':'Contact the studio','/privacy':'Privacy policy','/cookies':'Cookie and storage policy','/terms':'Website terms','/privacy/choices':'Privacy rights and preferences','/teamjob':'The studio collective','/concepts/aurel':'AUREL Atelier — Studio concept','/concepts/orbit':'ORBIT Workspace — Studio concept','/concepts/forme':'FORME Objects — Studio concept'};
 for(const person of people)pages['/teamjob/'+(person.slug||slug(person.name))]=person.name+' — Studio profile';
 for(const document of ["overview","experience","architecture","project-ai","pricing","client-portal","privacy","copyright","quality","troubleshooting","communications"])pages['/docs/'+document]='VELORYZ '+document.replace(/-/g,' ')+' documentation';
 for(const [docPath,docTitle] of Object.entries(studioDocsRoutes))pages[docPath]=docTitle;
 Object.assign(pages,knowledgeRoutes);
 const docEdits=data.state.site.documentation?.edits||{};
 for(const [rawPath,edit] of Object.entries(docEdits)){
  const p=rawPath.replace(/\/+$/,'')||'/';
  if(!Object.hasOwn(pages,p))continue;
  if((edit as {visible?:boolean}).visible===false)delete pages[p];
  else if((edit as {title?:string}).title)pages[p]=(edit as {title:string}).title;
 }
 if(normal==='/robots.txt')return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /client\nDisallow: /api/\nDisallow: /_studio_preview/\nSitemap: ${base}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public,max-age=300','X-Content-Type-Options':'nosniff'}});
 if(normal==='/sitemap.xml'){
  const escapeXml=(v:string)=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const urls=[...new Set([...Object.keys(pages).filter(p=>!['/designs','/client'].includes(p)),'/reviews.html','/roadmap.html'])].sort().map(p=>{
   const href=base+canonicalPath(p);
    const finalHref=isDocumentPath(p)?base+htmlDocumentPath(p):href;
   return `<url><loc>${escapeXml(finalHref)}</loc></url>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public,max-age=300','X-Content-Type-Options':'nosniff'}});
 }
 const knowledge=knowledgeResponse(request,normal,docEdits,base);
 if(knowledge){if(!import.meta.env.DEV&&base!==new URL(request.url).origin)knowledge.headers.set('X-Robots-Tag','noindex, nofollow');return knowledge;}
 const routeDescriptions:Record<string,string>={
  '/':'VELORYZ Studio designs and develops thoughtful websites, product interfaces, identity systems and digital experiences from India, collaborating across Asia.',
  '/help/assistant':'Chat with the VELORYZ AI Help Assistant, grounded in official public documentation.',
  '/support':'Contact VELORYZ Studio support AI for guidance and the correct human support channel.',
  '/report-bug':'Report website issues using editable examples and a real, private VELORYZ Studio Control bug report with a reference number.',
  '/docs':'Find the complete VELORYZ Studio Help Centre, product documentation, services, security, copyright and project workflow guides.',
  '/sitemap':'Search the full VELORYZ website, the Studio documentation, Help Centre and every available public reference.',
  '/work':'Explore VELORYZ Studio original products, work in progress and clearly identified visual concept studies, with transparent project status.',
  '/services':'Explore VELORYZ Studio services across custom websites, product interfaces, brand identity, backend systems and motion design.',
  '/design':'Browse curated website design references and transparent adaptation estimates. Source attribution is shown for third-party references.',
  '/pricing':'Review VELORYZ Studio starting prices, project-scope assumptions and a pathway to a tailored written proposal.',
  '/create':'Plan your next website or digital product, review an illustrative budget range and prepare a project brief.',
  '/book':'Request a VELORYZ Studio discovery conversation. Preferred dates are requests until the studio confirms availability.',
  '/contact':'Contact VELORYZ Studio in India, about websites, design, software and digital projects.',
  '/developers':'Explore practical web development, APIs, integration design, protected systems and backend delivery approaches.',
  '/studio':'Meet VELORYZ Studio and explore its design, development and creative direction team.',
  '/privacy':'Read how VELORYZ Studio uses enquiry, client, AI and browser preference data, and how to request correction or deletion.',
  '/cookies':'Review necessary and optional browser storage, cookie choices and consent settings.',
  '/terms':'Read VELORYZ Studio website terms, project agreement principles and cancellation and refund guidance.',
  '/privacy/choices':'Manage browser consent, local measurement and privacy access, deletion and opt-out requests.'
 };
 const known=Object.hasOwn(pages,normal);
 let html=siteShell.replace(/<script src="\/app\.js(?:\?[^"]*)?" defer><\/script>/,match=>`<script>window.STUDIO_STATE=${serialise(data)};</script>${match}`);
 if(['/design','/designs','/create'].includes(normal))html=html.replace('</head>',`<script>window.VELORYZ_OPEN_DESIGNS=${serialise(openDesigns.items.filter(item=>item.enabled!==false))};</script></head>`);
 const override=docEdits[normal] as {title?:string;summary?:string;visible?:boolean}|undefined;
 const description=(override?.summary||(studioDocsSummaries as Record<string,string>)[normal]||routeDescriptions[normal]||data.state.site.description).slice(0,300);
 const pageTitle=normal==='/'?'VELORYZ Studio | Website Design, Development & Creative Technology':(pages[normal]||'Page not found')+' — VELORYZ Studio';
 html=pageMetadata(html,{title:pageTitle,description,url:base+htmlDocumentPath(normal),image:base+'/assets/brand/official/VELORYZ-Social-1200x630.jpg',site:data.state.site});
 // The initial HTML must already contain readable page content. Once JS loads
 // the SPA replaces this same <main>, preserving the existing motion experience.
 const actualDocument=isDocumentPath(normal)?renderHtmlDocument(normal,docEdits):'';
  if(actualDocument)html=html.replace('</head>','<link rel="stylesheet" href="/docs-server.css"><link rel="stylesheet" href="/reference-global-theme.css?v=20261122-docs-v2"></head>');
  if(known)html=html.replace('<main id="main" tabindex="-1"></main>',
   '<main id="main" tabindex="-1">'+(actualDocument||renderIndexableBody(normal,pages[normal],description))+'</main>');
 // Use the actual official brand name; misspellings are explained in visible
 // Studio content, never masquerading as registered alternate organisation names.
 if(known){
  const brand={'@context':'https://schema.org','@type':'WebSite','@id':base+'/#website',
   name:'VELORYZ Studio',alternateName:['VELORYZ','Veloryz Studio'],url:base+'/',
   publisher:{'@id':base+'/#organization'}};
  html=html.replace('</head>','<script type="application/ld+json">'+serialise(brand)+'</script></head>');
 }
 if(known&&(normal==='/sitemap'||normal.startsWith('/docs/')||normal.startsWith('/help/studio/')||normal==='/docs')){
  const crumbs=[{name:'VELORYZ Studio',item:base+'/'}];
  if(normal==='/sitemap')crumbs.push({name:'Site map',item:base+'/sitemap/'});
  else {
   crumbs.push({name:'Documentation',item:base+'/docs/index.html'});
   if(normal.startsWith('/docs/studio'))crumbs.push({name:'Studio documentation',item:base+'/docs/studio/index.html'});
   if(normal.startsWith('/help/studio'))crumbs.push({name:'Help Centre',item:base+'/help/studio/index.html'});
   const current=pages[normal]||'Documentation';
   const at=base+htmlDocumentPath(normal);
   if(crumbs[crumbs.length-1].item!==at)crumbs.push({name:current,item:at});
  }
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:c.item}))};
  const structured:Record<string,unknown>[]=[breadcrumb];
  if((studioDocsRoutes as Record<string,string>)[normal]||normal.startsWith('/docs/')&&normal!=='/docs/studio'){
   structured.push({'@context':'https://schema.org','@type':normal.startsWith('/help/')?'Article':'TechArticle',headline:pages[normal],description,articleSection:(studioDocsCategories as Record<string,string>)[normal]||'Documentation',publisher:{'@type':'Organization',name:'VELORYZ Studio'},mainEntityOfPage:base+htmlDocumentPath(normal)});
  }
  html=html.replace('</head>',`<script type="application/ld+json">${serialise(structured)}</script></head>`);
 }
 const response=secureHtml(html,known?200:404);
 if(!import.meta.env.DEV&&base!==new URL(request.url).origin)response.headers.set('X-Robots-Tag','noindex, nofollow');
 return response;
}
