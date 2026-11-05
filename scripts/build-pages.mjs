import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateState } from '../server/portfolio.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('docs/', root);
const ids = JSON.parse(await readFile(new URL('content/video-ids.json', root), 'utf8'));
// Preserve collections uploaded directly to GitHub through the Pages editor.
let collectionText;
try { collectionText = await readFile(new URL('collection.json', output), 'utf8'); }
catch(error) { if(error.code !== 'ENOENT') throw error; collectionText = await readFile(new URL('content/collection.json', root), 'utf8'); }
const collection = JSON.parse(collectionText);
if (collection.state !== null && !validateState(collection.state, ids)) {
  throw new Error('The Pages collection must include all catalog IDs with valid settings.');
}
await mkdir(output, { recursive: true });
for (const name of ['assets', 'theme.css', 'app.js', 'catalog.js', 'favicon.svg', 'manager.js', 'collection-editor.js']) {
  await cp(new URL(`public/${name}`, root), new URL(name, output), { recursive: true });
}
let html = await readFile(new URL('content/index.html', root), 'utf8');
html = html.replace('<html lang="en">', '<html lang="en" data-collection-url="./collection.json" data-pages-editor="true">')
  .replace(/\b(href|src)="\/(?!\/)/g, '$1="./')
  .replace('<script src="./app.js" defer>', '<script src="./collection-editor.js" defer></script><script src="./app.js" defer>')
  .replace('Manage portfolio ↗', 'Manage videos ↗')
  .replace('THE EDIT ROOM / OWNER ACCESS', 'THE EDIT ROOM / BROWSER PREVIEW')
  .replace('Changes appear on the portfolio after saving.', 'Preview changes stay on this browser. Publish through GitHub to update the page for everyone.')
  .replace('Save changes ↗', 'Save preview ↗')
  .replace('<div class="manager-toolbar">', `<div class="pages-publish"><p>Reorder with ↑ / ↓ or drag a row. Remove hides a video; Show removed lets you restore it. Saving a preview only changes this browser.</p><details><summary>Publish for everyone</summary><ol><li>Click <strong>Download layout</strong> below.</li><li><a href="https://github.com/rohanrhz22/shivad-portfolio/upload/main/docs" target="_blank" rel="noopener noreferrer">Open the GitHub upload page ↗</a> and sign in with repository access.</li><li>Upload the downloaded <strong>collection.json</strong> into <strong>docs</strong> and commit the change to main. This replaces the existing file.</li><li>Wait for GitHub Pages to finish deploying, then refresh the site. Only repository collaborators can publish.</li></ol></details></div><div class="manager-toolbar">`)
  .replace('<button id="manage-discard"', '<button id="manage-published" class="secondary">Use published layout</button><button id="manage-download" class="secondary">Download layout ↓</button><button id="manage-discard"');
await writeFile(new URL('index.html', output), html);
await writeFile(new URL('collection.json', output), JSON.stringify({ state: collection.state, revision: 0, canEdit: false }, null, 2) + '\n');
await writeFile(new URL('.nojekyll', output), '');
console.log(`GitHub Pages files ready: ${fileURLToPath(output)}`);
