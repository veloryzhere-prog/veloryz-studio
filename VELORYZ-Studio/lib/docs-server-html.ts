/* Server HTML includes the real, escaped documentation text before client hydration. */
import projectDocs from '../public/docs-library.json';
import studioDocs from '../public/studio-docs-catalog.json';
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const norm=(v:string)=>v.replace(/\/+$/,'')||'/';
const docHref=(p:string)=>['/docs','/docs/studio','/help/studio'].includes(norm(p))?norm(p)+'/index.html':norm(p)+'.html';
// Only allow same-site relative paths, fragments and HTTPS sources in CMS Markdown.
function fmt(v:string){
 const chunks=String(v).split(/(\[[^\]\n]+\]\([^\s)]+\))/g);
 return chunks.map(chunk=>{
  const m=chunk.match(/^\[([^\]\n]+)\]\(([^\s)]+)\)$/);
  if(m){
   const href=m[2];
   const safe=(href.startsWith('/')&&!href.startsWith('//')&&!href.includes('\\'))||href.startsWith('#')||/^https:\/\/[^/\s\\]+(?:\/|$)/i.test(href);
   if(safe&&!/[\u0000-\u001f\u007f]/.test(href))return '<a href="'+esc(href)+'"'+(href.startsWith('https://')?' rel="noopener noreferrer"':'')+'>'+esc(m[1])+'</a>';
  }
  return esc(chunk).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
 }).join('');
}
function markdown(source:string){
 const lines=String(source||'').slice(0,50000).split(/\r?\n/);
 let output='',paragraph:string[]=[],list:string[]=[],code:string[]=[],inCode=false;
 const para=()=>{if(paragraph.length){output+='<p>'+fmt(paragraph.join(' '))+'</p>';paragraph=[];}};
 const bullets=()=>{if(list.length){output+='<ul>'+list.map(x=>'<li>'+fmt(x)+'</li>').join('')+'</ul>';list=[];}};
 for(const line of lines){
  if(line.trim().startsWith('~~~')){para();bullets();if(inCode){output+='<pre><code>'+esc(code.join('\n'))+'</code></pre>';code=[];}inCode=!inCode;continue;}
  if(inCode){code.push(line);continue;}
  if(!line.trim()){para();bullets();continue;}
  const heading=line.match(/^(#{1,5})\s+(.+)$/);
  if(heading){para();bullets();const level=Math.min(5,heading[1].length+1);output+='<h'+level+'>'+fmt(heading[2])+'</h'+level+'>';continue;}
  const item=line.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/);
  if(item){para();list.push(item[1]);continue;}
  bullets();paragraph.push(line.trim());
 }
 para();bullets();if(code.length)output+='<pre><code>'+esc(code.join('\n'))+'</code></pre>';
 return output;
}
export function renderHtmlDocument(path:string,edits:Record<string,any>={}):string{
 const target=norm(path);
 const entries=[
  ...projectDocs.documents.map(d=>({path:'/docs/'+d.id,title:d.label,summary:d.description,markdown:d.markdown,group:'Service guides'})),
  ...studioDocs.articles.map(d=>({path:norm(d.path),title:d.title,summary:d.summary,markdown:d.markdown,group:d.category}))
 ];
 const index=['/docs','/docs/studio','/help/studio'].includes(target);
 if(!index){
  const doc=entries.find(x=>x.path===target);
  if(!doc)return '';
  const edit=edits[target]||{};if(edit.visible===false)return '';
  const title=String(edit.title||doc.title),summary=String(edit.summary||doc.summary),content=String(edit.markdown||doc.markdown);
  const related=entries.filter(x=>x.path!==target&&x.group===doc.group&&(edits[x.path]||{}).visible!==false).slice(0,4);
  const relatedHtml=related.length?'<nav aria-label="Related guides"><h2>Related guides</h2><ul>'+related.map(x=>'<li><a href="'+esc(docHref(x.path))+'">'+esc((edits[x.path]||{}).title||x.title)+'</a></li>').join('')+'</ul></nav>':'';

  return '<article class="seo-doc-reader container" aria-labelledby="seo-doc-title">'+
   '<nav aria-label="Documentation breadcrumbs"><a href="/">VELORYZ</a> / <a href="/docs/index.html">Documentation</a> / '+esc(doc.group)+'</nav>'+
   '<header><div class="eyebrow">VELORYZ STUDIO / KNOWLEDGE</div><h1 id="seo-doc-title">'+esc(title)+'</h1><p>'+esc(summary)+'</p></header>'+
   '<div class="seo-doc-body">'+markdown(content)+'</div>'+
   relatedHtml+
   '<footer><a href="/docs/index.html">← All guides</a> · <a href="/help/studio/index.html">Help Centre</a> · <a href="/help/assistant/">Ask Help AI</a> · <a href="/contact/">Contact the Studio ↗</a> · <a href="/privacy/">Privacy</a></footer></article>';
 }
 const type=target==='/help/studio'?'help':target==='/docs/studio'?'studio':'all';
 const subset=entries.filter(d=>(edits[d.path]||{}).visible!==false&&(type==='all'||(type==='help'?d.path.startsWith('/help/studio/'):d.path.startsWith('/docs/studio/'))));
 const title=type==='help'?'VELORYZ Help Centre':type==='studio'?'Studio documentation':'Documentation & guides';
 return '<section class="seo-doc-reader container" aria-labelledby="seo-doc-title"><div class="eyebrow">VELORYZ / DOCUMENTATION</div><h1 id="seo-doc-title">'+title+'</h1>'+
 '<p>Browse genuine Studio guides for projects, design, support, privacy and publishing workflows.</p>'+
 '<nav aria-label="Knowledge workspace links"><a href="/docs/index.html">All guides</a> · <a href="/docs/studio/index.html">Studio documentation</a> · <a href="/help/studio/index.html">Help Centre</a> · <a href="/help/assistant/">Ask Help AI</a> · <a href="/support/">Support</a> · <a href="/privacy/">Privacy</a> · <a href="/cookies/">Cookies</a> · <a href="/privacy/choices/">Privacy choices</a> · <a href="/sitemap/">Sitemap</a></nav>'+
 '<nav class="seo-doc-links" aria-label="Documentation index">'+subset.map(d=>'<a href="'+esc(docHref(d.path))+'"><strong>'+esc((edits[d.path]||{}).title||d.title)+'</strong><small>'+esc((edits[d.path]||{}).summary||d.summary)+'</small></a>').join('')+'</nav></section>';
}
