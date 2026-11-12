// Static server with firebase.json's hosting behaviour: serve the file if it exists, otherwise
// rewrite to /index.html, gzipped like Firebase Hosting. Usage: node serve.mjs <dir> <port>
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createGzip } from 'node:zlib';
import { extname, join, normalize, resolve } from 'node:path';

/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/**
 * @param {string} dir
 * @param {number} port
 */
export function serve(dir, port) {
  const root = resolve(dir);
  /** @param {string} path */
  const isFile = path => {
    try {
      return statSync(path).isFile();
    } catch {
      return false;
    }
  };
  return createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    let file = normalize(join(root, pathname));
    if (!file.startsWith(root) || !isFile(file)) file = join(root, 'index.html');
    const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ...(gzip && { 'Content-Encoding': 'gzip' }),
    });
    const body = createReadStream(file);
    (gzip ? body.pipe(createGzip()) : body).pipe(res);
  }).listen(port);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const [dir, port] = process.argv.slice(2);
  serve(dir, Number(port));
  console.log(`serving ${dir} on http://localhost:${port}`);
}
