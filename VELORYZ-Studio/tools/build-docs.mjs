import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Source-controlled documentation is canonical. Website JSON is a derived public snapshot.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'public','docs-library.json');
const source=path.join(root,'docs','project-creator');
const manifest=JSON.parse(await fs.readFile(output,'utf8'));
if(!Array.isArray(manifest.documents)||manifest.documents.length!==11)throw Error('Expected eleven indexed source documents.');
const seen=new Set();
for(const doc of manifest.documents){
 if(!/^[A-Za-z0-9-]+\.md$/.test(doc.filename)||!/^[a-z0-9-]+$/.test(doc.id)||seen.has(doc.id))throw Error('Unsafe or duplicate document metadata.');
 seen.add(doc.id);
 const file=path.resolve(source,doc.filename);
 if(!file.startsWith(source+path.sep))throw Error('Document path escaped the source directory.');
 const content=await fs.readFile(file,'utf8');
 if(!/^#\s+.+/m.test(content)||content.trim().length<350)throw Error('Document appears empty or incomplete: '+doc.filename);
 doc.markdown=content;
}
manifest.version=new Date().toISOString().slice(0,10);
await fs.writeFile(output,JSON.stringify(manifest)+'\n','utf8');
console.log('Documentation synced: '+manifest.documents.length+' guides → public/docs-library.json');
