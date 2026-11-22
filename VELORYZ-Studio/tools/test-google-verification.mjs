import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const expected='google-site-verification: googleb802659617480672.html';
const root=new URL('../',import.meta.url);
const file=readFileSync(new URL('public/googleb802659617480672.html',root),'utf8');
const handler=readFileSync(new URL('lib/page-handler.ts',root),'utf8');

assert.equal(file,expected,'The static verification file must contain the exact Google token, with no HTML wrapper or extra content.');
const route="if(path==='/googleb802659617480672.html')";
const at=handler.indexOf(route);
assert.ok(at>0,'An exact root route must handle Search Console verification.');
assert.ok(at<handler.indexOf("if(path==='/client'"),'Serve the verification token before any CMS or SPA routing.');
assert.ok(handler.slice(at,at+350).includes(expected),'The fallback route must return the exact token text.');
assert.match(handler.slice(at,at+350),/status:200/,'The verification handler must return HTTP 200.');
assert.match(handler.slice(at,at+350),/Content-Type.*text\/html/,'The token should be served as an HTML-file response.');
console.log('PASS: /googleb802659617480672.html returns the uploaded Google site-verification token verbatim.');
