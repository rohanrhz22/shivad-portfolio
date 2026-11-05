import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function editor(storageUnavailable = false) {
  const values = new Map();
  const localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { if(storageUnavailable) throw new Error('Quota exceeded'); values.set(key, value); },
    removeItem: key => values.delete(key),
  };
  const sandbox = { window: {}, location: { pathname: '/shivad-portfolio/' }, localStorage };
  vm.runInNewContext(readFileSync(new URL('../public/catalog.js', import.meta.url), 'utf8'), sandbox);
  vm.runInNewContext(readFileSync(new URL('../public/collection-editor.js', import.meta.url), 'utf8'), sandbox);
  const state = { items: sandbox.window.FILMS.map(f => ({ id: f.id, category: f.category, hidden: false, featured: false })) };
  return { api: sandbox.window.PagesCollection, state, values };
}

test('reordered and removed films persist locally and export with no edit permission', () => {
  const { api, state } = editor();
  const published = structuredClone(state);
  state.items.reverse(); state.items[0].hidden = true; state.items[1].featured = true;
  api.save(state, published);
  assert.equal(JSON.stringify(api.load(published)), JSON.stringify(state));
  const output = JSON.parse(api.exportLayout(state));
  assert.deepEqual(output.state, JSON.parse(JSON.stringify(state)));
  assert.equal(output.canEdit, false);
  assert.equal(output.state.items.length, 35);
  output.state.items[0].hidden = false;
  assert.ok(api.valid(output.state), 'removed films remain restorable');
});
test('new published layouts supersede browser previews and reset restores the public layout', () => {
  const { api, state } = editor();
  api.save(state, null);
  assert.equal(api.load(state), state);
  api.reset();
  assert.equal(api.load(null), null);
});
test('malformed storage and incomplete or duplicate collections cannot replace public films', () => {
  const { api, state, values } = editor();
  values.set('shivad-layout:/shivad-portfolio/', '{broken');
  assert.equal(api.load(state), state);
  for(const change of [s => s.items.pop(), s => s.items[0] = s.items[1], s => s.items[0].hidden = 'yes', s => s.items.slice(0,7).forEach(item => item.featured = true)]) {
    const invalid = structuredClone(state); change(invalid);
    assert.equal(api.valid(invalid), false);
    assert.throws(() => api.exportLayout(invalid));
  }
});
test('unavailable storage reports failure so unsaved edits are not reported as saved', () => {
  const { api, state } = editor(true);
  assert.throws(() => api.save(state, null), /could not save/);
  assert.ok(JSON.parse(api.exportLayout(state)).state, 'download still works without storage');
});
