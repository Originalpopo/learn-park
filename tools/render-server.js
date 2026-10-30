// Dev-only tool (not published): renders Kenney .glb models to transparent PNGs for the app.
// Usage: node learn-park/tools/render-server.js <folder with .glb files> <output folder>
// Then open http://localhost:3013/ — the page renders every model and POSTs each PNG back here.
const http = require('http'), fs = require('fs'), path = require('path');
const [models, out] = process.argv.slice(2).map(p => path.resolve(p));
if (!models || !out) { console.error('usage: render-server.js <models dir> <out dir>'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (req.method === 'POST' && url.startsWith('/save/')) {
    // /save/<name> saves a PNG; /save/<name>.webp or .json keep their extension (park layers + layout)
    const base = path.basename(url.slice(6)), ext = (base.match(/\.(webp|json)$/) || ['', 'png'])[1];
    const name = base.replace(/\.(webp|json)$/, '').replace(/[^a-z0-9-]/gi, '') + '.' + ext;
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const data = ext === 'json' ? Buffer.from(body) : Buffer.from(body.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      fs.writeFileSync(path.join(out, name), data);
      console.log('saved', name);
      res.end('ok');
    });
    return;
  }
  if (url === '/' || url === '/render.html') return send(res, path.join(__dirname, 'render.html'), 'text/html; charset=utf-8');
  if (url === '/park.html') return send(res, path.join(__dirname, 'park.html'), 'text/html; charset=utf-8');
  if (url === '/parks.js') return send(res, path.join(__dirname, 'parks.js'), 'text/javascript; charset=utf-8');
  if (url === '/list') { res.end(JSON.stringify(fs.readdirSync(models).filter(f => f.endsWith('.glb')))); return; }
  const file = path.join(models, path.normalize(url));
  if (!file.startsWith(models)) { res.writeHead(403); res.end(); return; }
  send(res, file, file.endsWith('.png') ? 'image/png' : 'model/gltf-binary');
}).listen(3013, () => console.log('render tool on http://localhost:3013'));

function send(res, file, type) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(data);
  });
}
