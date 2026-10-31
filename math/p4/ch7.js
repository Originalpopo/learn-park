/* บทที่ 7 ทศนิยม: helpers shared by lessons 7.1-7.4.
   Every number is kept as a whole count of thousandths (2350 = 2.35), so adding, taking away and comparing are exact.
   Exposed as window.D7. */
window.D7 = (() => {
const { ri, pick, shuffle } = L;

/* ---------- numbers ---------- */
// how many digits after the point the number needs (2350 → 2)
const places = v => v % 1000 === 0 ? 0 : v % 100 === 0 ? 1 : v % 10 === 0 ? 2 : 3;
// as text, with p digits after the point (p may be more than the number needs: 2.5 with p 2 → "2.50")
const fmt = (v, p = places(v)) => {
  const w = Math.floor(v / 1000), r = String(v % 1000).padStart(3, '0');
  return p ? `${w}.${r.slice(0, p)}` : `${w}`;
};
// as big display digits, the point in orange
const dn = (v, p = places(v)) => `<span class="dn">${fmt(v, p).replace('.', '<b>.</b>')}</span>`;
// digit of v at a place: 0 ones, -1 tens, 1 tenths, 2 hundredths, 3 thousandths
const digitAt = (v, k) => Math.floor(v / 10 ** (3 - k)) % 10;
const PLACE = { '-1': 'หลักสิบ', 0: 'หลักหน่วย', 1: 'หลักส่วนสิบ', 2: 'หลักส่วนร้อย', 3: 'หลักส่วนพัน' };
// the value a digit stands for at place k, in thousandths
const valueAt = (d, k) => d * 10 ** (3 - k);

/* ---------- reading in Thai: whole part as usual, then จุด, then each digit on its own ---------- */
const DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
function thaiInt(n) {
  if (n === 0) return 'ศูนย์';
  const s = String(n), UNIT = ['', 'สิบ', 'ร้อย', 'พัน'];
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const d = +s[i], pos = s.length - 1 - i;
    if (!d) continue;
    if (pos === 1) out += (d === 1 ? '' : d === 2 ? 'ยี่' : DIG[d]) + 'สิบ';
    else if (pos === 0) out += d === 1 && n > 10 ? 'เอ็ด' : DIG[d];
    else out += DIG[d] + UNIT[pos];
  }
  return out;
}
const read = (v, p = places(v)) => {
  const [w, r] = fmt(v, p).split('.');
  return thaiInt(+w) + (r ? 'จุด' + [...r].map(c => DIG[+c]).join('') : '');
};

/* ---------- pictures ---------- */
/* one square of the skate-park floor cut into 100 tiles (or 10 strips with o.tenths); the first n painted,
   a column (10 tiles) at a time, as in the textbook */
function grid(n, o = {}) {
  const c = o.color || 'var(--blue)', S = 10;
  let s = '';
  if (o.tenths) {
    for (let i = 0; i < 10; i++) s += `<rect class="t${i < n && o.anim ? ' anim' : ''}" x="${i * S}" y="0" width="${S}" height="100" style="fill:${i < n ? c : 'var(--empty)'};--d:${(i * .06).toFixed(2)}s"/>`;
  } else {
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10), row = i % 10, on = i < n;
      s += `<rect class="t${on && o.anim ? ' anim' : ''}" x="${col * S}" y="${row * S}" width="${S}" height="${S}" style="fill:${on ? c : 'var(--empty)'};--d:${(Math.floor(i / 10) * .06 + (i % 10) * .012).toFixed(2)}s"/>`;
    }
    for (let i = 1; i < 10; i++) s += `<line class="tenth" x1="${i * S}" y1="0" x2="${i * S}" y2="100"/>`;
  }
  return `<svg class="grid ${o.cls || ''}" viewBox="-2 -2 104 104" aria-hidden="true">${s}<rect class="rim" x="0" y="0" width="100" height="100"/></svg>`;
}
// a number (tenths or hundredths) as full squares plus one part-painted square
function grids(v, o = {}) {
  const whole = Math.floor(v / 1000), part = v % 1000, out = [];
  for (let i = 0; i < whole; i++) out.push(grid(o.tenths ? 10 : 100, { ...o, anim: false, color: o.wholeColor || o.color }));
  if (part || !whole) out.push(grid(o.tenths ? part / 100 : part / 10, o));
  return `<span class="grids">${out.join('')}</span>`;
}

/* place-value table: หน่วย . ส่วนสิบ ส่วนร้อย ส่วนพัน (plus สิบ when needed); o.hi = a place to light up */
function table(v, p = places(v), o = {}) {
  const tens = v >= 10000;
  const cols = [...(tens ? [-1] : []), 0, ...[1, 2, 3].slice(0, Math.max(p, o.min || 0))];
  const NAME = { '-1': 'สิบ', 0: 'หน่วย', 1: 'ส่วนสิบ', 2: 'ส่วนร้อย', 3: 'ส่วนพัน' };
  return `<table class="pv"><tr>${cols.map(k => `<th class="${k === o.hi ? 'hi' : ''}${k === 1 ? ' after' : ''}">${NAME[k]}</th>`).join('')}</tr>
    <tr>${cols.map(k => `<td class="${k === o.hi ? 'hi' : ''}${k === 1 ? ' after' : ''}">${digitAt(v, k)}</td>`).join('')}</tr></table>`;
}
// expanded form: 3.456 = 3 + 0.4 + 0.05 + 0.006 (zeros left out)
const expandParts = v => [-1, 0, 1, 2, 3].map(k => valueAt(digitAt(v, k), k)).filter(x => x);
const expand = v => expandParts(v).map(x => fmt(x)).join(' + ');

/* number line from `from` (thousandths) across 10 tenths; marks: [{ v, label, color }] shown as dots with a letter or number above.
   o.labels writes every tenth under its tick; otherwise only the two ends. */
function nline(from, marks = [], o = {}) {
  const X = v => 30 + (v - from) / 1000 * 540;
  let s = `<line class="ax" x1="14" y1="60" x2="586" y2="60"/>`;
  for (let i = 0; i <= 10; i++) {
    const x = 30 + i * 54, v = from + i * 100, end = i === 0 || i === 10;
    s += `<line class="tk${end ? ' end' : ''}" x1="${x}" y1="${end ? 48 : 52}" x2="${x}" y2="${end ? 72 : 68}"/>`;
    if (o.labels || end) s += `<text class="tl${end ? ' end' : ''}" x="${x}" y="94">${fmt(v)}</text>`;
  }
  if (o.hundredths) for (let i = 0; i < 100; i++) if (i % 10) { const x = 30 + i * 5.4; s += `<line class="tk fine" x1="${x}" y1="56" x2="${x}" y2="64"/>`; }
  marks.forEach(m => {
    s += `<circle cx="${X(m.v)}" cy="60" r="8" style="fill:${m.color || 'var(--orange)'}"/>`;
    if (m.label) s += `<text class="ml" x="${X(m.v)}" y="36" style="fill:${m.color || 'var(--orange)'}">${m.label}</text>`;
  });
  return `<svg class="nline" viewBox="0 0 600 104" aria-hidden="true">${s}</svg>`;
}

/* ---------- numbers set out in columns, points lined up (7.3) ----------
   a op b = r. o.ans shows the answer, o.pad writes the zeros that fill the empty places (in orange),
   o.carry shows what is carried when adding, o.pa / o.pb force the places shown for a / b. */
function column(a, b, op, o = {}) {
  const r = op === '+' ? a + b : a - b;
  const pa = o.pa ?? places(a), pb = o.pb ?? places(b), P = Math.max(pa, pb, places(r));
  const W = Math.max(...[a, b, r].map(x => String(Math.floor(x / 1000)).length));
  const cols = `.9em repeat(${W}, .72em)${P ? ` .4em repeat(${P}, .72em)` : ''}`;   // op sign, whole digits, the point (narrow), digits after it
  const cell = (ch, cls = '') => `<span class="${cls}">${ch}</span>`;
  const row = (x, px, pre = '', show = true) => {
    const [w, f = ''] = fmt(x, P).split('.');
    let h = cell(pre, 'opc') + Array.from({ length: W }, (_, i) => cell(show ? (w.padStart(W, ' ')[i].trim()) : '')).join('');
    if (P) h += cell(show && (px || o.pad) ? '.' : '', px ? 'pt' : 'pt pad') +[...f].map((c, i) => cell(show ? (i < px ? c : o.pad ? c : '') : '', i >= px ? 'pad' : '')).join('');
    return h;
  };
  let carry = '';
  if (o.carry && op === '+') {
    // carries go over the column they move into: digits from the right, the point skipped
    const da = fmt(a, P).replace('.', '').padStart(W + P, '0'), db = fmt(b, P).replace('.', '').padStart(W + P, '0');
    const cs = Array(W + P).fill('');
    let c = 0;
    for (let i = W + P - 1; i >= 0; i--) { const s = +da[i] + +db[i] + c; c = s >= 10 ? 1 : 0; if (c && i > 0) cs[i - 1] = '1'; }
    carry = cell('', 'opc') + cs.slice(0, W).map(x => cell(x, 'cy')).join('') + (P ? cell('', 'pt') + cs.slice(W).map(x => cell(x, 'cy')).join('') : '');
  }
  return `<div class="colsum" style="--cols:${cols}">
    ${carry ? `<div class="r carry">${carry}</div>` : ''}
    <div class="r">${row(a, pa)}</div>
    <div class="r">${row(b, pb, op)}</div>
    <div class="r ans">${row(r, P, '', !!o.ans)}</div>
  </div>`;
}

/* ---------- random numbers ---------- */
// a number with exactly p digits after the point (last digit not 0) and a whole part up to maxW
function rnd(p, maxW = 9, minW = 0) {
  for (;;) {
    const w = ri(minW, maxW), f = p ? ri(1, 10 ** p - 1) : 0;
    if (p && f % 10 === 0) continue;
    return w * 1000 + f * 10 ** (3 - p);
  }
}
// the right answer plus up to 3 wrong ones, all different numbers (values in thousandths, none below 0)
function opts(right, wrong, show = v => dn(v)) {
  const seen = new Set([right]), out = [];
  for (const w of wrong) {
    if (out.length >= 3 || w < 0 || seen.has(w) || !Number.isInteger(w)) continue;
    seen.add(w); out.push(w);
  }
  return shuffle([{ html: show(right), ok: true }, ...out.map(w => ({ html: show(w), ok: false }))]);
}
// numbers a child might get by lining the digits up on the right instead of at the point
function rightAligned(a, b, op) {
  const P = Math.max(places(a), places(b));
  const sa = Math.round(a / 10 ** (3 - places(a))), sb = Math.round(b / 10 ** (3 - places(b)));
  const r = op === '+' ? sa + sb : sa - sb;
  return r < 0 ? -1 : r * 10 ** (3 - P);
}

return { places, fmt, dn, digitAt, PLACE, valueAt, DIG, thaiInt, read, grid, grids, table, expandParts, expand, nline, column, rnd, opts, rightAligned };
})();
