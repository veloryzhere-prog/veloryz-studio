import { spawnSync } from 'node:child_process';
import { createHash, randomBytes, pbkdf2Sync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';

const site = 'https://veloryz.online';
const project = 'https://vgxdfjlqstpbtezxmxtq.supabase.co';
const worker = 'veloryz-studio01';
const cli = ['--yes', 'wrangler@4.92.0'];
function wrangler(args, input, capture = false) {
  // Only fixed CLI options enter the Windows shell. Secrets travel through stdin.
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', [...cli, ...args], {
    cwd: tmpdir(), shell: process.platform === 'win32', input, encoding: 'utf8',
    stdio: [input ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit', 'inherit']
  });
  if (result.error || result.status !== 0) throw Error('Wrangler could not complete ' + args.slice(0, 2).join(' ') + '. Check the selected Cloudflare account and Worker.');
  return result.stdout;
}
async function get(path) {
  const r = await fetch(site + path, {cache:'no-store', signal:AbortSignal.timeout(15000)});
  return {status:r.status, body:await r.json()};
}
async function status() {
  const [health, admin] = await Promise.all([get('/api/health'),get('/api/admin/state')]);
  return {healthy:health.status === 200 && health.body.ok === true, locked:admin.status === 401 && admin.body.passwordRequired === true, message:admin.body.error};
}
async function prompt(label, hidden = false) {
  process.stdout.write(label);
  const output = hidden ? new Writable({write(chunk, enc, done){done();}}) : process.stdout;
  const rl = createInterface({input:process.stdin,output,terminal:true});
  try {return await rl.question('');} finally {rl.close(); if(hidden) console.log();}
}
async function settle() {
  let check;
  for(let n=0;n<8;n++){
    if(n) await delay(3000);
    check=await status();
    if(check.healthy) break;
  }
  return check;
}
async function main(){
  let check=await status();
  if(check.healthy && check.locked){console.log('Database healthy. The admin password screen is ready.');return;}
  if(process.argv.includes('--check')) throw Error(check.message || 'Studio health check failed.');
  if(!check.healthy && !check.message?.includes('Connect the studio database')) throw Error('Unexpected live response. Check the Worker deployment before changing secrets.');
  if(!process.stdin.isTTY) throw Error('Open an interactive terminal to run the repair.');
  console.log('Sign in to the Cloudflare account that owns veloryz.online.');
  wrangler(['login']);
  const list=()=>JSON.parse(wrangler(['secret','list','--name',worker,'--format','json'],undefined,true));
  const names=new Set(list().map(s=>s.name));
  if(!check.healthy){
    console.log('Connecting ' + worker + ' to the existing studio project ' + project);
    const key=(await prompt('Supabase service_role or server secret key (hidden): ',true)).trim();
    if(!key || key.startsWith('sb_publishable_')) throw Error('A private Supabase server key is required.');
    const query='SELECT id FROM studio_enquiries LIMIT 1';
    const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
    const probe=await fetch(project+'/rest/v1/rpc/veloryz_studio_query',{method:'POST',headers,
      redirect:'error',signal:AbortSignal.timeout(20000),body:JSON.stringify({p_statements:[{key:createHash('sha256').update(query).digest('hex'),params:[]}]})});
    if(!probe.ok || !Array.isArray((await probe.json())[0]?.results)) throw Error('Supabase did not validate the studio query. Check the project key and installed studio schema. No Worker settings were updated.');
    wrangler(['secret','bulk','--name',worker],JSON.stringify({STUDIO_DATABASE:'supabase',SUPABASE_URL:project,SUPABASE_SERVICE_ROLE_KEY:key,STUDIO_STORAGE_BUCKET:'veloryz-studio'}));
    check=await settle();
  }
  if(check.healthy && !check.locked && check.message?.includes('ADMIN_PASSWORD_HASH')){
    const additions={};
    if(!names.has('ADMIN_PASSWORD_HASH')){
      const pwd=await prompt('Choose a new studio owner password (12+ characters, hidden): ',true);
      if(pwd.length<12 || pwd!==await prompt('Confirm new password (hidden): ',true)) throw Error('Password length or confirmation failed.');
      const salt=randomBytes(16);
      additions.ADMIN_PASSWORD_HASH='100000:'+salt.toString('hex')+':'+pbkdf2Sync(pwd,salt,100000,32,'sha256').toString('hex');
    }
    if(!names.has('ADMIN_SESSION_SECRET')) additions.ADMIN_SESSION_SECRET=randomBytes(48).toString('hex');
    if(Object.keys(additions).length) wrangler(['secret','bulk','--name',worker],JSON.stringify(additions));
    for(let n=0;n<8 && !check.locked;n++){await delay(3000); check=await status();}
  }
  if(!check.healthy || !check.locked) throw Error('Live verification incomplete. Admin response: '+(check.message || 'unexpected response'));
  console.log('Database healthy. Open '+site+'/admin/ and sign in with your studio password.');
}
main().catch(err=>{console.error(err.message);process.exitCode=1;});
