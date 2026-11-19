const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const response=(data,status=200)=>Response.json(data,{status,headers});
const reject=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const clean=(value,max,required=false)=>{const s=String(value??'').trim();if((required&&!s)||s.length>max||/[<>\x00-\x1f]/.test(s.replace(/[\n\r\t]/g,'')))reject('Please check the form fields and their length.');return s;};
const uuid=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const consultationTimes=['10:00 AM – 11:00 AM','11:00 AM – 12:00 PM','12:00 PM – 1:00 PM','2:00 PM – 3:00 PM','3:00 PM – 4:00 PM','4:00 PM – 5:00 PM','5:00 PM – 6:00 PM'];
const fields='id,reference,name,email,phone,service,budget,preferred_date,preferred_time,company,message,status,notes,version,created_at,updated_at';
async function readBody(request){
 if(!request.headers.get('content-type')?.includes('application/json'))reject('Send a JSON request.',415);
 const reader=request.body?.getReader();if(!reader)reject('The request is empty.');let length=0,parts=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>16000){await reader.cancel();reject('Keep your request under 16 KB.',413);}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
 try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')reject('The request could not be read.');return data;}catch(error){if(error.status)throw error;reject('The request could not be read.');}
}
async function hash(value){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
function validateSchedule(day,time){
 const local=new Date(Date.now()+330*60000),today=local.toISOString().slice(0,10),last=new Date(Date.now()+180*86400000+330*60000).toISOString().slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day||day<today||day>last)reject('Choose a date within the next 180 days.');
 if(!consultationTimes.includes(time))reject('Choose a valid consultation time.');
 const hour=Number(time.split(':')[0])+(time.startsWith('12:')?0:time.split(' – ')[0].includes('PM')?12:0);
 if(day===today&&hour<=local.getUTCHours())reject('That time has already passed. Choose a later time or another day.');
}
export async function submitEnquiry(request,env,state){
 if(!env.DB)reject('The enquiry service is temporarily unavailable. Please contact the studio directly.',503);
 const input=await readBody(request);
 if(input.consent!==true)reject('Please agree to share your enquiry with the studio.');
 if(input.website)reject('The request could not be accepted.');
 const data={id:clean(input.requestId,36,true),name:clean(input.name,100,true),email:clean(input.email,180,true).toLowerCase(),phone:clean(input.phone,20),service:clean(input.service,120,true),budget:clean(input.budget,100),preferred_date:clean(input.date,10,true),preferred_time:clean(input.time,40,true),company:clean(input.company,200),message:clean(input.message,2000,true)};
 if(!uuid(data.id))reject('Please reload the form and try again.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))reject('Enter a valid email address.');
 if(data.phone&&(!/^\+?[0-9 ()-]{8,20}$/.test(data.phone)||!/^\d{8,15}$/.test(data.phone.replace(/\D/g,''))))reject('Enter a phone number with its country code, or leave it empty.');
 if(data.message.length<10)reject('Tell us a little more about your project.');
 const fingerprint=await hash(JSON.stringify(data)),existing=await env.DB.prepare('SELECT reference,fingerprint FROM studio_enquiries WHERE id=?').bind(data.id).first();
 if(existing){if(existing.fingerprint!==fingerprint)reject('This request was already received. Use Send another request for a new enquiry.',409);return response({ok:true,reference:existing.reference,status:'received'});}
 if(!state.services.some(s=>s.name===data.service)&&data.service!=='Not sure yet — let’s discuss')reject('Choose a current service from the form.');
 validateSchedule(data.preferred_date,data.preferred_time);
 const rateKey=await hash(data.email),networkKey=await hash(request.headers.get('cf-connecting-ip')||request.headers.get('user-agent')||'unknown-client'),created=new Date().toISOString(),since=new Date(Date.now()-3600000).toISOString(),reference='VZ-'+data.id.replaceAll('-','').slice(0,12).toUpperCase();
 const saved=await env.DB.prepare(`INSERT INTO studio_enquiries (id,reference,name,email,phone,service,budget,preferred_date,preferred_time,company,message,status,notes,version,fingerprint,rate_key,network_key,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,'new','',0,?,?,?,?,? WHERE (SELECT count(*) FROM studio_enquiries WHERE rate_key=? AND created_at>?)<3 AND (SELECT count(*) FROM studio_enquiries WHERE network_key=? AND created_at>?)<30 ON CONFLICT(id) DO NOTHING`).bind(data.id,reference,data.name,data.email,data.phone,data.service,data.budget,data.preferred_date,data.preferred_time,data.company,data.message,fingerprint,rateKey,networkKey,created,created,rateKey,since,networkKey,since).run();
 if(!saved.meta?.changes){const retry=await env.DB.prepare('SELECT reference,fingerprint FROM studio_enquiries WHERE id=?').bind(data.id).first();if(retry?.fingerprint===fingerprint)return response({ok:true,reference:retry.reference,status:'received'});reject('Too many requests. Please try again in an hour or contact the studio directly.',429);}
 return response({ok:true,reference,status:'received'},201);
}
export async function enquiryAdmin(request,env,path){
 if(path==='/api/admin/enquiries'&&request.method==='GET'){
  const query=new URL(request.url).searchParams,page=Math.min(10000,Math.max(0,Number.parseInt(query.get('page')||'0',10)||0)),filter=query.get('status')||'all';
  if(!['all','new','contacted','confirmed','closed'].includes(filter))reject('Choose a valid status.');
  const condition=filter==='all'?'1=1':'status=?',values=filter==='all'?[]:[filter];
  const items=await env.DB.prepare(`SELECT ${fields} FROM studio_enquiries WHERE ${condition} ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?`).bind(...values,page*25).all();
  const total=await env.DB.prepare(`SELECT count(*) AS total FROM studio_enquiries WHERE ${condition}`).bind(...values).first();
  return response({items:items.results,total:total.total,page});
 }
 const id=path.split('/').at(-1);if(!uuid(id)||request.method!=='PUT')return response({error:'Not found.'},404);
 const data=await readBody(request);if(!['new','contacted','confirmed','closed'].includes(data.status)||!Number.isInteger(data.version))reject('Choose a valid status and revision.');
 const row=await env.DB.prepare('SELECT preferred_date,preferred_time FROM studio_enquiries WHERE id=?').bind(id).first();if(!row)reject('This enquiry could not be found.',404);
 if(data.status==='confirmed')validateSchedule(row.preferred_date,row.preferred_time);
 let updated;try{updated=await env.DB.prepare(`UPDATE studio_enquiries SET status=?,notes=?,version=version+1,updated_at=? WHERE id=? AND version=? RETURNING ${fields}`).bind(data.status,clean(data.notes,3000),new Date().toISOString(),id,data.version).first();}catch(error){if(String(error.message).includes('UNIQUE'))reject('Another consultation is confirmed for this time. Contact the visitor to arrange another slot.',409);throw error;}
 if(!updated)reject('This enquiry changed in another tab. Refresh the inbox before saving.',409);
 return response({ok:true,item:updated});
}
