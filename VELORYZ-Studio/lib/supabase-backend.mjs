/** Server-only Supabase bridge. Only pre-registered CMS queries can execute. */
const encoder = new TextEncoder();
async function key(sql) {
 const digest = await crypto.subtle.digest('SHA-256', encoder.encode(sql));
 return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
}
export function studioEnvironment(env) {
 if (env.__studioSupabase) return env;
 const provider = env.STUDIO_DATABASE?.trim().toLowerCase();
 const hasCredentials = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
 if (provider ? provider !== 'supabase' : env.DB || !hasCredentials) return env;
 if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Studio Supabase runtime settings are missing.');
 const base = env.SUPABASE_URL.replace(/\/$/,'');
 if (!base.startsWith('https://')) throw new Error('Studio Supabase requires HTTPS.');
 const headers = {apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type':'application/json'};
 async function execute(statements) {
  const p_statements = await Promise.all(statements.map(async s => ({key:await key(s.sql),params:s.params})));
  const response = await fetch(base+'/rest/v1/rpc/veloryz_studio_query', {method:'POST', headers, body:JSON.stringify({p_statements}),signal:AbortSignal.timeout(20000)});
  const data = await response.json();
  if (!response.ok) {
   console.error('Studio database request failed', {status:response.status,code:data.code});
   throw new Error(data.code==='23505' ? 'UNIQUE constraint violation' : 'Studio database request failed.');
  }
  return data;
 }
 const DB = {
  prepare(sql) {
   return {sql, params:[], bind(...params) {return {...this,params};},
    async all() {return (await execute([this]))[0];},
    async first(column) {const row=(await this.all()).results[0]??null;return column ? row?.[column]??null : row;},
    async run() {return (await execute([this]))[0];}
   };
  },
  batch(statements) {return execute(statements);}
 };
 // R2 media remains compatible; Supabase Storage replaces it when configured.
 let BUCKET=env.BUCKET;
 if(env.STUDIO_STORAGE_BUCKET) {
  const bucket=encodeURIComponent(env.STUDIO_STORAGE_BUCKET);
  const objectUrl=k=>base+'/storage/v1/object/'+bucket+'/'+k.split('/').map(encodeURIComponent).join('/');
  BUCKET={
   async put(k,bytes,options={}) {
    let r;
    try {
     r=await fetch(objectUrl(k),{method:'POST',headers:{...headers,'Content-Type':options.httpMetadata?.contentType||'application/octet-stream','x-upsert':'false'},body:bytes,signal:AbortSignal.timeout(100000)});
    }catch(error){
     console.error('Studio storage transport error',{reason:error?.name||'network-error'});
     throw Object.assign(new Error('Media storage connection timed out or failed. Retry the upload.'),{status:503});
    }
    if(!r.ok){
     let detail={};try{detail=await r.json();}catch{}
     const code=String(detail?.error||detail?.code||detail?.statusCode||'').slice(0,72);
     console.error('Studio storage upload rejected',{status:r.status,code});
     const message=r.status===413?'This file exceeds your storage upload limit. Try a smaller or compressed video.':
       r.status===429?'Media storage is busy. Retry the upload shortly.':
       r.status===401||r.status===403?'The private media storage connection needs administrator attention.':
       r.status===400?'The storage service rejected this file. Check format, size and bucket configuration.':
       'Media storage is temporarily unavailable. Retry the upload.';
     throw Object.assign(new Error(message),{status:r.status===413?413:503});
    }
   },
   async delete(k) {
    const r=await fetch(base+'/storage/v1/object/'+bucket,{method:'DELETE',headers,body:JSON.stringify({prefixes:[k]})});
    if(!r.ok)throw new Error('Studio media deletion failed.');
   },
   async get(k,options={}) {
    const range=options.range?.get?.('range');
    const r=await fetch(objectUrl(k),{headers:{...headers,...(range?{Range:range}:{})},signal:AbortSignal.timeout(20000)});
    if(r.status===404)return null;
    if(!r.ok)throw new Error('Studio media retrieval failed.');
    const contentRange=r.headers.get('content-range')?.match(/bytes (\d+)-(\d+)\/(\d+)/);
    return {body:r.body,httpEtag:r.headers.get('etag')||'',size:Number(contentRange?.[3]||r.headers.get('content-length')||0),
     ...(contentRange?{range:{offset:Number(contentRange[1]),length:Number(contentRange[2])-Number(contentRange[1])+1}}:{}),
     writeHttpMetadata(h){for(const name of ['content-type','content-language','content-disposition']){const v=r.headers.get(name);if(v)h.set(name,v);}}
    };
   }
  };
 }
 return {...env,STUDIO_DATABASE:'supabase',DB,BUCKET,__studioSupabase:true};
}
