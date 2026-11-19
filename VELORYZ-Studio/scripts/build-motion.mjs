import {build} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createLogo} from '../src/motion/logo-model.mjs';
import {createStudyModel,disposeModel} from '../src/motion/study-models.mjs';
class BlobReader {
 readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();});}
 readAsDataURL(blob){blob.arrayBuffer().then(data=>{this.result='data:'+blob.type+';base64,'+Buffer.from(data).toString('base64');this.onloadend?.();});}
}
globalThis.FileReader=BlobReader;
await mkdir('public/assets/brand',{recursive:true});
const model=await new GLTFExporter().parseAsync(createLogo(),{binary:true});
await writeFile('public/assets/brand/veloryz-logo.glb',Buffer.from(model));
for(const kind of ['ribbon','orbit']){const study=createStudyModel(kind);const binary=await new GLTFExporter().parseAsync(study,{binary:true});await writeFile('public/assets/brand/study-'+kind+'.glb',Buffer.from(binary));disposeModel(study);}
await build({configFile:false,publicDir:false,logLevel:'warn',build:{emptyOutDir:false,outDir:'public',lib:{entry:'src/motion/experience.mjs',formats:['es'],fileName:()=> 'motion-3d.js'},minify:true,rollupOptions:{output:{codeSplitting:false}}}});
console.log('Built self-hosted 3D runtime and VELORYZ GLB model.');
