const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function secureHtml(html:string,status=200,privatePage=false,forceProduction=false){
 const nonce=crypto.randomUUID().replaceAll('-','');
 const headers:Record<string,string>={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','X-Permitted-Cross-Domain-Policies':'none'};
 if(forceProduction||!import.meta.env.DEV)headers['Content-Security-Policy']=`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; media-src 'self' blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com; upgrade-insecure-requests`;
 if((forceProduction||!import.meta.env.DEV))headers['Strict-Transport-Security']='max-age=31536000';
 if(privatePage||status===404)headers['X-Robots-Tag']='noindex, nofollow';
 // The old floating create CTA was disabled in CSS but still injected on every page.
 // Remove it at the HTML source. Keep the stylesheet for its other chat/form UI.
 html=html.replace('</head>','<link rel="stylesheet" href="/make-project.css"><link rel="stylesheet" href="/chat-experience.css"></head>');
 // Version first-party UI resources so a regular browser cannot combine old cached CSS with new JavaScript.
 html=html.replace(/(src|href)="(\/[^"?#]+\.(?:css|js))"/g,(_,attribute,path)=>`${attribute}="${path}?v=veloryz-chat-spice-20261121"`);
 return new Response(html.replace(/<script\b/g,`<script nonce="${nonce}"`),{status,headers});
}
export function pageMetadata(html:string,{title,description,url,image,site}:{title:string;description:string;url:string;image:string;site:any}){
 const attrs:Record<string,string>={'og:title':title,'og:description':description,'og:url':url};
 html=html.replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,()=>`<meta name="description" content="${escape(description)}">`).replace(/<link rel="canonical" href="[^"]*">/,()=>`<link rel="canonical" href="${escape(url)}">`);
 for(const [key,value]of Object.entries(attrs))html=html.replace(new RegExp(`<meta property="${key}" content="[^"]*">`),()=>`<meta property="${key}" content="${escape(value)}">`);
 html=html.replace('</head>',`<meta property="og:image" content="${escape(image)}"><meta name="twitter:card" content="summary_large_image"></head>`);
 const schema={"@context":"https://schema.org","@type":"Organization","@id":new URL(url).origin+"/#organization",name:"VELORYZ Studio",alternateName:"VELORYZ",url:new URL(url).origin+"/",logo:new URL("/assets/brand/official/Main-Transparent.webp",url).href,email:site.email,telephone:"+"+site.phone};
 return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,()=>`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`);
}
