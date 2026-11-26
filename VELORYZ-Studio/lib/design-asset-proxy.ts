/**
 * Allowlisted, read-only media/CSS/JS delivery for previously imported open-source
 * showcase sites. Keeps *their original files* resolving from a stable VELORYZ path
 * when cross-origin browser restrictions or original demo domains prevent loading.
 * Never a generic URL proxy; arbitrary hosts and HTML cannot be fetched.
 */
type Source={repo:string;branch:string;dir:string;fallback:string};
const sources:Record<string,Source>={
 'os-grocery-and-delivery-grilli-restaurant':{
  repo:'codewithsadee/grilli',branch:'master',dir:'',fallback:'https://codewithsadee.github.io/grilli/'},
 'os-publishing-and-blogs-wren-editorial':{
  repo:'codewithsadee/wren',branch:'master',dir:'',fallback:'https://codewithsadee.github.io/wren/'},
 'os-template-libraries-start-bootstrap-agency':{
  repo:'StartBootstrap/startbootstrap-agency',branch:'master',dir:'dist/',fallback:'https://startbootstrap.github.io/startbootstrap-agency/'},
 'os-template-libraries-start-bootstrap-freelancer':{
  repo:'StartBootstrap/startbootstrap-freelancer',branch:'master',dir:'dist/',fallback:'https://startbootstrap.github.io/startbootstrap-freelancer/'},
 'os-dashboards-and-saas-lumen-cinematic-ai-saas':{
  repo:'MiddleSugar7000/lumen-saas-landing-page-template',branch:'main',dir:'',fallback:'https://middlesugar7000.github.io/lumen-saas-landing-page-template/'},
 'os-dashboards-and-saas-volt-arc-product-landing':{
  repo:'MiddleSugar7000/volt-arc-landing-page-template',branch:'main',dir:'',fallback:'https://middlesugar7000.github.io/volt-arc-landing-page-template/'}
};
const mime:Record<string,string>={
 css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',json:'application/json',
 svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',
 gif:'image/gif',ico:'image/x-icon',avif:'image/avif',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',
 otf:'font/otf',webm:'video/webm',mp4:'video/mp4',glb:'model/gltf-binary',gltf:'model/gltf+json'
};
export async function serveDesignAsset(request:Request):Promise<Response|null>{
 const {pathname,search}=new URL(request.url);
 if(!/^\/studio-preview-assets(?:-v2)?\//.test(pathname))return null;
 const match=pathname.match(/^\/studio-preview-assets(?:-v2)?\/([a-z0-9-]+)\/([a-zA-Z0-9_./-]+)$/);
 if(!match)return new Response('Not found',{status:404});
 const src=sources[match[1]],file=match[2];
 if(!src||file.length>250||file.split('/').some(part=>!part||part==='.'||part==='..'))return new Response('Not found',{status:404});
 const extension=file.split('.').pop()?.toLowerCase()||'';
 if(!mime[extension])return new Response('Unsupported preview asset',{status:415});
 // Exact, fixed GitHub repositories. User-supplied URLs/hostnames never enter the request.
 // The sandboxed iframe has an opaque origin. Public demo assets are intentionally
 // cross-origin readable; the allowlist and file-type restrictions remain in force.
 const urls=[src.fallback+file,'https://raw.githubusercontent.com/'+src.repo+'/'+src.branch+'/'+src.dir+file];
 for(const url of urls){
  try{
   const upstream=await fetch(url,{headers:{Accept:'*/*'},redirect:'follow',signal:AbortSignal.timeout(7500)});
   if(!upstream.ok)continue;
   const type=(upstream.headers.get('content-type')||'').toLowerCase();
   if(type.includes('text/html')||type.includes('application/xhtml'))continue;
   const length=Number(upstream.headers.get('content-length')||0);
   if(length>12*1024*1024)return new Response('Preview asset too large',{status:413});
   if(!upstream.body)continue;
   const reader=upstream.body.getReader();const chunks:Uint8Array[]=[];let total=0;
   for(;;){const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>12*1024*1024){await reader.cancel();return new Response('Preview asset too large',{status:413});}chunks.push(part.value);}
   const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   if(!total)continue;
   return new Response(bytes,{status:200,headers:{'Content-Type':mime[extension],'Cache-Control':'public,max-age=3600,stale-while-revalidate=86400','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'cross-origin','Access-Control-Allow-Origin':'*'}});
  }catch{ /* Try only the second fixed publisher endpoint. */ }
 }
 return new Response('Preview asset unavailable',{status:502,headers:{'Cache-Control':'no-store','Cross-Origin-Resource-Policy':'cross-origin','Access-Control-Allow-Origin':'*'}});
}
