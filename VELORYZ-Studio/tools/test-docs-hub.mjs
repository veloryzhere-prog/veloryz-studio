import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const data=JSON.parse(read('public/docs-library.json'));
assert.equal(data.documents.length,11);
assert.equal(new Set(data.documents.map(d=>d.id)).size,11);
for(const item of data.documents){
 const source=read('docs/project-creator/'+item.filename).trim();
 assert.equal(item.markdown.trim(),source,'Published content must match source: '+item.filename);
}
const listeners={},loc={pathname:'/docs/'},root={outerHTML:''};
let hits=0;
const ctx=vm.createContext({
 window:{print(){hits++}},
 location:loc,
 document:{
  addEventListener(type,fn){listeners[type]=fn},
  getElementById(key){return key==='docs-app'?root:null},
  querySelector(){return null},
  querySelectorAll(){return []}
 },
 fetch:async url=>{
  assert.equal(url.startsWith('/docs-library.json'),true);
  hits++;
  return {ok:true,json:async()=>data};
 },
 console
});
vm.runInContext(read('public/docs-hub.js'),ctx);
const hub=ctx.window.VeloryzDocs;
assert(hub);
let html=hub.render();
assert.match(html,/Loading documentation/);
await new Promise(resolve=>setImmediate(resolve));
html=hub.render();
assert.match(html,/Documentation library/);
assert.match(html,/docs-search/);
assert.match(html,/11 guide/);
for(const item of data.documents)assert(html.includes('href="/docs/'+item.id+'/"'));
loc.pathname='/docs/copyright/';
html=hub.render();
assert.match(html,/Copyright/);
assert.match(html,/Section 19/);
assert.match(html,/docs-article/);
assert(!html.includes('<script>'));
assert(html.includes('href="/docs/privacy.html"'));
loc.pathname='/docs/unknown/';
assert(hub.render().includes('Guide not found'));
const app=read('public/app.js'),admin=read('public/admin.js'),shell=read('lib/site-shell.ts'),cms=read('lib/cms-api.mjs');
assert(app.includes("'/docs/':{title:"));
assert(app.includes("VeloryzDocs?.render()"));
assert(app.includes('docsLinks'));
assert(admin.includes('function documentationPage(){'));
assert(admin.includes('documentation:documentationPage'));
assert(cms.includes('site.documentation={'));
assert(shell.indexOf('docs-hub.js')<shell.indexOf('app.js'));
assert(shell.includes('docs-hub.css'));
console.log('PASS: 11 source-identical docs, safe article rendering, search, dynamic routes, CMS editing and script ordering.');
