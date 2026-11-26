import assert from 'node:assert/strict';
const origin='https://veloryz.online',fid='00000000-0000-4000-8000-000000000001';
for(const path of ['/api/client-portal/files/'+fid,'/api/client-portal/admin/files/'+fid+'?project_id='+fid,'/api/client-portal/ai-archive','/api/client-portal/session']){
 const response=await fetch(origin+path,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(25000)});
 assert.equal(response.status,401,'Unauthenticated route must deny: '+path);
 console.log('PASS: private route denies anonymous requests:',path);
}
const portal=await fetch(origin+'/client/',{cache:'no-store',signal:AbortSignal.timeout(25000)});assert(portal.ok);assert.equal(portal.headers.get('x-veloryz-commit'),process.env.GITHUB_SHA);
assert((await portal.text()).includes('/client-portal.js?v=20261126-r50'));
console.log('PASS: R50 exact deployed client workspace and private access boundaries.');
