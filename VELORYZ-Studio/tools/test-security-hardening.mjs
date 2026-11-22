import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mediaResponse} from '../lib/cms-api.mjs';
import {passwordSession} from '../lib/studio-platform.mjs';

const testId='123e4567-e89b-42d3-a456-426614174000';
let sqlSeen='';
let storageReads=0;
const bucket={
  async get(){storageReads++;return {body:new Uint8Array([137,80,78,71]),size:4,httpEtag:'test-etag',writeHttpMetadata(){}}}
};
const database={
  prepare(sql){
    sqlSeen=sql;
    return {bind(){return this},async first(){return sql.includes('archived=0')?{storage_key:'studio/test',mime:'image/png'}:null}};
  }
};
const request=new Request('https://veloryz.online/media/'+testId);
const served=await mediaResponse(request,{DB:database,BUCKET:bucket},testId);
assert.equal(served.status,200);
assert.match(sqlSeen,/WHERE id=\? AND archived=0/, 'Archived media must not be retrievable');
assert.match(served.headers.get('cache-control')||'',/no-store/, 'Revoked media must not be cached');
assert.equal(storageReads,1);
assert.equal(await passwordSession(request,{}, {id:'studio-owner'}),false,
  'Unconfigured administrator credentials must fail closed');

const cms=await readFile(new URL('../lib/cms-api.mjs',import.meta.url),'utf8');
const portal=await readFile(new URL('../supabase/functions/veloryz-client-portal-api/index.ts',import.meta.url),'utf8');
const privacy=await readFile(new URL('../supabase/functions/veloryz-privacy-api/index.ts',import.meta.url),'utf8');
assert.match(cms,/cf-connecting-ip/, 'Edge proxy forwards trusted client identity');
assert.match(portal,/await throttle\(req,"invitation-access",8,900\)/);
assert.match(portal,/await throttle\(req,"portal-message:"\+pid,30,3600\)/);
assert.match(privacy,/if\(!await throttle\(req\)\)/, 'Consent attempts must be throttled independently of receipt ID');
console.log('VELORYZ security regression tests passed.');
