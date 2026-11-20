const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function secureHtml(html:string,status=200,privatePage=false,forceProduction=false){
 const nonce=crypto.randomUUID().replaceAll('-','');
 const headers:Record<string,string>={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','X-Permitted-Cross-Domain-Policies':'none'};
 if(forceProduction||!import.meta.env.DEV)headers['Content-Security-Policy']=`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' blob: https:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com; upgrade-insecure-requests`;
 if(privatePage||status===404)headers['X-Robots-Tag']='noindex, nofollow';
 const projectLink='<a class="make-project-link" href="/create/"><span>Make your project</span><span class="make-project-arrow" aria-hidden="true">↗</span></a>';
 html=html.replace('</head>','<link rel="stylesheet" href="/make-project.css"></head>').replace('</body>',projectLink+'</body>');
 // Version first-party UI resources so a regular browser cannot combine old cached CSS with new JavaScript.
 html=html.replace(/(src|href)="(\/[^"?#]+\.(?:css|js))"/g,(_,attribute,path)=>`${attribute}="${path}?v=veloryz-chat-personal2-20261120"`);
 return new Response(html.replace(/<script\b/g,`<script nonce="${nonce}"`),{status,headers});
}
export function pageMetadata(html:string,{title,description,url,image,site}:{title:string;description:string;url:string;image:string;site:any}){
 const attrs:Record<string,string>={'og:title':title,'og:description':description,'og:url':url};
 html=html.replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,()=>`<meta name="description" content="${escape(description)}">`).replace(/<link rel="canonical" href="[^"]*">/,()=>`<link rel="canonical" href="${escape(url)}">`);
 for(const [key,value]of Object.entries(attrs))html=html.replace(new RegExp(`<meta property="${key}" content="[^"]*">`),()=>`<meta property="${key}" content="${escape(value)}">`);
 html=html.replace('</head>',`<meta property="og:image" content="${escape(image)}"><meta name="twitter:card" content="summary_large_image"></head>`);
 const schema={"@context":"https://schema.org","@type":"Organization",name:site.name,url:new URL(url).origin,email:site.email,telephone:'+'+site.phone,founder:{'@type':'Person',name:site.founderName}};
 return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,()=>`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`);
}
