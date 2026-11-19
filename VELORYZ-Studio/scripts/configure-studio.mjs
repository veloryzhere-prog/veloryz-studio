import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {writeFile,access} from 'node:fs/promises';
import {passwordHash} from '../lib/studio-platform.mjs';
let hidden=false;
const output=new Writable({write(chunk,encoding,callback){if(!hidden)process.stdout.write(chunk);callback();}});
const rl=createInterface({input:process.stdin,output,terminal:true});
try{
 try{await access(new URL('../.dev.vars',import.meta.url));throw Error('A .dev.vars file already exists. Back it up and remove it before configuring again.');}catch(e){if(e.code!=='ENOENT')throw e;}
 const url=(await rl.question('Supabase project URL: ')).trim();
 if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))throw Error('Enter the HTTPS Supabase project URL.');
 process.stdout.write('Supabase server secret / service-role key (hidden): ');hidden=true;
 const key=(await rl.question('')).trim();hidden=false;process.stdout.write('\n');
 process.stdout.write('Choose your studio owner password, 12+ characters (hidden): ');hidden=true;
 const password=await rl.question('');hidden=false;process.stdout.write('\n');
 if(key.length<30||password.length<12)throw Error('Use a valid server key and a password of at least 12 characters.');
 const salt=crypto.randomUUID().replaceAll('-','');
 const values={STUDIO_DATABASE:'supabase',SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,STUDIO_STORAGE_BUCKET:'veloryz-studio',ADMIN_LOGIN_MODE:'password',ADMIN_PASSWORD_HASH:'100000:'+salt+':'+await passwordHash(password,salt),ADMIN_SESSION_SECRET:crypto.randomUUID()+crypto.randomUUID()};
 await writeFile(new URL('../.dev.vars',import.meta.url),Object.entries(values).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n')+'\n',{mode:0o600,flag:'wx'});
 console.log('Local configuration saved. Start the studio and open /admin. Use these settings as private runtime secrets when deploying.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{rl.close();}
