import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const file=new URL('../public/veloryz-open-designs.json',import.meta.url);
const raw=readFileSync(file),j=JSON.parse(raw);
const checks=[
['id-present',x=>typeof x.id==='string'&&x.id.length>0],
['id-unique',x=>j.items.filter(y=>y.id===x.id).length===1],
['name',x=>typeof x.name==='string'&&x.name.trim().length>0],
['category',x=>typeof x.category==='string'&&x.category.trim().length>0],
['source-https',x=>/^https:\/\/[^/\s]+(?:\/|$)/.test(x.source)],
['author',x=>typeof x.author==='string'&&x.author.trim().length>0],
['license-declared',x=>typeof x.license==='string'&&x.license.trim().length>0],
['price',x=>Number.isFinite(x.price)&&x.price>0&&x.currency==='INR'],
['preview-available',x=>typeof x.previewImage==='string'&&x.previewImage.length>0],
['screenshot-evidence',x=>x.previewImageKind==='upstream-screenshot'],
['interactive-upstream',x=>x.previewType==='real-upstream-site'],
['rights-cleared',x=>!['candidate','review','restricted'].includes(x.rights)&&!!x.rights],
['pricing-model',x=>x.priceModel==='starting_customization_quote'],
['delivery-scope',x=>typeof x.studioDeliverable==='string'&&x.studioDeliverable.length>0],
['rights-notice',x=>typeof x.studioLicense==='string'&&x.studioLicense.length>0]
];
const rows=j.items.flatMap(x=>checks.map(([check,fn])=>({item:x.id,check,status:fn(x)?'pass':'review'})));
const stats=checks.map(([id])=>({id,pass:rows.filter(x=>x.check===id&&x.status==='pass').length,review:rows.filter(x=>x.check===id&&x.status==='review').length}));
const result={schema:1,source:'public/veloryz-open-designs.json',sourceBlob:createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex'),scope:'Metadata checks only. Review does not mean a confirmed defect. Screenshot and interactive checks indicate coverage, not asset reachability; rights status requires manual verification.',stats,rows};
if(process.argv.includes('--write'))writeFileSync(new URL('../audit/v2-catalogue-checks.json',import.meta.url),JSON.stringify(result,null,2));
console.table(stats);console.log({total:rows.length,pass:rows.filter(x=>x.status==='pass').length,review:rows.filter(x=>x.status==='review').length});
