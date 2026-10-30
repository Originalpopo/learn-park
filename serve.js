// Local preview server for learn-park / สนามเด็กเรียน (port 3003). Lessons live at /<subject>/<grade>/<lesson>.html.
// index.html is written without <!doctype>/<head> (the Artifact publish adds them), so add them here too.
// Lesson pages carry their own <!doctype> and are served as they are.
const http = require('http'), fs = require('fs'), path = require('path');
const HEAD = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const file = path.join(__dirname, path.normalize(url));
  if (!file.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    const needsHead = ext === '.html' && !/^\s*<!doctype/i.test(data.toString('utf8', 0, 64));
    res.end(needsHead ? Buffer.concat([Buffer.from(HEAD), data]) : data);
  });
}).listen(3003, () => console.log('learn-park on http://localhost:3003'));
