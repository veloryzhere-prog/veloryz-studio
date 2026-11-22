/* Public bug reports: integration test against actual enquiry API and in-memory Studio DB.
   Does not bypass current password-only Studio Control authentication. */
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {handleApi} from '../lib/cms-api.mjs';
const db=new DatabaseSync(':memory:');
for(const file of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())
 db.exec(fs.readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
const DB={prepare(sql){let args=[];return {
 bind(...value){args=value;return this;},
 async first(){return db.prepare(sql).get(...args)||null;},
 async all(){return {results:db.prepare(sql).all(...args)};},
 async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}};}
};}};
const env={DB,BUCKET:{},ADMIN_EMAIL:'owner@example.com'};
async function call(path,payload,extraHeaders={},method=payload?'POST':'GET'){
 const r=await handleApi(new Request('https://studio.test'+path,{
  method,
  headers:{origin:'https://studio.test',...extraHeaders,...(payload?{'Content-Type':'application/json'}:{})},
  body:payload?JSON.stringify(payload):undefined
 }),env);
 return {status:r.status,data:await r.json()};
}
const payload=(patch={})=>({
 kind:'bug',requestId:crypto.randomUUID(),name:'QA Bug Reporter',
 email:'bug-qa@example.com',service:'Website bug report',
 message:'WEBSITE BUG REPORT\nCategory: Navigation\nPage: /\nSteps: Open the homepage and click Menu.\nExpected: The menu opens.\nActual: The button does not respond.',
 consent:true,website:'',...patch
});
const sample=payload(),received=await call('/api/enquiries',sample);
assert.equal(received.status,201,'New valid bug reports must be accepted');
assert.equal(received.data.ok,true);
assert.match(received.data.reference,/^VZ-[A-F0-9]{12}$/,'A real reference must be returned');
const saved=db.prepare('SELECT reference,service,preferred_date,preferred_time,status,message,email FROM studio_enquiries WHERE id=?').get(sample.requestId);
assert.equal(saved.reference,received.data.reference,'The reference must exist in the actual studio queue');
assert.equal(saved.service,'Website bug report','Bug reports must be clearly differentiated from consultation enquiries');
assert.equal(saved.preferred_date,'','Bug reports do not require a booking date');
assert.equal(saved.preferred_time,'','Bug reports do not require a booking time');
assert.equal(saved.status,'new');
assert.equal(saved.email,'bug-qa@example.com');
assert.match(saved.message,/Actual: The button does not respond/);
assert.equal((await call('/api/enquiries',sample)).data.reference,received.data.reference,'Safe retry must be idempotent');
assert.equal(db.prepare('SELECT count(*) AS n FROM studio_enquiries').get().n,1,'Idempotent retry cannot duplicate a report');
assert.equal((await call('/api/enquiries',payload({consent:false,email:'declined@example.com'}))).status,400,'Explicit consent is required');
assert.equal((await call('/api/enquiries',payload({website:'bot.example',email:'honeypot@example.com'}))).status,400,'Honeypot still rejects spam');
assert.equal((await call('/api/enquiries',payload({message:'too short',email:'short@example.com'}))).status,400,'Bug reports require meaningful details');
assert.equal((await call('/api/enquiries',payload({message:'<script>alert(1)</script>',email:'unsafe@example.com'}))).status,400,'Dangerous markup must be rejected');
assert.equal((await call('/api/enquiries',payload({email:'other-origin@example.com'}),{origin:'https://attacker.example'})).status,403,'Cross-origin POSTs must stay prohibited');
assert.equal((await call('/api/enquiries',payload({requestId:sample.requestId,message:sample.message+' edited'}))).status,409,'Identifier conflict must be blocked');
assert.equal((await call('/api/enquiries',payload())).status,201);
assert.equal((await call('/api/enquiries',payload())).status,201);
assert.equal((await call('/api/enquiries',payload())).status,429,'Same-email hourly limits must apply to bug reports');
assert.equal((await call('/api/admin/enquiries')).status,401,'Report queue remains private to Studio Control');
const site=await call('/api/site');
assert(!('enquiries' in (site.data.state||{})),'Bug reports never leak into public CMS state');
console.log('PASS: real bug-report persistence, VZ reference, issue labeling, booking-free intake, consent, XSS, same-origin policy, rate limiting and protected admin inbox.');
db.close();
