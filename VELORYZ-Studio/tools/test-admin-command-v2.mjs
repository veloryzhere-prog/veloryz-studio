/* Owner console source contract tests. No production credentials or network calls. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {Script, createContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=relative=>readFileSync(path.join(root,relative),'utf8');
const addon=source('public/admin-command-v2.js');
const admin=source('public/admin.js');
const css=source('public/admin-command-v2.css');
const shell=source('lib/admin-shell.ts');

new Script(addon,{filename:'admin-command-v2.js'});
new Script(admin,{filename:'admin.js'});
assert.ok(shell.indexOf('admin-command-v2.js')<shell.indexOf('admin.js?v'),'addon must load before core admin script');
assert.ok(shell.includes('admin-command-v2.css'),'new styles must be loaded by the admin shell');
for(const text of [
  "command:AdminCommandV2.command",
  "'ai-minds':AdminCommandV2.minds",
  "'system-health':AdminCommandV2.health",
  "media:AdminCommandV2.media",
  "function sidebar(){return AdminCommandV2.sidebar();}"
])assert.ok(admin.includes(text),'missing admin route or override: '+text);
for(const id of ['aryan','happy','nikhil','milky','ritik'])
  assert.ok(existsSync(path.join(root,'public','assets','ai-avatars',id+'.webp')),'missing adviser avatar '+id);
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'CSS blocks must balance');
const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const context=createContext({
  window:{},document:{addEventListener(){}},section:'command',
  workspace:{state:{site:{aryanBrief:'Act like a precise studio adviser.'},projects:[{published:true,featured:true}],offers:[{enabled:true}]},user:{name:'Studio owner'},publishedVersion:3,hasDraft:true,dirty:false},
  E:escape,
  icon:id=>'<svg data-icon="'+id+'"></svg>',
  active:item=>Boolean(item.enabled),
  heading:(label,title)=>'<header>'+escape(title)+'</header>',
  field:(label,key)=>'<textarea data-bind="'+escape(key)+'"></textarea>',
  getPath:(obj,key)=>key.split('.').reduce((state,part)=>state?.[part],obj),
  mediaItems:[{id:'a',filename:'cover.png',mime:'image/png',size:40000},{id:'b',filename:'film.mp4',mime:'video/mp4',size:900000}],
  mediaCard:item=>'<article>'+escape(item.filename)+'</article>',
  mediaLoaded:true,preview:false,
  navigation:[['command','Command center'],['ai-minds','AI character minds'],['knowledge-ai','AI agent console'],['media','Media Studio'],['system-health','System health']],
});
new Script(addon,{filename:'admin-command-v2.js'}).runInContext(context,{timeout:1000});
const app=context.window.AdminCommandV2;
for(const key of ['sidebar','command','minds','media','health','applyMediaFilter'])assert.equal(typeof app[key],'function','missing UI entry point: '+key);
const screens={command:app.command(),minds:app.minds(),media:app.media(),health:app.health(),sidebar:app.sidebar()};
for(const [name,html] of Object.entries(screens))assert.ok(html.length>1000,name+' console should have complete content');
for(const route of ['#/ai-minds','#/knowledge-ai','#/media','#/content','#/client-portal','#/offers'])
  assert.ok(screens.command.includes(route),'command center missing navigation to '+route);
assert.ok(screens.minds.includes('data-bind="site.aryanBrief"'),'mind editor must bind to existing CMS draft');
assert.ok(screens.minds.includes('data-sc-test-ai'),'main AI provider should be testable');
assert.ok(screens.media.includes('data-action="upload"'),'reuse real authenticated upload action');
assert.ok(screens.media.includes('data-sc-media-card'),'media tiles should support filtering');
assert.ok(screens.media.includes('cover.png')&&screens.media.includes('film.mp4'),'existing images and videos visible');
assert.ok(screens.health.includes('data-sc-run-health'),'health console should expose live checks');
assert.ok(screens.sidebar.includes('System health')&&screens.sidebar.includes('AI character minds'),'new consoles navigable');
console.log('Admin Command Center source smoke tests passed: five responsive consoles, routes, media and CMS actions.');
