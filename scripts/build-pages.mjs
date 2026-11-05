import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateState } from '../server/portfolio.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('docs/', root);
const ids = JSON.parse(await readFile(new URL('content/video-ids.json', root), 'utf8'));
const collection = JSON.parse(await readFile(new URL('content/collection.json', root), 'utf8'));
if (collection.state !== null && !validateState(collection.state, ids)) {
  throw new Error('The Pages collection must include all catalog IDs with valid settings.');
}
await mkdir(output, { recursive: true });
for (const name of ['assets', 'theme.css', 'app.js', 'catalog.js', 'favicon.svg']) {
  await cp(new URL(`public/${name}`, root), new URL(name, output), { recursive: true });
}
let html = await readFile(new URL('content/index.html', root), 'utf8');
html = html.replace('<html lang="en">', '<html lang="en" data-collection-url="./collection.json">')
  .replace(/\b(href|src)="\/(?!\/)/g, '$1="./')
  .replace(/<button id="manage-open"[^>]*>[\s\S]*?<\/button>/, '')
  .replace(/<dialog id="manager"[\s\S]*?<\/dialog>/, '')
  .replace(/<script src="\.\/manager\.js" defer><\/script>/, '');
await writeFile(new URL('index.html', output), html);
await writeFile(new URL('collection.json', output), JSON.stringify({ state: collection.state, revision: 0, canEdit: false }, null, 2) + '\n');
await writeFile(new URL('.nojekyll', output), '');
console.log(`GitHub Pages files ready: ${fileURLToPath(output)}`);
