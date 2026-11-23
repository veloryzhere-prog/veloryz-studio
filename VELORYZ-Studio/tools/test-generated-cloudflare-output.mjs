import fs from 'node:fs';
const p=new URL('../dist/server/wrangler.json',import.meta.url);
if(!fs.existsSync(p)) throw new Error('dist/server/wrangler.json missing after production build');
const cfg=JSON.parse(fs.readFileSync(p,'utf8'));
console.log('GENERATED_WRANGLER',JSON.stringify({
  name:cfg.name,
  main:cfg.main,
  assets:cfg.assets,
  compatibility_date:cfg.compatibility_date,
  compatibility_flags:cfg.compatibility_flags,
  bindings:{
    ai:cfg.ai,
    d1_databases:cfg.d1_databases,
    r2_buckets:cfg.r2_buckets,
    services:cfg.services
  }
},null,2));
