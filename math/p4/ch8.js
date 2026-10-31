/* บทที่ 8 มุม: drawing helpers shared by lessons 8.1-8.6: points, lines, rays and segments, angles, a protractor, a clock.
   Directions are in degrees the maths way: 0 points right, 90 points up, counting anticlockwise.
   Exposed as window.G8. */
window.G8 = (() => {
const { ri, pick, shuffle } = L;
const rad = d => d * Math.PI / 180;
const f1 = v => +v.toFixed(1);
const at = (p, r, d) => [p[0] + r * Math.cos(rad(d)), p[1] - r * Math.sin(rad(d))];
const dirOf = (a, b) => Math.atan2(a[1] - b[1], b[0] - a[0]) * 180 / Math.PI;
const xy = p => `${f1(p[0])},${f1(p[1])}`;

/* ---------- small parts ---------- */
const ah = (tip, d, cls = '') => `<path class="ah ${cls}" d="M${xy(at(tip, 15, d + 152))}L${xy(tip)}L${xy(at(tip, 15, d - 152))}"/>`;
const dot = (p, cls = '') => `<circle class="pt ${cls}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="5.5"/>`;
const label = (p, s, d, r = 22, cls = '') => { const q = at(p, r, d); return `<text class="lb ${cls}" x="${f1(q[0])}" y="${f1(q[1] + 7)}">${s}</text>`; };
// a viewBox that holds every point given, with room around
function box(pts, pad = 34) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  return `${f1(x0)} ${f1(y0)} ${f1(Math.max(...xs) - x0 + pad)} ${f1(Math.max(...ys) - y0 + pad)}`;
}
const svg = (vb, body, cls = '') => `<svg class="geo ${cls}" viewBox="${vb}" aria-hidden="true">${body}</svg>`;

/* ---------- 8.1: line (เส้นตรง), ray (รังสี), segment (ส่วนของเส้นตรง) ----------
   kind 'line' | 'ray' | 'seg' through points A and B, named n = ['A', 'B']; o.d direction (degrees), o.len distance A-B */
function fig(kind, n = ['A', 'B'], o = {}) {
  const d = o.d ?? 0, len = o.len ?? 170, ext = o.ext ?? 70;
  const A = [0, 0], B = at(A, len, d), side = d + 90;
  let body = '';
  const s = kind === 'line' ? at(A, ext, d + 180) : A, e = kind === 'seg' ? B : at(B, ext, d);
  body += `<line class="ln ${o.cls || ''}" x1="${f1(s[0])}" y1="${f1(s[1])}" x2="${f1(e[0])}" y2="${f1(e[1])}"/>`;
  if (kind !== 'seg') body += ah(e, d, o.cls);
  if (kind === 'line') body += ah(s, d + 180, o.cls);
  body += dot(A) + dot(B) + label(A, n[0], side) + label(B, n[1], side);
  return svg(box([s, e, at(A, 30, side), at(B, 30, side)], 22), body, o.svgCls || '');
}
// the symbol: AB with a bar, an arrow or a double arrow over it
function sym(kind, name) {
  const mark = kind === 'seg' ? '<line x1="2" y1="6" x2="38" y2="6"/>'
    : kind === 'ray' ? '<line x1="2" y1="6" x2="36" y2="6"/><path d="M31,2L37,6L31,10"/>'
    : '<line x1="4" y1="6" x2="36" y2="6"/><path d="M31,2L37,6L31,10M9,2L3,6L9,10"/>';
  return `<span class="sym"><svg viewBox="0 0 40 12" aria-hidden="true">${mark}</svg>${name}</span>`;
}
const KIND1 = { line: 'เส้นตรง', ray: 'รังสี', seg: 'ส่วนของเส้นตรง' };

/* points [[x, y, name, labelDirection]] alone (o.closed joins them into a shape, o.open into one straight line through them) */
function dots(list, o = {}) {
  let body = '';
  const P = list.map(p => [p[0], -p[1]]);   // given with y up, drawn with y down
  if (o.closed) body += `<path class="ln" d="M${P.map(xy).join('L')}Z" style="fill:${o.fill || 'none'}"/>`;
  if (o.open) body += `<line class="ln" x1="${P[0][0]}" y1="${P[0][1]}" x2="${P[P.length - 1][0]}" y2="${P[P.length - 1][1]}"/>`;
  list.forEach((p, i) => { body += dot(P[i]) + label(P[i], p[2], p[3] ?? 90, 22); });
  return svg(box(P.flatMap((p, i) => [p, at(p, 30, list[i][3] ?? 90)]), 16), body, o.svgCls || '');
}

/* ---------- angles ----------
   shape({ arms: [{ d, n, len }], v: 'B', arcs: [[i, j, cls]] }): arms from one vertex; an arc (or a right-angle square) between arms i and j.
   o.ray puts arrowheads at the arm ends; o.noDots leaves the arm points out. */
function shape(o) {
  const V = [0, 0], ends = [], pts = [V];
  let body = '';
  // o.paper lays the corner of a sheet of paper on the first arm (to check against a right angle, 8.3)
  if (o.paper) {
    const a = o.arms[0].d, s = o.paper === true ? 95 : o.paper, p = at(V, s, a), q = at(p, s, a + 90), r = at(V, s, a + 90);
    body += `<path class="paper" d="M0,0L${xy(p)}L${xy(q)}L${xy(r)}Z"/>`;
    pts.push(q, r);
  }
  (o.arcs || []).forEach(([i, j, cls = '']) => {
    let a = o.arms[i].d, b = o.arms[j].d, sweep = ((b - a) % 360 + 360) % 360;
    const r = o.arcR ?? 30;
    if (Math.abs(sweep - 90) < .01 && o.square !== false) {
      const p = at(V, 17, a), q = at(p, 17, b);
      body += `<path class="sq ${cls}" d="M${xy(p)}L${xy(q)}L${xy(at(V, 17, b))}"/>`;
    } else {
      body += `<path class="arc ${cls}" d="M${xy(at(V, r, a))}A${r},${r} 0 ${sweep > 180 ? 1 : 0} 0 ${xy(at(V, r, b))}"/>`;
    }
  });
  o.arms.forEach(arm => {
    const len = arm.len ?? o.len ?? 150, e = at(V, len, arm.d);
    ends.push(e); pts.push(e);
    body += `<line class="ln ${arm.cls || ''}" x1="0" y1="0" x2="${f1(e[0])}" y2="${f1(e[1])}"/>`;
    if (o.ray) body += ah(e, arm.d, arm.cls);
    if (arm.n) {
      const p = at(V, len * (o.ray ? .78 : 1), arm.d);
      if (!o.noDots) body += dot(p);
      const lp = at(p, 24, arm.d + 90 * (arm.side ?? 1));
      pts.push(lp);
      body += label(p, arm.n, arm.d + 90 * (arm.side ?? 1), 24);
    }
  });
  // vertex letter on the far side of the arms (the middle of the widest gap)
  if (o.v) {
    const ds = o.arms.map(a => ((a.d % 360) + 360) % 360).sort((x, y) => x - y);
    let best = 0, mid = 0;
    ds.forEach((x, i) => { const y = i + 1 < ds.length ? ds[i + 1] : ds[0] + 360, gap = y - x; if (gap > best) { best = gap; mid = x + gap / 2; } });
    body += dot(V, 'v') + label(V, o.v, mid, 24, 'v');
    pts.push(at(V, 30, mid));
  }
  return svg(box(pts, 26), body, o.svgCls || '');
}
// one angle: base arm pointing `rot`, the other `deg` further round; names [on base arm, vertex, on other arm]
const angle = (deg, o = {}) => shape({
  ...o,
  arms: [{ d: o.rot ?? 0, n: o.names?.[0], side: -1 }, { d: (o.rot ?? 0) + deg, n: o.names?.[2], side: 1 }],
  v: o.names?.[1], arcs: o.arc === false ? [] : [[0, 1, 'hot']]
});

const kindOf = d => d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : 'straight';
const KIND = { acute: 'มุมแหลม', right: 'มุมฉาก', obtuse: 'มุมป้าน', straight: 'มุมตรง' };
// a size that is plainly one kind (nothing close to 90 to squint at)
const sizeOf = k => k === 'acute' ? ri(4, 13) * 5 : k === 'right' ? 90 : k === 'obtuse' ? ri(23, 32) * 5 : 180;

/* ---------- protractor (โพรแทรกเตอร์) ----------
   Centre (0,0), radius R. Inner scale (blue) counts from 0 on the right, outer scale (orange) from 0 on the left.
   o.angle = { deg, side: 'right' | 'left' } draws an angle on it: one arm on the base line, the other deg further round.
   o.marks = [{ t, n }] letters just outside the edge at direction t (8.5). o.read: ring the reading where the arm crosses. */
const R = 150;
function protractor(o = {}) {
  let body = `<path class="pr" d="M${-R},0A${R},${R} 0 0 1 ${R},0Z"/>`;
  for (let t = 0; t <= 180; t += 5) {
    const long = t % 10 === 0, a = at([0, 0], R, t), b = at([0, 0], R - (long ? 13 : 7), t);
    body += `<line class="tick" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/>`;
    if (long) {
      // the numbers at the two ends sit just above the base line instead of on it
      const p = at([0, 0], R - 22, t), q = at([0, 0], R - 39, t), up = t === 0 || t === 180 ? -5 : 4;
      body += `<text class="sc out" x="${f1(p[0])}" y="${f1(p[1] + up)}">${180 - t}</text><text class="sc in" x="${f1(q[0])}" y="${f1(q[1] + up)}">${t}</text>`;
    }
  }
  body += `<line class="base" x1="${-R}" y1="0" x2="${R}" y2="0"/><circle class="ctr" r="4"/>`;
  let pts = [[-R - 12, 6], [R + 12, -R - 12]];
  if (o.angle) {
    const { deg, side } = o.angle, b = side === 'left' ? 180 : 0, t = side === 'left' ? 180 - deg : deg, L = R + 26;
    const n = o.names || [];
    body += `<line class="ln arm" x1="0" y1="0" x2="${f1(at([0, 0], L, b)[0])}" y2="0"/>`;
    // deg null: only the base arm so far (building an angle, 8.5)
    const e = deg == null ? null : at([0, 0], L, t);
    if (e) body += `<line class="ln arm" x1="0" y1="0" x2="${f1(e[0])}" y2="${f1(e[1])}"/>`;
    if (o.ray !== false) body += ah([b ? -L : L, 0], b) + (e ? ah(e, t) : '');
    if (n[0]) body += dot(at([0, 0], L - 4, b)) + label(at([0, 0], L - 4, b), n[0], 270, 24);
    if (n[2] && e) body += dot(at([0, 0], L - 4, t)) + label(at([0, 0], L - 4, t), n[2], t + (t > 90 ? 90 : -90), 22);
    if (n[1]) body += label([0, 0], n[1], 270, 24, 'v');
    if (o.read && e) { const q = at([0, 0], o.read === 'out' ? R - 22 : R - 39, t); body += `<circle class="ring" cx="${f1(q[0])}" cy="${f1(q[1])}" r="14"/>`; }
    pts.push(...(e ? [e] : []), [b ? -L - 16 : L + 16, 0], [0, 36]);
  }
  (o.marks || []).forEach(m => {
    const p = at([0, 0], R + 14, m.t);
    body += `<circle class="mk ${m.cls || ''}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="6"/>` + label(p, m.n, m.t, 20, 'mk ' + (m.cls || ''));
    pts.push(at([0, 0], R + 44, m.t));
  });
  if (o.extra) body += o.extra;
  return svg(box(pts, 18), body, 'prot ' + (o.cls || ''));
}

/* ---------- clock: the hour hand on h, the minute hand on 12 ---------- */
function clock(h, o = {}) {
  let body = '<circle class="face" r="70"/>';
  for (let i = 0; i < 12; i++) {
    const a = at([0, 0], 64, 90 - i * 30), b = at([0, 0], 58, 90 - i * 30), c = at([0, 0], 47, 90 - i * 30);
    body += `<line class="cmark" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/><text class="cn" x="${f1(c[0])}" y="${f1(c[1] + 5)}">${i || 12}</text>`;
  }
  const hd = 90 - h * 30, hp = at([0, 0], 27, hd), mp = at([0, 0], 38, 90);
  const gap = Math.min(h * 30, 360 - h * 30);
  if (o.arc !== false) {
    const [a, b] = h * 30 <= 180 ? [hd, 90] : [90, hd];
    body += gap === 90 ? `<path class="sq hot" d="M${xy(at([0, 0], 14, a))}L${xy(at(at([0, 0], 14, a), 14, b))}L${xy(at([0, 0], 14, b))}"/>`
      : `<path class="arc hot" d="M${xy(at([0, 0], 20, a))}A20,20 0 0 0 ${xy(at([0, 0], 20, b))}"/>`;
  }
  body += `<line class="hand h" x1="0" y1="0" x2="${f1(hp[0])}" y2="${f1(hp[1])}"/><line class="hand m" x1="0" y1="0" x2="${f1(mp[0])}" y2="${f1(mp[1])}"/><circle class="pin" r="5"/>`;
  return svg('-78 -78 156 156', body, 'clock');
}
const clockGap = h => Math.min(h * 30, 360 - h * 30);
const THAI_H = h => `${h} นาฬิกา`;

/* ---------- options ---------- */
// letters for a figure, all different (no I or O, which look like 1 and 0)
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const letters = n => shuffle([...LETTERS]).slice(0, n);
const txt = s => `<span class="txt">${s}</span>`;

return { at, dirOf, fig, sym, KIND1, dots, shape, angle, kindOf, KIND, sizeOf, protractor, R, clock, clockGap, THAI_H, letters, txt };
})();
