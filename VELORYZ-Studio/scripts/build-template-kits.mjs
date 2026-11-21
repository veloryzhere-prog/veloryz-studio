/* Private VELORYZ original website template fulfillment ZIPs. Never publish /private. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {templates} from './template-products.mjs';
import {renderTemplate} from './template-showcase.mjs';
const out='private/template-kits';await mkdir(out,{recursive:true});
const css=await readFile('public/template-preview.css','utf8'),js=await readFile('public/template-preview-runtime.js','utf8');
const enc=x=>Buffer.from(x,'utf8');
const crc32=b=>{let crc=0xffffffff;for(const n of b){crc^=n;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0};
function zip(entries){
 const local=[],central=[];let offset=0;
 for(const [name,content]of Object.entries(entries)){
  const file=enc(name),data=enc(content),crc=crc32(data),h=Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(file.length,26);local.push(h,file,data);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(file.length,28);c.writeUInt32LE(offset,42);central.push(c,file);offset+=h.length+file.length+data.length;
 }
 const tail=Buffer.alloc(22);tail.writeUInt32LE(0x06054b50,0);tail.writeUInt16LE(Object.keys(entries).length,8);tail.writeUInt16LE(Object.keys(entries).length,10);tail.writeUInt32LE(central.reduce((n,b)=>n+b.length,0),12);tail.writeUInt32LE(offset,16);
 return Buffer.concat([...local,...central,tail]);
}
for(const t of templates){
 const html=renderTemplate(t).replace('/template-preview.css?v=2','./styles.css').replace('/template-preview-runtime.js?v=2','./interactions.js').replace('<meta name="robots" content="noindex, nofollow">','<meta name="robots" content="noindex">').replaceAll('href="/design/"','href="#contact"').replaceAll('href="/create/?template='+encodeURIComponent(t.id)+'"','href="#contact"').replaceAll('target="_top"','');
 const readme='# '+t.name+' — Original VELORYZ Front-End Template\n\n'+t.description+'\n\nOpen index.html in a browser. Modify the demo copy, colours and branding before publishing. styles.css contains the responsive design; interactions.js runs all included front-end interactions. This package includes one functional full landing page and its sections, not a backend, CMS, live checkout, authentication or live reservations. Source files must be licensed to use commercially. Extra pages and production connections are separately scoped.\n\nSample businesses, products, counts and testimonials must be replaced with accurate content. A commercial license is granted only with payment confirmation and a written agreement. Refer to LICENSE.txt.\n';
 const license='VELORYZ STUDIO / TEMPLATE SOURCE LICENSE\nProduct: '+t.name+' / '+t.id+'\nListed starting license price INR: '+t.price+'\n\nVELORYZ Studio retains authorship of the original code and vector artwork. After verified payment and written approval, the licensee may modify and deploy the template on one commercial website. Redistribution, sublicensing, resale as a template, or inclusion in another template marketplace is prohibited. Source possession alone is not a license. No third-party rights to trademarks, external imagery, proprietary fonts, services, or payment processors are conveyed. Customer assets and production integrations require separate agreements.\n';
 await writeFile(out+'/'+t.id+'-VELORYZ-template.zip',zip({'index.html':html,'styles.css':css,'interactions.js':js,'README.md':readme,'LICENSE.txt':license}));
}
console.log('Built '+templates.length+' private portable VELORYZ template fulfillment ZIPs.');
