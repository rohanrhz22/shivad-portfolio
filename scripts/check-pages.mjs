import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { validateState } from '../server/portfolio.mjs';

const root = new URL('../docs/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(html, /data-collection-url="\.\/collection.json"/);
assert.doesNotMatch(html, /(?:href|src)="\/(?!\/)/);
assert.match(html, /data-pages-editor="true"/);
assert.match(html, /id="manage-open"/);
assert.match(html, /id="manage-download"/);
assert.match(html, /src="\.\/collection-editor.js"/);
assert.match(html, /src="\.\/manager.js"/);
for (const [, name] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) {
  await access(new URL(name, root));
}
const sandbox = { window: {} };
vm.runInNewContext(await readFile(new URL('catalog.js', root), 'utf8'), sandbox);
const films = sandbox.window.FILMS;
const inventory = JSON.parse(await readFile(new URL('../content/drive-videos.json', root), 'utf8'));
assert.deepEqual(Array.from(films, film => film.id).sort(), inventory.files.map(file => file.id).sort());
assert.equal(films.length, 35);
assert.equal(new Set(films.map(f => f.id)).size, 35);
for (const film of films) {
  assert.ok(film.image.startsWith('assets/'));
  await access(new URL(film.image, root));
}
const collection = JSON.parse(await readFile(new URL('collection.json', root), 'utf8'));
assert.equal(collection.canEdit, false);
assert.ok(collection.state === null || validateState(collection.state, films.map(f => f.id)));
await access(new URL('.nojekyll', root));
console.log('Pages checks passed: relative URLs, all 35 films and thumbnails, valid collection, browser editor and export controls.');
