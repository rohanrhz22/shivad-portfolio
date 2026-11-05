export const CATEGORIES = ['Brand films','Products','Spaces','Presentations','People & stories','Experiments'];
const OWNER_EMAIL = 'rohanrameshdop@gmail.com';
const json = (body,status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function canEdit(request) {
  return Boolean(request.headers.get('oai-authenticated-user-id')) && request.headers.get('oai-authenticated-user-email')?.toLowerCase() === OWNER_EMAIL;
}
export function validateState(value, ids) {
  if (!value || !Array.isArray(value.items) || value.items.length !== ids.length) return false;
  const seen = new Set();
  return value.items.every(item => {
    if (!item || !ids.includes(item.id) || seen.has(item.id) || !CATEGORIES.includes(item.category) || typeof item.hidden !== 'boolean' || typeof item.featured !== 'boolean') return false;
    seen.add(item.id); return true;
  }) && value.items.filter(x=>x.featured && !x.hidden).length <= 6;
}
export async function portfolioApi(request, env, ids) {
  const editable = canEdit(request);
  if (request.method === 'GET') {
    try {
      const row = await env.DB.prepare('SELECT revision,state FROM portfolio_state WHERE id=1').first();
      return json({canEdit:editable,revision:row?.revision || 0,state:row ? JSON.parse(row.state) : null});
    } catch { return json({error:'The saved collection could not be loaded. Please try again.'},503); }
  }
  if (request.method !== 'PUT') return json({error:'Method not allowed.'},405);
  if (!editable) return json({error:'Sign in with the portfolio owner account to save changes.'},403);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'This request must come from the portfolio.'},403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'JSON required.'},415);
  if (Number(request.headers.get('content-length')) > 100000) return json({error:'Request too large.'},413);
  let input;
  try { const body=await request.text(); if(body.length>100000)return json({error:'Request too large.'},413); input=JSON.parse(body); } catch {return json({error:'Invalid request.'},400);}
  if (!Number.isSafeInteger(input.revision) || input.revision<0 || !validateState(input.state,ids)) return json({error:'The collection contains invalid or missing videos.'},400);
  const state={items:input.state.items.map(({id,category,hidden,featured})=>({id,category,hidden,featured}))};
  try {
    const updated=input.revision===0
      ? await env.DB.prepare('INSERT INTO portfolio_state (id,revision,state) VALUES (1,1,?) ON CONFLICT(id) DO NOTHING RETURNING revision').bind(JSON.stringify(state)).first()
      : await env.DB.prepare('UPDATE portfolio_state SET revision=revision+1,state=? WHERE id=1 AND revision=? RETURNING revision').bind(JSON.stringify(state),input.revision).first();
    if (!updated) return json({error:'This portfolio changed on another device. Reload the saved collection before editing again.'},409);
    return json({revision:updated.revision,state,canEdit:true});
  } catch { return json({error:'Changes could not be saved. Your edits are still here; please retry.'},503); }
}
