// Parent summary: progress, habits, trends and suggested actions on one printable page.
import { SUBJECTS, BASELINE, CS_EXAMS, ROUTINE } from './data/config.js';
import { RUBRIC, RUBRIC_TOTAL } from './data/writing.js';
import * as store from './store.js';
import { topicMastery, topicsFor, mistakesCount } from './bank.js';
import { computeProgress } from './pet.js';
import { isBreakDay, breakOn, studyDaysUntil, addDays, daysBetween, today, nextBreak, fmtShort } from './breaks.js';
import { esc, pct, fmtDate, toast } from './util.js';

const $app = () => document.getElementById('app');
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SUBJ = ['reading', 'maths', 'thinking'];
const name = s => SUBJECTS[s].short || SUBJECTS[s].name;
const localDay = iso => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const mins = r => Math.min(r.durationSec || 0, (r.limitSec || 5400) + 60) / 60; // cap idle time
const plannedDay = d => (ROUTINE[DOW[new Date(d + 'T00:00:00').getDay()]]?.mins || 0) > 0 && !isBreakDay(d);
const arrow = (a, b) => (a === null || b === null ? '' : a - b >= 5 ? `<span class="up">▲ ${a - b}</span>` : b - a >= 5 ? `<span class="down">▼ ${b - a}</span>` : '<span class="flat">→</span>');
const lvl = p => (p === null ? '' : p < 50 ? 'bad' : p < 75 ? 'mid' : 'good');

function stats(rs) {
  const items = rs.flatMap(r => r.items || []);
  return {
    sessions: rs.length, questions: items.length, minutes: Math.round(rs.reduce((a, r) => a + mins(r), 0)),
    acc: items.length ? pct(items.filter(i => i.correct).length, items.length) : null,
  };
}

function weekRange(offset) {
  const t = today(); const mon = addDays(t, -((new Date(t + 'T00:00:00').getDay() + 6) % 7) - 7 * offset);
  return [mon, addDays(mon, 6)];
}

export function parentView() {
  const s = store.getSettings();
  const prof = store.getProfile();
  const all = store.getResults();
  const drills = all.filter(r => r.mode !== 'exam');
  const t = today();
  const byDay = new Map();
  for (const r of drills) { const d = localDay(r.finishedAt); byDay.set(d, (byDay.get(d) || 0) + mins(r)); }
  const pr = computeProgress(all, prof);
  const daysLeft = daysBetween(t, s.examDate), studyLeft = studyDaysUntil(s.examDate);
  const last = drills[drills.length - 1];

  // ---------- this week vs last week ----------
  const inRange = ([a, b]) => drills.filter(r => { const d = localDay(r.finishedAt); return d >= a && d <= b; });
  const [w0, w1] = [weekRange(0), weekRange(1)];
  const s0 = stats(inRange(w0)), s1 = stats(inRange(w1));
  const adherence = range => { let planned = 0, done = 0; for (let d = range[0]; d <= range[1] && d <= t; d = addDays(d, 1)) if (plannedDay(d)) { planned++; if (byDay.has(d)) done++; } return { planned, done }; };
  const a0 = adherence(w0), a1 = adherence(w1);
  const row = (label, x, y, unit = '') => `<tr><td>${label}</td><td><b>${x ?? '–'}${x !== null && x !== undefined ? unit : ''}</b></td><td class="muted">${y ?? '–'}${y !== null && y !== undefined ? unit : ''}</td></tr>`;

  // ---------- heatmap (8 weeks) ----------
  const start = addDays(weekRange(0)[0], -49);
  let cells = '';
  for (let w = 0; w < 8; w++) {
    cells += '<div class="hmcol">';
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d); const m = byDay.get(day) || 0;
      const cls = day > t ? 'future' : breakOn(day) ? 'brk' : m >= 30 ? 'l3' : m >= 15 ? 'l2' : m > 0 ? 'l1' : plannedDay(day) ? 'miss' : 'rest';
      cells += `<i class="${cls}" title="${fmtShort(day)}: ${m ? Math.round(m) + ' min' : breakOn(day) ? breakOn(day).name : plannedDay(day) ? 'no practice' : 'rest day'}"></i>`;
    }
    cells += '</div>';
  }

  // ---------- subjects ----------
  const cutoff = addDays(t, -28), cutoff2 = addDays(t, -56);
  const subjRows = SUBJ.map(sub => {
    const rs = drills.filter(r => r.subject === sub);
    const recent = stats(rs.filter(r => localDay(r.finishedAt) > cutoff)), prev = stats(rs.filter(r => { const d = localDay(r.finishedAt); return d > cutoff2 && d <= cutoff; }));
    const cs = [...CS_EXAMS].filter(e => e.subject === sub).pop();
    const tests = rs.filter(r => r.mode === 'mock'); const lastTest = tests[tests.length - 1];
    const csP = cs ? pct(cs.score, cs.total) : null;
    return `<tr><td>${SUBJECTS[sub].icon} <b>${name(sub)}</b></td>
      <td>${cs ? `<span class="pct ${lvl(csP)}">${csP}%</span> <span class="muted">(avg ${Math.round(cs.avg)}%, rank ${cs.rank}/${cs.rankOf})</span>` : '–'}</td>
      <td>${recent.acc === null ? '<span class="muted">no practice</span>' : `<span class="pct ${lvl(recent.acc)}">${recent.acc}%</span> ${arrow(recent.acc, prev.acc)} <span class="muted">${recent.questions} Qs</span>`}</td>
      <td>${lastTest ? `<span class="pct ${lvl(pct(lastTest.score, lastTest.total))}">${pct(lastTest.score, lastTest.total)}%</span> <span class="muted">${fmtDate(lastTest.finishedAt)} · ${tests.length} total</span>` : '<span class="muted">none yet</span>'}</td>
      <td>${mistakesCount(sub)}</td></tr>`;
  }).join('');

  // ---------- topic movers ----------
  const recentItems = sub => drills.filter(r => r.subject === sub && localDay(r.finishedAt) > addDays(t, -42)).flatMap(r => r.items || []);
  const movers = [];
  for (const sub of SUBJ) {
    const its = recentItems(sub); const baseT = BASELINE[sub]?.topics || {};
    for (const topic of topicsFor(sub)) {
      const ti = its.filter(i => i.topic === topic); const b = baseT[topic];
      const app = ti.length >= 4 ? pct(ti.filter(i => i.correct).length, ti.length) : null;
      const cs = b && b[1] ? pct(b[0], b[1]) : null;
      movers.push({ sub, topic, app, cs, csN: b ? b[1] : 0, n: ti.length });
    }
  }
  const improving = movers.filter(m => m.app !== null && m.cs !== null && m.app >= 50 && m.app - m.cs >= 15).sort((a, b) => (b.app - b.cs) - (a.app - a.cs)).slice(0, 6);
  const help = movers.filter(m => (m.app ?? m.cs) !== null && (m.app ?? m.cs) < 50).sort((a, b) => (a.app ?? a.cs) - (b.app ?? b.cs)).slice(0, 8);
  const untried = movers.filter(m => m.n === 0 && m.cs !== null && m.cs < 60).slice(0, 6);
  const moverRow = m => `<tr><td>${SUBJECTS[m.sub].icon} ${esc(m.topic)}</td><td>${m.cs === null ? '–' : `<span class="pct ${lvl(m.cs)}">${m.cs}%</span> <span class="muted">(${m.csN} Q${m.csN === 1 ? '' : 's'})</span>`}</td><td>${m.app === null ? `<span class="muted">${m.n ? `${m.n} Qs` : 'not practised'}</span>` : `<span class="pct ${lvl(m.app)}">${m.app}%</span> <span class="muted">(${m.n} Qs)</span>`}</td></tr>`;

  // ---------- habits ----------
  const timed = drills.filter(r => ['mock', 'mini'].includes(r.mode) && r.subject !== 'writing');
  const tItems = timed.flatMap(r => r.items || []);
  const blankRate = tItems.length ? pct(tItems.filter(i => i.chosen === null).length, tItems.length) : null;
  const pace = SUBJ.map(sub => {
    const its = timed.filter(r => r.subject === sub).flatMap(r => r.items || []); if (!its.length) return null;
    const target = Math.round(SUBJECTS[sub].mock.minutes * 60 / (sub === 'reading' ? 32 : SUBJECTS[sub].mock.questions));
    const avg = Math.round(its.reduce((a, i) => a + (i.timeSec || 0), 0) / its.length);
    return { sub, avg, target };
  }).filter(Boolean);
  const timeUps = timed.filter(r => r.timeUp).length;
  const csBlanks = CS_EXAMS.reduce((a, e) => a + (e.blanks || 0), 0);

  // ---------- writing ----------
  const csW = [...CS_EXAMS].filter(e => e.subject === 'writing').pop();
  const appW = drills.filter(r => r.subject === 'writing' && r.rubric);
  const wAvg = key => appW.length ? Math.round(appW.reduce((a, r) => a + (r.rubric[key] || 0), 0) / appW.length * 10) / 10 : null;

  // ---------- suggested actions ----------
  const tips = [];
  if (a0.planned && a0.done < a0.planned) tips.push(`This week ${a0.done} of ${a0.planned} planned practice days were done so far.${a0.done === 0 ? ' A short 15-minute session is a good restart.' : ''}`);
  if (a0.planned && a0.done === a0.planned) tips.push(`All ${a0.planned} planned days done this week. Worth a mention at dinner! 🎉`);
  if (blankRate !== null && blankRate > 3) tips.push(`She is leaving <b>${blankRate}%</b> of timed questions blank. Remind her there's no penalty for guessing, and to flag and move on.`);
  else if (blankRate === null && csBlanks) tips.push(`She left ${csBlanks} blanks across the CS Thinking tests. When she starts timed tests in the app, check the "blanks" figure here.`);
  for (const p of pace) if (p.avg > p.target * 1.2) tips.push(`${name(p.sub)}: averaging ${p.avg}s per question vs about ${p.target}s in the real test. Practise flagging hard questions and coming back.`);
  if (help.length) tips.push(`Topics to raise with the CS tutor: <b>${help.slice(0, 4).map(h => h.topic).join(', ')}</b>.`);
  if (untried.length) tips.push(`Weak in CS exams but not yet practised in the app: <b>${untried.slice(0, 3).map(u => u.topic).join(', ')}</b>. Use the "Practise" buttons on My Skills.`);
  if (improving.length) tips.push(`Real improvement since the CS exams in <b>${improving.slice(0, 3).map(i => i.topic).join(', ')}</b>. Praise the effort!`);
  if (csW && appW.length === 0) tips.push(`No app writing tasks yet. CS feedback asked for hooks, witness quotes and richer vocabulary, and the newspaper report task targets exactly this.`);
  const nb = nextBreak(); if (nb && daysBetween(t, nb.start) <= 30) tips.push(`${esc(nb.name)} starts ${fmtShort(nb.start)}. Nothing is planned during the trip, so no need to pack worksheets!`);
  if (!store.syncConfigured()) tips.push('Results are only saved on this device. Add the GitHub token in ⚙️ Settings so progress is backed up.');

  const summaryText = () => [
    `${s.nickname} – Selective prep summary (${fmtShort(t)})`,
    `Exam: ${fmtShort(s.examDate)} – ${daysLeft} days (${studyLeft} study days). Phase: ${document.querySelector('.ps-phase')?.textContent || ''}`,
    `This week: ${s0.sessions} sessions, ${s0.questions} questions, ${s0.minutes} min, accuracy ${s0.acc ?? '–'}%. Planned days done: ${a0.done}/${a0.planned}.`,
    ...SUBJ.map(sub => { const its = recentItems(sub); return `${name(sub)}: last 6 weeks ${its.length ? pct(its.filter(i => i.correct).length, its.length) + '% over ' + its.length + ' questions' : 'no practice'}.`; }),
    help.length ? `Needs help: ${help.map(h => `${h.topic} (${h.app ?? h.cs}%)`).join(', ')}.` : '',
    improving.length ? `Improving: ${improving.map(i => `${i.topic} (${i.cs}% → ${i.app}%)`).join(', ')}.` : '',
    blankRate !== null ? `Blank answers in timed tests: ${blankRate}%.` : '',
  ].filter(Boolean).join('\n');

  const phaseName = daysLeft <= 0 ? 'Exam done' : studyLeft > 95 ? 'Foundation' : studyLeft > 56 ? 'Build' : 'Exam mode';

  $app().innerHTML = `
    <div class="parent">
    <div class="card ps-head">
      <div><h1>👪 Parent summary: ${esc(s.nickname)}</h1>
        <p class="muted">Generated ${fmtShort(t)} · last practice ${last ? fmtDate(last.finishedAt) : 'not yet'} · ${store.syncConfigured() ? '✅ backed up to GitHub' : '⚠️ saved on this device only'}</p></div>
      <div class="btns noprint"><button class="btn" id="copy">📋 Copy for tutor</button><button class="btn primary" id="print">🖨 Print</button></div>
    </div>
    <div class="tiles ps-tiles">
      <div class="tile"><b>${Math.max(daysLeft, 0)}</b><span>days to exam</span></div>
      <div class="tile"><b>${studyLeft}</b><span>study days (after holidays)</span></div>
      <div class="tile"><b class="ps-phase">${phaseName}</b><span>current phase</span></div>
      <div class="tile"><b>🔥 ${pr.streak}</b><span>day streak · best ${pr.bestStreak}</span></div>
      <div class="tile"><b>${stats(drills).questions}</b><span>questions answered</span></div>
      <div class="tile"><b>${Math.round(stats(drills).minutes / 60 * 10) / 10}h</b><span>total practice time</span></div>
    </div>

    <div class="card"><h2>💡 Suggested actions</h2>${tips.length ? `<ul class="tips">${tips.map(x => `<li>${x}</li>`).join('')}</ul>` : '<p>All on track. Nothing to flag right now.</p>'}</div>

    <div class="two">
      <div class="card"><h2>📅 This week vs last week</h2>
        <table class="tbl"><thead><tr><th></th><th>This week</th><th>Last week</th></tr></thead><tbody>
          ${row('Planned days done', `${a0.done}/${a0.planned}`, `${a1.done}/${a1.planned}`)}
          ${row('Sessions', s0.sessions, s1.sessions)}
          ${row('Questions', s0.questions, s1.questions)}
          ${row('Time spent', s0.minutes, s1.minutes, ' min')}
          ${row('Accuracy', s0.acc, s1.acc, '%')}
        </tbody></table>
        <p class="muted">The plan targets about 2¼ hours a week. CS tuition days and holidays don't count as planned days.</p></div>
      <div class="card"><h2>🗓 Last 8 weeks</h2>
        <div class="heat"><div class="hmlabels">${['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map(x => `<span>${x}</span>`).join('')}</div>${cells}</div>
        <div class="legend hmlegend"><span><i class="l3"></i>30+ min</span><span><i class="l2"></i>15–30</span><span><i class="l1"></i>&lt;15</span><span><i class="miss"></i>planned, missed</span><span><i class="rest"></i>rest/CS day</span><span><i class="brk"></i>holiday</span></div></div>
    </div>

    <div class="card"><h2>📚 Subjects</h2>
      <table class="tbl"><thead><tr><th>Subject</th><th>Latest CS exam</th><th>App accuracy (4 weeks)</th><th>Last full app test</th><th>Mistakes to fix</th></tr></thead><tbody>${subjRows}
      <tr><td>✍️ <b>Writing</b></td><td>${csW ? `<span class="pct ${lvl(pct(csW.score, csW.total))}">${csW.score}/${csW.total}</span> <span class="muted">(rank ${csW.rank}/${csW.rankOf})</span>` : '–'}</td>
        <td colspan="2">${appW.length ? `${appW.length} task${appW.length > 1 ? 's' : ''}, latest self-mark ${appW[appW.length - 1].score}/${RUBRIC_TOTAL}` : '<span class="muted">no app writing yet</span>'}</td><td>–</td></tr></tbody></table>
      <p class="muted">▲/▼ compare the last 4 weeks with the 4 weeks before (5+ points).</p></div>

    <div class="two">
      <div class="card"><h2>🛠 Needs help</h2><p class="muted">Below 50%: app practice in the last 6 weeks (4+ questions), otherwise CS exams.</p>
        ${help.length ? `<table class="tbl"><thead><tr><th>Topic</th><th>CS exams</th><th>App (6 weeks)</th></tr></thead><tbody>${help.map(moverRow).join('')}</tbody></table>` : '<p>Nothing below 50%. 🎉</p>'}</div>
      <div class="card"><h2>🌱 Improving</h2><p class="muted">Now at 50%+ in the app and 15+ points above the CS exams.</p>
        ${improving.length ? `<table class="tbl"><thead><tr><th>Topic</th><th>CS exams</th><th>App (6 weeks)</th></tr></thead><tbody>${improving.map(moverRow).join('')}</tbody></table>` : '<p class="muted">Not enough practice yet. This fills in as she practises.</p>'}</div>
    </div>

    <div class="two">
      <div class="card"><h2>⏱ Exam habits (timed tests)</h2>
        <table class="tbl"><tbody>
          <tr><td>Timed tests done in app</td><td><b>${timed.length}</b> (${timed.filter(r => r.mode === 'mock').length} full, ${timed.filter(r => r.mode === 'mini').length} mini)</td></tr>
          <tr><td>Blank answers</td><td>${blankRate === null ? '<span class="muted">no timed tests yet</span>' : `<b class="${blankRate > 3 ? 'warn' : 'ok'}">${blankRate}%</b>`} <span class="muted">· CS tests: ${csBlanks} blanks in Thinking</span></td></tr>
          ${pace.map(p => `<tr><td>${name(p.sub)} pace</td><td><b class="${p.avg > p.target * 1.2 ? 'warn' : 'ok'}">${p.avg}s</b> per question <span class="muted">(real test ≈ ${p.target}s)</span></td></tr>`).join('')}
          <tr><td>Ran out of time</td><td>${timeUps} test${timeUps === 1 ? '' : 's'}</td></tr>
          <tr><td>Past mistakes fixed</td><td>${pr.fixes}</td></tr>
        </tbody></table></div>
      <div class="card"><h2>✍️ Writing criteria</h2>
        <table class="tbl"><thead><tr><th>Criterion</th><th>CS No. 24</th><th>App avg (self-mark)</th></tr></thead><tbody>
          ${RUBRIC.map(c => `<tr><td>${esc(c.name)}</td><td>${csW ? `${csW.rubric[c.key]}/${c.max}` : '–'}</td><td>${wAvg(c.key) === null ? '<span class="muted">–</span>' : `${wAvg(c.key)}/${c.max}`}</td></tr>`).join('')}
        </tbody></table>
        <p class="muted">Self-marks can be generous. Marking one piece together each fortnight keeps them honest.</p></div>
    </div>

    <div class="card"><h2>🏆 CS exam history</h2>
      <table class="tbl"><thead><tr><th>Date</th><th>Exam</th><th>Subject</th><th>Score</th><th>Class avg</th><th>Rank</th></tr></thead><tbody>
      ${[...CS_EXAMS, ...all.filter(r => r.mode === 'exam').map(r => ({ date: localDay(r.finishedAt), name: r.topicLabel, subject: r.subject, score: r.score, total: r.total, avg: r.avg, rank: r.rank, rankOf: r.rankOf }))]
        .sort((a, b) => b.date.localeCompare(a.date)).map(e => `<tr><td>${fmtShort(e.date)}</td><td>${esc(e.name)}</td><td>${SUBJECTS[e.subject].icon} ${name(e.subject)}</td>
        <td><b>${e.score}/${e.total}</b> <span class="pct ${lvl(pct(e.score, e.total))}">${pct(e.score, e.total)}%</span></td><td>${e.avg ? Math.round(e.avg) + '%' : '–'}</td><td>${e.rank ? `${e.rank}/${e.rankOf}` : '–'}</td></tr>`).join('')}
      </tbody></table><p class="muted noprint">Add new CS results on the <a href="#/exams">Exams</a> page.</p></div>
    </div>`;

  document.getElementById('print').onclick = () => window.print();
  document.getElementById('copy').onclick = async () => {
    try { await navigator.clipboard.writeText(summaryText()); toast('Summary copied. Paste it into a message to the tutor 📋', 'ok'); }
    catch { prompt('Copy this summary:', summaryText()); }
  };
}
