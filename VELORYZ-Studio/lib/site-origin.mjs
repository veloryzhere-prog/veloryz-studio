// Trusted public origin, never inferred from attacker-controlled Host headers in production.
export const DEFAULT_PUBLIC_ORIGIN='https://veloryz.online';
export function publicOrigin(configured,requestOrigin,development=false){
 const source=String(configured||'').trim()||(development?String(requestOrigin||''):DEFAULT_PUBLIC_ORIGIN);
 let url;try{url=new URL(source);}catch{throw new Error('PUBLIC_SITE_URL must be a full HTTPS origin.');}
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||url.pathname!=='/'||(!development&&url.protocol!=='https:'))throw new Error('PUBLIC_SITE_URL must be an HTTPS origin without a path, query, or credentials.');
 return url.origin;
}
export function canonicalPath(path){const clean=String(path||'/').split(/[?#]/)[0].replace(/\/+$/,'');return clean&&clean!=='/'?clean+'/':'/';}
