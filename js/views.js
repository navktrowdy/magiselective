// Engagement screens: Potalien adoption & home, My Skills dashboard, Monthly exams.

import { SUBJECTS, BASELINE, CS_EXAMS, CS_TRIALS, trialTrends } from './data/config.js';
import { SPECIES, STAGES, SHOP, FREE_BG } from './data/pets.js';
import * as store from './store.js';
import { topicMastery, topicsFor } from './bank.js';
import { petSvg, computeProgress, say, speciesById, shopItem } from './pet.js';
import { radarChart, lineChart, categoryChart } from './charts.js';
import { esc, pct, fmtDate, fmtDuration, todayStr, level, toast } from './util.js';

const $app = () => document.getElementById('app');
export const progressNow = () => computeProgress(store.getResults(), store.getProfile());

// ======================================================================
// Pet widget used on the dashboard, practice feedback and results
// ======================================================================
export function petWidget({ mood, size = 120, message = '', bg = false, cls = '' } = {}) {
  const prof = store.getProfile(); if (!prof) return '';
  const pr = progressNow();
  return `<div class="petw ${cls}"><div class="petpic ${mood || pr.mood}">${petSvg({ species: prof.pet.species, stage: pr.stageIdx, mood: mood || pr.mood, equipped: prof.pet.equipped, size, bg })}</div>
    ${message ? `<div class="bubble"><b>${esc(prof.pet.name)}:</b> ${message}</div>` : ''}</div>`;
}

/** Celebrate new evolution stages / badges once. Call after rendering a page. */
export function celebrate() {
  const prof = store.getProfile(); if (!prof) return;
  const pr = progressNow();
  const seen = new Set(prof.seenBadges || []);
  const newBadges = pr.badges.filter(b => b.earned && !seen.has(b.id));
  const evolved = pr.stageIdx > (prof.seenStage ?? 0);
  if (!newBadges.length && !evolved) return;
  prof.seenBadges = pr.badges.filter(b => b.earned).map(b => b.id);
  prof.seenStage = pr.stageIdx;
  store.saveProfile(prof);
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modalcard">${confetti()}
    ${evolved ? `<h2>✨ ${esc(prof.pet.name)} evolved!</h2>${petSvg({ species: prof.pet.species, stage: pr.stageIdx, mood: 'excited', equipped: prof.pet.equipped, size: 180 })}
      <p>Now a <b>${esc(pr.stage.name)}</b>. ${esc(pr.stage.perk)}</p>` : ''}
    ${newBadges.length ? `<h2>🏅 New badge${newBadges.length > 1 ? 's' : ''}!</h2><div class="badges">${newBadges.map(badgeHtml).join('')}</div>` : ''}
    <button class="btn primary" id="closemodal">Awesome!</button></div>`;
  document.body.appendChild(m);
  m.querySelector('#closemodal').onclick = () => m.remove();
}

const confetti = () => `<div class="confetti">${Array.from({ length: 28 }, (_, i) =>
  `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 7) * 0.12}s;background:${['#c9a55c', '#5a8a64', '#f48fb1', '#64b5f6', '#ffd54f'][i % 5]}"></i>`).join('')}</div>`;
const badgeHtml = b => `<div class="badge ${b.earned ? 'on' : 'off'}" title="${esc(b.desc)}"><span>${b.earned ? b.icon : '🔒'}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`;

// ======================================================================
// Adopt
// ======================================================================
export function adoptView() {
  const prof = store.getProfile();
  const nick = store.getSettings().nickname;
  let chosen = prof?.pet.species || 'spudnik';
  const render = () => {
    $app().innerHTML = `
      <div class="card adopt">
        <h1>👽🥔 ${prof ? 'Change your Potalien' : `Welcome, ${esc(nick)}! Adopt your Potalien`}</h1>
        <p>Potaliens are potato aliens from planet Spudonia. Yours grows, evolves and earns stardust every time you practise.
        Choose one, give it a name, and look after it until exam day!</p>
        <div class="species">${SPECIES.map(s => `<button class="sp ${s.id === chosen ? 'sel' : ''}" data-sp="${s.id}">
          ${petSvg({ species: s.id, stage: 0, mood: s.id === chosen ? 'excited' : 'happy', size: 120, bg: false })}
          <b>${esc(s.name)}</b><small>${esc(s.blurb)}</small></button>`).join('')}</div>
        <label>Name your Potalien<input id="petname" maxlength="20" value="${esc(prof?.pet.name || speciesById(chosen).name)}"></label>
        <div class="btns"><button class="btn primary big" id="adopt">${prof ? 'Save' : '🚀 Adopt!'}</button>${prof ? '<a class="btn" href="#/pet">Cancel</a>' : ''}</div>
        ${prof ? '<p class="muted">Your stardust, outfits and progress stay the same.</p>' : ''}
      </div>`;
    $app().querySelectorAll('[data-sp]').forEach(b => b.onclick = () => {
      const typed = document.getElementById('petname').value;
      const wasDefault = !typed || SPECIES.some(sp => sp.name === typed);
      chosen = b.dataset.sp; render();
      document.getElementById('petname').value = wasDefault ? speciesById(chosen).name : typed;
    });
    document.getElementById('adopt').onclick = async () => {
      const name = document.getElementById('petname').value.trim() || speciesById(chosen).name;
      const p = prof || { owned: [], spent: 0, seenBadges: [], seenStage: 0, theme: localStorage.getItem('ms.theme') || 'sand', pet: { equipped: { bg: 'moon' } } };
      p.pet = { ...p.pet, species: chosen, name };
      if (!prof) {
        const pr = computeProgress(store.getResults(), p);
        p.seenBadges = pr.badges.filter(b => b.earned).map(b => b.id); p.seenStage = pr.stageIdx;
      }
      await store.saveProfile(p);
      toast(`${esc(name)} has landed! 🛸`, 'ok');
      location.hash = '#/pet';
    };
  };
  render();
}

// ======================================================================
// Potalien home: stats, wardrobe/shop, badges, evolution
// ======================================================================
export function petView() {
  const prof = store.getProfile();
  if (!prof) { location.hash = '#/adopt'; return; }
  const pr = progressNow();
  const nick = store.getSettings().nickname;
  const eq = prof.pet.equipped || {};
  const slots = [['head', '🎩 Hats'], ['face', '👓 Glasses'], ['neck', '🧣 Neckwear'], ['bg', '🌌 Backgrounds']];
  const items = slot => (slot === 'bg' ? [FREE_BG, ...SHOP.filter(s => s.slot === 'bg')] : SHOP.filter(s => s.slot === slot));
  const owned = id => id === 'moon' || (prof.owned || []).includes(id);

  $app().innerHTML = `
    <div class="pethome">
      <div class="card petstage">
        <div class="petbig ${pr.mood}">${petSvg({ species: prof.pet.species, stage: pr.stageIdx, mood: pr.mood, equipped: eq, size: 260 })}</div>
        <div class="petinfo">
          <h1>${esc(prof.pet.name)} <small class="muted">the ${esc(speciesById(prof.pet.species).name)}</small></h1>
          <div class="bubble">${esc(say(pr.mood, { nick }))}</div>
          <p><span class="chip gold">${esc(pr.stage.name)}</span> <span class="chip">🔥 ${pr.streak}-day streak</span> <span class="chip">✨ ${pr.coins} stardust</span></p>
          <p class="muted">${pr.next ? `${pr.next.xp - pr.xp} XP until <b>${esc(pr.next.name)}</b>: ${esc(pr.next.perk)}` : 'Fully evolved. A true Cosmic Legend!'}</p>
          <div class="xpbar"><span style="width:${pr.stagePct}%"></span></div><p class="muted">${pr.xp} XP total</p>
          <details><summary>How do I earn XP and stardust?</summary><ul>
            <li>+2 XP for every question you answer, +10 XP for every correct answer</li>
            <li>+5 bonus XP for fixing a question you got wrong before</li>
            <li>+15 for a mini mock, +30 for a full test, +40 or more for a writing task</li>
            <li>Every 4 XP = 1 ✨ stardust to spend in the wardrobe</li>
            <li>Practise every day to keep ${esc(prof.pet.name)} happy (and your 🔥 streak alive)</li></ul></details>
          <div class="btns"><a class="btn primary" href="#/">Go practise</a><a class="btn" href="#/adopt">Change Potalien</a></div>
        </div>
      </div>
      <div class="card"><h2>🧥 Wardrobe & shop</h2><p class="muted">You have <b>✨ ${pr.coins} stardust</b>.</p>
        ${slots.map(([slot, title]) => `<h3>${title}</h3><div class="shop">${items(slot).map(it => {
          const on = eq[slot] === it.id || (slot === 'bg' && !eq.bg && it.id === 'moon');
          const prev = petSvg({ species: prof.pet.species, stage: pr.stageIdx, mood: 'happy', equipped: { ...eq, [slot]: it.id }, size: 92, bg: slot === 'bg' });
          const btn = owned(it.id)
            ? (on ? (slot === 'bg' ? '<span class="chip good">Using</span>' : `<button class="btn small" data-off="${slot}">Take off</button>`) : `<button class="btn small primary" data-wear="${it.id}">${slot === 'bg' ? 'Use' : 'Wear'}</button>`)
            : `<button class="btn small" data-buy="${it.id}" ${pr.coins < it.price ? 'disabled' : ''}>✨ ${it.price}</button>`;
          return `<div class="item ${on ? 'on' : ''}">${prev}<b>${esc(it.name)}</b>${btn}</div>`;
        }).join('')}</div>`).join('')}
      </div>
      <div class="card"><h2>🎨 Paint your spaceship</h2><p class="muted">Choose how the whole app looks.</p><div id="themeslot"></div></div>
      <div class="card"><h2>🏅 Badges <small class="muted">${pr.badges.filter(b => b.earned).length}/${pr.badges.length}</small></h2><div class="badges">${pr.badges.map(badgeHtml).join('')}</div></div>
      <div class="card"><h2>🧬 Evolution path</h2><div class="evo">${STAGES.map((s, i) => `<div class="evostep ${i <= pr.stageIdx ? 'done' : ''}">
        ${petSvg({ species: prof.pet.species, stage: i, mood: 'happy', size: 84, bg: false })}<b>${esc(s.name)}</b><small>${s.xp} XP</small></div>`).join('')}</div></div>
    </div>`;

  import('./app.js').then(m => { const slot = document.getElementById('themeslot'); if (slot) { slot.innerHTML = m.themePicker(); m.wireThemePicker(petView); } });
  // Always edit the latest stored profile (celebrate() may have updated it since render).
  const edit = async (fn, msg) => { const p = store.getProfile(); fn(p); await store.saveProfile(p); if (msg) toast(msg, 'ok'); petView(); };
  $app().querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    const it = shopItem(b.dataset.buy);
    if (progressNow().coins < it.price) return;
    if (!confirm(`Buy ${it.name} for ✨ ${it.price} stardust?`)) return;
    edit(p => { p.owned = [...(p.owned || []), it.id]; p.spent = (p.spent || 0) + it.price; p.pet.equipped = { ...p.pet.equipped, [it.slot]: it.id }; },
      `${esc(prof.pet.name)} loves the ${esc(it.name)}! 💖`);
  });
  $app().querySelectorAll('[data-wear]').forEach(b => b.onclick = () => {
    const it = b.dataset.wear === 'moon' ? FREE_BG : shopItem(b.dataset.wear);
    edit(p => { p.pet.equipped = { ...p.pet.equipped, [it.slot]: it.id }; });
  });
  $app().querySelectorAll('[data-off]').forEach(b => b.onclick = () => edit(p => { const e = { ...p.pet.equipped }; delete e[b.dataset.off]; p.pet.equipped = e; }));
  celebrate();
}

// ======================================================================
// My Skills dashboard
// ======================================================================
const TITLES = [[90, 'Galaxy Brain'], [75, 'Super Nova'], [60, 'Shining Star'], [40, 'Rising Star'], [0, 'Brave Beginner']];

export function skillsView(subj = 'maths') {
  if (!['maths', 'thinking', 'reading'].includes(subj)) subj = 'maths';
  const results = store.getResults().filter(r => r.subject === subj && r.mode !== 'exam');
  const items = results.flatMap(r => r.items || []);
  const correct = items.filter(i => i.correct).length;
  const acc = items.length ? pct(correct, items.length) : null;
  const time = items.reduce((a, i) => a + (i.timeSec || 0), 0);
  const base = BASELINE[subj];
  const title = items.length < 20 ? 'New Explorer' : TITLES.find(([min]) => acc >= min)[1];

  // per-topic stats from drills (time) + mastery (includes CS exam baseline)
  const mastery = topicMastery(subj);
  const tstat = {};
  for (const it of items) { const t = tstat[it.topic] || (tstat[it.topic] = { n: 0, c: 0, time: 0 }); t.n++; if (it.correct) t.c++; t.time += it.timeSec || 0; }

  // radar axes: maths → strands; thinking/reading → topics
  let axes;
  if (subj === 'maths') {
    axes = SUBJECTS.maths.strands.map(st => {
      const its = items.filter(i => i.strand === st);
      const v = its.length ? pct(its.filter(i => i.correct).length, its.length) : base?.strands?.[st] ? Math.round(base.strands[st][0]) : null;
      return { label: st.replace(' and ', ' & '), value: v };
    });
  } else {
    axes = topicsFor(subj).map(t => ({ label: shortTopic(t), value: mastery.find(m => m.topic === t)?.pct ?? null }));
  }

  const card = (m) => {
    const t = tstat[m.topic] || { n: 0, c: 0, time: 0 };
    const tag = m.pct === null ? ['new', '🌱 Not started'] : m.total < 3 ? ['new', '🔭 Early days'] : m.pct < 50 ? ['bad', '🛠 Needs practice'] : m.pct < 75 ? ['mid', '🌿 Growing'] : ['good', '🌟 Strong'];
    const href = subj === 'reading' ? '#/practice/reading' : `#/practice/${subj}?topic=${encodeURIComponent(m.topic)}`;
    return `<div class="skill">
      <div class="skillhead"><b>${esc(m.topic)}</b><span class="pct ${level(m.pct)}">${m.pct === null ? '–' : m.pct + '%'}</span></div>
      <div class="bar2 ${level(m.pct)}"><span style="width:${m.pct ?? 0}%"></span></div>
      <div class="skillmeta"><span class="chip ${tag[0]}">${tag[1]}</span>
        <span>📝 ${t.n} answered</span><span>⏱ ${fmtDuration(t.time)}${t.n ? ` · ${Math.round(t.time / t.n)}s each` : ''}</span>
        ${m.baseline && !t.n ? '<span class="muted">from CS exam</span>' : ''}
        <a href="${href}">Practise →</a></div></div>`;
  };
  const sorted = [...mastery].sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1));
  const isStrong = m => m.pct !== null && m.pct >= 75 && m.total >= 3;
  const needs = sorted.filter(m => !isStrong(m));
  const strong = sorted.filter(isStrong).reverse();

  $app().innerHTML = `
    <div class="skillsdash">
      <div class="card sd">
        <div class="sdhead"><div class="staricon">⭐</div><div><h1>My Skills Dashboard</h1><p class="muted">Your progress map</p></div>
          <div class="tabs">${['maths', 'thinking', 'reading'].map(s => `<a href="#/skills/${s}" class="${s === subj ? 'on' : ''}">${SUBJECTS[s].icon} ${SUBJECTS[s].short || SUBJECTS[s].name}</a>`).join('')}</div></div>
        <div class="tiles">
          <div class="tile"><b class="${level(acc)}">${acc === null ? '–' : acc + '%'}</b><span>Accuracy</span></div>
          <div class="tile"><b>${items.length}</b><span>Questions</span></div>
          <div class="tile"><b>${results.length}</b><span>Drills</span></div>
          <div class="tile"><b>${fmtDuration(time)}</b><span>Time spent</span></div>
        </div>
        <div class="radarwrap">${radarChart(axes, { size: 400 })}</div>
        ${base ? `<p class="muted center">Dots start from your CS exams and update as you practise.</p>` : ''}
        <div class="titlebadge"><span>${esc(title)}</span></div>
      </div>
      <div class="two">
        <div class="card"><h2>🛠 Practise next</h2>${needs.length ? needs.map(card).join('') : '<p>Everything is strong. Amazing! 🎉</p>'}</div>
        <div class="card"><h2>🌟 Strengths</h2>${strong.length ? strong.map(card).join('') : '<p class="muted">Skills where you reach 75% (with at least 3 questions) will show up here.</p>'}</div>
      </div>
    </div>`;
}
const shortTopic = t => ({
  'Finding the Main Conclusion': 'Main Conclusion', 'Identifying Inferences and Assumptions': 'Assumptions',
  'Strengthening and Weakening': 'Strengthen / Weaken', 'Detecting Reasoning Error': 'Reasoning Errors',
  'Identifying Similarities and Patterns': 'Patterns', "Author's Purpose and Tone": 'Purpose & Tone',
  'Vocabulary in Context': 'Vocabulary', 'Character and Theme': 'Character & Theme', 'Figurative Language': 'Figurative',
}[t] || t);

// ======================================================================
// Monthly exams
// ======================================================================
export const TRIAL_COLORS = { maths: '#1e88e5', thinking: '#8e24aa', reading: '#43a047', writing: '#fb8c00', total: '#2b2620' };

export function trialCard() {
  const tr = trialTrends(); const L = CS_TRIALS.map(t => t.tests);
  const cell = v => `<td><span class="pct ${v < 50 ? 'bad' : v < 75 ? 'mid' : 'good'}">${v}</span></td>`;
  const arrow = (a, b) => (b - a >= 5 ? `<span class="up">▲ ${b - a}</span>` : a - b >= 5 ? `<span class="down">▼ ${a - b}</span>` : '<span class="flat">→</span>');
  return `<div class="card"><h2>📈 CS trial test history (12 trials)</h2>
    ${categoryChart(L, [
      ...['maths', 'thinking', 'reading', 'writing'].map(k => ({ name: SUBJECTS[k].short || SUBJECTS[k].name, color: TRIAL_COLORS[k], values: CS_TRIALS.map(t => t[k]) })),
      { name: 'Total', color: TRIAL_COLORS.total, values: CS_TRIALS.map(t => t.total), bold: true },
      { name: 'Ahead of % of students', color: '#9e9e9e', values: CS_TRIALS.map(t => tr.ahead(t)), dashed: true },
    ])}
    <div class="trialsum">${tr.subjects.map(s => `<div class="tile"><b>${SUBJECTS[s.key].icon} ${s.late}%</b><span>${SUBJECTS[s.key].short || SUBJECTS[s.key].name}: last 6 avg ${arrow(s.early, s.late)}<br><small>first 6 avg ${s.early}% · best ${s.best}% (Test ${s.bestAt})</small></span></div>`).join('')}</div>
    <details><summary>Show all 12 trials</summary>
    <table class="tbl"><thead><tr><th>Tests</th><th>Maths</th><th>Thinking</th><th>Reading</th><th>Writing</th><th>Total</th><th>Rank</th><th>Ahead of</th></tr></thead><tbody>
    ${[...CS_TRIALS].reverse().map(t => `<tr><td>${t.tests}</td>${cell(t.maths)}${cell(t.thinking)}${cell(t.reading)}${cell(t.writing)}<td><b>${t.total}</b></td><td>${t.rank}/${t.of}</td><td>${tr.ahead(t)}%</td></tr>`).join('')}
    </tbody></table></details>
    <p class="muted">"Ahead of" = the share of students she scored above. The group grew from 138 to 397 students, so rank numbers aren't directly comparable over time.</p></div>`;
}

export function examsView() {
  const entries = [
    ...CS_EXAMS.map(e => ({ id: null, subject: e.subject, topicLabel: e.name, finishedAt: e.date + 'T12:00:00Z',
      pctScore: pct(e.score, e.total), avg: e.avg, rank: e.rank, rankOf: e.rankOf, builtIn: true, score: e.score, total: e.total })),
    ...store.getResults().filter(r => r.mode === 'exam').map(r => ({ ...r, pctScore: pct(r.score, r.total) })),
  ].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));

  const charts = ['reading', 'maths', 'thinking', 'writing'].map(s => {
    const es = entries.filter(e => e.subject === s).sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
    if (!es.length) return '';
    const series = [{ name: store.getSettings().nickname, color: '#5a8a64', points: es.map(e => ({ x: e.finishedAt.slice(0, 10), y: e.pctScore, label: e.topicLabel })) }];
    const av = es.filter(e => e.avg);
    if (av.length) series.push({ name: 'Class average', color: '#c9a55c', points: av.map(e => ({ x: e.finishedAt.slice(0, 10), y: e.avg, label: e.topicLabel })) });
    return `<div class="card"><h3>${SUBJECTS[s].icon} ${SUBJECTS[s].name}</h3>${lineChart(series, { height: 200 })}</div>`;
  }).join('');

  $app().innerHTML = `
    <div class="card"><h1>🏆 Monthly exam results</h1>
      <p>Record each tutoring or trial exam (for example CS Education Selective tests) so it sits alongside daily drills on your progress charts.</p>
      <table class="tbl"><thead><tr><th>Date</th><th>Exam</th><th>Subject</th><th>Score</th><th>Class avg</th><th>Rank</th></tr></thead><tbody>
      ${entries.map(e => `<tr><td>${fmtDate(e.finishedAt)}</td><td>${esc(e.topicLabel)}</td><td>${SUBJECTS[e.subject].icon} ${esc(SUBJECTS[e.subject].short || SUBJECTS[e.subject].name)}</td>
        <td><b>${e.score}/${e.total}</b> <span class="pct ${level(e.pctScore)}">${Math.round(e.pctScore)}%</span></td>
        <td>${e.avg ? Math.round(e.avg) + '%' : '–'} ${e.avg ? (e.pctScore >= e.avg ? '<span class="chip good">above</span>' : '<span class="chip bad">below</span>') : ''}</td>
        <td>${e.rank ? `${e.rank} / ${e.rankOf}` : '–'}</td></tr>`).join('')}</tbody></table></div>
    ${trialCard()}
    <div class="grid2">${charts}</div>
    <div class="card narrow"><h2>➕ Add an exam result</h2>
      <div class="row3"><label>Exam name<input id="ename" placeholder="e.g. CS Selective No. 18"></label>
        <label>Date<input id="edate" type="date" value="${todayStr()}"></label>
        <label>Subject<select id="esubj">${['reading', 'maths', 'thinking', 'writing'].map(s => `<option value="${s}">${SUBJECTS[s].name}</option>`).join('')}</select></label></div>
      <div class="row3"><label>Score<input id="escore" type="number" step="0.5" min="0"></label><label>Out of<input id="etotal" type="number" min="1"></label>
        <label>Class average %<input id="eavg" type="number" step="0.01" min="0" max="100" placeholder="optional"></label></div>
      <div class="row3"><label>Rank<input id="erank" type="number" min="1" placeholder="optional"></label><label>Out of (students)<input id="erankof" type="number" min="1" placeholder="optional"></label><div></div></div>
      <div class="btns"><button class="btn primary" id="eadd">Save exam result</button></div></div>`;

  document.getElementById('eadd').onclick = async () => {
    const v = id => document.getElementById(id).value.trim();
    const name = v('ename'), score = Number(v('escore')), total = Number(v('etotal'));
    if (!name || !v('escore') || !total || score > total) return toast('Please enter an exam name, a score and the total (score cannot exceed the total).', 'error');
    const date = v('edate') || todayStr();
    const r = {
      id: `${date}-exam-${v('esubj')}-${Math.random().toString(36).slice(2, 7)}`, subject: v('esubj'), mode: 'exam', topicLabel: name,
      startedAt: `${date}T12:00:00.000Z`, finishedAt: `${date}T12:00:00.000Z`, score, total,
      avg: v('eavg') ? Number(v('eavg')) : null, rank: v('erank') ? Number(v('erank')) : null, rankOf: v('erankof') ? Number(v('erankof')) : null,
      nickname: store.getSettings().nickname, items: [], byStrand: {}, byTopic: {},
    };
    const res = await store.saveResult(r);
    toast(res.synced ? 'Exam saved to GitHub ✔ (+50 XP)' : `Saved on this device. ${esc(res.error || '')}`, res.synced ? 'ok' : 'warn');
    examsView();
  };
}
