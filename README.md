# สนามเด็กเรียน (learn-park)

A small learning web app for one child, used on an iPad: tap-to-explain lessons (คณิต ป.4 เทอม 2 so far),
a skate-park home page where each chapter is a park zone and each lesson a stop.

Plain HTML/CSS/JS, no build tools. Progress (stars, EXP) is saved in the browser's
`localStorage` under the key `learn-at-home` (the app's first name; kept so saved progress survives renames).

## Run locally

```bash
node serve.js    # http://localhost:3003
```

## Deploy

Pushing to `main` builds `_site/` with `node build.js` and deploys it to GitHub Pages
(`.github/workflows/pages.yml`).

## Layout

- `index.html` home page (written without `<!doctype>`/`<head>`; `serve.js`, `build.js` and the Claude
  artifact publish add them)
- `math/p4/6-1.html` lessons, at `<subject>/<grade>/<topic>.html`; `math/p4/ch7.js`/`ch8.js` (+ `.css`) helpers shared by one chapter's lessons
- `shared/core.css`, `shared/core.js` shared look and lesson shell; the lesson list `COURSES` is in core.js
- `shared/parks.js` where each skate-park stop sits on its picture (generated)
- `DESIGN.md` the look of the site (colours, buttons, lessons, map): follow it for anything new
- `tools/` dev-only: `render.html` renders single Kenney models; `cut.html` cuts the painted park pictures in `tools/incoming/` into the map layers; `ART-STYLE.md` the style block to give an image AI for new pictures

## Credits

- 3D skate park models: [Kenney "Mini Skate"](https://kenney.nl/assets/mini-skate), CC0
- Park map pictures and the home page scene: painted with an image AI in the Kenney style
- Stars, lock: [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), MIT
