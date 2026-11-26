import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const edge=read('supabase/functions/veloryz-client-portal-api/index.ts');
const owner=read('public/admin-client.js'),client=read('public/client-portal.js'),proxy=read('lib/cms-api.mjs');
const migration=read('supabase/migrations/20261126061545_r50_private_deliverables_atomic_decisions.sql');
const finance=read('supabase/migrations/20261126061713_r50_client_scoped_payment_records.sql');
const queries=JSON.parse(edge.match(/const QUERIES=(\{[^\n]+\});\nconst enc=/)[1]);
for(const k of ['secureFileAdd','secureFileGet','secureFileCount','decisionAtomic'])assert(migration.includes(queries[k]),'Pinned SQL '+k);
assert(finance.includes(queries.projectPayments));assert(!queries.projectPayments.includes('token'));assert(queries.projectPayments.includes('p.id=?'));
assert(migration.includes('AS RESTRICTIVE FOR ALL TO anon,authenticated'));
assert(migration.includes('SECURITY INVOKER'));
assert(migration.includes("state='waiting'"));assert(migration.includes("INSERT INTO veloryz_studio.studio_client_messages"));
assert(edge.indexOf('if(!await admin(req))')<edge.indexOf('if(action==="/admin/files"'));
assert(edge.indexOf('const pid=await client(req)')<edge.indexOf('if(action.startsWith("/files/")'));
assert(edge.includes('await db("decisionAtomic",pid,item,status'));assert(!edge.includes('await db("clientDecision",status'));
assert(owner.includes('data-cpm-form="private-file"'));assert(client.includes('Download private file'));assert(client.includes('function billing()')&&client.includes('function handover()'));
assert(proxy.includes("outgoing.set('Content-Disposition',disposition)"));
assert(client.includes('tab==="ai"||archiveBusy'));assert(client.includes('generation!==archiveGeneration'));
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const context={TextDecoder,TextEncoder,Uint8Array,atob,Response,AbortSignal,encodeURIComponent,BASE:'https://storage.example.test',KEY:'synthetic',common:{},fail,
 trim(v,max,required=false){const s=String(v??'').trim();if(s.length>max||(required&&!s))fail('Invalid field');return s;},
 db:async(name,id,pid)=>name==='secureFileGet'&&id==='file-a'&&pid==='project-a'?[{object_key:'project-a/file-a',filename:'sample.txt'}]:[],
 fetch:async(url)=>{assert(url.includes('/object/authenticated/veloryz-client-deliverables/project-a/file-a'));return new Response('sample');}
};
const block=edge.slice(edge.indexOf('// Private delivery bucket:'),edge.indexOf('async function main(req)'));
vm.runInNewContext(block+'\nthis.checked=checkedFile;this.deliver=deliverFile;',context);
const b64=s=>Buffer.from(s).toString('base64');
assert.equal(context.checked({filename:'sample.txt',content:b64('hello')}).bytes.length,5);
assert.equal(context.checked({filename:'sample.pdf',content:b64('%PDF-1.7')}).mime,'application/pdf');
assert.throws(()=>context.checked({filename:'fake.pdf',content:b64('not a PDF')}),/signature/);
assert.throws(()=>context.checked({filename:'bad.html',content:b64('<html>')}),/Choose/);
assert.throws(()=>context.checked({filename:'../bad.txt',content:b64('hi')}),/filename/);
assert.throws(()=>context.checked({filename:'binary.txt',content:b64('a\0b')}),/UTF-8/);
await assert.rejects(()=>context.deliver('project-b','file-a'),/not found/i);
const delivered=await context.deliver('project-a','file-a');assert.equal(await delivered.text(),'sample');assert(delivered.headers.get('content-disposition').startsWith('attachment;'));assert.equal(delivered.headers.get('cache-control'),'private, no-store');
console.log('PASS: R50 file validation, cross-project denial, attachment security, registered SQL, payments and owner/client UI contracts (synthetic files).');
