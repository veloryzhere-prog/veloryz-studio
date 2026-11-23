import fs from 'node:fs';
const p=new URL('../dist/server/wrangler.json',import.meta.url);
if(!fs.existsSync(p)) throw new Error('dist/server/wrangler.json missing after production build');
const cfg=JSON.parse(fs.readFileSync(p,'utf8'));
const safe={...cfg};
delete safe.vars;
delete safe.secrets;
console.log('GENERATED_WRANGLER_FULL',JSON.stringify(safe,null,2));
