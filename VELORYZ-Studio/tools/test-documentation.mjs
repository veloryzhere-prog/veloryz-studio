/* VELORYZ documentation release gates — run with node tools/test-documentation.mjs */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { studioDocsRoutes, studioDocsSummaries, studioDocsCategories } from '../lib/studio-docs-routes.mjs';

const root=resolve(import.meta.dirname,'..');
const file=p=>readFileSync(resolve(root,p),'utf8');
const json=p=>JSON.parse(file(p));
const full=json('public/studio-docs-catalog.json');
const index=json('public/studio-docs-index.json');
const service=json('public/docs-library.json');
const norm=p=>p.replace(/\/+$/,'')||'/';
const topic=a=>a.category.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
assert.equal(full.articles.length,141,'Full handbook needs 141 product/help routes');
assert.equal(index.articles.length,141,'Navigation index needs 141 product/help routes');
assert.equal(service.documents.length,11,'The original Studio service guides must be preserved');
assert.equal(full.articles.filter(x=>x.id.startsWith('H-')).length,20,'Help Centre count');
assert.equal(full.articles.filter(x=>x.id.startsWith('D-')).length,121,'Studio docs count');
assert.equal(new Set(full.articles.map(x=>x.id)).size,141,'Duplicate documentation IDs');
assert.equal(new Set(full.articles.map(x=>norm(x.path))).size,141,'Duplicate paths');
assert.deepEqual(index.articles.map(x=>x.id),full.articles.map(x=>x.id),'Index order and content order must agree');
const chapters=new Map();
for(const a of full.articles){
 assert.match(a.path,/^\/(?:docs|help)\/studio(?:\/[a-z0-9-]+)*\/$/);
 assert.ok(a.markdown.length>=4500,'Article too short: '+a.id);
 assert.ok(a.markdown.includes('## Topic-specific operating procedure'),'Missing subject-specific instructions: '+a.id);
 assert.ok(a.markdown.includes('## Troubleshooting and recovery'),'Missing recovery guidance: '+a.id);
 assert.ok(!a.markdown.includes('**Documentation status:** Product documentation blueprint.'),'Blueprint placeholder in '+a.id);
 assert.notEqual(a.status,'blueprint','Old editorial status for '+a.id);
 assert.equal(studioDocsRoutes[norm(a.path)],a.title,'Server route title not registered: '+a.path);
 assert.equal(studioDocsSummaries[norm(a.path)],a.summary,'SEO description does not match '+a.id);
 assert.equal(studioDocsCategories[norm(a.path)],a.category,'SEO category missing '+a.id);
 const indexRecord=index.articles.find(x=>x.id===a.id);
 assert.equal(indexRecord.categorySlug,topic(a),'Topic file index mismatch: '+a.id);
 if(!chapters.has(indexRecord.categorySlug))chapters.set(indexRecord.categorySlug,[]);
 chapters.get(indexRecord.categorySlug).push(a);
}
assert.equal(chapters.size,19,'Expected 19 documentation categories');
for(const [name,entries] of chapters){
 const p='public/studio-docs-content/'+name+'.json';
 assert.ok(existsSync(resolve(root,p)),'Missing lazy-loaded chapter '+name);
 const chunk=json(p);
 assert.equal(chunk.category,name,'Chapter slug mismatch: '+name);
 assert.deepEqual(chunk.articles.map(x=>x.id),entries.map(x=>x.id),'Article order mismatch: '+name);
 for(const chapter of chunk.articles){
  const original=entries.find(x=>x.id===chapter.id);
  assert.equal(chapter.markdown,original.markdown,'Chapter content drift: '+chapter.id);
 }
}
const staticRoutes=['/','/docs/','/docs/studio/','/help/studio/','/sitemap/','/sitemap.xml','/create/','/pricing/','/book/','/contact/','/client/','/developers/','/design/','/motion/','/work/','/services/','/studio/','/teamjob/','/payments/','/veloryz/','/process/','/journey/'];
const known=new Set([...staticRoutes,...full.articles.map(a=>a.path),...service.documents.map(d=>'/docs/'+d.id+'/')].map(norm));
const missing=[];
for(const entry of [...full.articles,...service.documents]){
 for(const m of String(entry.markdown).matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)){
  const target=m[1].split('#')[0];
  if(target.startsWith('/')&&!known.has(norm(target)))missing.push(entry.id+' → '+target);
 }
}
assert.deepEqual(missing,[],'Documentation contains broken internal links');
const app=file('public/app.js');
assert.ok(app.includes('https://veloryz.online/docs'),'Useful Links target must be VELORYZ docs');
assert.ok(!app.includes('https://chat.veloryz.online/us#veloryz'),'Old Useful Links target must be removed');
for(const p of ['/docs/','/docs/studio/','/help/studio/','/sitemap/','/sitemap.xml'])assert.ok(app.includes(p),'Footer missing '+p);
const server=file('lib/page-handler.ts');
assert.ok(server.includes('studioDocsRoutes')&&server.includes('studioDocsSummaries'),'Server must register documentation routes and metadata');
assert.ok(server.includes("normal==='/sitemap.xml'"),'XML sitemap route missing');
assert.ok(server.includes('visible===false')&&server.includes('delete pages[p]'),'CMS-hidden pages must not enter sitemap');
assert.ok(server.includes('window.STUDIO_STATE'),'CMS initial state missing');
assert.ok(server.includes('app\\.js'),'CMS initial state must match cache-busted app JS');
for(const path of ['public/docs-hub.js','public/docs-studio.js','public/site-map.js','public/admin-docs.js','public/app.js','public/admin.js']){
 try{new Function(file(path));}catch(e){throw new Error('Invalid browser JavaScript in '+path+': '+e.message)}
}
const hub=file('public/docs-hub.js'),reader=file('public/docs-studio.js'),sitemap=file('public/site-map.js');
for(const choice of ["kind:'help'","kind:'studio'","kind:'all'"])assert.ok(hub.includes(choice),'Three-way docs portal missing '+choice);
assert.ok(hub.includes('docs-choice-'+"c.kind"),'Three-way docs cards must render CSS variants');
assert.ok(hub.includes('data-doc-more'),'Public doc directory is not paginated');
assert.ok(reader.includes('ensureChapter')&&reader.includes('studio-docs-index.json'),'Lazy article loading missing');
assert.ok(reader.includes('data-studio-doc-print')&&reader.includes('ON THIS PAGE'),'Article actions/TOC missing');
assert.ok(sitemap.includes('site-map-app')&&sitemap.includes('studio-docs-index.json'),'Human sitemap missing');
for(const stylesheet of ['public/docs-hub.css','public/docs-studio.css','public/site-map.css'])assert.ok(file(stylesheet).includes('prefers-reduced-motion'),'Reduced motion handling missing: '+stylesheet);
console.log('Documentation quality checks passed: 141 Studio/Help articles, 11 service guides, 19 lazy chapters, working internal links, site map, accessible UI and CMS wiring.');


/* Living Blueprint design-contract tests: browser-script syntax + functional route output. */
const ui=file('public/knowledge-v4.js');
const design=file('public/knowledge-v4.css');
assert.doesNotThrow(()=>new Function(ui),'Living Blueprint browser script must parse');
assert.ok(file('lib/site-shell.ts').includes('knowledge-v4.js?v=20261121-multi-agent-v3'),'Design script not loaded');
assert.ok(file('lib/site-shell.ts').includes('knowledge-v4.css?v=20261121-living-blueprint-v4'),'Design stylesheet not loaded');
assert.ok(app.includes("['/docs/','Docs']"),'Top navigation must use only Docs label');
const header=app.slice(app.indexOf('function header(){'),app.indexOf('function footer(){'));
assert.ok(!header.includes('Useful Links'),'Header must not duplicate Docs with Useful Links');
const footer=app.slice(app.indexOf('function footer(){'),app.indexOf('function motionGlyph(){'));
assert.ok(footer.includes("['https://veloryz.online/docs','Useful Links']"),'Useful Links should remain available in footer');
assert.ok(footer.includes('footer-knowledge-index'),'Footer must have expandable complete article index');
for(const link of ['/docs/studio/','/help/studio/','/sitemap/','/sitemap.xml','/docs/privacy/','/docs/copyright/'])assert.ok(footer.includes(link),'Footer directory link missing '+link);
assert.ok(ui.includes('data-kb-map-zoom')&&ui.includes('data-kb-map-node')&&ui.includes('data-kb-map-filter'),'Site-map zoom and node interactions missing');
assert.ok(ui.includes('data-kb-search')&&ui.includes('kb-command-input'),'Command search UI is missing');
assert.ok(ui.includes('kb-reader-progress')&&ui.includes('kb-reader-rail-collapsed'),'Reading progress / collapsible sidebar missing');
assert.ok(design.includes('prefers-reduced-motion'),'UI must respect reduced-motion settings');
assert.ok(design.includes('@media(max-width:520px)'),'Mobile design breakpoint missing');

const mockListeners=new Map();
const mockDocument={
 addEventListener(name,fn){mockListeners.set(name,fn)},
 getElementById(){return null},
 querySelector(){return null},
 querySelectorAll(){return []}
};
const mockLocation={pathname:'/docs/',href:'https://veloryz.online/docs/'};
const mockWindow={
 VeloryzDocs:{render:()=>'<div id="docs-app">existing article reader</div>'},
 VeloryzSiteMap:{render:()=>'<div id="site-map-app">existing site map</div>'},
 addEventListener(){}
};
const fetchMock=async path=>({ok:true,json:async()=>path.includes('studio-docs-index.json')?index:service});
new Function('window','document','fetch','location','studioCMS',ui)(
 mockWindow,mockDocument,fetchMock,mockLocation,{site:{documentation:{edits:{}}}}
);
assert.match(mockWindow.VeloryzDocs.render(),/Opening the knowledge system/,'Loading feedback must appear');
await new Promise(resolve=>setImmediate(resolve));
const home=mockWindow.VeloryzDocs.render();
assert.equal((home.match(/class="kb-feature kb-feature-/g)||[]).length,3,'Three primary Docs destinations required');
assert.match(home,/kb-sidebar/,'Documentation workspace sidebar missing');
assert.match(home,/data-kb-search/,'Prominent search trigger missing');
mockLocation.pathname='/help/studio/';
const help=mockWindow.VeloryzDocs.render();
assert.match(help,/How can we/,'Support hero missing');
assert.equal((help.match(/class="kb-help-topic kb-help-topic-/g)||[]).length,8,'Support quick-find cards missing');
assert.match(help,/kb-faq-list/,'FAQ section missing');
mockLocation.pathname='/docs/studio/';
const studio=mockWindow.VeloryzDocs.render();
assert.equal((studio.match(/class="kb-studio-category"/g)||[]).length,18,'Studio category explorer incomplete');
mockLocation.pathname='/sitemap/';
const visualMap=mockWindow.VeloryzSiteMap.render();
assert.equal((visualMap.match(/data-kb-map-node=/g)||[]).length,4,'Interactive site map cluster count');
assert.match(visualMap,/\/help\/studio\/create-project\//,'Help articles absent from human sitemap');
assert.match(visualMap,/\/docs\/studio\/seo\/indexing\//,'Studio articles absent from human sitemap');
mockLocation.pathname='/docs/studio/seo/indexing/';
assert.match(mockWindow.VeloryzDocs.render(),/existing article reader/,'Existing content reader must remain intact');
console.log('Living Blueprint visual routing passed: docs, help, Studio topics, searchable network, full footer and existing articles.');


/* Uploaded Figma Make source, original SVG library and human-friendly XML sitemap checks. */
const figmaCSS=file('public/knowledge-figma.css');
assert.ok(file('lib/site-shell.ts').includes('knowledge-figma.css?v=20261121-source-figma-1'),'Figma visual stylesheet is not loaded');
assert.ok(figmaCSS.includes('#f8f9f7')&&figmaCSS.includes('#111c32')&&figmaCSS.includes('#23bde6')&&figmaCSS.includes('#4267e8'),'Figma source palette changed unexpectedly');
assert.ok(figmaCSS.includes('prefers-reduced-motion'),'Original motion system requires reduced-motion support');
assert.ok(ui.includes('Main-Dark-Ink-Transparent.webp'),'Original brand logo must remain in the documentation experience');
assert.ok(!ui.includes('aria-label="VELORYZ logo placeholder"'),'Generic Figma placeholder logo is forbidden');
assert.ok(ui.includes('kb-service-toc')&&ui.includes('kb-reader-progress'),'Article navigation and reading progress missing');
const assets=json('public/assets/future-assets/catalog.json');
assert.equal(assets.length,100,'All 100 original future assets must exist');
assert.equal(new Set(assets.map(x=>x.id)).size,100,'SVG catalog IDs must be unique');
for(const item of assets){
 assert.match(item.path,/^\.\/[a-z]+\/[a-z0-9-]+\.svg$/,'Asset path is not safe: '+item.path);
 const path='public/assets/future-assets/'+item.path.slice(2);
 assert.ok(existsSync(resolve(root,path)),'Missing imported Figma asset '+item.path);
 const svg=file(path);
 assert.ok(svg.startsWith('<svg ')&&svg.includes('prefers-reduced-motion:reduce'),'Imported SVG is invalid or lacks reduced-motion support: '+item.path);
}
const xsl=file('public/sitemap.xsl');
assert.ok(xsl.startsWith('<?xml version="1.0"'),'XSL must be valid XML');
assert.ok(xsl.includes('<xsl:stylesheet')&&xsl.includes('match="/"')&&xsl.includes('sm:urlset/sm:url'),'XML site map view must list all public routes');
assert.ok(xsl.includes('Main-Dark-Ink-Transparent.webp'),'Branded sitemap XSL must use the original VELORYZ wordmark');
assert.ok(server.includes('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'),'XML route must associate the readable XSL stylesheet');
assert.ok(server.includes('http://www.sitemaps.org/schemas/sitemap/0.9'),'XML sitemap must retain crawler-compliant namespace');
console.log('Figma source integration checks passed: exact 100-asset library, official logo, article reader and styled XML sitemap.');
