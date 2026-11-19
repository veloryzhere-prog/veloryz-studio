import assert from 'node:assert/strict';
import fs from 'node:fs';
import {personas,adviserPrompt} from '../lib/adviser-personas.mjs';
import {studioGuide} from '../lib/adviser-guide.mjs';
const defaults=JSON.parse(fs.readFileSync(new URL('../lib/defaults.json',import.meta.url),'utf8'));
assert.deepEqual(Object.keys(personas).sort(),['aryan','happy','milky','nikhil','ritik']);
for(const id of Object.keys(personas)){
 const avatar=fs.readFileSync(new URL('../public/assets/ai-avatars/'+id+'.webp',import.meta.url));
 assert.equal(avatar.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(avatar.subarray(8,12).toString('ascii'),'WEBP');
 assert(avatar.length>10000, id+' avatar needs real image content');
 const greeting=studioGuide({id,name:personas[id].name},[{role:'user',content:'How are you?'}],defaults);
 assert.equal(greeting.mode,'guide');
 assert(greeting.answer.length<120,'Every persona should answer short social questions briefly');
 assert(!/pricing|contact|WhatsApp|book an appointment|studio guide/i.test(greeting.answer));
 const casual=adviserPrompt(id,defaults,false,[{role:'user',content:'How are you?'}]);
 assert(!casual.includes('startingINR'),'Pricing catalogue should not pollute casual prompts');
 const studio=adviserPrompt(id,defaults,false,[{role:'user',content:'How much is a VELORYZ design?'}]);
 assert(studio.includes('startingINR'),'A real studio question must have catalogue facts');
 assert(casual.includes('Reply in whichever language the user uses'),'Prompts must support multilingual replies');
}
const shell=fs.readFileSync(new URL('../lib/site-shell.ts',import.meta.url),'utf8');
assert(shell.includes('studio-warm-v3.css'),'Final warm stylesheet must be loaded');
assert(shell.indexOf('studio-warm-v3.css')>shell.indexOf('journey-planner.css'),'Warm layer must load after other site styles');
console.log('PASS: all five fictional avatar assets, concise social replies, separated studio facts, language guidance and final stylesheet ordering.');
