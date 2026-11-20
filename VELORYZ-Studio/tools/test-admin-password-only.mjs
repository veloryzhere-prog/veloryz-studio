import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {handleApi} from '../lib/cms-api.mjs';
import {passwordHash} from '../lib/studio-platform.mjs';

const sqlite=new DatabaseSync(':memory:');
for(const f of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(x=>x.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this},async first(){return sqlite.prepare(sql).get(...args)||null},async all(){return {results:sqlite.prepare(sql).all(...args)}},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}}}}}};
const salt='a'.repeat(32),password='200814';
const env={DB,BUCKET:{},ADMIN_PASSWORD_HASH:'100000:'+salt+':'+await passwordHash(password,salt),ADMIN_SESSION_SECRET:'test-only-secret-'+crypto.randomUUID()};
const call=async(path,{body,headers={},method=body?'POST':'GET'}={})=>{const r=await handleApi(new Request('https://studio.test'+path,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}),env,'password');return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')}};
try{
 const before=await call('/api/admin/state');assert.equal(before.status,401);assert.equal(before.data.passwordRequired,true);
 assert.equal((await call('/api/admin/unlock',{body:{password:'wrong'}})).status,401);
 assert.equal((await call('/api/admin/unlock',{body:{password},headers:{origin:'https://other.test'}})).status,403);
 const unlocked=await call('/api/admin/unlock',{body:{password}});assert.equal(unlocked.status,200);assert.match(unlocked.cookie,/HttpOnly; Secure; SameSite=Strict/);
 const cookie=unlocked.cookie.split(';')[0];
 const state=await call('/api/admin/state',{headers:{cookie}});assert.equal(state.status,200);assert.equal(state.data.user.id,'studio-owner');
 assert.equal((await call('/api/admin/state',{headers:{cookie:cookie.slice(0,-1)+'x'}})).status,401);
 assert.equal((await call('/api/admin/state',{headers:{cookie,'oai-authenticated-user-email':'anyone@example.com'}})).status,200,'untrusted user headers cannot switch password-mode identity');
 assert.equal((await call('/api/admin/lock',{body:{},headers:{cookie}})).status,200);
 const locked=await call('/api/admin/lock',{body:{},headers:{cookie}});assert.match(locked.cookie,/Max-Age=0/);
 // A logout cookie deletion takes effect in the browser; the old signed cookie is
 // still valid if stolen. Password changes invalidate it via the signature input.
 env.ADMIN_PASSWORD_HASH='100000:'+salt+':'+await passwordHash('new-temporary-test-password',salt);
 assert.equal((await call('/api/admin/state',{headers:{cookie}})).status,401);
 assert.equal((await call('/api/admin/unlock',{body:{password}})).status,401);
 delete env.ADMIN_SESSION_SECRET;
 assert.equal((await call('/api/admin/state')).status,503,'missing signing key fails closed');
 console.log('PASS: password-only owner login, session guard, origin, tamper detection, change-password revocation, missing-config refusal');
}finally{sqlite.close()}
