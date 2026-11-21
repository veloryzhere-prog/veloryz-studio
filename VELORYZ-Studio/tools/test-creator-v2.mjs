import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TextEncoder,TextDecoder} from 'node:util';

const read=file=>fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8');
const ctx=vm.createContext({console,TextEncoder,TextDecoder,setTimeout,clearTimeout,URL,Blob,document:{addEventListener(){},querySelectorAll(){return []},querySelector(){return null}},window:{},sessionStorage:{getItem(){return null}}});
vm.runInContext(read('planner-model.js'),ctx);
ctx.window.VeloryzPlanner=ctx.VeloryzPlanner;
const model=ctx.VeloryzPlanner;
assert(model.styles.includes('Editorial'));
assert(model.styles.includes('Immersive'));
assert.equal(model.normalize({budget:999999}).budget,300000);
assert.equal(model.normalize({style:'Bold'}).style,'Bold');
const brief=model.normalize({purpose:'Portfolio',style:'Bold',pages:'8',budget:75000,features:['Motion direction'],goal:'Create a beautiful portfolio for our business.'});
assert.equal(model.estimate(brief,null,[]).low,26499);
const setup=[
"let projectBrief=VeloryzPlanner.normalize({purpose:'Portfolio',style:'Bold',pages:'8',budget:75000,features:['Motion direction'],goal:'Create a beautiful portfolio for our business.'});",
"let chosenDesign=null;",
"const arrow='↗',money=n=>'₹'+Number(n).toLocaleString('en-IN');",
"const esc=v=>String(v??'').replace(/[&<>\\\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',\"'\":'&#39;'}[ch]));",
"const catalogue=()=>[];",
"const platformIntro=()=>'<section class=\"platform-intro\">Old header</section>';",
"const projectStarterCards=()=>'<section class=\"planner-starters\">Starters</section>';",
"const plannerEstimate=()=>VeloryzPlanner.estimate(projectBrief,null,[]);",
"const $=()=>null;"
].join('\n');
vm.runInContext(setup,ctx);
const original=read('platform.js');
const creatorFn=original.slice(original.indexOf('function createPage(){'),original.indexOf('function plannerReview(){'));
const summaryFn=original.slice(original.indexOf('function plannerReview(){'),original.indexOf('function bookingPage(){'));
assert(creatorFn.includes('function createPage()'));
vm.runInContext(creatorFn+summaryFn,ctx);
vm.runInContext(read('creator-v2.js'),ctx);
const html=vm.runInContext('createPage()',ctx);
assert(html.includes('creator-hero'));
assert(html.includes('data-creator-pdf'));
assert(html.includes('data-planner-contact-email required'));
assert.equal((html.match(/data-planner-panel="\d"/g)||[]).length,4);
assert.equal((html.match(/data-creator-style=/g)||[]).length,4);
assert.equal((html.match(/data-brief-feature=/g)||[]).length,6);
assert(html.includes('data-creator-budget'));
assert(html.includes('data-creator-timeline'));
assert(html.includes('data-planner-go="3"'));
assert(html.includes('data-creator-style="Bold" aria-pressed="true"'));
assert.equal((html.match(/id="brief-live"/g)||[]).length,1);
assert(html.includes('₹26,499'));
vm.runInContext(read('creator-proposal.js'),ctx);
const pdf=ctx.VeloryzProposal.build({brief,estimate:model.estimate(brief,null,[])});
const bytes=new TextDecoder().decode(pdf);
assert(bytes.startsWith('%PDF-1.4\n'));
assert(bytes.endsWith('%%EOF\n'));
assert.equal((bytes.match(/\/Type \/Page \/Parent/g)||[]).length,3);
assert(bytes.includes('CLIENT-SIDE DRAFT - NOT A STUDIO QUOTATION'));
const xref=Number(bytes.match(/startxref\n(\d+)/)?.[1]);
assert.equal(bytes.slice(xref,xref+4),'xref');
assert(pdf.length>6000&&pdf.length<200000);
console.log('PASS: Creator 2.0 four steps, styles, features, estimate controls, required email, and three-page proposal PDF.');
