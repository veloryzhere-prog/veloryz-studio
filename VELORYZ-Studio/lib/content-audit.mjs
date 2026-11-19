// Pure prepublication review: no network access, no automatic content mutation.
export function auditStudioContent(input){
 const s=input&&typeof input==='object'?input:{},issues=[];
 const add=(severity,area,message)=>issues.push({severity,area,message});
 const site=s.site||{};
 if(!site.name?.trim())add('error','Identity','Studio name is missing.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email||''))add('error','Contact','Public contact email is invalid.');
 if((site.description||'').trim().length<60)add('warning','SEO','Homepage description is too brief for useful search previews.');
 if((site.headline||'').trim().length<7)add('warning','Homepage','Hero headline needs a clear purpose.');
 const ids=new Set();
 for(const project of s.projects||[]){
  if(ids.has(project.id))add('error','Portfolio','Duplicate project ID: '+String(project.id).slice(0,100));
  ids.add(project.id);
  if(!project.published)continue;
  if((project.description||'').trim().length<45)add('warning','Portfolio',`${project.name||'Unnamed project'} needs a more informative case-study description.`);
  if(!Array.isArray(project.scope)||!project.scope.length)add('warning','Portfolio',`${project.name||'Unnamed project'} has no published scope evidence.`);
  if(!project.cover&&!project.video)add('warning','Portfolio',`${project.name||'Unnamed project'} does not have an uploaded cover or film; confirm its fallback artwork is suitable.`);
 }
 for(const offer of s.offers||[]){
  if(!offer.enabled)continue;
  if(!offer.title?.trim())add('error','Campaigns','An enabled campaign has no title.');
  for(const field of ['buttonUrl','secondaryUrl','logoLink']){
   const dest=offer[field];if(!dest)continue;
   if(typeof dest!=='string'||dest.startsWith('//')||dest.startsWith('javascript:')||(/^[a-z]+:/i.test(dest)&&!/^https:\/\//i.test(dest)))add('error','Campaigns',`Unsafe destination in ${field}.`);
   if(dest.startsWith('/')&&!/^\/[a-z0-9/_?=&%.#-]*$/i.test(dest))add('warning','Campaigns',`Review the local destination in ${field}.`);
  }
 }
 for(const item of s.catalogue||[])if(item.enabled&&(!item.image||!Number.isFinite(Number(item.price))||Number(item.price)<=0))add('error','Design library',`${item.name||'A visible item'} needs a working preview reference and positive starting price.`);
 if(!issues.length)add('info','Review','No source-data issues detected. External links, actual accessibility and deployed media still require real browser checks.');
 return {ok:!issues.some(i=>i.severity==='error'),count:issues.length,issues,checkedAt:new Date().toISOString()};
}
