import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const inventory = JSON.parse(await readFile(new URL('content/drive-videos.json', root), 'utf8'));
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('public/catalog.js', root), 'utf8'), context);
const normalize = title => title.replace(/\.(mp4|mov)$/i, '').replace(/[\s_-]+/g, ' ').trim().toLowerCase();
const previous = new Map(context.window.FILMS.map(film => [normalize(film.originalTitle), film]));
const featuredTitles = ['Apple Tree_0.mp4', 'PRODUCT SHOOT PORTFOLIO.mp4', 'REEM.mp4', 'MANAKKAL-FURNITURE VIDEO 01.mp4', 'AMAL MSQUAD VIDEO.mp4'];
const featured = inventory.files.filter(file => featuredTitles.includes(file.title)).map(file => file.id);
const films = inventory.files.map(file => {
  if (!file.mime_type.startsWith('video/')) throw new Error('Only videos belong in the collection.');
  const old = previous.get(normalize(file.title));
  return {
    id: file.id,
    title: old?.title || file.title.replace(/\.(mp4|mov)$/i, '').replace(/_/g, ' '),
    originalTitle: file.title, source: 'portfolio', sourceLabel: 'Selected portfolio', platform: 'drive',
    category: old?.category || 'Experiments', image: `assets/drive-${file.id}.jpg`, url: file.url,
  };
});
if (new Set(films.map(film => film.id)).size !== films.length) throw new Error('Duplicate video IDs.');
await writeFile(new URL('public/catalog.js', root), '// Generated from content/drive-videos.json.\nwindow.PORTFOLIO_FEATURED = ' + JSON.stringify(featured) + ';\nwindow.FILMS = ' + JSON.stringify(films, null, 2) + ';\n');
await writeFile(new URL('content/video-ids.json', root), JSON.stringify(films.map(film => film.id), null, 2) + '\n');
const collection = { state: { items: films.map(film => ({ id: film.id, category: film.category, hidden: false, featured: featured.includes(film.id) })) }, revision: 0, canEdit: false };
// Reset curation only when the folder's membership changes, preserving later edits.
for (const name of ['content/collection.json', 'docs/collection.json']) {
  let current;
  try { current = JSON.parse(await readFile(new URL(name, root), 'utf8')); } catch {}
  const currentIds = current?.state?.items?.map(item => item.id) || [];
  if (currentIds.length !== films.length || currentIds.some(id => !films.some(film => film.id === id))) {
    await writeFile(new URL(name, root), JSON.stringify(collection, null, 2) + '\n');
  }
}
console.log(`Catalog now contains exactly ${films.length} videos from ${inventory.folderId}.`);
