import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const origin='http://127.0.0.1:5173';
const context={window:{}};vm.runInNewContext(readFileSync('public/catalog.js','utf8'),context);
const films=context.window.FILMS;
const featured=['cfu-XLeZXH4','13XfIpgDFnW89iUTpTxB9p-p1uXIV0w7D','1CtdcPCaLHccBGir5st1dAYHiLr_Ce2CI','kuUCt8yEowc','UGoMkOqnYiI'];
const baseline={items:films.map(f=>({id:f.id,category:f.category,hidden:false,featured:featured.includes(f.id)}))};
const page=await fetch(origin);assert.equal(page.status,200);assert.match(await page.text(),/shivad-hero.png/);
for(const path of ['/theme.css','/app.js','/manager.js','/catalog.js','/assets/shivad-hero.png'])assert.equal((await fetch(origin+path)).status,200,path);
const anonymous=await fetch(origin+'/api/portfolio');assert.equal((await anonymous.json()).canEdit,false);
const spoof=await fetch(origin+'/api/portfolio',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'rohanrameshdop@gmail.com'}});assert.equal((await spoof.json()).canEdit,false);
// Only the starter's local development sign-in, never a production credential.
const signIn=await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});
const cookie=signIn.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie,'local mock sign-in cookie');
const read=async()=>{const r=await fetch(origin+'/api/portfolio',{headers:{Cookie:cookie}});assert.equal(r.status,200);return r.json();};
const put=async(state,revision)=>fetch(origin+'/api/portfolio',{method:'PUT',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({state,revision})});
const before=await read();assert.equal(before.canEdit,true);
const state=structuredClone(before.state||baseline);state.items.reverse();state.items[0].hidden=true;state.items[1].category='Presentations';
let changed=false;
try{
  assert.equal((await put(state,before.revision)).status,200);changed=true;
  const after=await read();assert.deepEqual(after.state,state);assert.equal(after.revision,before.revision+1);
  assert.equal((await put(state,before.revision)).status,409);
  console.log('Preview passed: page and assets, authenticated editing, persisted reorder/removal/category, stale-save protection, spoofed-header rejection.');
}finally{if(changed){const latest=await read();assert.equal((await put(before.state||baseline,latest.revision)).status,200);console.log('Preview collection restored.');}}
