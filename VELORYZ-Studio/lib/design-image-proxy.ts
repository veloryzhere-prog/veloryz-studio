/**
 * Read-only image gateway for published design media.
 * Resolves ONLY static catalogue URLs from verified image hosts, not user URLs.
 * Keeps imagery usable in browsers that block third-party media hotlinking/CORS.
 */
import catalog from '../public/veloryz-open-designs.json' with { type:'json' };
const hostAllowed=(hostname:string)=>[
 'raw.githubusercontent.com','opengraph.githubassets.com','github.com','user-images.githubusercontent.com',
 'marmelab.com','refine.ams3.cdn.digitaloceanspaces.com','assets.startbootstrap.com',
 'adminmart.github.io','cdn.dribbble.com','images.unsplash.com'
].includes(hostname)||hostname.endsWith('.githubusercontent.com');
export async function serveDesignImage(request:Request):Promise<Response|null>{
 const {pathname}=new URL(request.url);
 if(!pathname.startsWith('/studio-preview-images/'))return null;
 const match=pathname.match(/^\/studio-preview-images\/([a-z0-9-]{2,100})\/?$/);
 if(!match)return new Response('Not found',{status:404});
 const design=catalog.items.find(item=>item.id===match[1]);
 if(!design||!design.enabled||!design.previewImage)return new Response('Image not found',{status:404});
 let url:URL;
 try{url=new URL(design.previewImage)}catch{return new Response('Invalid image',{status:404})}
 if(url.protocol!=='https:'||!hostAllowed(url.hostname)||url.username||url.password)return new Response('Image host not allowed',{status:403});
 try{
  const upstream=await fetch(url.toString(),{redirect:'follow',signal:AbortSignal.timeout(12000)});
  if(!upstream.ok)return new Response('Image temporarily unavailable',{status:502,headers:{'Cache-Control':'public,max-age=90'}});
  const mime=(upstream.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['image/png','image/jpeg','image/webp','image/avif','image/gif','image/svg+xml'].includes(mime))
   return new Response('Unexpected image type',{status:502});
  const size=Number(upstream.headers.get('content-length')||0);
  if(size>12*1024*1024)return new Response('Image too large',{status:413});
  return new Response(upstream.body,{status:200,headers:{
   'Content-Type':mime,
   'Cache-Control':'public,max-age=21600,stale-while-revalidate=86400',
   'X-Content-Type-Options':'nosniff',
   'Cross-Origin-Resource-Policy':'same-origin',
   'Referrer-Policy':'no-referrer'
  }});
 }catch{return new Response('Image temporarily unavailable',{status:502,headers:{'Cache-Control':'public,max-age=90'}})}
}
