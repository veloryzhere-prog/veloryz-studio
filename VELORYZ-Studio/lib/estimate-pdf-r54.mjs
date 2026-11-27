// R52.4 — deterministic A4 estimate PDF, no external renderer or network dependency.
// Approved existing studio emblem from the deployed portal mail renderer.
const LOGO='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';
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function decode(s){let v=0,n=0,out=[];for(const c of s){if(c==='=')break;const i=alphabet.indexOf(c);if(i<0)throw Error('Invalid logo');v=(v<<6)|i;n+=6;if(n>=8){n-=8;out.push((v>>n)&255);}}return out;}
const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()+'>';
function dimensions(b){let i=2;while(i<b.length){if(b[i++]!==255)throw Error('JPEG invalid');while(b[i]===255)i++;const marker=b[i++],len=b[i]*256+b[i+1];if([192,193,194].includes(marker))return {h:b[i+3]*256+b[i+4],w:b[i+5]*256+b[i+6],channels:b[i+7]};if(len<2)break;i+=len;}throw Error('JPEG dimensions missing');}
const safe=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u20b9/g,'INR ').replace(/[^\x20-\x7e]/g,' ').replace(/\s+/g,' ').trim();
const pdfstr=s=>'('+String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')+')';
const money=n=>'INR '+(n/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const id=(s,p)=>typeof s==='string'&&new RegExp('^'+p+'[A-F0-9]{32}$').test(s);
function validate(d){
 const s=d?.snapshot,q=s?.quote;
 if(d?.renderer_version!=='r54-estimate-v1'||!id(d.document_code,'VZ-EST-')||!id(s?.client_code,'VZ-CL-')||!id(s?.project_code,'VZ-PR-')||!id(s?.reference,'VZ-SUB-')||!s.contact||!s.project||q?.currency!=='INR'||q.kind!=='indicative-estimate'||q.amountDuePaise!==0||!Array.isArray(q.lines)||q.lines.length<1||q.lines.length>18)throw Error('Invalid estimate snapshot');
 const amounts=[q.lowPaise,q.highPaise,q.contingencyPaise,...q.lines.map(x=>x.amountPaise)];
 if(!amounts.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1e12)||q.lines.reduce((t,x)=>t+x.amountPaise,0)!==q.lowPaise||q.lowPaise+q.contingencyPaise!==q.highPaise)throw Error('Inconsistent estimate totals');
 if(!Number.isFinite(Date.parse(d.created_at)))throw Error('Invalid issue date');
 return s;
}
export function makeEstimatePdf(d){
 const s=validate(d),q=s.quote,objs=[null],add=o=>(objs.push(o),objs.length-1),ref=i=>i+' 0 R';
 const catalog=add(''),pages=add(''),regular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 const bytes=decode(LOGO),dim=dimensions(bytes);if(dim.channels!==3)throw Error('Unexpected logo format');
 const imageData=hex(bytes),im=add('<< /Type /XObject /Subtype /Image /Width '+dim.w+' /Height '+dim.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length '+imageData.length+' >>\nstream\n'+imageData+'\nendstream');
 const pageIds=[];let commands=[],annotations=[],y=0;
 const navy='0.031 0.043 0.137',indigo='0.20 0.286 0.651',ink='0.086 0.106 0.165',muted='0.32 0.37 0.45',soft='0.953 0.961 0.98';
 const rect=(x,y,w,h,c)=>commands.push(c+' rg '+x+' '+y+' '+w+' '+h+' re f');
 const txt=(v,x,y,size=10,b=false,c=ink)=>commands.push('BT /'+(b?'F2':'F1')+' '+size+' Tf '+c+' rg 1 0 0 1 '+x+' '+y+' Tm '+pdfstr(safe(v))+' Tj ET');
 const wrapped=(v,max)=>{const str=safe(v)||'See original registration data';let a=[],line='';for(const word of str.split(' ')){for(let i=0;i<word.length;i+=max){const w=word.slice(i,i+max);if(line&&(line+' '+w).length>max){a.push(line);line='';}line+=(line?' ':'')+w;}}if(line)a.push(line);return a;};
 const block=(label,v)=>{txt(label,40,y,8,true,indigo);y-=14;for(const line of wrapped(v,78)){if(y<90){end();start('Estimate / continued');}txt(line,40,y,10);y-=14;}y-=7;};
 const link=(label,url,x,w)=>{rect(x,40,w,25,indigo);txt(label,x+9,49,9,true,'1 1 1');annotations.push(add('<< /Type /Annot /Subtype /Link /Rect ['+x+' 40 '+(x+w)+' 65] /Border [0 0 0] /A << /S /URI /URI '+pdfstr(url)+' >> >>'));};
 function start(title){commands=[];annotations=[];rect(0,744,595,98,navy);rect(0,741,595,3,'0.875 0.376 0.612');const w=48,h=w*dim.h/dim.w;commands.push('q '+w+' 0 0 '+h+' 40 '+(780-h/2)+' cm /Logo Do Q');txt('VELORYZ STUDIO',102,791,22,true,'1 1 1');txt('REGISTRATION / COMMERCIAL PLANNING',103,774,9,true,'0.87 0.90 1');txt(title,40,710,24,true);txt('INDICATIVE ESTIMATE  |  NOT A TAX INVOICE',40,690,9,true,indigo);y=664;}
 function end(){link('Client portal','https://veloryz.online/client/',40,115);link('Client guide','https://veloryz.online/docs/client-portal.html',166,115);link('Support','https://veloryz.online/support/',292,100);txt('VELORYZ  /  veloryz.online  /  Page '+(pageIds.length+1),40,22,8,false,muted);const stream=commands.join('\n');const content=add('<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream');pageIds.push(add('<< /Type /Page /Parent '+ref(pages)+' /MediaBox [0 0 595 842] /Resources << /Font << /F1 '+ref(regular)+' /F2 '+ref(bold)+' >> /XObject << /Logo '+ref(im)+' >> >> /Contents '+ref(content)+' /Annots ['+annotations.map(ref).join(' ')+'] >>'));}
 start('Project registration estimate');
 block('ESTIMATE ID  /  ISSUE DATE',d.document_code+'  |  '+new Date(d.created_at).toISOString().slice(0,10));
 block('REGISTRATION REFERENCE',s.reference);block('CLIENT ID',s.client_code);block('PROJECT ID',s.project_code);
 block('PREPARED FOR',s.contact.name+' / '+s.contact.email+(s.contact.company?' / '+s.contact.company:''));
 block('PROJECT',s.project.category+' / '+String(s.project.pages||'To review')+' pages / '+String(s.project.timeline||'To review'));
 rect(40,y-76,515,76,navy);txt('INDICATIVE PLANNING RANGE',54,y-18,9,true,'0.87 0.90 1');txt(money(q.lowPaise)+' - '+money(q.highPaise),54,y-43,18,true,'1 1 1');txt('Payment due now: INR 0.00',54,y-61,10,true,'1 1 1');y-=94;
 for(const line of wrapped('Planning only. Final scope, third-party fees, licences, hosting and applicable taxes require written approval. No payment is requested.',90)){txt(line,40,y,9,false,muted);y-=13;}
 txt('Full original Unicode snapshot attached to this PDF. Visible text uses Latin-safe rendering.',40,y-13,8,false,muted);
 end();start('Scope & cost allowances');
 txt('ITEM / PLANNING ALLOWANCE',40,y,9,true,indigo);txt('AMOUNT',415,y,9,true,indigo);y-=18;
 const item=(label,amount)=>{if(y<112){end();start('Scope & cost allowances / continued');}rect(40,y-7,515,21,soft);txt(safe(label).slice(0,55),48,y,10);txt(money(amount),415,y,10,true);y-=25;};
 for(const l of q.lines)item(l.label,l.amountPaise);item('Lower planning estimate',q.lowPaise);item('Scope contingency',q.contingencyPaise);item('Upper planning estimate',q.highPaise);
 if(y<170){end();start('Project objective');}
 block('PROJECT OBJECTIVE',s.project.goal);block('PRICING VERSION',String(q.pricingVersion||'Not recorded')+' / published revision '+String(q.publishedRevision??'Not recorded'));
 end();
 // Embedded immutable source data retains original Unicode without inventing font coverage.
 const raw=new TextEncoder().encode(JSON.stringify(s,null,2)),attachment=hex(raw),embedded=add('<< /Type /EmbeddedFile /Subtype /application#2Fjson /Filter /ASCIIHexDecode /Length '+attachment.length+' >>\nstream\n'+attachment+'\nendstream'),spec=add('<< /Type /Filespec /F (registration-snapshot.json) /EF << /F '+ref(embedded)+' >> >>');
 objs[pages]='<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(ref).join(' ')+'] >>';
 objs[catalog]='<< /Type /Catalog /Pages '+ref(pages)+' /Names << /EmbeddedFiles << /Names [(registration-snapshot.json) '+ref(spec)+'] >> >> >>';
 let pdf='%PDF-1.7\n',offsets=[0];for(let i=1;i<objs.length;i++){offsets.push(pdf.length);pdf+=i+' 0 obj\n'+objs[i]+'\nendobj\n';}const xref=pdf.length;pdf+='xref\n0 '+objs.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+objs.length+' /Root '+ref(catalog)+' >>\nstartxref\n'+xref+'\n%%EOF\n';
 return new TextEncoder().encode(pdf);
}
