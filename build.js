// Builds the static site for GitHub Pages into _site/: copies the app files and gives index.html the
// <!doctype>/<head> it is written without (the Artifact publish and serve.js add them the same way).
// Dev-only files (tools/, this script, serve.js, README, DESIGN) are left out.
const fs = require('fs'), path = require('path');
const HEAD = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
const SKIP = new Set(['_site', 'tools', '.git', '.github', 'node_modules', 'build.js', 'serve.js', 'README.md', 'DESIGN.md', '.gitignore']);
const root = __dirname, out = path.join(root, '_site');

fs.rmSync(out, { recursive: true, force: true });
(function copy(dir, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    if (dir === root && SKIP.has(name)) continue;
    const src = path.join(dir, name), dst = path.join(to, name);
    if (fs.statSync(src).isDirectory()) { copy(src, dst); continue; }
    if (name.endsWith('.html')) {
      const html = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dst, /^\s*<!doctype/i.test(html) ? html : HEAD + html);
    } else fs.copyFileSync(src, dst);
  }
})(root, out);
console.log('built', out);
