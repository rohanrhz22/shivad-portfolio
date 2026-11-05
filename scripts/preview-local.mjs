import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Read-only local preview for hosts where the Workers runtime cannot start.
const root = fileURLToPath(new URL('../public/', import.meta.url));
const publicRoot = await realpath(root);
const page = new URL('../content/index.html', import.meta.url);
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (pathname === '/api/portfolio') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ canEdit: false, revision: 0, state: null }));
      return;
    }
    let file;
    if (pathname === '/') file = page;
    else {
      file = await realpath(path.resolve(root, '.' + pathname));
      const relative = path.relative(publicRoot, file);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        res.writeHead(404); res.end(); return;
      }
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(pathname)] || (pathname === '/' ? types['.html'] : 'application/octet-stream') });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : 404); res.end();
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  console.log(`Shivad Films preview: http://127.0.0.1:${server.address().port}`);
  console.log('Read-only preview of the bundled collection. Owner editing uses npm run dev.');
});