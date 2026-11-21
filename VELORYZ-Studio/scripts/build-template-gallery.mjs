/* Original VELORYZ template compiler: 12 real HTML/CSS/JS showcase products, 12 covers and source catalog. */
import {mkdir,writeFile} from 'node:fs/promises';
import {templates} from './template-products.mjs';
import {renderTemplate,coverSVG} from './template-showcase.mjs';
const out='public/template-previews',cover='public/template-covers';
await mkdir(out,{recursive:true});await mkdir(cover,{recursive:true});
const ids=new Set();
for(const t of templates){
 if(ids.has(t.id)||!/^[a-z][a-z0-9-]{1,45}$/.test(t.id))throw Error('Invalid/duplicate template ID '+t.id);
 ids.add(t.id);
 const html=renderTemplate(t),svg=coverSVG(t);
 if(!html.includes('template-preview-runtime.js')||!html.includes('prefers')&&!html.includes('template-preview.css'))throw Error('Preview missing runtime '+t.id);
 await writeFile(out+'/'+t.id+'.html',html,'utf8');
 await writeFile(cover+'/'+t.id+'.svg',svg,'utf8');
}
const publicData=templates.map(({id,name,category,style,price,description,headline,subline,pages,features,layout,license,deliverable})=>({id,name,category,style,price,description,headline,subline,pages,features,layout,license,deliverable,cover:'/template-covers/'+id+'.svg',preview:'/template-previews/'+id+'.html'}));
await writeFile('public/veloryz-template-products.js','window.VELORYZ_TEMPLATE_PRODUCTS='+JSON.stringify(publicData).replace(/</g,'\\u003c')+';\n','utf8');
await writeFile('public/veloryz-template-products.json',JSON.stringify(publicData,null,2)+'\n','utf8');
console.log('VELORYZ templates built: '+templates.length+' original functional demos, '+templates.length+' SVG covers, product catalog.');
