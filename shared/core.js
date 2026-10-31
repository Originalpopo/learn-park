/* learn-park (สนามเด็กเรียน) shared code: lesson list, saved progress, sound, drawing helpers,
   and the lesson shell (tabs 1 เนื้อหา, 2 ลองเล่น, 3 ตอบคำถาม: the same names in every lesson) every lesson page uses.
   Exposed as window.L. */
window.L = (() => {
const $ = s => document.querySelector(s);

/* ---------- lesson list (follows the textbook) ---------- */
// A topic with `file` is ready; the rest show "เร็วๆ นี้" on the home page.
// `exam` marks a chapter's last stop: โจทย์ปัญหา over the whole chapter (quiz only), drawn with a yellow number on the map.
const COURSES = [{
  id: 'math-p4', subject: 'คณิตศาสตร์', grade: 'ป.4', term: 'เทอม 2',
  chapters: [
    { no: 6, title: 'เศษส่วน', color: 'var(--red)', topics: [
      { no: '6.1', title: 'เศษส่วนแท้ เศษเกิน', file: 'math/p4/6-1.html' },
      { no: '6.2', title: 'จำนวนคละ', file: 'math/p4/6-2.html' },
      { no: '6.3', title: 'เศษส่วนที่เท่ากับจำนวนนับ', file: 'math/p4/6-3.html' },
      { no: '6.4', title: 'เศษส่วนที่เท่ากัน', file: 'math/p4/6-4.html' },
      { no: '6.5', title: 'เศษส่วนอย่างต่ำ', file: 'math/p4/6-5.html' },
      { no: '6.6', title: 'การเปรียบเทียบและเรียงลำดับ', file: 'math/p4/6-6.html' },
      { no: '6.7', title: 'การบวก การลบ', file: 'math/p4/6-7.html' },
      { no: '6.8', title: 'โจทย์ปัญหา', file: 'math/p4/6-8.html', exam: true }
    ] },
    { no: 7, title: 'ทศนิยม', color: 'var(--yellow-deep)', topics: [
      { no: '7.1', title: 'การอ่าน การเขียนทศนิยมไม่เกิน 3 ตำแหน่ง' },
      { no: '7.2', title: 'การเปรียบเทียบและเรียงลำดับ' },
      { no: '7.3', title: 'การบวกและการลบทศนิยมไม่เกิน 3 ตำแหน่ง' },
      { no: '7.4', title: 'โจทย์ปัญหา', exam: true }
    ] },
    { no: 8, title: 'มุม', color: 'var(--blue)', topics: [
      { no: '8.1', title: 'จุด เส้นตรง รังสี และส่วนของเส้นตรง' },
      { no: '8.2', title: 'มุม ส่วนประกอบของมุมและการเรียกชื่อมุม' },
      { no: '8.3', title: 'มุมฉาก มุมตรง มุมแหลม มุมป้าน' },
      { no: '8.4', title: 'การวัดขนาดของมุมและการจำแนกชนิดของมุม' },
      { no: '8.5', title: 'การสร้างมุมโดยใช้โพรแทรกเตอร์' }
    ] }
  ]
}];
const lessonId = (course, topic) => `${course.id}/${topic.no}`;
function findLesson(id) {
  for (const course of COURSES) for (const chapter of course.chapters) for (const topic of chapter.topics)
    if (lessonId(course, topic) === id) return { course, chapter, topic };
  return null;
}

/* ---------- saved progress (this device only) ---------- */
const KEY = 'learn-at-home';   // saved progress lives under the app's first name; keep it so nothing is lost
const store = { exp: 0, sound: true, lessons: {} };
try { Object.assign(store, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
// Progress from the first version of lesson 6.1 (before the home page existed): copy it in once, leave the old entry alone.
try {
  const old = JSON.parse(localStorage.getItem('p4-frac-6-1') || 'null');
  if (old && !store.migrated61) {
    store.exp += old.exp || 0;
    if (typeof old.sound === 'boolean') store.sound = old.sound;
    const l = store.lessons['math-p4/6.1'] || (store.lessons['math-p4/6.1'] = {});
    l.best = Math.max(l.best || 0, old.best || 0);
    store.migrated61 = true;
    localStorage.setItem(KEY, JSON.stringify(store));
  }
} catch (e) {}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  const x = $('#exp'); if (x) x.textContent = store.exp;
}
function addExp(n) {
  store.exp += n; save();
  const c = $('#expchip'); if (!c) return;
  c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
}
const best = id => (store.lessons[id] && store.lessons[id].best) || 0;
function setBest(id, stars) {
  const l = store.lessons[id] || (store.lessons[id] = {});
  l.best = Math.max(l.best || 0, stars); save();
}

/* ---------- lessons open one at a time, in book order ---------- */
// A lesson opens once the one before it has at least PASS stars (5 of 10 right), so the child learns in order.
const ORDER = COURSES.flatMap(c => c.chapters.flatMap(ch => ch.topics.map(t => lessonId(c, t))));
const PASS = 1;
const isOpen = id => { const i = ORDER.indexOf(id); return i <= 0 || best(ORDER[i - 1]) >= PASS; };
const nextId = id => ORDER[ORDER.indexOf(id) + 1] || null;
const prevId = id => ORDER[ORDER.indexOf(id) - 1] || null;

/* ---------- sound ---------- */
let ac = null;
function tone(freqs) {
  if (!store.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t0 = ac.currentTime;
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = t0 + i * .09;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.18, t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t + .28);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + .3);
    });
  } catch (e) {}
}
const sfx = { tap: () => tone([700]), good: () => tone([523, 659, 784]), bad: () => tone([300, 240]), win: () => tone([523, 659, 784, 1047]) };

/* ---------- helpers ---------- */
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const G = 'var(--green)', B = 'var(--blue)', O = 'var(--orange)', Y = 'var(--yellow)';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
// all right = 3 stars, 80%+ = 2, half or more = 1 (opens the next lesson); e.g. 10 questions: 10 / 8 / 5, 20: 20 / 16 / 10
const passMark = total => Math.ceil(total / 2);
const starsFor = (score, total = 10) => score >= total ? 3 : score >= Math.ceil(total * .8) ? 2 : score >= passMark(total) ? 1 : 0;

function frac(n, d, o = {}) {
  return `<span class="frac ${o.cls || ''}"${o.color ? ` style="color:${o.color}"` : ''}><b${o.nc ? ` style="color:${o.nc}"` : ''}>${n}</b><i>${d}</i></span>`;
}
const fade = (html, d) => `<span class="fade" style="--d:${d}s">${html}</span>`;
const ava = (initial, color) => `<span class="ava" style="background:${color}">${initial}</span>`;

const pathCache = {};
function slicePaths(n) {
  if (pathCache[n]) return pathCache[n];
  const r = 100, out = [];
  for (let i = 0; i < n; i++) {
    if (n === 1) { out.push('M0,-100A100,100 0 1 1 0,100A100,100 0 1 1 0,-100Z'); break; }
    const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
    const f = v => v.toFixed(2);
    out.push(`M0,0L${f(r * Math.cos(a0))},${f(r * Math.sin(a0))}A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${f(r * Math.cos(a1))},${f(r * Math.sin(a1))}Z`);
  }
  return (pathCache[n] = out);
}

/* fills: array of colors (null = empty slice).
   o.anim: 'filled' pops filled slices in order, 'all' pops every slice, a number pops only that slice.
   o.tap: base index for tappable slices. */
function pie(d, fills, o = {}) {
  const step = o.step ?? .08;
  let k = 0, s = '';
  slicePaths(d).forEach((p, i) => {
    const f = fills[i];
    let anim = false;
    if (o.anim === 'all') anim = true;
    else if (o.anim === 'filled') anim = !!f;
    else if (typeof o.anim === 'number') anim = o.anim === i;
    const delay = anim ? (o.delay0 || 0) + (typeof o.anim === 'number' ? 0 : step * k++) : 0;
    s += `<path class="s${anim ? ' anim' : ''}" d="${p}" style="fill:${f || 'var(--empty)'};--d:${delay.toFixed(2)}s"${o.tap != null ? ` data-g="${o.tap + i}"` : ''}/>`;
  });
  return `<svg class="pie ${o.cls || ''}${o.tap != null ? ' tap' : ''}" viewBox="-108 -108 216 216" aria-hidden="true">${s}<circle class="rim" r="100"/></svg>`;
}

/* parts: [[count, color], ...] laid out across as many pies as needed */
function piesSeg(d, parts, o = {}) {
  const colors = [];
  parts.forEach(([n, c]) => { for (let i = 0; i < n; i++) colors.push(c); });
  const k = Math.max(1, Math.ceil(colors.length / d));
  let h = '';
  for (let p = 0; p < k; p++) {
    const fills = [];
    for (let i = 0; i < d; i++) fills.push(colors[p * d + i] || null);
    h += pie(d, fills, { ...o, delay0: (o.delay0 || 0) + Math.min(colors.length, p * d) * (o.step ?? .08) });
  }
  return `<span class="pies">${h}</span>`;
}

/* ---------- header chips (sound + EXP) ---------- */
function chipsHTML() {
  return `<button class="chip icon-btn" id="sound" title="เปิด/ปิดเสียง"></button>
    <span class="chip" id="expchip">${STAR}<span id="exp">${store.exp}</span> <span class="txt">EXP</span></span>`;
}
function drawSound() {
  const b = $('#sound'); if (!b) return;
  b.innerHTML = store.sound
    ? '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  b.setAttribute('aria-label', store.sound ? 'ปิดเสียง' : 'เปิดเสียง');
}
function wireChips() {
  drawSound();
  const b = $('#sound');
  if (b) b.addEventListener('click', () => { store.sound = !store.sound; save(); drawSound(); sfx.tap(); });
}

/* ---------- lesson shell ----------
   L.lesson({ id, home, story: [{vis, say}], play: {render, onClick}, quiz: () => [question] })
   question: { ask, pic, opts: [{html, ok}], explain, after?, review }
   A chapter's last stop (topic.exam, the โจทย์ปัญหา test over the whole chapter) has no story or play:
   L.lesson({ id, exam: { intro }, quiz }) shows a start card, then the questions. */
function lesson(cfg) {
  const { course, chapter, topic } = findLesson(cfg.id);
  const app = $('#app'), home = cfg.home || '../../index.html', root = home.replace(/index.html$/, '');
  const header = `
    <header class="top">
      <a class="chip back" href="${home}">‹ หน้าแรก</a>
      <div class="title"><div class="eyebrow">${course.subject} ${course.grade} · บทที่ ${chapter.no} ${chapter.title}</div><h1>${topic.no} ${topic.title}</h1></div>
      <div class="top-right">${chipsHTML()}</div>
    </header>`;
  // opened by link or bookmark before the lesson before it is passed: say so and send the child back to the map
  if (!isOpen(cfg.id)) {
    const p = findLesson(prevId(cfg.id)).topic;
    app.innerHTML = `${header}
      <section class="card result locked-card">
        <img src="${root}shared/img/locked.png" alt="" width="72" height="72">
        <h2>ด่านนี้ยังล็อกอยู่</h2>
        <p>ผ่านด่าน ${p.no} ${p.title} ให้ได้อย่างน้อย 1 ดาวก่อนนะ</p>
        <a class="btn" href="${home}#map">กลับแผนที่</a>
      </section>`;
    wireChips();
    return;
  }
  const exam = !!cfg.exam;
  app.innerHTML = `${header}
    ${exam ? '' : `<nav class="tabs" role="tablist">
      <button class="tab" role="tab" data-tab="story" aria-selected="true"><span class="n">1</span>เนื้อหา</button>
      <button class="tab" role="tab" data-tab="play" aria-selected="false"><span class="n">2</span>ลองเล่น</button>
      <button class="tab" role="tab" data-tab="quiz" aria-selected="false"><span class="n">3</span>ตอบคำถาม</button>
    </nav>`}
    <main id="view"></main>`;
  wireChips();
  const view = $('#view');
  const STORY = cfg.story;
  let tab = exam ? 'quiz' : 'story', st = 0, quiz = null, started = !exam;

  // the exam's start card: what it covers, how many questions, what it takes to pass
  function renderStart() {
    const n = cfg.exam.count;
    view.innerHTML = `
      <section class="card result exam-start">
        <img src="${root}shared/img/glowing-star.png" alt="" width="84" height="84">
        <h2>ด่านสุดท้ายของบทที่ ${chapter.no}</h2>
        <p>${cfg.exam.intro}</p>
        <div class="exam-facts"><span><b>${n}</b> ข้อ</span><span>ถูก <b>${passMark(n)}</b> ข้อขึ้นไป ผ่านด่าน</span></div>
        <button class="btn" data-act="start-exam">เริ่มทำ</button>
      </section>`;
  }

  function renderStory() {
    const s = STORY[st], last = st === STORY.length - 1;
    view.innerHTML = `
      <section class="card story">
        <div class="stage">${s.vis()}</div>
        <div class="say"><div class="step-no">ขั้นที่ ${st + 1} จาก ${STORY.length}</div>${s.say()}</div>
      </section>
      <div class="story-nav">
        <button class="arrow-btn" data-act="prev" aria-label="ย้อน" ${st === 0 ? 'disabled' : ''}>‹</button>
        <div class="dots">${STORY.map((_, i) => `<button class="dot${i === st ? ' on' : ''}" data-step="${i}" aria-label="ไปขั้นที่ ${i + 1}"></button>`).join('')}</div>
        ${last ? '<button class="btn" data-act="goplay">ไปลองเล่น</button>' : '<button class="btn" data-act="next">ต่อไป</button>'}
      </div>`;
  }

  const newQuiz = () => ({ qs: cfg.quiz(), i: 0, score: 0, picked: null, marks: [], done: false, unlockedNow: false });
  // after the quiz: the way on to the next lesson (back on the map, where it plays its unlock if this quiz just opened it)
  function nextStep() {
    const nid = nextId(cfg.id), nx = nid && findLesson(nid);
    if (!nx) return '';
    if (best(cfg.id) < PASS) return `<p class="callout">ตอบถูกอย่างน้อย ${passMark(quiz.qs.length)} ข้อ (1 ดาว) เพื่อเปิดด่าน ${nx.topic.no} นะ</p>`;
    if (!nx.topic.file) return `<p class="hint">ด่าน ${nx.topic.no} กำลังสร้าง เร็วๆ นี้</p>`;
    return `<a class="btn" href="${home}${quiz.unlockedNow ? '?unlocked=' + encodeURIComponent(nid) : ''}#map">ไปด่านถัดไป ${nx.topic.no}</a>`;
  }
  function renderQuiz() {
    if (!started) { renderStart(); return; }
    if (!quiz) quiz = newQuiz();
    const z = quiz;
    if (z.done) {
      const stars = starsFor(z.score, z.qs.length);
      const wrong = z.qs.filter((_, i) => !z.marks[i]);
      view.innerHTML = `
        <section class="card result">
          <div class="stars">${[0, 1, 2].map(i => STAR.replace('<svg', `<svg class="${i < stars ? 'on' : ''}" style="--d:${.2 + i * .25}s"`)).join('')}</div>
          <h2 style="font-size:2rem">ถูก ${z.score} จาก ${z.qs.length} ข้อ</h2>
          <p>${stars === 3 ? 'เก่งมาก ได้เต็มเลย!' : stars === 2 ? 'เก่งมาก อีกนิดเดียวก็เต็มแล้ว' : stars === 1 ? 'ผ่านแล้ว! ลองเล่นอีกรอบเพื่อเก็บดาวเพิ่มได้นะ' : exam ? `ไม่เป็นไร ลองทบทวนบทเรียนในบทที่ ${chapter.no} แล้วมาทำใหม่นะ` : 'ไม่เป็นไร ลองดูเนื้อหาอีกรอบแล้วมาเล่นใหม่นะ'}</p>
          <p class="hint">ดาวมากที่สุดที่เคยได้: ${best(cfg.id)} ดวง</p>
          ${nextStep()}
          ${wrong.length ? `<div class="review"><h3>ข้อที่ยังพลาด</h3><ul>${wrong.map(q => `<li>${q.review}</li>`).join('')}</ul></div>` : ''}
          <div class="row-btns">
            <button class="btn ${best(cfg.id) >= PASS && nextId(cfg.id) ? 'ghost' : ''}" data-act="quiz-again">${exam ? 'ทำอีกรอบ' : 'เล่นอีกรอบ'} (โจทย์ใหม่)</button>
            ${exam ? '' : '<button class="btn ghost" data-act="tostory">ดูเนื้อหาอีกครั้ง</button>'}
          </div>
        </section>`;
      return;
    }
    const q = z.qs[z.i], picked = z.picked;
    const dots = z.qs.map((_, i) => `<span class="qdot ${i < z.marks.length ? (z.marks[i] ? 'ok' : 'no') : i === z.i ? 'now' : ''}"></span>`).join('');
    let fb = '';
    if (picked != null) {
      const ok = q.opts[picked].ok;
      fb = `<div class="fb ${ok ? 'good' : 'bad'}"><b class="t">${ok ? pick(['ถูกต้อง เก่งมาก!', 'ใช่เลย!', 'เยี่ยมมาก!']) : 'ยังไม่ใช่ ลองดูวิธีคิดนะ'}</b><p>${q.explain}</p>${!ok && q.after ? q.after : ''}</div>
        <div class="qfoot"><button class="btn" data-act="qnext">${z.i === z.qs.length - 1 ? 'ดูผล' : 'ข้อต่อไป'}</button></div>`;
    }
    view.innerHTML = `
      <section class="card">
        <div class="qtop"><span class="step-no">ข้อ ${z.i + 1} จาก ${z.qs.length}</span><div class="qdots${z.qs.length > 12 ? ' many' : ''}">${dots}</div><span class="step-no">ถูก ${z.score} ข้อ</span></div>
        <div class="qask">${q.ask}</div>
        ${q.pic ? `<div class="qpic">${q.pic}</div>` : ''}
        <div class="opts n${q.opts.length}">${q.opts.map((o, i) => {
          let cls = '';
          if (picked != null) cls = o.ok ? 'ok' : i === picked ? 'no' : 'dim';
          return `<button class="opt ${cls}" data-opt="${i}" ${picked != null ? 'aria-disabled="true"' : ''}>${o.html}</button>`;
        }).join('')}</div>
        ${fb}
      </section>`;
  }
  function answerQuiz(i) {
    const z = quiz;
    if (z.picked != null) return;
    z.picked = i;
    const ok = z.qs[z.i].opts[i].ok;
    z.marks.push(ok);
    if (ok) { z.score++; addExp(10); sfx.good(); } else sfx.bad();
    renderQuiz();
  }
  function nextQuiz() {
    const z = quiz;
    z.picked = null;
    if (z.i === z.qs.length - 1) {
      z.done = true;
      const stars = starsFor(z.score, z.qs.length);
      z.unlockedNow = best(cfg.id) < PASS && stars >= PASS;
      setBest(cfg.id, stars);
      if (stars) sfx.win();
    } else z.i++;
    renderQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // the play tab ends with the same kind of bar as the story, so the way on to the quiz is easy to find
  const playNav = `<div class="story-nav play-nav">
      <button class="arrow-btn" data-act="toplay-back" aria-label="กลับไปเนื้อหา">‹</button><span></span>
      <button class="btn" data-act="goquiz">ไปตอบคำถาม</button>
    </div>`;
  function render() { tab === 'story' ? renderStory() : tab === 'play' ? (view.innerHTML = cfg.play.render() + playNav) : renderQuiz(); }
  function setTab(t) {
    tab = t;
    document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    render();
    window.scrollTo({ top: 0 });
  }

  if (!exam) $('.tabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (b) { sfx.tap(); setTab(b.dataset.tab); }
  });
  view.addEventListener('click', e => {
    const dot = e.target.closest('[data-step]');
    if (dot) { st = +dot.dataset.step; sfx.tap(); renderStory(); return; }
    const opt = e.target.closest('[data-opt]');
    if (opt) { answerQuiz(+opt.dataset.opt); return; }
    const a = e.target.closest('[data-act]');
    switch (a && a.dataset.act) {
      case 'next': st = Math.min(STORY.length - 1, st + 1); sfx.tap(); renderStory(); return;
      case 'prev': st = Math.max(0, st - 1); sfx.tap(); renderStory(); return;
      case 'goplay': sfx.tap(); setTab('play'); return;
      case 'goquiz': sfx.tap(); setTab('quiz'); return;
      case 'toplay-back': sfx.tap(); st = STORY.length - 1; setTab('story'); return;
      case 'tostory': st = 0; setTab('story'); return;
      case 'qnext': sfx.tap(); nextQuiz(); return;
      case 'quiz-again': quiz = newQuiz(); renderQuiz(); window.scrollTo({ top: 0 }); return;
      case 'start-exam': sfx.tap(); started = true; renderQuiz(); window.scrollTo({ top: 0 }); return;
    }
    if (tab === 'play' && cfg.play.onClick) cfg.play.onClick(e);
  });

  save(); render();
  scratchPad();
}

/* ---------- scratch pad: write on the screen instead of on paper ----------
   A pencil button opens a see-through layer over the lesson. While it is open the page is frozen (nothing can be
   tapped or scrolled) but two fingers can still pinch-zoom. Works with a finger, a pencil or a mouse.
   Pens: black, blue, red in three sizes; an eraser in three sizes. Closing wipes everything, so the child always
   comes back to a clean page. Nothing is saved. */
const ICON = {
  pen: '<path d="M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 3L8 18z"/><path d="M13.5 6.5l3 3"/>',
  eraser: '<path d="M8.5 20H20"/><path d="M4.6 15.4l9.9-9.9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 18H7.2z"/><path d="M9 11l5 5"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chev: '<path d="M7 10l5 5 5-5"/>'
};
const icon = (n, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${ICON[n]}</svg>`;
const PENS = [['#2B2620', 'ดำ'], ['#2F6FD6', 'น้ำเงิน'], ['#E0433A', 'แดง']];
const SIZES = { pen: [3, 6, 11], eraser: [14, 28, 48] };

function scratchPad() {
  const open = document.createElement('button');
  open.className = 'scratch-open';
  open.setAttribute('aria-label', 'เปิดกระดาษทด');
  open.innerHTML = icon('pen', 26);
  const layer = document.createElement('div');
  layer.className = 'scratch';
  layer.hidden = true;
  layer.innerHTML = `<canvas></canvas>
    <div class="scratch-dock">
    <div class="scratch-menu" hidden></div>
    <div class="scratch-bar" role="toolbar" aria-label="กระดาษทด">
      <button class="tool pen" data-tool="pen" aria-label="ปากกา">${icon('pen')}<span class="ink"></span></button>
      <button class="tool more" data-menu="pen" aria-label="เลือกสีและขนาดปากกา">${icon('chev', 18)}</button>
      <button class="tool" data-tool="eraser" aria-label="ยางลบ">${icon('eraser')}</button>
      <button class="tool more" data-menu="eraser" aria-label="เลือกขนาดยางลบ">${icon('chev', 18)}</button>
      <span class="sep"></span>
      <button class="tool" data-act="clear" aria-label="ล้างทั้งหมด">${icon('trash')}</button>
      <button class="tool" data-act="close" aria-label="ล้างแล้วปิดกระดาษทด">${icon('close')}</button>
    </div></div>`;
  document.body.append(open, layer);
  document.body.classList.add('has-scratch');

  const cv = layer.querySelector('canvas'), cx = cv.getContext('2d');
  const menu = layer.querySelector('.scratch-menu');
  const st = { tool: 'pen', pen: 0, size: { pen: 1, eraser: 1 }, menuFor: null, strokes: [], cur: null, fingers: new Set(), multi: false };
  // the little panel above the bar: colours and sizes for the pen, sizes only for the eraser (dots drawn to scale, capped)
  function showMenu(tool) {
    st.menuFor = tool;
    menu.innerHTML = `${tool === 'pen' ? `<div class="row">${PENS.map(([c, n], i) => `<button class="swatch" data-pen="${i}" style="--c:${c}" aria-label="ปากกาสี${n}"></button>`).join('')}</div>` : ''}
      <div class="row">${SIZES[tool].map((s, i) => { const d = Math.min(s + 4, 30); return `<button class="size" data-size="${i}" aria-label="ขนาด ${i + 1}"><i class="${tool}" style="width:${d}px;height:${d}px"></i></button>`; }).join('')}</div>`;
    menu.hidden = false;
  }
  const hideMenu = () => { menu.hidden = true; st.menuFor = null; };

  // sizes come from the canvas box, not innerWidth: on iPad innerWidth shrinks while pinch-zoomed, which put the ink in the wrong place.
  // Zoomed in, the canvas gets more pixels so the ink stays sharp (capped to what Safari allows for one canvas)
  let W = 0, H = 0;
  function fit() {
    W = cv.clientWidth; H = cv.clientHeight;
    const zoom = (window.visualViewport && visualViewport.scale) || 1;
    const r = Math.min((devicePixelRatio || 1) * Math.max(1, zoom), Math.sqrt(16e6 / (W * H)));
    cv.width = Math.round(W * r); cv.height = Math.round(H * r);
    cx.setTransform(r, 0, 0, r, 0, 0);
    redraw();
  }
  function line(s, from) {
    cx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
    cx.strokeStyle = s.color; cx.lineWidth = s.w; cx.lineCap = cx.lineJoin = 'round';
    cx.beginPath();
    const p = s.pts, a = p[Math.max(0, from - 1)];
    cx.moveTo(a[0], a[1]);
    for (let i = from; i < p.length; i++) cx.lineTo(p[i][0], p[i][1]);
    if (p.length === 1) cx.lineTo(p[0][0] + .01, p[0][1]);   // a tap leaves a dot
    cx.stroke();
  }
  function redraw() { cx.clearRect(0, 0, W, H); st.strokes.forEach(s => line(s, 0)); }
  function paint() {
    layer.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === st.tool));
    layer.querySelectorAll('[data-pen]').forEach(b => b.classList.toggle('on', +b.dataset.pen === st.pen));
    if (st.menuFor) layer.querySelectorAll('[data-size]').forEach(b => b.classList.toggle('on', +b.dataset.size === st.size[st.menuFor]));
    layer.querySelectorAll('[data-menu]').forEach(b => b.classList.toggle('on', b.dataset.menu === st.menuFor));
    layer.querySelector('.pen .ink').style.background = PENS[st.pen][0];
  }
  const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };

  // one finger writes; a second finger means a pinch, so the stroke just started is dropped and nothing draws until all lift
  cv.addEventListener('pointerdown', e => {
    st.fingers.add(e.pointerId);
    hideMenu();
    if (st.fingers.size > 1) { if (st.cur) { st.strokes.pop(); st.cur = null; redraw(); } st.multi = true; paint(); return; }
    if (st.multi) return;
    cv.setPointerCapture(e.pointerId);
    st.cur = { erase: st.tool === 'eraser', color: PENS[st.pen][0], w: SIZES[st.tool][st.size[st.tool]], pts: [at(e)] };
    st.strokes.push(st.cur); line(st.cur, 0); paint();
  });
  cv.addEventListener('pointermove', e => {
    if (!st.cur || st.multi) return;
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    const from = st.cur.pts.length;
    (evs.length ? evs : [e]).forEach(ev => st.cur.pts.push(at(ev)));
    line(st.cur, from);
  });
  const lift = e => { st.fingers.delete(e.pointerId); st.cur = null; if (!st.fingers.size) st.multi = false; };
  cv.addEventListener('pointerup', lift);
  cv.addEventListener('pointercancel', lift);
  // keep the page still under the layer (mouse wheel, trackpad scroll); a trackpad pinch still zooms
  layer.addEventListener('wheel', e => { if (!e.ctrlKey) e.preventDefault(); }, { passive: false });
  // no word picking while writing (a fast double tap of the pencil is Safari's select-a-word gesture)
  const writing = () => !layer.hidden;
  document.addEventListener('selectstart', e => { if (writing()) e.preventDefault(); });
  layer.addEventListener('dblclick', e => e.preventDefault());
  cv.addEventListener('pointerdown', () => getSelection()?.removeAllRanges());

  layer.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tool) { st.tool = b.dataset.tool; hideMenu(); }
    else if (b.dataset.menu) { const t = b.dataset.menu; st.tool = t; st.menuFor === t ? hideMenu() : showMenu(t); }
    else if (b.dataset.pen) { st.pen = +b.dataset.pen; }
    else if (b.dataset.size) { st.size[st.menuFor] = +b.dataset.size; }
    else if (b.dataset.act === 'clear') { st.strokes = []; redraw(); }
    else if (b.dataset.act === 'close') {   // one tap: wipe the page and close
      st.strokes = []; redraw(); hideMenu();
      layer.hidden = true; open.hidden = false;
      document.documentElement.classList.remove('scratching');
    }
    sfx.tap(); paint();
  });
  open.addEventListener('click', () => {
    sfx.tap();
    layer.hidden = false; open.hidden = true;
    document.documentElement.classList.add('scratching');
    fit(); paint();
  });
  addEventListener('resize', () => { if (!layer.hidden) fit(); });
  // after a pinch ends, sharpen the ink for the new zoom (not mid-stroke, refitting is a full redraw)
  let zoomT = 0;
  window.visualViewport?.addEventListener('resize', () => {
    clearTimeout(zoomT);
    zoomT = setTimeout(() => { if (!layer.hidden && !st.cur) fit(); }, 200);
  });
  // the toolbar sits on the zoomed-in view at its normal size: the dock covers just the visible part, scaled back down
  const dock = layer.querySelector('.scratch-dock');
  function pinDock() {
    const v = window.visualViewport;
    if (!v || layer.hidden) return;
    const z = v.scale || 1;
    dock.style.width = v.width * z + 'px'; dock.style.height = v.height * z + 'px';
    dock.style.transform = `translate(${v.offsetLeft}px, ${v.offsetTop}px) scale(${1 / z})`;
  }
  window.visualViewport?.addEventListener('resize', pinDock);
  window.visualViewport?.addEventListener('scroll', pinDock);
  open.addEventListener('click', pinDock);
}

return {
  COURSES, lessonId, findLesson,
  store, save, addExp, best, setBest, PASS, isOpen, nextId, prevId,
  sfx, ri, pick, shuffle, G, B, O, Y, STAR, starsFor,
  frac, fade, ava, pie, piesSeg,
  chipsHTML, wireChips, lesson
};
})();
