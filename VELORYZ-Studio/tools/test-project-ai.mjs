import assert from 'node:assert/strict';
import {projectCreatorAi} from '../lib/studio-platform.mjs';

const makeRequest=(messages,context={},ip='198.51.100.23')=>new Request('https://veloryz.online/api/project-ai',{
 method:'POST',
 headers:{'Content-Type':'application/json','CF-Connecting-IP':ip},
 body:JSON.stringify({messages,context})
});
const messages=[{role:'user',content:'What should a simple SaaS app include?'}];
const context={category:'SaaS / platform',features:['Member accounts','Admin dashboard'],budget:'100000',goal:'A dashboard that helps clients see their progress',stage:'features-apps-platforms'};
let runs=0,prompt='';
const configuredAI={
 AI:{async run(model,input){
  runs++;prompt=input.messages[0].content;
  assert.match(model,/llama-3.1-8b-instruct/);
  return {response:'Start with member login, a simple dashboard and clear role permissions. We can phase extra features later.'};
 }}
};
let reply=await projectCreatorAi(makeRequest(messages,context),configuredAI);
assert.equal(reply.status,200);
let body=await reply.json();
assert.equal(body.agent,'VELORYZ Project AI');
assert.equal(body.mode,'ai');
assert.equal(body.available,true);
assert.match(body.answer,/dashboard/);
assert.match(prompt,/Team|team/);
assert.match(prompt,/Do not promise discounts/);
assert.equal(runs,1);
reply=await projectCreatorAi(makeRequest(messages,context,'198.51.100.24'),{});
body=await reply.json();
assert.equal(reply.status,503);
assert.equal(body.available,false);
assert.equal(body.code,'PROJECT_AI_UNAVAILABLE');
await assert.rejects(()=>projectCreatorAi(makeRequest([{role:'assistant',content:'invalid'}],context,'198.51.100.25'),configuredAI),/valid project conversation/);
await assert.rejects(()=>projectCreatorAi(makeRequest([{role:'user',content:'x'.repeat(651)}],context,'198.51.100.26'),configuredAI),/check the message contents/);
console.log('PASS: real-model binding path, dedicated project prompt, unavailable response and input validation.');
