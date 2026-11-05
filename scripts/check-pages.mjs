import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { validateState } from '../server/portfolio.mjs';

const root = new URL('../docs/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(html, /data-collection-url="\.\/collection.json"/);
assert.doesNotMatch(html, /(?:href|src)="\/(?!\/)/);
assert.doesNotMatch(html, /id="manager"|id="manage-open"|src="\.\/manager.js"/);
for (const [, name] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) {
  await access(new URL(name, root));
}
const sandbox = { window: {} };
vm.runInNewContext(await readFile(new URL('catalog.js', root), 'utf8'), sandbox);
const films = sandbox.window.FILMS;
assert.equal(films.length, 121);
assert.equal(new Set(films.map(f => f.id)).size, 121);
for (const film of films) {
  assert.ok(film.image.startsWith('assets/'));
  await access(new URL(film.image, root));
}
const collection = JSON.parse(await readFile(new URL('collection.json', root), 'utf8'));
assert.equal(collection.canEdit, false);
assert.ok(collection.state === null || validateState(collection.state, films.map(f => f.id)));
await access(new URL('.nojekyll', root));
console.log('Pages checks passed: relative URLs, all 121 films and thumbnails, valid collection, no owner controls.');
