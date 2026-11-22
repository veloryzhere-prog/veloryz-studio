/**
 * Third-party acknowledgements stay accessible outside the main design UI.
 * Original LICENSE and CREDITS files in imported templates stay unmodified.
 */
import catalog from '../public/veloryz-open-designs.json' with { type:'json' };
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as Record<string,string>)[c]||c);
export function renderDesignNoticesPage():string{
 const sources=[...catalog.items].sort((a,b)=>a.name.localeCompare(b.name));
 const records=sources.map(item=>{
  const local=item.importStatus==='real-upstream-html'&&/^[a-z0-9-]+$/.test(item.id);
  const licenseLink=local?'/design-source-previews/'+item.id+'/LICENSE':'';
  const origin=/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/.test(item.source)?item.source:'';
  return '<details class="vz-legal-item" id="'+escape(item.id)+'"><summary><span>'+escape(item.name)+'</span><small>'+escape(item.author)+'</small></summary><div class="vz-legal-details">'+
   '<p>Upstream license: '+escape(item.license)+'. '+(local?'Original HTML is included in the local VELORYZ preview.':'This source is listed for design research; a working application import is not claimed.')+'</p>'+
   (licenseLink?'<a href="'+escape(licenseLink)+'" target="_blank" rel="noopener">Read original license</a>':'')+
   (origin?'<a href="'+escape(origin)+'" target="_blank" rel="noopener noreferrer">Original publisher / repository</a>':'')+
   (local?'<a href="/design-source-previews/'+escape(item.id)+'/README.md" target="_blank" rel="noopener">Original README</a>':'')+
   '</div></details>';
 }).join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Design acknowledgements — VELORYZ Studio</title>'+
 '<style>:root{color-scheme:light}*{box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;margin:0;background:#f3f1ee;color:#29252a;line-height:1.65}a{color:#30243b;text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #775ca0;outline-offset:4px}header,main,footer{max-width:1060px;margin:auto;padding:32px clamp(18px,5vw,60px)}header{border-bottom:1px solid #d9d1d8;display:flex;justify-content:space-between;gap:15px;align-items:center}header a:first-child{text-decoration:none;font-weight:850;font-size:20px;letter-spacing:-.06em}header a:last-child{font-size:12px}h1{font-size:clamp(34px,5vw,65px);letter-spacing:-.07em;line-height:1.1;margin:25px 0}main>p{max-width:730px;font-size:14px;color:#635b64}.vz-legal-list{margin-top:45px}.vz-legal-item{border-bottom:1px solid #d9d1d8;padding:16px 0}.vz-legal-item summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:14px;font-weight:760}.vz-legal-item small{font-size:11px;font-weight:460;color:#7a6d79}.vz-legal-details{padding:13px 0 14px;font-size:12px;color:#645b65}.vz-legal-details a{display:inline-block;margin-right:21px;margin-top:6px}footer{border-top:1px solid #d9d1d8;color:#746a75;font-size:11px}@media(max-width:560px){.vz-legal-item summary{align-items:flex-start;flex-direction:column;gap:4px}}</style></head>'+
 '<body><header><a href="/">V. VELORYZ STUDIO</a><a href="/design/">Back to the design library ↗</a></header><main><span>VELORYZ / LEGAL REFERENCE</span><h1>Design acknowledgements.</h1><p>This archive preserves creator notices and software licenses for projects included in the VELORYZ Studio catalogue. Hosting a design preview does not transfer third-party authorship or copyright. Some accompanying images, fonts, dependencies and trademarks have separate terms.</p><div class="vz-legal-list">'+records+'</div></main><footer>VELORYZ Studio · Design explorer and customization service · <a href="/design/">Design Library</a></footer></body></html>';
}
