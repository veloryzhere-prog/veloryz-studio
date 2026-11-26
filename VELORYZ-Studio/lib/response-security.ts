const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function secureHtml(html:string,status=200,privatePage=false,forceProduction=false){
 const nonce=crypto.randomUUID().replaceAll('-','');
 const headers:Record<string,string>={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','X-Permitted-Cross-Domain-Policies':'none'};
 if(forceProduction||!import.meta.env.DEV)headers['Content-Security-Policy']=`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; media-src 'self' blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com; upgrade-insecure-requests`;
 if((forceProduction||!import.meta.env.DEV))headers['Strict-Transport-Security']='max-age=31536000';
 if(privatePage||status===404)headers['X-Robots-Tag']='noindex, nofollow';
 // The old floating create CTA was disabled in CSS but still injected on every page.
 // Remove it at the HTML source. Keep the stylesheet for its other chat/form UI.
 // Merge the supplied Silk/UI bundles into the current hardened response layer.
 // The uploaded response-security.ts was older and would have reinstated the
 // removed floating Create button; only the assets are imported here.
 // Private pages, admin, client portal, immersive design previews and 404 pages
 // deliberately retain their isolated, original presentation and motion.
 const ui2026Release='silk-ui-20261123-r5';
 const experienceRelease='public-experience-20261124-r29';
 if(!privatePage&&status===200){
  headers['X-VELORYZ-UI-Release']=ui2026Release;
  headers['X-VELORYZ-Experience-Release']=experienceRelease;
 }
 const silkUiAssets=!privatePage&&status===200
  ? '<link rel="stylesheet" href="/veloryz-silk-2026.css?v=20261123-route-r5">'
   +'<link rel="stylesheet" href="/veloryz-ui-2026.css?v=20261123-route-r5">'
   +'<meta name="veloryz-ui-release" content="'+ui2026Release+'">'
   +'<link rel="stylesheet" href="/veloryz-brand-motion-r9.css?v=20261123-brand-motion-r9">'
   +'<link rel="stylesheet" href="/veloryz-experience-r20.css?v=20261124-r29">'
   +'<meta name="veloryz-experience-release" content="'+experienceRelease+'">'
   +'<script src="/veloryz-silk-2026.js?v=20261123-route-r5" defer></script>'
   +'<script src="/veloryz-brand-motion-r9.js?v=20261123-brand-motion-r9" defer></script>'
   +'<script src="/veloryz-experience-r20.js?v=20261126-r42" defer></script>'
  : '';
 const editorialAssets=!privatePage&&status===200
  ? '<link rel="stylesheet" href="/reference-elegance-r5.css?v=20261123-editorial-r5">'
  : '';
 // Only the real reference homepage renders #mb and #mn; avoid adding this
 // specialised menu theme to creator, docs, client portal or admin HTML.
 const referenceMenu=!privatePage&&status===200&&html.includes('<body class="vz-reference-site"');
 const menuAssets=referenceMenu
  ? '<link rel="stylesheet" href="/reference-menu-morph-r6.css?v=20261123-reference-menu-r6">'
  : '';
 const qcAssets=referenceMenu
  ? '<link rel="stylesheet" href="/reference-qc-layout-r7.css?v=20261123-layout-qc-r7">'
   +'<link rel="stylesheet" href="/home-editorial-r32.css?v=20261126-v2-alpha2-benchmark">'
   +'<link rel="stylesheet" href="/capabilities-scroll-r34.css?v=20261125-r34">'
   +'<script src="/capabilities-scroll-r34.js?v=20261125-r34" defer></script>'
  : '';
 if(referenceMenu){
  headers['X-VELORYZ-Menu-Release']='reference-menu-20261123-r6';
  headers['X-VELORYZ-QC-Release']='visual-layout-20261123-r7';
  headers['X-VELORYZ-Homepage-Release']='v2-layout-repair-20261126-r42';
 }
 const v2Assets=!privatePage&&status===200?(referenceMenu?'<link rel="stylesheet" href="/v2-home-warm.css?v=20261126-v2"><script defer src="/v2-home-warm.js?v=20261126-v2"></script>':'<link rel="stylesheet" href="/v2-workspaces.css?v=20261126-v2">'):'';
 html=html.replace('</head>','<link rel="stylesheet" href="/make-project.css"><link rel="stylesheet" href="/chat-experience.css">'+silkUiAssets+editorialAssets+menuAssets+qcAssets+v2Assets+'<link rel="stylesheet" href="/v2-layout-repair.css?v=20261126-r42"></head>');
 // Version first-party UI resources so a regular browser cannot combine old cached CSS with new JavaScript.
 html=html.replace(/(src|href)="(\/[^"?#]+\.(?:css|js))"/g,(_,attribute,path)=>`${attribute}="${path}?v=veloryz-layout-20261126-r42"`);
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
