import assert from 'node:assert/strict';
import defaults from '../lib/defaults.json' with {type:'json'};
import {auditStudioContent} from '../lib/content-audit.mjs';
const base=auditStudioContent(defaults);assert.ok(Array.isArray(base.issues));
const broken=structuredClone(defaults);broken.site.email='not email';broken.offers.push({enabled:true,title:'Test',buttonUrl:'javascript:alert(1)'});
const checked=auditStudioContent(broken);assert.equal(checked.ok,false);assert.ok(checked.issues.some(i=>i.area==='Campaigns'));
console.log('V5 CMS content-audit tests passed');
