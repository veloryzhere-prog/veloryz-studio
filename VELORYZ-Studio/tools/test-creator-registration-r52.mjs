import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {normalizeSubmission,calculateQuote,fingerprint,readSubmission} from '../lib/creator-registration-r52.mjs';
const sample={contractVersion:1,intent:'create-project',requestId:'c162bb72-2d79-44da-bc7f-7bf073b62933',consent:true,contact:{name:'Example Client',email:'CLIENT@example.test'},brief:{category:'Business',style:'Minimal',pages:6,features:['Content management','SEO foundations'],budget:55000,goal:'A clear professional business site',timeline:'Flexible',briefMode:'detailed'}};
const published={version:12,state:{site:{creatorPricing:{base:17999,pageAllowance:1500,featureAllowance:2500,contingencyPct:25}},catalogue:[{id:'demo',category:'Business',price:8000,enabled:true,license:'MIT'}]}};
const run=(normalizeSubmission,calculateQuote,planner,assert)=>{
 const normalized=normalizeSubmission(sample),q=calculateQuote(normalized,published);
 assert.equal(normalized.contact.email,'client@example.test');
 assert.equal(q.lowPaise,2499900);assert.equal(q.highPaise,3150000);
 assert.equal(q.publishedRevision,12);assert.equal(q.amountDuePaise,0);assert.equal(q.promotionApplied,false);
 for(const category of ['Business','Portfolio','Ecommerce','Agency','SaaS / platform','Restaurant','Editorial','Education','Community','Custom App']){
  for(const pages of [1,4,6,8,12]){
   const n=normalizeSubmission({...sample,brief:{...sample.brief,category,pages,features:['AI adviser','Content management','SEO foundations','API integrations']}});
   const q=calculateQuote(n,published),legacy=planner.estimate({purpose:category,pages,features:n.brief.features},null,[],published.state.site.creatorPricing);
   assert.equal(q.lowPaise,legacy.low*100);assert.equal(q.highPaise,legacy.high*100);
  }
 }
 const untrusted=normalizeSubmission({...sample,quote:{lowPaise:1},brief:{...sample.brief,budget:6000,promoRequested:true,price:1}});
 assert.equal(calculateQuote(untrusted,published).lowPaise,q.lowPaise);assert.equal(calculateQuote(untrusted,published).promotionApplied,false);
 const ref=normalizeSubmission({...sample,brief:{...sample.brief,referenceId:'demo',referenceRights:'review'}});
 assert.equal(calculateQuote(ref,published).source,'catalogue');
 assert.equal(calculateQuote(ref,published).lowPaise,1500000);
 const independent=normalizeSubmission({...sample,brief:{...sample.brief,referenceId:'demo',referenceRights:'independent'}});
 assert.equal(calculateQuote(independent,published).source,'category');
 const unknown=normalizeSubmission({...sample,brief:{...sample.brief,referenceId:'unknown',referenceRights:'review'}});
 assert.equal(calculateQuote(unknown,published).referenceStatus,'manual-reference-review');
 const restricted={...published,state:{...published.state,catalogue:[{id:'demo',category:'Business',price:1,enabled:true,license:'CC BY-NC'}]}};
 assert.equal(calculateQuote(ref,restricted).source,'category');
 assert.throws(()=>calculateQuote(normalized,null),/pricing/);
 for(const input of [{...sample,intent:'payment'},{...sample,consent:false},{...sample,website:'bot'},{...sample,requestId:'bad'},{...sample,contact:{name:'X',email:'bad'}},{...sample,brief:{...sample.brief,features:['invented']}},{...sample,brief:{...sample.brief,features:['SEO foundations','SEO foundations']}},{...sample,brief:{...sample.brief,goal:'<script>'}},{...sample,brief:{...sample.brief,reference:'javascript:alert(1)'}},{...sample,brief:{...sample.brief,answers:{'AI adviser':'ignored'}}}])assert.throws(()=>normalizeSubmission(input));
 assert.deepEqual(normalizeSubmission({...sample,brief:{...sample.brief,features:[...sample.brief.features].reverse()}}),normalized);
};
const ctx=vm.createContext({});vm.runInContext(readFileSync(new URL('../public/planner-model.js',import.meta.url),'utf8'),ctx);
run(normalizeSubmission,calculateQuote,ctx.VeloryzPlanner,assert);
const same=normalizeSubmission(sample),changed=normalizeSubmission({...sample,brief:{...sample.brief,goal:'Different valid project goals'}});
assert.equal(await fingerprint(same),await fingerprint(normalizeSubmission(sample)));
assert.notEqual(await fingerprint(same),await fingerprint(changed));
const request=new Request('https://veloryz.online/api/project-submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sample)});
assert.deepEqual(await readSubmission(request),same);
await assert.rejects(readSubmission(new Request('https://veloryz.online/api/project-submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(32769)})),e=>e.status===413);
console.log('R52.2: strict contract, pricing parity across 50 category/page combinations, source review, fingerprint and body limits passed.');
