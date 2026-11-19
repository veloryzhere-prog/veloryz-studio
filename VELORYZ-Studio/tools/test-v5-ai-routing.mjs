import assert from 'node:assert/strict';
import {adviserNavigation,rankTopic,validStudioRoute} from '../lib/adviser-navigation.mjs';
const cases=[['How much does a website cost if I book a call?','pricing'],['Please debug this website error','technology'],['Can we schedule a meeting?','booking'],['I already paid but need an invoice','payment'],['Design a modern logo','design']];
for(const [question,intent] of cases)assert.equal(rankTopic(question)?.id,intent,question);
for(const [question] of cases){const result=adviserNavigation(question,'/services/','happy');for(const link of result.links)assert.equal(validStudioRoute(link.url),true);assert.ok(result.suggestions.length>0);}
console.log('V5 AI intent tests passed');
