import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const pkg=JSON.parse(read('package.json'));
const wrangler=JSON.parse(read('wrangler.jsonc'));
const nodeVersion=read('.node-version').trim();
const vite=read('vite.config.ts');

assert.equal(wrangler.name,'veloryz-studio01','Cloudflare Git integration must deploy to the connected Worker name');
assert.equal(wrangler.main,'./dist/server/index.js','Nested Wrangler must deploy the generated Vinext Worker entry');
assert.equal(wrangler.compatibility_date,'2026-05-15','Compatibility date must stay aligned with the current Worker types/runtime contract');
assert.deepEqual(wrangler.compatibility_flags,['nodejs_compat'],'Worker must retain Node compatibility');
assert.equal(wrangler.keep_vars,true,'Deploys must preserve dashboard-managed runtime variables/secrets');
assert.equal(wrangler.assets?.directory,'./dist/client','Nested Wrangler must deploy generated client assets');
assert.equal(wrangler.no_bundle,true,'Nested Wrangler must preserve Vinext no_bundle output');
assert.equal(wrangler.ai?.binding,'AI','Nested Wrangler must preserve the AI binding');
assert(String(wrangler.build?.command||'').includes('pnpm build'),'Nested Wrangler must build the app before direct deploy');
assert.equal(nodeVersion,'22','Cloudflare build Node major must match GitHub CI');
assert.equal(pkg.packageManager,'pnpm@11.25.0','Workers Builds must use the exact pnpm version pinned by packageManager');
assert.equal(pkg.engines?.node,'>=22.13.0','Project Node requirement changed unexpectedly');
assert(fs.existsSync(new URL('worker/index.ts',root)),'Worker entry file is missing');
assert(vite.includes('cloudflare({'),'Cloudflare Vite plugin is missing');
assert(vite.includes('config: {'),'Cloudflare Vite plugin must still merge programmatic bindings into Wrangler config');
const localStart=vite.indexOf('const localBindingConfig = {');
const localEnd=vite.indexOf('\n};',localStart);
assert(localStart>=0&&localEnd>localStart,'localBindingConfig block is missing');
const localConfigSource=vite.slice(localStart,localEnd);
assert(!/\bname\s*:/.test(localConfigSource),'localBindingConfig must not override the canonical Worker name');

const repoRoot=new URL('../../',import.meta.url);
const rootWrangler=JSON.parse(fs.readFileSync(new URL('wrangler.jsonc',repoRoot),'utf8'));
const rootPkg=JSON.parse(fs.readFileSync(new URL('package.json',repoRoot),'utf8'));
assert.equal(rootWrangler.name,'veloryz-studio01','Repository-root Wrangler must target the connected Worker');
assert.equal(rootWrangler.main,'VELORYZ-Studio/dist/server/index.js','Repository-root Wrangler must deploy the generated Vinext Worker entry');
assert.equal(rootWrangler.assets?.directory,'VELORYZ-Studio/dist/client','Repository-root Wrangler must deploy generated client assets');
assert.equal(rootWrangler.no_bundle,true,'Repository-root Wrangler must preserve Vinext no_bundle output');
assert(String(rootWrangler.build?.command||'').includes('pnpm --dir VELORYZ-Studio build'),'Repository-root Wrangler must build the nested VELORYZ app first');
assert(String(rootPkg.scripts?.deploy||'').includes('VELORYZ-Studio'),'Repository-root deploy script must delegate to the real app');

console.log('PASS: Cloudflare Worker identity, root deploy shim, Node/pnpm versions and Vite/Wrangler deployment contract are explicit.');
