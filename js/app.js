import { SUBJECTS, SUBJECT_ORDER, BASELINE, CS_EXAMS, ROUTINE, THEMES } from './data/config.js';
import { activeBreak, nextBreak, lastEndedBreak, breakEndWithRecovery, breakOn, studyDaysUntil, getBreaks, saveBreaks, addDays, daysBetween, today as todayLocal, fmtShort } from './breaks.js';
import CONCEPTS from './data/concepts.js';
import { RUBRIC, RUBRIC_TOTAL, TIPS } from './data/writing.js';
import * as store from './store.js';
import {
  buildTest, getQuestion, passages, writingTasks, letter, scoreItems, topicMastery, weakTopics,
  topicsFor, mistakesCount,
} from './bank.js';
import { lineChart } from './charts.js';
import { parentView } from './parent.js';
import { esc, pct, fmtTime, fmtDate, todayStr, toast, applyTheme } from './util.js';
import { adoptView, petView, skillsView, examsView, petWidget, celebrate, progressNow } from './views.js';
import { say, computeProgress } from './pet.js';

const $app = document.getElementById('app');
const subjName = s => SUBJECTS[s].short || SUBJECTS[s].name;
const MODE_LABEL = { mock: 'Full timed test', mini: 'Mini mock', practice: 'Practice', exam: 'Monthly exam' };

let timer = null;
let session = null; // active test/practice session
const stopTimer = () => { if (timer) clearInterval(timer); timer = null; };

// =====================================================================
// Router
// =====================================================================
const routes = [
  [/^#?\/?$/, dashboard],
  [/^#\/practice\/(\w+)(?:\?.*)?$/, practiceSetup],
  [/^#\/test\/(\w+)\/(mock|mini)$/, testIntro],
  [/^#\/run$/, runSession],
  [/^#\/result\/(.+)$/, resultView],
  [/^#\/writing$/, writingList],
  [/^#\/writing\/(\w+)$/, writingTask],
  [/^#\/history(?:\?.*)?$/, historyView],
  [/^#\/concepts$/, conceptsView],
  [/^#\/settings$/, settingsView],
  [/^#\/adopt$/, adoptView],
  [/^#\/pet$/, petView],
  [/^#\/skills(?:\/(\w+))?$/, skillsView],
  [/^#\/exams$/, examsView],
  [/^#\/parent$/, parentView],
];

function route() {
  stopTimer();
  document.querySelectorAll('.modal').forEach(m => m.remove());
  const h = location.hash || '#/';
  const seg = h.split(/[/?]/)[1] || '';
  document.querySelectorAll('nav a:not(.brand)').forEach(a => a.classList.toggle('active', (a.getAttribute('href').split('/')[1] || '') === seg));
  for (const [re, fn] of routes) {
    const m = h.match(re);
    if (m) { window.scrollTo(0, 0); return fn(...m.slice(1)); }
  }
  dashboard();
}
window.addEventListener('hashchange', route);

// =====================================================================
// Dashboard
// =====================================================================
function daysToExam() {
  const d = Math.ceil((new Date(store.getSettings().examDate) - new Date(todayStr())) / 86400000);
  return d;
}

function phaseFor(days) {
  // Phases follow STUDY days left (holidays like the India trip don't count).
  const sd = studyDaysUntil(store.getSettings().examDate);
  if (days <= 0) return { name: 'Exam done', desc: 'Well done! Update the exam date in Settings if needed.' };
  if (sd > 95) return { name: 'Foundation', desc: 'Learn the concepts: short untimed practice on weak topics during the week, mini mocks on Sundays.' };
  if (sd > 56) return { name: 'Build', desc: 'One full timed test every Sunday (rotating subjects), with weak-topic practice on Mondays and Tuesdays.' };
  return { name: 'Exam mode', desc: 'A full test every Sunday, mistake reviews during the week, and plenty of rest before the big day.' };
}

function weeklyPlan(days) {
  // Rotates weekly so every subject gets its turn; topics follow her weakest skills.
  const w = s => weakTopics(s, 3).map(t => t.topic);
  const wm = w('maths'), wt = w('thinking');
  const phase = phaseFor(days).name;
  const week = Math.floor(Date.now() / (7 * 86400000));
  const alt = week % 2; const rot = ['maths', 'thinking', 'reading'][week % 3];
  const P = (s, topic, label, m) => ({ subject: s, label, mins: m, href: `#/practice/${s}${topic ? `?topic=${encodeURIComponent(topic)}` : ''}` });
  const T = (s, mode, label, m) => ({ subject: s, label, mins: m, href: `#/test/${s}/${mode}` });
  const W = { subject: 'writing', label: 'Writing task + self-mark', mins: 30, href: '#/writing' };
  const REST_CS = [{ subject: 'rest', label: 'No app today. CS tuition counts! 💪', mins: 0, href: '#/pet' }];
  let plan;
  const ended = lastEndedBreak();
  const backWeek = ended && daysBetween(ended.end, todayLocal()) <= 8;
  if (backWeek) plan = { // gentle restart after a holiday
    Mon: [P('maths', 'all', 'Welcome back: easy mixed Maths (5–10 Qs)', 15)],
    Tue: [P('thinking', 'all', 'Easy mixed Thinking (5–10 Qs)', 15)],
    Fri: [P('reading', 'all', 'One reading text', 15)],
    Sat: [{ subject: 'rest', label: 'Free morning: settle back in 🌱', mins: 0, href: '#/pet' }],
    Sun: [T('maths', 'mini', 'Maths mini mock', 15)],
  };
  else if (phase === 'Exam mode') plan = {
    Mon: [P(rot, 'mistakes', `Review last test's ${subjName(rot)} mistakes`, 25)],
    Tue: [P(alt ? 'thinking' : 'maths', 'focus', `${alt ? 'Thinking' : 'Maths'}: weak-topic drill`, 25)],
    Fri: [P('reading', 'Word Meaning in Context', 'Word meaning set (quick)', 15)],
    Sat: [W],
    Sun: [T(rot, 'mock', `Full ${subjName(rot)} test (${SUBJECTS[rot].mock.minutes} min)`, 45)],
  };
  else if (phase === 'Build') plan = {
    Mon: [P('maths', wm[0], `Maths: ${wm[0]}`, 25)],
    Tue: [P('thinking', wt[0], `Thinking: ${wt[0]}`, 25)],
    Fri: [P(alt ? 'maths' : 'thinking', 'mistakes', `Re-try ${alt ? 'Maths' : 'Thinking'} mistakes`, 15)],
    Sat: [alt ? W : P('reading', 'all', 'Reading: 1 text + 1 multi-part set', 30)],
    Sun: [T(rot, 'mock', `Full ${subjName(rot)} test (${SUBJECTS[rot].mock.minutes} min)`, 45)],
  };
  else plan = {
    Mon: [P('maths', wm[0], `Maths: ${wm[0]} (untimed, 10 Qs)`, 25)],
    Tue: [P('thinking', wt[0], `Thinking: ${wt[0]} (untimed, 10 Qs)`, 25)],
    Fri: [P('reading', alt ? 'Word Meaning in Context' : 'Gapped Text', alt ? 'Word meaning set' : 'Gapped-text (cloze) set', 15)],
    Sat: [alt ? W : P('maths', wm[1] || 'focus', `Maths: ${wm[1] || 'weak topics'}`, 30)],
    Sun: alt ? [T('thinking', 'mini', 'Thinking mini mock', 15), T('reading', 'mini', 'Reading mini mock', 20)]
      : [T('maths', 'mini', 'Maths mini mock', 15), P('thinking', 'mistakes', 'Re-try Thinking mistakes', 20)],
  };
  return Object.keys(ROUTINE).map(d => [d, ROUTINE[d].mins ? (plan[d] || []) : REST_CS]);
}

function dashboard() {
  if (!store.getProfile()) { location.hash = '#/adopt'; return; }
  const s = store.getSettings();
  const pr = progressNow();
  const results = store.getResults();
  const days = daysToExam();
  const phase = phaseFor(days);
  const inprog = store.getInProgress();
  const pending = store.pendingCount();
  const plan = weeklyPlan(days);
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const monday = addDays(todayLocal(), -((new Date().getDay() + 6) % 7));
  const dateOf = d => addDays(monday, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(d));
  const studyDays = studyDaysUntil(s.examDate);
  const brk = activeBreak(), upcoming = nextBreak(), ended = lastEndedBreak();
  const justBack = ended && !brk && daysBetween(ended.end, todayLocal()) <= 8 && !results.some(r => r.finishedAt.slice(0, 10) > ended.end);
  const petMsg = brk ? say('holiday', { nick: s.nickname }) : justBack ? say('welcome', { nick: s.nickname }) : say(pr.mood, { nick: s.nickname });
  const holidayBanner = brk?.recovery
    ? `<div class="banner">😴 <b>Jet-lag rest day.</b> Sleep, unpack and relax. No study today! We restart gently on <b>${fmtShort(addDays(brk.end, 1))}</b>.</div>`
    : brk
    ? `<section class="holidaybanner">${petWidget({ mood: 'holiday', size: 90 })}<div><h2>🇮🇳 ${esc(brk.name)}: holiday mode!</h2>
        <p>No study until <b>${fmtShort(addDays(breakEndWithRecovery(brk), 1))}</b> (you get a jet-lag rest day after landing). Enjoy the family time, the food and the adventures!</p>
        <p class="muted">Your 🔥 streak is safe and ${esc(store.getProfile().pet.name)} is on holiday too.</p></div></section>`
    : upcoming && daysBetween(todayLocal(), upcoming.start) <= 21
      ? `<div class="banner">✈️ <b>${esc(upcoming.name)}</b> starts in ${daysBetween(todayLocal(), upcoming.start)} day${daysBetween(todayLocal(), upcoming.start) === 1 ? '' : 's'} (${fmtShort(upcoming.start)} – ${fmtShort(upcoming.end)}, plus a rest day after). No study during the trip, so your streak will be paused, not lost.</div>`
      : justBack ? `<div class="banner">🌱 <b>Welcome back from ${esc(ended.name)}!</b> Start gently: one short drill a day this week is plenty.</div>` : '';
  const doneToday = new Set(results.filter(r => r.finishedAt.slice(0, 10) === todayStr()).map(r => r.subject));

  const card = (subj) => {
    const S = SUBJECTS[subj];
    const rs = results.filter(r => r.subject === subj);
    const lastTest = [...rs].reverse().find(r => r.mode !== 'practice');
    const base = BASELINE[subj];
    const scoreLine = lastTest
      ? `Last test: <b>${pct(lastTest.score, lastTest.total)}%</b> <span class="muted">(${fmtDate(lastTest.finishedAt)})</span>`
      : base ? `Latest CS test: <b>${Math.round(base.score)}%</b> <span class="muted">(${fmtDate(base.date)})</span>` : '<span class="muted">No tests yet</span>';
    if (subj === 'writing') {
      return `<div class="card subj"><h3>${S.icon} ${S.name}</h3><p>${lastTest ? `Last task: <b>${lastTest.score}/${lastTest.total}</b> <span class="muted">(${fmtDate(lastTest.finishedAt)})</span>` : '<span class="muted">No tasks yet</span>'}</p>
        <p class="muted">1 task · 30 minutes · marked with a rubric</p>
        <div class="btns"><a class="btn primary" href="#/writing">Start a writing task</a></div></div>`;
    }
    const mc = mistakesCount(subj);
    return `<div class="card subj"><h3>${S.icon} ${S.name}</h3><p>${scoreLine}</p>
      <p class="muted">${rs.length} session${rs.length === 1 ? '' : 's'} done${mc ? ` · ${mc} mistake${mc === 1 ? '' : 's'} to re-try` : ''}</p>
      <div class="btns">
        <a class="btn" href="#/practice/${subj}">Practice (untimed)</a>
        <a class="btn" href="#/test/${subj}/mini">Mini mock · ${S.mini.minutes}m</a>
        <a class="btn primary" href="#/test/${subj}/mock">Full test · ${S.mock.minutes}m</a>
      </div></div>`;
  };

  const focus = ['maths', 'thinking', 'reading'].map(subj => {
    const w = weakTopics(subj, 3);
    return `<div><h4>${SUBJECTS[subj].icon} ${subjName(subj)}</h4><ul class="focus">${w.map(t =>
      `<li><a href="#/practice/${subj}?topic=${encodeURIComponent(subj === 'reading' ? 'all' : t.topic)}">${esc(t.topic)}</a>
       <span class="pill ${t.pct === null ? '' : t.pct < 50 ? 'bad' : t.pct < 75 ? 'mid' : 'good'}">${t.pct === null ? 'new' : t.pct + '%'}</span></li>`).join('')}</ul></div>`;
  }).join('');

  $app.innerHTML = `
    <section class="hero">
      <div>
        <h1>Hi ${esc(s.nickname)} 👽🥔</h1>
        <p>${days > 0 ? `<b>${days}</b> days until the Selective test (${fmtDate(s.examDate)})${studyDays < days ? ` · <b>${studyDays}</b> study days after holidays` : ''}` : 'Exam day has passed. Update the date in Settings.'}</p>
        <p class="phase"><b>${phase.name} phase:</b> ${phase.desc}</p>
      </div>
      <div class="countdown"><span>${Math.max(days, 0)}</span>days</div>
    </section>
    <section class="card petbar">
      <a href="#/pet" class="petlink">${petWidget({ size: 110, message: esc(petMsg) })}</a>
      <div class="petstats">
        <div><b>🔥 ${pr.streak}</b><span>day streak${pr.practisedToday ? ' ✔ today' : ''}</span></div>
        <div><b>✨ ${pr.coins}</b><span>stardust</span></div>
        <div><b>${esc(pr.stage.name)}</b><span>${pr.next ? `${pr.next.xp - pr.xp} XP to evolve` : 'fully evolved'}</span><div class="xpbar"><span style="width:${pr.stagePct}%"></span></div></div>
        <div><b>🏅 ${pr.badges.filter(b => b.earned).length}/${pr.badges.length}</b><span>badges</span></div>
      </div>
      <div class="btns col"><a class="btn primary" href="#/pet">Visit ${esc(store.getProfile().pet.name)}</a><a class="btn" href="#/skills">My Skills</a></div>
    </section>
    ${holidayBanner}
    ${inprog ? `<div class="banner">You have an unfinished ${esc(subjName(inprog.subject))} ${MODE_LABEL[inprog.mode].toLowerCase()}. <a class="btn primary" href="${inprog.subject === 'writing' ? `#/writing/${inprog.promptId}` : '#/run'}">Resume</a> <button class="btn" id="discard">Discard</button></div>` : ''}
    ${pending ? `<div class="banner warn">${pending} result${pending > 1 ? 's are' : ' is'} saved only on this device. <button class="btn" id="syncnow">Save to GitHub now</button> <a href="#/settings">Settings</a></div>` : ''}
    <section class="grid4">${SUBJECT_ORDER.map(card).join('')}</section>
    <section class="card">
      <h2>📅 This week's plan <small class="muted">· about ${Math.round(plan.filter(([d]) => !breakOn(dateOf(d))).flatMap(([, t]) => t).reduce((a, t) => a + t.mins, 0) / 5) * 5} min of app time this week</small></h2>
      <p class="muted">Fits around CS tuition, boxing and Tamil school. Skip a day if school homework is heavy; Potalien will understand 💛</p>
      <div class="plan">${plan.map(([d, tasks]) => breakOn(dateOf(d)) ? `<div class="day holidayday ${d === dow ? 'today' : ''}"><h4>${d}${d === dow ? ' · today' : ''}</h4><div class="busy">${breakOn(dateOf(d)).recovery ? '😴' : '🇮🇳'} ${esc(breakOn(dateOf(d)).name)}</div><span class="task">${breakOn(dateOf(d)).recovery ? 'Rest and beat the jet lag 😴' : 'Holiday: no study! 🥭'}</span></div>` : `<div class="day ${d === dow ? 'today' : ''} ${ROUTINE[d].mins ? '' : 'restday'}"><h4>${d}${d === dow ? ' · today' : ''}</h4>
        <div class="busy">${ROUTINE[d].icon} ${esc(ROUTINE[d].busy)}</div>${tasks.map(t =>
        `<a href="${t.href}" class="task">${d === dow && doneToday.has(t.subject) ? '✅ ' : ''}${esc(t.label)}${t.mins ? ` <small>· ${t.mins}m</small>` : ''}</a>`).join('')}
        ${ROUTINE[d].when ? `<div class="busy">⏰ ${esc(ROUTINE[d].when)}</div>` : ''}</div>`).join('')}</div>
    </section>
    <section class="two">
      <div class="card"><h2>🎯 Focus topics</h2><p class="muted">Lowest accuracy so far (includes your CS exams). Click to practise.</p><div class="focusgrid">${focus}</div></div>
      <div class="card"><h2>📈 Progress</h2>${progressChart(results)}</div>
    </section>`;

  document.getElementById('discard')?.addEventListener('click', () => { if (confirm('Discard the unfinished test?')) { store.clearInProgress(); dashboard(); } });
  document.getElementById('syncnow')?.addEventListener('click', doSync);
  celebrate();
}

function progressChart(results) {
  const colors = { maths: '#1e88e5', thinking: '#8e24aa', reading: '#43a047', writing: '#fb8c00' };
  const series = SUBJECT_ORDER.map(subj => {
    const pts = [];
    CS_EXAMS.filter(e => e.subject === subj).forEach(e => pts.push({ x: e.date, y: pct(e.score, e.total), label: e.name }));
    results.filter(r => r.subject === subj && r.mode !== 'practice')
      .forEach(r => pts.push({ x: r.finishedAt.slice(0, 10), y: pct(r.score, r.total), label: MODE_LABEL[r.mode] }));
    return { name: subjName(subj), color: colors[subj], points: pts };
  }).filter(s => s.points.length);
  if (!series.some(s => s.points.length > 1)) {
    return `${lineChart(series)}<p class="muted">Finish a mini mock or a full test to see your progress line grow.</p>`;
  }
  return lineChart(series);
}

async function doSync() {
  toast('Syncing with GitHub…');
  const r = await store.syncAll();
  if (r.errors.length) toast(`Sync problem: ${esc(r.errors[0])}`, 'error');
  else toast(`Synced ✔ (${r.uploaded} uploaded, ${r.downloaded} downloaded)`, 'ok');
  route();
}

// =====================================================================
// Practice setup
// =====================================================================
function practiceSetup(subj) {
  if (!SUBJECTS[subj] || subj === 'writing') return dashboard();
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const pre = params.get('topic') || 'all';
  const mastery = topicMastery(subj);
  const mc = mistakesCount(subj);
  const topicOpts = subj === 'reading'
    ? SUBJECTS.reading.strands.map(t => `<option value="${esc(t)}" ${pre === t ? 'selected' : ''}>${esc(t)}</option>`).join('')
    : topicsFor(subj).map(t => { const m = mastery.find(x => x.topic === t); return `<option value="${esc(t)}" ${pre === t ? 'selected' : ''}>${esc(t)}${m?.pct !== null && m?.pct !== undefined ? ` (${m.pct}%)` : ''}</option>`; }).join('');

  $app.innerHTML = `
    <div class="card narrow">
      <h1>${SUBJECTS[subj].icon} ${SUBJECTS[subj].name}: Practice</h1>
      <p>No timer. After each question you'll see whether you were right and a full explanation of the concept.</p>
      <label>What would you like to practise?
        <select id="topic">
          <option value="all" ${pre === 'all' ? 'selected' : ''}>Mixed: all categories</option>
          ${subj !== 'reading' ? `<option value="focus" ${pre === 'focus' ? 'selected' : ''}>🎯 My weak topics</option>` : ''}
          <option value="mistakes" ${pre === 'mistakes' ? 'selected' : ''} ${mc ? '' : 'disabled'}>🔁 Re-try my mistakes (${mc})</option>
          <optgroup label="${subj === 'reading' ? 'Text type' : 'One topic'}">${topicOpts}</optgroup>
        </select></label>
      ${subj !== 'reading' ? `<label>Number of questions
        <select id="count"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>` : '<p class="muted">Reading practice uses whole texts with all their questions.</p>'}
      <div class="btns"><button class="btn primary" id="go">Start practice</button> <a class="btn" href="#/">Back</a></div>
    </div>`;
  document.getElementById('go').onclick = () => {
    const topic = document.getElementById('topic').value;
    const count = Number(document.getElementById('count')?.value || 12);
    const qids = buildTest(subj, 'practice', { topic, count });
    if (!qids.length) return toast('No questions found for that choice.', 'error');
    startSession({ subject: subj, mode: 'practice', qids, topicLabel: topic === 'all' ? 'Mixed' : topic === 'focus' ? 'Weak topics' : topic === 'mistakes' ? 'Mistakes re-try' : topic });
  };
}

// =====================================================================
// Timed test intro
// =====================================================================
function testIntro(subj, mode) {
  if (!SUBJECTS[subj] || subj === 'writing') return dashboard();
  const S = SUBJECTS[subj];
  const f = S[mode];
  const qids = buildTest(subj, mode);
  $app.innerHTML = `
    <div class="card narrow">
      <h1>${S.icon} ${S.name}: ${MODE_LABEL[mode]}</h1>
      <ul class="rules">
        <li>${subj === 'reading'
          ? `<b>${mode === 'mock' ? '17 questions' : '2 texts'} (${f.note}) · ${qids.length} marks · ${f.minutes} minutes</b>${mode === 'mock' ? ' (same format as the real NSW Selective test)' : ''}`
          : `<b>${qids.length} questions · ${f.minutes} minutes</b>${mode === 'mock' && qids.length === f.questions ? ' (same as the real NSW Selective test)' : ''}`}</li>
        <li>Covers every category: ${S.strands.join(', ')}${subj === 'reading' && mode === 'mini' ? ' (a few text types each time)' : ''}.</li>
        <li>You can move between questions and <b>flag</b> ones to come back to.</li>
        <li>There is <b>no penalty for wrong answers</b>, so never leave a question blank. Guess if time is running out!</li>
        <li>The test submits automatically when time runs out. You'll get full explanations afterwards.</li>
        <li>Keyboard: <kbd>A</kbd>–<kbd>E</kbd> choose · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>F</kbd> flag.</li>
      </ul>
      <p class="muted">Pacing guide: about ${Math.round((f.minutes * 60) / qids.length)} seconds per ${subj === 'reading' ? 'mark' : 'question'}.</p>
      <div class="btns"><button class="btn primary" id="go">Start the clock ⏱</button> <a class="btn" href="#/">Back</a></div>
    </div>`;
  document.getElementById('go').onclick = () => startSession({ subject: subj, mode, qids, limitSec: f.minutes * 60 });
}

// =====================================================================
// Session engine (practice + timed)
// =====================================================================
function startSession({ subject, mode, qids, limitSec = null, topicLabel = '' }) {
  if (store.getInProgress() && !confirm('This will replace your unfinished test. Continue?')) return;
  session = {
    id: `${new Date().toISOString().replace(/[:.]/g, '-')}-${subject}-${mode}`,
    subject, mode, qids, limitSec, topicLabel,
    answers: {}, flags: {}, checked: {}, qTime: {}, current: 0,
    startedAt: Date.now(), lastSwitch: Date.now(),
  };
  store.saveInProgress(session);
  location.hash = '#/run';
}

function tickQTime() {
  const now = Date.now(); const qid = session.qids[session.current];
  session.qTime[qid] = (session.qTime[qid] || 0) + (now - session.lastSwitch) / 1000;
  session.lastSwitch = now;
}
const persist = () => store.saveInProgress(session);
const remaining = () => session.limitSec - (Date.now() - session.startedAt) / 1000;

function runSession() {
  session = session || store.getInProgress();
  if (!session) { location.hash = '#/'; return; }
  if (session.subject === 'writing') { const pid = session.promptId; session = null; location.hash = `#/writing/${pid}`; return; }
  session.lastSwitch = Date.now();
  if (session.limitSec && remaining() <= 0) return finishSession(true);
  renderQuestion();
  if (session.limitSec) {
    timer = setInterval(() => {
      const r = remaining();
      const el = document.getElementById('timer');
      if (el) { el.textContent = fmtTime(r); el.classList.toggle('low', r < 300); }
      if (r <= 0) { stopTimer(); finishSession(true); }
    }, 1000);
  }
}

function renderQuestion() {
  const s = session; const qid = s.qids[s.current]; const q = getQuestion(qid);
  const practice = s.mode === 'practice';
  const checked = practice && s.checked[qid];
  const chosen = s.answers[qid];
  const passage = q.passageId ? passages.get(q.passageId) : null;
  const answeredCount = Object.keys(s.answers).length;

  const optHtml = q.opts.map((o, i) => {
    let cls = 'opt';
    if (chosen === i) cls += ' chosen';
    if (checked) { if (i === q.a) cls += ' correct'; else if (chosen === i) cls += ' wrong'; }
    const text = passage && q.topic === 'Text Structure' && q.opts.length > 4 ? esc(o.replace(/^[A-G]\.\s*/, '')) : (/<svg/.test(o) ? o : esc(o));
    return `<button class="${cls}" data-i="${i}" ${checked ? 'disabled' : ''}><span class="L">${letter(i)}</span><span class="t">${text}</span></button>`;
  }).join('');

  const concept = CONCEPTS[q.topic];
  const feedback = checked ? `
    <div class="feedback ${chosen === q.a ? 'ok' : 'no'}">
      <div class="fbhead">${petWidget({ mood: chosen === q.a ? 'excited' : 'oops', size: 70, cls: 'mini' })}
      <div><h3>${chosen === q.a ? '✅ Correct!' : `❌ Not quite. The answer is ${letter(q.a)}.`}</h3>
      <p class="petsay">${esc(say(chosen === q.a ? 'correct' : 'wrong'))}</p></div></div>
      <div class="exp">${q.exp}</div>
      ${concept ? `<details class="concept"><summary>📘 Concept: ${esc(q.topic)}</summary>${conceptHtml(q.topic)}</details>` : ''}
    </div>` : '';

  const nav = practice ? '' : `<div class="navgrid">${s.qids.map((id, i) =>
    `<button data-go="${i}" class="${i === s.current ? 'cur' : ''} ${s.answers[id] !== undefined ? 'ans' : ''} ${s.flags[id] ? 'flag' : ''}">${i + 1}</button>`).join('')}</div>`;

  $app.innerHTML = `
    <div class="exam ${passage ? 'withpassage' : ''}">
      <header class="examhead">
        <div><b>${SUBJECTS[s.subject].icon} ${subjName(s.subject)}</b> · ${MODE_LABEL[s.mode]}${s.topicLabel ? ` · ${esc(s.topicLabel)}` : ''}</div>
        <div>Question <b>${s.current + 1}</b> of ${s.qids.length}${practice ? '' : ` · ${answeredCount} answered`}</div>
        ${s.limitSec ? `<div id="timer" class="timer">${fmtTime(remaining())}</div>` : `<div class="muted">No time limit</div>`}
      </header>
      <div class="exambody">
        ${passage ? `<article class="passage"><h3>${esc(passage.title)}</h3><div class="ptype">${esc(passage.type)}</div>${passage.text}</article>` : ''}
        <section class="qpanel">
          <div class="qmeta"><span class="pill">${esc(q.topic)}</span>${!practice && s.flags[qid] ? ' <span class="pill mid">🚩 flagged</span>' : ''}</div>
          <div class="qtext">${q.q}</div>
          <div class="opts ${q.opts.length > 5 ? 'long' : ''}">${optHtml}</div>
          ${feedback}
          <div class="qbtns">
            ${practice ? (checked
              ? `<button class="btn primary" id="next">${s.current < s.qids.length - 1 ? 'Next question →' : 'Finish & see summary'}</button>`
              : `<button class="btn primary" id="check" ${chosen === undefined ? 'disabled' : ''}>Check answer</button>`)
              : `<button class="btn" id="prev" ${s.current === 0 ? 'disabled' : ''}>← Back</button>
                 <button class="btn" id="flag">${s.flags[qid] ? 'Unflag' : '🚩 Flag'}</button>
                 <button class="btn primary" id="next">${s.current < s.qids.length - 1 ? 'Next →' : 'Review & finish'}</button>`}
            <button class="btn ghost" id="end">${practice ? 'End practice' : 'Finish test'}</button>
          </div>
          ${nav}
        </section>
      </div>
    </div>`;

  $app.querySelectorAll('.opt').forEach(b => b.onclick = () => choose(Number(b.dataset.i)));
  $app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(Number(b.dataset.go)));
  document.getElementById('check')?.addEventListener('click', check);
  document.getElementById('next')?.addEventListener('click', () => {
    if (s.current < s.qids.length - 1) go(s.current + 1); else practice ? finishSession() : confirmFinish();
  });
  document.getElementById('prev')?.addEventListener('click', () => go(s.current - 1));
  document.getElementById('flag')?.addEventListener('click', () => { s.flags[qid] = !s.flags[qid]; persist(); renderQuestion(); });
  document.getElementById('end').onclick = () => (practice ? finishSession() : confirmFinish());
}

function choose(i) {
  const qid = session.qids[session.current];
  if (session.mode === 'practice' && session.checked[qid]) return;
  session.answers[qid] = i; persist(); renderQuestion();
}
function check() {
  const qid = session.qids[session.current];
  if (session.answers[qid] === undefined) return;
  tickQTime(); session.checked[qid] = true; persist(); renderQuestion();
}
function go(i) {
  if (i < 0 || i >= session.qids.length) return;
  tickQTime(); session.current = i; persist(); renderQuestion();
  document.querySelector('.qpanel')?.scrollIntoView({ block: 'start' });
}
function confirmFinish() {
  const blanks = session.qids.filter(id => session.answers[id] === undefined).length;
  const flags = session.qids.filter(id => session.flags[id]).length;
  const msg = `${blanks ? `⚠️ ${blanks} question${blanks > 1 ? 's are' : ' is'} unanswered. There's no penalty for guessing!\n` : ''}${flags ? `🚩 ${flags} flagged.\n` : ''}Submit the test now?`;
  if (confirm(msg)) finishSession();
}

document.addEventListener('keydown', (e) => {
  if (!session || location.hash !== '#/run' || e.target.matches('input, textarea, select')) return;
  if (e.key === 'Enter' && e.target.matches('button, a')) return;
  const k = e.key.toUpperCase();
  const q = getQuestion(session.qids[session.current]);
  const idx = 'ABCDEFG'.indexOf(k);
  if (idx >= 0 && idx < q.opts.length && k.length === 1) choose(idx);
  else if (e.key === 'ArrowRight') go(session.current + 1);
  else if (e.key === 'ArrowLeft') go(session.current - 1);
  else if (k === 'F' && session.mode !== 'practice') { const id = session.qids[session.current]; session.flags[id] = !session.flags[id]; persist(); renderQuestion(); }
  else if (e.key === 'Enter' && session.mode === 'practice') {
    const id = session.qids[session.current];
    if (!session.checked[id]) check(); else document.getElementById('next')?.click();
  }
});

async function finishSession(timeUp = false) {
  stopTimer();
  if (!session) return;
  tickQTime();
  const s = session;
  const qids = s.mode === 'practice' ? s.qids.filter(id => s.checked[id]) : s.qids;
  if (!qids.length) { store.clearInProgress(); session = null; location.hash = '#/'; return; }
  const items = qids.map(id => {
    const q = getQuestion(id); const chosen = s.answers[id] ?? null;
    return { qid: id, topic: q.topic, strand: q.strand, chosen, correct: chosen === q.a, timeSec: Math.round(s.qTime[id] || 0), flagged: !!s.flags[id] };
  });
  const sc = scoreItems(items);
  const result = {
    id: s.id, subject: s.subject, mode: s.mode, topicLabel: s.topicLabel, nickname: store.getSettings().nickname,
    startedAt: new Date(s.startedAt).toISOString(), finishedAt: new Date().toISOString(),
    durationSec: Math.round((Date.now() - s.startedAt) / 1000), limitSec: s.limitSec, timeUp,
    score: sc.score, total: sc.total, byStrand: sc.byStrand, byTopic: sc.byTopic, items,
  };
  store.clearInProgress(); session = null;
  if (timeUp) toast('⏰ Time is up! Your test has been submitted.');
  location.hash = `#/result/${result.id}`;
  const res = await store.saveResult(result);
  toast(res.synced ? 'Result saved to GitHub ✔' : `Saved on this device. ${esc(res.error || '')}`, res.synced ? 'ok' : 'warn');
}

// =====================================================================
// Results
// =====================================================================
function conceptHtml(topic) {
  const c = CONCEPTS[topic]; if (!c) return '';
  return `<p>${esc(c.what)}</p><b>Key ideas</b><ul>${c.keys.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
    <b>Watch out for</b><ul class="traps">${c.traps.map(k => `<li>${esc(k)}</li>`).join('')}</ul>`;
}

const bar = (p, cls = '') => `<div class="bar ${cls}"><span style="width:${p}%"></span></div>`;

function xpGain(r) {
  const prof = store.getProfile(); if (!prof) return '';
  const all = store.getResults();
  const before = computeProgress(all.filter(x => x.id !== r.id), prof);
  const after = computeProgress(all, prof);
  const p = pct(r.score, r.total);
  const nick = store.getSettings().nickname;
  const msg = p >= 85 ? `WOW, ${nick}! That was out of this world! 🌟` : p >= 70 ? 'Great work! My antennae are glowing with pride ✨'
    : p >= 50 ? 'Nice effort! Read the concept cards below and we\'ll smash it next time 💪'
    : 'Tough one! Every mistake below is a clue. Let\'s learn them together 🔍';
  return `<div class="xpgain">${petWidget({ mood: p >= 50 ? 'excited' : 'content', size: 90, message: esc(msg) })}
    <div class="gain"><b>+${after.xp - before.xp} XP</b><span>+${Math.floor(after.xp / 4) - Math.floor(before.xp / 4)} ✨ stardust</span></div></div>`;
}

function resultView(id) {
  const r = store.getResult(decodeURIComponent(id));
  if (!r) { $app.innerHTML = '<div class="card">Result not found. <a href="#/history">Back to history</a></div>'; return; }
  if (r.mode === 'exam') { location.hash = '#/exams'; return; }
  if (r.subject === 'writing') return writingResult(r);
  const p = pct(r.score, r.total);
  const blanks = r.items.filter(i => i.chosen === null).length;
  const base = BASELINE[r.subject];
  const target = SUBJECTS[r.subject].mock.minutes * 60 / SUBJECTS[r.subject].mock.questions;
  const avgT = r.items.reduce((a, i) => a + i.timeSec, 0) / r.items.length;
  const slow = [...r.items].map((it, n) => ({ ...it, n: n + 1 })).sort((a, b) => b.timeSec - a.timeSec).slice(0, 3);
  const wrongTopics = [...new Set(r.items.filter(i => !i.correct).map(i => i.topic))];

  const strands = Object.entries(r.byStrand).map(([st, v]) => {
    const bp = base?.strands?.[st];
    return `<tr><td>${esc(st)}</td><td>${v.correct}/${v.total}</td><td>${bar(pct(v.correct, v.total), pct(v.correct, v.total) < 50 ? 'bad' : pct(v.correct, v.total) < 75 ? 'mid' : 'good')}</td>
      <td>${pct(v.correct, v.total)}%</td><td class="muted">${bp ? `${Math.round(bp[0])}% in CS test (${fmtDate(base.date)})` : ''}</td></tr>`;
  }).join('');
  const topics = Object.entries(r.byTopic).sort((a, b) => pct(a[1].correct, a[1].total) - pct(b[1].correct, b[1].total))
    .map(([t, v]) => `<tr><td>${esc(t)}</td><td>${v.correct}/${v.total}</td><td>${bar(pct(v.correct, v.total), pct(v.correct, v.total) < 50 ? 'bad' : pct(v.correct, v.total) < 75 ? 'mid' : 'good')}</td></tr>`).join('');

  let lastPassage = null;
  const review = r.items.map((it, n) => {
    const q = getQuestion(it.qid); if (!q) return '';
    let ph = '';
    if (q.passageId && q.passageId !== lastPassage) {
      const ps = passages.get(q.passageId); lastPassage = q.passageId;
      ph = `<details class="passage-review"><summary>📖 Text: ${esc(ps.title)} (${esc(ps.type)})</summary><div class="passage">${ps.text}</div></details>`;
    }
    const status = it.chosen === null ? 'blank' : it.correct ? 'right' : 'wrong';
    const optText = i => (i === null ? 'No answer' : /<svg/.test(q.opts[i]) ? `Option ${letter(i)}` : esc(q.opts[i]));
    return `${ph}<details class="rev ${status}" ${status !== 'right' ? 'open' : ''}>
      <summary><span class="qn">Q${n + 1}</span> ${status === 'right' ? '✅' : status === 'blank' ? '⬜' : '❌'} <span class="pill">${esc(it.topic)}</span> <span class="muted">${it.timeSec}s</span></summary>
      <div class="qtext">${q.q}</div>
      <p><b>Your answer:</b> ${letter(it.chosen)}${it.chosen !== null ? `: ${optText(it.chosen)}` : ''}<br>
      <b>Correct answer:</b> ${letter(q.a)}: ${optText(q.a)}</p>
      <div class="exp">${q.exp}</div></details>`;
  }).join('');

  $app.innerHTML = `
    <div class="card">
      <h1>${SUBJECTS[r.subject].icon} ${SUBJECTS[r.subject].name}: ${MODE_LABEL[r.mode]}${r.topicLabel ? ` (${esc(r.topicLabel)})` : ''}</h1>
      <p class="muted">${fmtDate(r.finishedAt)} · time used ${fmtTime(r.durationSec)}${r.limitSec ? ` of ${fmtTime(r.limitSec)}` : ''}${r.timeUp ? ' · ⏰ ran out of time' : ''}</p>
      <div class="scorebox">
        <div class="big ${p < 50 ? 'bad' : p < 75 ? 'mid' : 'good'}">${p}%</div>
        <div><b>${r.score} / ${r.total}</b> correct<br>${blanks ? `<span class="warn">${blanks} left blank</span>. Always guess, there's no penalty!` : 'No blanks. Great!'}
        ${base && r.mode !== 'practice' ? `<br><span class="muted">Latest CS test: ${Math.round(base.score)}% (class average ${Math.round(base.cohortAverage)}%)</span>` : ''}</div>
      </div>
      ${xpGain(r)}
      <div class="btns"><a class="btn" href="#/">Dashboard</a>
        ${wrongTopics.length ? `<a class="btn primary" href="#/practice/${r.subject}?topic=mistakes">Re-try these mistakes</a>` : ''}</div>
    </div>
    <div class="two">
      <div class="card"><h2>By category</h2><table class="tbl">${strands}</table>
        <h3>By topic (weakest first)</h3><table class="tbl">${topics}</table></div>
      <div class="card"><h2>⏱ Timing</h2>
        <p>Average <b>${Math.round(avgT)}s</b> per question (target ≈ ${Math.round(target)}s in the real test).</p>
        ${avgT > target * 1.15 ? '<p class="warn">You are spending longer than the real test allows. Practise moving on: flag hard questions and come back.</p>' : avgT < target * 0.5 && p < 70 ? '<p class="warn">You answered quickly but made mistakes. Slow down and re-read each question.</p>' : '<p>Your pacing looks good.</p>'}
        <p>Slowest questions: ${slow.map(s => `Q${s.n} (${s.timeSec}s, ${esc(s.topic)})`).join(' · ')}</p>
      </div>
    </div>
    ${wrongTopics.length ? `<div class="card"><h2>📘 Concepts to review</h2><p class="muted">Based on the questions you missed. Read these before your next practice.</p>
      <div class="concepts">${wrongTopics.map(t => `<div class="concept-card"><h3>${esc(t)}</h3>${conceptHtml(t)}</div>`).join('')}</div></div>` : ''}
    <div class="card"><h2>Question-by-question explanations</h2><p class="muted">Wrong and blank answers are opened for you.</p>${review}</div>`;
  celebrate();
}

// =====================================================================
// Writing
// =====================================================================
function coachCard() {
  const cs = [...CS_EXAMS].filter(e => e.subject === 'writing').pop();
  if (!cs) return '';
  return `<div class="card coach"><h2>🧑‍🏫 Coach notes from ${esc(cs.name)}: ${cs.score}/${cs.total}</h2>
    <p class="muted">Your CS teacher's advice. Tick these off in every piece of writing.</p>
    <ul class="checklist">${cs.feedback.map(f => `<li>☐ ${esc(f)}</li>`).join('')}</ul>
    <table class="tbl">${RUBRIC.map(c => `<tr><td>${esc(c.name)}</td><td>${cs.rubric[c.key]}/${c.max}</td><td>${bar(pct(cs.rubric[c.key], c.max), pct(cs.rubric[c.key], c.max) < 60 ? 'bad' : pct(cs.rubric[c.key], c.max) < 80 ? 'mid' : 'good')}</td></tr>`).join('')}</table></div>`;
}

function writingList() {
  const results = store.getResults().filter(r => r.subject === 'writing');
  $app.innerHTML = `
    <div class="card">
      <h1>✍️ Writing</h1>
      <p>One task, <b>30 minutes</b>, as in the real test. When you finish, mark your writing with the rubric and compare it with a model answer.</p>
      <details><summary><b>Tips for a high score</b></summary><ul>${TIPS.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>
    </div>
    ${coachCard()}
    <div class="grid3">${writingTasks.map(w => {
      const done = results.filter(r => r.promptId === w.id);
      return `<div class="card"><span class="pill">${esc(w.type)}</span><h3>${esc(w.title)}</h3><p>${esc(w.prompt)}</p>
        ${done.length ? `<p class="muted">Done ${done.length}× · best ${Math.max(...done.map(d => d.score))}/${RUBRIC_TOTAL}</p>` : ''}
        <a class="btn primary" href="#/writing/${w.id}">Start (30 min)</a></div>`;
    }).join('')}</div>`;
}

function writingTask(id) {
  const w = writingTasks.find(x => x.id === id);
  if (!w) return writingList();
  let st = store.getInProgress();
  if (!st || st.subject !== 'writing' || st.promptId !== id) {
    if (st && !confirm('This will replace your unfinished test. Continue?')) { location.hash = '#/'; return; }
    st = { subject: 'writing', mode: 'mock', promptId: id, text: '', startedAt: null, limitSec: 30 * 60, id: `${new Date().toISOString().replace(/[:.]/g, '-')}-writing` };
    store.saveInProgress(st);
  }
  if (!st.startedAt) {
    $app.innerHTML = `<div class="card narrow"><span class="pill">${esc(w.type)}</span><h1>${esc(w.title)}</h1><p class="prompt">${esc(w.prompt)}</p>
      <p>You have <b>30 minutes</b>. Spend the first few minutes planning.</p>
      <div class="btns"><button class="btn primary" id="go">Start the clock ⏱</button> <a class="btn" href="#/writing">Back</a></div></div>`;
    document.getElementById('go').onclick = () => { st.startedAt = Date.now(); store.saveInProgress(st); writingTask(id); };
    return;
  }
  const rem = () => st.limitSec - (Date.now() - st.startedAt) / 1000;
  const words = t => (t.trim().match(/\S+/g) || []).length;
  $app.innerHTML = `<div class="card writing">
      <header class="examhead"><div><b>✍️ ${esc(w.title)}</b> · ${esc(w.type)}</div><div id="wc">${words(st.text)} words</div><div id="timer" class="timer">${fmtTime(rem())}</div></header>
      <p class="prompt">${esc(w.prompt)}</p>
      <textarea id="txt" spellcheck="false" placeholder="Plan first, then write here…">${esc(st.text)}</textarea>
      <p class="muted">Spell-check is turned off, just like in the real test. Your writing is saved as you type.</p>
      <div class="btns"><button class="btn primary" id="done">I'm finished, mark it</button></div></div>`;
  const ta = document.getElementById('txt');
  ta.focus();
  ta.oninput = () => { st.text = ta.value; store.saveInProgress(st); document.getElementById('wc').textContent = `${words(ta.value)} words`; };
  const finish = (timeUp) => { stopTimer(); st.text = ta.value; st.finishedAt = Date.now(); st.timeUp = timeUp; store.saveInProgress(st); writingMark(w, st); };
  document.getElementById('done').onclick = () => { if (confirm('Finish and mark your writing?')) finish(false); };
  if (rem() <= 0) return finish(true);
  timer = setInterval(() => {
    const r = rem(); const el = document.getElementById('timer');
    if (el) { el.textContent = fmtTime(r); el.classList.toggle('low', r < 300); }
    if (r <= 0) { toast('⏰ Time is up! Pens down.'); finish(true); }
  }, 1000);
}

function writingMark(w, st) {
  const words = (st.text.trim().match(/\S+/g) || []).length;
  $app.innerHTML = `
    <div class="card"><h1>✍️ Mark your writing</h1><p class="muted">${words} words${st.timeUp ? ' · time ran out' : ''}. Read your writing, then the model answer, then choose a score for each of the 7 CS criteria (total 25). A parent can help mark.</p></div>
    <div class="two">
      <div class="card"><h2>Your writing</h2><div class="mywriting">${esc(st.text).replace(/\n/g, '<br>') || '<i>(empty)</i>'}</div></div>
      <div class="card"><h2>Model answer</h2><div class="model">${w.model}</div><p class="notes"><b>${esc(w.notes)}</b></p></div>
    </div>
    ${coachCard()}
    <div class="card"><h2>Rubric</h2>
      ${RUBRIC.map(c => `<fieldset class="rubric"><legend>${esc(c.name)}</legend>${c.levels.map((l, i) =>
        `<label><input type="radio" name="${c.key}" value="${i + 1}"> <b>${i + 1}</b> · ${esc(l)}</label>`).join('')}</fieldset>`).join('')}
      <label>Notes for next time (optional)<textarea id="notes" rows="2" placeholder="e.g. use more paragraphs, stronger ending"></textarea></label>
      <div class="btns"><button class="btn primary" id="save">Save my score</button></div></div>`;
  document.getElementById('save').onclick = async () => {
    const rub = {}; let missing = false;
    for (const c of RUBRIC) { const v = document.querySelector(`input[name=${c.key}]:checked`); if (!v) missing = true; else rub[c.key] = Number(v.value); }
    if (missing) return toast('Please choose a level for every criterion.', 'error');
    const total = Object.values(rub).reduce((a, b) => a + b, 0);
    const result = {
      id: st.id, subject: 'writing', mode: 'mock', promptId: w.id, title: w.title, type: w.type, nickname: store.getSettings().nickname,
      startedAt: new Date(st.startedAt).toISOString(), finishedAt: new Date(st.finishedAt || Date.now()).toISOString(),
      durationSec: Math.round(((st.finishedAt || Date.now()) - st.startedAt) / 1000), limitSec: st.limitSec, timeUp: !!st.timeUp,
      text: st.text, words, rubric: rub, notes: document.getElementById('notes').value, score: Math.round(total * 100) / 100, total: RUBRIC_TOTAL, items: [],
    };
    store.clearInProgress();
    location.hash = `#/result/${result.id}`;
    const res = await store.saveResult(result);
    toast(res.synced ? 'Saved to GitHub ✔' : `Saved on this device. ${esc(res.error || '')}`, res.synced ? 'ok' : 'warn');
  };
}

function writingResult(r) {
  const w = writingTasks.find(x => x.id === r.promptId);
  $app.innerHTML = `
    <div class="card"><h1>✍️ ${esc(r.title)}</h1><p class="muted">${fmtDate(r.finishedAt)} · ${r.words} words · ${fmtTime(r.durationSec)}</p>
      <div class="scorebox"><div class="big ${r.score / r.total < 0.5 ? 'bad' : r.score / r.total < 0.75 ? 'mid' : 'good'}">${r.score}/${r.total}</div>
      <table class="tbl">${RUBRIC.map(c => `<tr><td>${esc(c.name)}</td><td>${r.rubric[c.key]}/${c.max}</td><td class="muted">${esc(c.levels[r.rubric[c.key] - 1])}</td></tr>`).join('')}</table></div>
      ${r.notes ? `<p><b>Notes:</b> ${esc(r.notes)}</p>` : ''}${xpGain(r)}</div>
    <div class="two"><div class="card"><h2>Your writing</h2><div class="mywriting">${esc(r.text).replace(/\n/g, '<br>')}</div></div>
      <div class="card"><h2>Model answer</h2>${w ? `<div class="model">${w.model}</div><p class="notes"><b>${esc(w.notes)}</b></p>` : ''}</div></div>`;
  celebrate();
}

// =====================================================================
// History, concepts, settings
// =====================================================================
function historyView() {
  const f = new URLSearchParams(location.hash.split('?')[1] || '').get('s') || 'all';
  const rs = [...store.getResults()].reverse().filter(r => r.mode !== 'exam' && (f === 'all' || r.subject === f));
  const tabs = ['all', ...SUBJECT_ORDER].map(k => `<a href="#/history${k === 'all' ? '' : `?s=${k}`}" class="${k === f ? 'on' : ''}">${k === 'all' ? 'All' : `${SUBJECTS[k].icon} ${subjName(k)}`}</a>`).join('');
  $app.innerHTML = `<div class="card"><h1>🗂 Drill history</h1>
    <p class="muted">Open any finished drill to review every answer and its worked solution. Monthly exams are on the <a href="#/exams">Exams</a> page.</p>
    <div class="tabs">${tabs}</div>
    ${rs.length ? `<div class="drills">${rs.map(r => {
      const p = pct(r.score, r.total);
      const blanks = (r.items || []).filter(i => i.chosen === null).length;
      return `<a class="drill" href="#/result/${encodeURIComponent(r.id)}">
        <span class="dicon">${SUBJECTS[r.subject].icon}</span>
        <span class="dmain"><b>${esc(subjName(r.subject))} · ${MODE_LABEL[r.mode]}</b>
          <small>${fmtDate(r.finishedAt)}${r.topicLabel ? ` · ${esc(r.topicLabel)}` : ''}${r.title ? ` · ${esc(r.title)}` : ''} · ${fmtTime(r.durationSec || 0)}${blanks ? ` · ${blanks} blank` : ''}</small></span>
        <span class="pct ${p < 50 ? 'bad' : p < 75 ? 'mid' : 'good'}">${r.score}/${r.total}</span><span class="go">Review →</span></a>`;
    }).join('')}</div>` : '<p>No drills here yet. Start one from the dashboard!</p>'}</div>`;
}

function conceptsView() {
  const groups = { maths: 'Mathematical Reasoning', thinking: 'Thinking Skills', reading: 'Reading' };
  $app.innerHTML = `<div class="card"><h1>📘 Concept library</h1><p>Every topic in the test: the key ideas and the common traps.</p></div>
    ${Object.entries(groups).map(([s, name]) => `<div class="card"><h2>${SUBJECTS[s].icon} ${name}</h2><div class="concepts">${
      Object.entries(CONCEPTS).filter(([, c]) => c.subject === s).map(([t]) => `<details class="concept-card"><summary><b>${esc(t)}</b></summary>${conceptHtml(t)}
        ${s !== 'reading' ? `<a class="btn" href="#/practice/${s}?topic=${encodeURIComponent(t)}">Practise this</a>` : ''}</details>`).join('')}</div></div>`).join('')}`;
}

export function themePicker() {
  const cur = store.getProfile()?.theme || document.documentElement.dataset.theme || 'sand';
  return `<div class="themes">${THEMES.map(t => `<button class="themeopt ${t.id === cur ? 'on' : ''}" data-theme-pick="${t.id}">
    <span class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span><b>${esc(t.name)}</b><small>${esc(t.blurb)}</small></button>`).join('')}</div>`;
}
export function wireThemePicker(rerender) {
  document.querySelectorAll('[data-theme-pick]').forEach(b => b.onclick = async () => {
    const id = b.dataset.themePick; applyTheme(id);
    const p = store.getProfile(); if (p) { p.theme = id; await store.saveProfile(p); } else localStorage.setItem('ms.theme', id);
    rerender();
  });
}

function settingsView() {
  const s = store.getSettings();
  $app.innerHTML = `
    <div class="card narrow"><h1>⚙️ Settings</h1>
      <h2>🎨 Look and feel</h2><p class="muted">Pick a theme. It changes straight away and follows you to other computers.</p>
      ${themePicker()}
      <h2>✈️ Holidays and breaks</h2>
      <p class="muted">No study is planned on these days, the 🔥 streak is protected and the Potalien goes on holiday too.</p>
      <ul class="breaklist">${getBreaks().map((b, i) => `<li><b>${esc(b.name)}</b>: ${fmtShort(b.start)} → ${fmtShort(b.end)} (${daysBetween(b.start, b.end) + 1} days) ${b.builtIn ? '<span class="chip">built in</span>' : `<button class="btn small" data-delbreak="${i}">Remove</button>`}</li>`).join('') || '<li class="muted">No breaks added yet.</li>'}</ul>
      <div class="row3"><label>Name<input id="bname" value="India trip"></label><label>First day<input id="bstart" type="date"></label><label>Last day<input id="bend" type="date"></label></div>
      <div class="btns"><button class="btn" id="addbreak">Add break</button></div>
      <h2>👤 About</h2>
      <label>Nickname (shown in the app and saved with results; avoid full names because the repo is public)<input id="nick" value="${esc(s.nickname)}"></label>
      <label>Selective test date<input id="exam" type="date" value="${esc(s.examDate)}"></label>
      <h2>Save results to GitHub</h2>
      <p class="muted">Results are saved as files in <code>${esc(s.github.path)}/</code> of the repository, so progress follows ${esc(s.nickname)} to any computer. Set this up once on each computer.</p>
      <details><summary><b>How to create the access token (parent, one time)</b></summary><ol>
        <li>On GitHub: your avatar → <b>Settings</b> → <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</li>
        <li>Name: <i>magiselective results</i>. Expiration: after the exam date (e.g. 31 May 2027).</li>
        <li>Repository access: <b>Only select repositories</b> → <i>${esc(s.github.repo)}</i>.</li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b>. Nothing else.</li>
        <li>Generate, copy the token and paste it below. It is stored only in this browser.</li></ol></details>
      <div class="row3"><label>Owner<input id="owner" value="${esc(s.github.owner)}"></label><label>Repository<input id="repo" value="${esc(s.github.repo)}"></label><label>Branch<input id="branch" value="${esc(s.github.branch)}"></label></div>
      <label>Access token<input id="token" type="password" value="${esc(s.github.token)}" placeholder="github_pat_…" autocomplete="off"></label>
      <div class="btns"><button class="btn primary" id="save">Save settings</button><button class="btn" id="test">Test connection</button><button class="btn" id="sync">Sync now</button></div>
      <p id="msg"></p>
      <h2>Backup</h2>
      <div class="btns"><button class="btn" id="export">Download backup file</button><label class="btn">Restore from backup<input type="file" id="import" accept=".json" hidden></label></div>
    </div>`;
  const val = id => document.getElementById(id).value.trim();
  const save = () => {
    store.saveSettings({ nickname: val('nick') || 'Magi', examDate: val('exam'),
      github: { ...s.github, owner: val('owner'), repo: val('repo'), branch: val('branch') || 'main', token: val('token') } });
  };
  const msg = (t, ok) => { const m = document.getElementById('msg'); m.textContent = t; m.className = ok ? 'ok' : 'warn'; };
  document.getElementById('save').onclick = () => { save(); msg('Saved ✔', true); };
  wireThemePicker(settingsView);
  document.getElementById('addbreak').onclick = async () => {
    const name = val('bname') || 'Holiday', start = val('bstart'), end = val('bend');
    if (!start || !end || end < start) return toast('Please choose a first and last day (last day on or after the first).', 'error');
    if (!store.getProfile()) return toast('Adopt a Potalien first.', 'error');
    await saveBreaks([...(store.getProfile()?.breaks || []), { name, start, end }]); toast(`Added ${esc(name)} ✈️`, 'ok'); settingsView();
  };
  document.querySelectorAll('[data-delbreak]').forEach(b => b.onclick = async () => {
    const x = getBreaks()[Number(b.dataset.delbreak)];
    if (!confirm(`Remove ${x.name}?`)) return;
    await saveBreaks((store.getProfile()?.breaks || []).filter(y => !(y.start === x.start && y.end === x.end && y.name === x.name))); settingsView();
  });
  document.getElementById('test').onclick = async () => { save(); msg('Testing…'); try { const r = await store.testConnection(); msg(r.message, r.ok); } catch (e) { msg(e.message); } };
  document.getElementById('sync').onclick = async () => { save(); await doSync(); };
  document.getElementById('export').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.exportAll()], { type: 'application/json' }));
    a.download = `magiselective-backup-${todayStr()}.json`; a.click();
  };
  document.getElementById('import').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const n = store.importAll(await f.text()); msg(`Restored ${n} results ✔`, true); } catch (err) { msg(`Could not read file: ${err.message}`); }
  };
}

// =====================================================================
// Boot
// =====================================================================
window.addEventListener('beforeunload', (e) => { if (location.hash === '#/run' && session?.limitSec) { e.preventDefault(); } });
route();
// Pull results made on other devices in the background.
applyTheme(store.getProfile()?.theme || localStorage.getItem('ms.theme') || 'sand');
store.syncAll().then(r => { applyTheme(store.getProfile()?.theme || 'sand'); if (r.downloaded) { toast(`Loaded ${r.downloaded} result(s) from GitHub`, 'ok'); if (['', '#/', '#/history'].includes(location.hash)) route(); } }).catch(() => {});
