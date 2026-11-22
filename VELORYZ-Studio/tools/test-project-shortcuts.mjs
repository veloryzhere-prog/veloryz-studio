/* VELORYZ Project Shortcuts: site + creator + true Client Portal routes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').replace(/^export default\s*/,'').replace(/;\s*$/,''));
const js=read('public/project-quick-actions.js');
const css=read('public/project-quick-actions.css');
const creator=read('public/creator-v4.js'),creatorCSS=read('public/creator-v4.css');
const app=read('public/app.js'),portal=read('public/client-portal.js');
assert.doesNotThrow(()=>new vm.Script(js),'Site shortcuts controller must parse.');
assert.doesNotThrow(()=>new vm.Script(creator),'Creator V4 must remain valid JS.');
assert.ok(shell.includes('/project-quick-actions.css')&&shell.includes('/project-quick-actions.js'),'Site must load project shortcut assets.');
assert.ok(app.includes("'/create/':{title:")&&app.includes("'/create/'"),'Project creator route must exist.');
assert.ok(read('lib/client-portal-shell.ts').includes('client-portal.js'),'Actual client portal must be available.');
assert.ok(portal.length>1000,'Client portal functionality must be preserved.');
assert.match(js,/ROUTES_WITH_INLINE/,'Contextual site placements must be configured.');
assert.match(js,/footer\.prepend\(bar\)/,'Site footer must include quick actions.');
assert.match(js,/studio:route/,'Project shortcuts must refresh on client-side navigation.');
assert.match(js,/main\.querySelector\('#vz-quick-actions-inline'\)/, 'No duplicate inline widgets after rerenders.');
assert.match(js,/href="\/client\/"/,'Project tracking must use the real Client Portal.');
assert.match(js,/href="\/create\/"/,'New project action must go to the real project creator.');
assert.ok(!js.includes('/track/'),'Do not invent a new tracking endpoint.');
assert.ok(creator.includes('ALREADY HAVE A PROJECT?'),'Creator welcome must clearly address returning clients.');
assert.ok(creator.includes('v4-existing-primary')&&creator.includes('v4-existing-secondary'),'Creator must offer portal and tracking actions.');
assert.match(creator,/v4-client-shortcut.+href="\/client\/"/,'Wizard top bar must offer persistent portal shortcut.');
assert.ok(creator.includes('Track your project ↗'),'Success view should encourage project tracking.');
assert.ok(creator.includes('A team-issued invitation is required'),'Do not imply project submissions create account access.');
assert.ok(creator.includes('submitting does not create a client account'),'No new false portal invitation promises.');
assert.match(css,/@media\(max-width:760px\)/,'Mobile site quick actions must stack.');
assert.match(creatorCSS,/v4-existing-project/,'Creator return-client card must be styled.');
assert.match(creatorCSS,/v4-client-shortcut/,'Creator project-tracking header must be styled.');
assert.match(css, /prefers-reduced-motion/,'Motion must respect accessibility preferences.');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Quick action CSS syntax must be balanced.');

const events={};
const home={pathname:'/'};
const node=(id)=>({
 id,innerHTML:'',setAttribute(name,value){this[name]=value;},animate(){},
 isConnected:true
});
let bar=null,footBar=null,inlineCount=0,footerCount=0;
const anchor={insertAdjacentElement(pos,element){assert.equal(pos,'afterend');bar=element;inlineCount++;}};
const main={querySelector(sel){
 if(sel==='#vz-quick-actions-inline')return bar;
 if(sel==='.hero'||sel==='.page-intro')return anchor;
 return null;
}};
const footer={querySelector(sel){return sel==='#vz-quick-actions-footer'?footBar:null;},
 prepend(element){footBar=element;footerCount++;}};
const doc={
 readyState:'complete',
 addEventListener(type,fn){events[type]=fn;},
 createElement:()=>node(),
 querySelector(sel){return sel==='#main'?main:sel==='#footer'?footer:null;}
};
const sandbox={document:doc,location:home,window:{matchMedia(){return {matches:true}}},console};
vm.runInNewContext(js,sandbox,{timeout:2000});
assert.equal(inlineCount,1);
assert.equal(footerCount,1);
assert.equal((bar.innerHTML.match(/href="\/client\/"/g)||[]).length,2,'Returning and tracking buttons both open Client Portal.');
assert.equal((bar.innerHTML.match(/href="\/create\/"/g)||[]).length,1);
assert.ok(bar.innerHTML.includes('Already have a project?'));
assert.ok(bar.innerHTML.includes('Track your project'));
events['studio:route']();
assert.equal(inlineCount,1,'Repeat route events must not duplicate inline actions.');
assert.equal(footerCount,1,'Repeat route events must not duplicate footer actions.');
home.pathname='/services/';bar=null;footBar=null;
events['studio:route']();
assert.equal(inlineCount,2,'Service pages have a contextual shortcut.');
assert.equal(footerCount,2);
home.pathname='/docs/';bar=null;footBar=null;
events['studio:route']();
assert.equal(inlineCount,2,'Docs pages should remain unintrusive.');
assert.equal(footerCount,3,'Docs pages should still have footer project access.');
home.pathname='/create/';bar=null;footBar=null;
events['studio:route']();
assert.equal(inlineCount,2,'The full-page creator provides its own dedicated shortcuts.');
assert.equal(footerCount,3,'No globally injected panel should cover the creator.');
home.pathname='/client/';events['studio:route']();
assert.equal(footerCount,3,'Do not inject project shortcut UI into the private portal.');
console.log('PASS: routes, contextual and footer quick actions, returning-client creator links, no duplicate links and preserved real portal workflow.');
