import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adviserNavigation,STUDIO_ROUTES,validStudioRoute} from '../lib/adviser-navigation.mjs';
import {personas,adviserPrompt} from '../lib/adviser-personas.mjs';
import defaults from '../lib/defaults.json' with {type:'json'};
const paths=new Set(Object.keys(STUDIO_ROUTES));
for(const message of ['hello','How are you?','Hindi mein baat karein','What does a website cost?','I want a design','Book a meeting','Need help with my app backend','I need a refund']){
 const extras=adviserNavigation(message,'/pricing/','nikhil');
 assert(extras.links.length>0);assert(extras.suggestions.length===3);
 for(const link of extras.links)assert(paths.has(link.url)&&link.url.startsWith('/'));
 assert(!JSON.stringify(extras).includes('https://fake.example'));
}
assert.equal(validStudioRoute('https://evil.example'),false);
assert.equal(validStudioRoute('/admin/'),false);
assert.deepEqual(adviserNavigation('I want to book a call','/','happy').links.map(x=>x.url),['/book/','/contact/']);
assert.equal(adviserNavigation('I want to book a call','/','happy').action.type,'open_booking_form');
assert.equal(adviserNavigation('I want to build a website','/','happy').action.type,'open_project_planner');
assert.deepEqual(adviserNavigation('Show me the price','/','happy').links.map(x=>x.url),['/pricing/','/create/']);
assert.equal(personas.milky.name,'Milky');assert.match(personas.milky.voice,/female/i);
assert.match(personas.aryan.voice,/VERY assertive/);
assert.match(personas.nikhil.focus,/smartest analytical/);
assert.match(adviserPrompt('aryan',defaults,false,[],'/pricing/'),/\/pricing\//);
const client=fs.readFileSync(new URL('../public/platform.js',import.meta.url),'utf8');
assert(client.indexOf("{id:'happy'")<client.indexOf("{id:'aryan'"));
assert(client.includes('mountPageHelp();'));assert(client.includes('appendChatExtras'));assert(client.includes('validSiteLink(entry.url)'));
assert(client.includes('data-chat-prompt'));assert(client.includes('data-chat-action'));assert(client.includes('openBooking()'));
assert(!client.includes("'Live · '+(data.provider"));
for(const name of Object.keys(personas))assert(fs.statSync(new URL('../public/assets/ai-avatars/'+name+'.webp',import.meta.url)).size>10000);
console.log('PASS: safe per-message site links, next-chat prompts, page-scoped persona prompts, Happy first, ARYAN final, animated avatar assets and public provider-agnostic chat.');
