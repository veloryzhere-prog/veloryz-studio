import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const pkg=JSON.parse(read('package.json'));
const wrangler=JSON.parse(read('wrangler.jsonc'));
const nodeVersion=read('.node-version').trim();
const vite=read('vite.config.ts');

assert.equal(wrangler.name,'veloryz-studio01','Cloudflare Git integration must deploy to the connected Worker name');
assert.equal(wrangler.main,'./worker/index.ts','Wrangler must point to the real Vinext Worker entry');
assert.equal(wrangler.compatibility_date,'2026-05-15','Compatibility date must stay aligned with the current Worker types/runtime contract');
assert.deepEqual(wrangler.compatibility_flags,['nodejs_compat'],'Worker must retain Node compatibility');
assert.equal(wrangler.keep_vars,true,'Deploys must preserve dashboard-managed runtime variables/secrets');
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
console.log('PASS: Cloudflare Worker identity, Node/pnpm versions and Vite/Wrangler deployment contract are explicit.');
