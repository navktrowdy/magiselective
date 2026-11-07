// Parent summary data, shared by the Parent page, the email button and the weekly email (tools/weekly-email.mjs).
import { SUBJECTS, BASELINE, CS_EXAMS, CS_TRIALS, ROUTINE, trialTrends } from './data/config.js';
import { RUBRIC, RUBRIC_TOTAL } from './data/writing.js';
import * as store from './store.js';
import { topicMastery, topicsFor, mistakesCount } from './bank.js';
import { computeProgress } from './pet.js';
import { isBreakDay, breakOn, studyDaysUntil, addDays, daysBetween, today, nextBreak, fmtShort } from './breaks.js';
import { esc, pct, fmtDate } from './util.js';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SUBJ = ['reading', 'maths', 'thinking'];
export const name = s => SUBJECTS[s].short || SUBJECTS[s].name;
const localDay = iso => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const mins = r => Math.min(r.durationSec || 0, (r.limitSec || 5400) + 60) / 60; // cap idle time
const plannedDay = d => (ROUTINE[DOW[new Date(d + 'T00:00:00').getDay()]]?.mins || 0) > 0 && !isBreakDay(d);
const arrow = (a, b) => (a === null || b === null ? '' : a - b >= 5 ? `<span class="up">▲ ${a - b}</span>` : b - a >= 5 ? `<span class="down">▼ ${b - a}</span>` : '<span class="flat">→</span>');
export const lvl = p => (p === null ? '' : p < 50 ? 'bad' : p < 75 ? 'mid' : 'good');

export function stats(rs) {
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

export function computeSummary() {
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
  const trials = trialTrends();
  const fall = trials.subjects.filter(x => x.early - x.late >= 8).sort((a, b) => (b.early - b.late) - (a.early - a.late));
  for (const f of fall.slice(0, 2)) tips.push(`CS trials: <b>${SUBJECTS[f.key].short || SUBJECTS[f.key].name}</b> has dropped from a ${f.early}% average (first 6 trials) to ${f.late}% (last 6). It's the biggest drag on her total, so the plan gives it extra time.`);
  const steady = trials.subjects.filter(x => x.late >= 60 && Math.abs(x.early - x.late) < 5);
  if (steady.length) tips.push(`${steady.map(x => SUBJECTS[x.key].short || SUBJECTS[x.key].name).join(' and ')} is consistently strong in the CS trials (about ${steady[0].late}%). Keep it ticking over with one task a fortnight.`);
  if (help.length) tips.push(`Topics to raise with the CS tutor: <b>${help.slice(0, 4).map(h => h.topic).join(', ')}</b>.`);
  if (untried.length) tips.push(`Weak in CS exams but not yet practised in the app: <b>${untried.slice(0, 3).map(u => u.topic).join(', ')}</b>. Use the "Practise" buttons on My Skills.`);
  if (improving.length) tips.push(`Real improvement since the CS exams in <b>${improving.slice(0, 3).map(i => i.topic).join(', ')}</b>. Praise the effort!`);
  if (csW && appW.length === 0) tips.push(`No app writing tasks yet. CS feedback asked for hooks, witness quotes and richer vocabulary, and the newspaper report task targets exactly this.`);
  const nb = nextBreak(); if (nb && daysBetween(t, nb.start) <= 30) tips.push(`${esc(nb.name)} starts ${fmtShort(nb.start)}. Nothing is planned during the trip, so no need to pack worksheets!`);
  if (!store.syncConfigured()) tips.push('Results are only saved on this device. Add the GitHub token in ⚙️ Settings so progress is backed up.');

  const summaryText = () => [
    `${s.nickname} – Selective prep summary (${fmtShort(t)})`,
    `Exam: ${fmtShort(s.examDate)} – ${daysLeft} days (${studyLeft} study days). Phase: ${phaseName}`,
    `This week: ${s0.sessions} sessions, ${s0.questions} questions, ${s0.minutes} min, accuracy ${s0.acc ?? '–'}%. Planned days done: ${a0.done}/${a0.planned}.`,
    ...SUBJ.map(sub => { const its = recentItems(sub); return `${name(sub)}: last 6 weeks ${its.length ? pct(its.filter(i => i.correct).length, its.length) + '% over ' + its.length + ' questions' : 'no practice'}.`; }),
    help.length ? `Needs help: ${help.map(h => `${h.topic} (${h.app ?? h.cs}%)`).join(', ')}.` : '',
    improving.length ? `Improving: ${improving.map(i => `${i.topic} (${i.cs}% → ${i.app}%)`).join(', ')}.` : '',
    blankRate !== null ? `Blank answers in timed tests: ${blankRate}%.` : '',
  ].filter(Boolean).join('\n');

  const phaseName = daysLeft <= 0 ? 'Exam done' : studyLeft > 95 ? 'Foundation' : studyLeft > 56 ? 'Build' : 'Exam mode';

  return { trials, s, prof, all, drills, t, byDay, pr, daysLeft, studyLeft, last, s0, s1, a0, a1, row, cells, subjRows, recentItems, improving, help, untried, moverRow, timed, blankRate, pace, timeUps, csBlanks, csW, appW, wAvg, tips, summaryText, phaseName, stats };
}

/** A self-contained HTML email (inline styles) for the weekly summary. */
export function emailHtml(x, appUrl = 'https://navktrowdy.github.io/magiselective/') {
  const c = { bg: '#faf6f0', card: '#ffffff', ink: '#2b2620', muted: '#8a8075', pri: '#5a8a64', gold: '#c9a55c', good: '#4f8a5b', mid: '#b8862b', bad: '#c0563f' };
  const col = p => (p === null || p === undefined ? c.muted : p < 50 ? c.bad : p < 75 ? c.mid : c.good);
  const td = 'padding:6px 8px;border-bottom:1px solid #eee6da;font-size:14px;';
  const box = (title, inner) => `<div style="background:${c.card};border:1px solid #eee6da;border-radius:14px;padding:16px 18px;margin:0 0 14px"><h2 style="margin:0 0 10px;font-size:17px;color:${c.ink}">${title}</h2>${inner}</div>`;
  const tile = (v, l) => `<td style="background:#f7f2ea;border-radius:12px;padding:10px;text-align:center;width:25%"><div style="font-size:20px;font-weight:700;color:${c.ink}">${v}</div><div style="font-size:12px;color:${c.muted}">${l}</div></td>`;
  const subj = ['reading', 'maths', 'thinking'].map(sub => {
    const its = x.recentItems(sub); const acc = its.length ? pct(its.filter(i => i.correct).length, its.length) : null;
    const cs = [...CS_EXAMS].filter(e => e.subject === sub).pop(); const csP = cs ? pct(cs.score, cs.total) : null;
    return `<tr><td style="${td}">${SUBJECTS[sub].icon} ${name(sub)}</td><td style="${td}color:${col(csP)};font-weight:700">${csP ?? '–'}${csP !== null ? '%' : ''}</td><td style="${td}color:${col(acc)};font-weight:700">${acc ?? '–'}${acc !== null ? '%' : ''} <span style="color:${c.muted};font-weight:400">${its.length} Qs</span></td></tr>`;
  }).join('');
  const topicList = (list, empty) => list.length ? `<ul style="margin:0;padding-left:18px">${list.map(m => `<li style="margin:3px 0">${esc(m.topic)}: <b style="color:${col(m.app ?? m.cs)}">${m.app ?? m.cs}%</b>${m.app !== null && m.cs !== null ? ` <span style="color:${c.muted}">(CS ${m.cs}%)</span>` : ''}</li>`).join('')}</ul>` : `<p style="color:${c.muted};margin:0">${empty}</p>`;
  return `<!doctype html><html><body style="margin:0;background:${c.bg};font-family:Segoe UI,Helvetica,Arial,sans-serif;color:${c.ink}">
<div style="max-width:640px;margin:0 auto;padding:18px">
  <div style="background:linear-gradient(120deg,${c.gold},${c.pri});border-radius:16px;padding:18px 20px;color:#fff;margin-bottom:14px">
    <div style="font-size:13px;opacity:.9">👽🥔 Potalien Prep · weekly summary</div>
    <div style="font-size:22px;font-weight:700;margin-top:4px">${esc(x.s.nickname)}'s week</div>
    <div style="font-size:14px;margin-top:4px">${x.daysLeft} days to the exam · ${x.studyLeft} study days · ${x.phaseName} phase</div>
  </div>
  <table style="width:100%;border-spacing:6px;margin:0 -6px 8px"><tr>${tile(`${x.a0.done}/${x.a0.planned}`, 'planned days done')}${tile(x.s0.questions, 'questions this week')}${tile(`${x.s0.minutes}m`, 'time this week')}${tile(x.s0.acc === null ? '–' : x.s0.acc + '%', 'accuracy')}</tr></table>
  ${box('💡 Suggested actions', x.tips.length ? `<ul style="margin:0;padding-left:18px">${x.tips.map(t => `<li style="margin:5px 0;font-size:14px;line-height:1.5">${t}</li>`).join('')}</ul>` : '<p style="margin:0">All on track. Nothing to flag. 🎉</p>')}
  ${box('📅 This week vs last week', `<table style="width:100%;border-collapse:collapse"><tr><td style="${td}"></td><td style="${td}font-weight:700">This week</td><td style="${td}color:${c.muted}">Last week</td></tr>
    <tr><td style="${td}">Planned days done</td><td style="${td}">${x.a0.done}/${x.a0.planned}</td><td style="${td}">${x.a1.done}/${x.a1.planned}</td></tr>
    <tr><td style="${td}">Sessions</td><td style="${td}">${x.s0.sessions}</td><td style="${td}">${x.s1.sessions}</td></tr>
    <tr><td style="${td}">Questions</td><td style="${td}">${x.s0.questions}</td><td style="${td}">${x.s1.questions}</td></tr>
    <tr><td style="${td}">Time spent</td><td style="${td}">${x.s0.minutes} min</td><td style="${td}">${x.s1.minutes} min</td></tr>
    <tr><td style="${td}">Accuracy</td><td style="${td}">${x.s0.acc ?? '–'}${x.s0.acc !== null ? '%' : ''}</td><td style="${td}">${x.s1.acc ?? '–'}${x.s1.acc !== null ? '%' : ''}</td></tr></table>`)}
  ${box('📚 Subjects', `<table style="width:100%;border-collapse:collapse"><tr><td style="${td}"></td><td style="${td}font-weight:700">Latest CS exam</td><td style="${td}font-weight:700">App, last 6 weeks</td></tr>${subj}</table>`)}
  ${box('📈 CS trial tests (12 trials)', `<table style="width:100%;border-collapse:collapse"><tr><td style="${td}"></td><td style="${td}font-weight:700">First 6 avg</td><td style="${td}font-weight:700">Last 6 avg</td><td style="${td}font-weight:700">Latest</td></tr>${x.trials.subjects.map(t => `<tr><td style="${td}">${SUBJECTS[t.key].icon} ${name(t.key) === 'Writing' ? 'Writing' : name(t.key)}</td><td style="${td}">${t.early}%</td><td style="${td}color:${t.late - t.early <= -5 ? c.bad : t.late - t.early >= 5 ? c.good : c.ink};font-weight:700">${t.late}% ${t.late - t.early <= -5 ? '▼' : t.late - t.early >= 5 ? '▲' : ''}</td><td style="${td}">${t.latest}%</td></tr>`).join('')}</table><p style="margin:8px 0 0;font-size:13px;color:${c.muted}">Latest total ${x.trials.latest.total}% · rank ${x.trials.latest.rank}/${x.trials.latest.of} (ahead of ${x.trials.ahead(x.trials.latest)}% of students)</p>`)}
  ${box('🛠 Needs help', topicList(x.help.slice(0, 6), 'Nothing below 50%. 🎉'))}
  ${box('🌱 Improving', topicList(x.improving.slice(0, 6), 'Not enough practice yet.'))}
  ${x.blankRate !== null ? box('⏱ Exam habits', `<p style="margin:0;font-size:14px">Blank answers in timed tests: <b style="color:${x.blankRate > 3 ? c.bad : c.good}">${x.blankRate}%</b>${x.pace.map(p => ` · ${name(p.sub)} ${p.avg}s/question (real ≈ ${p.target}s)`).join('')}</p>`) : ''}
  <p style="text-align:center;margin:18px 0"><a href="${appUrl}#/parent" style="background:${c.pri};color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700">Open the full parent page</a></p>
  <p style="text-align:center;color:${c.muted};font-size:12px">Sent automatically every Sunday by the Potalien Prep app.</p>
</div></body></html>`;
}
