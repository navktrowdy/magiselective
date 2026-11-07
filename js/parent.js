// Parent summary: progress, habits, trends and suggested actions on one printable page.
import { SUBJECTS, BASELINE, CS_EXAMS, ROUTINE } from './data/config.js';
import { RUBRIC, RUBRIC_TOTAL } from './data/writing.js';
import * as store from './store.js';
import { topicMastery, topicsFor, mistakesCount } from './bank.js';
import { computeProgress } from './pet.js';
import { isBreakDay, breakOn, studyDaysUntil, addDays, daysBetween, today, nextBreak, fmtShort } from './breaks.js';
import { esc, pct, fmtDate, toast } from './util.js';

import { computeSummary, name, lvl } from './summary.js';
import { trialCard } from './views.js';

const $app = () => document.getElementById('app');

export function parentView() {
  const { s, prof, all, drills, t, byDay, pr, daysLeft, studyLeft, last, s0, s1, a0, a1, row, cells, subjRows, recentItems, improving, help, untried, moverRow, timed, blankRate, pace, timeUps, csBlanks, blankText, csW, appW, wAvg, tips, summaryText, phaseName, stats } = computeSummary();
  $app().innerHTML = `
    <div class="parent">
    <div class="card ps-head">
      <div><h1>👪 Parent summary: ${esc(s.nickname)}</h1>
        <p class="muted">Generated ${fmtShort(t)} · last practice ${last ? fmtDate(last.finishedAt) : 'not yet'} · ${store.syncConfigured() ? '✅ backed up to GitHub' : '⚠️ saved on this device only'}</p></div>
      <div class="btns noprint"><button class="btn" id="email">📧 Email us</button><button class="btn" id="copy">📋 Copy for tutor</button><button class="btn primary" id="print">🖨 Print</button></div>
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
        <p class="muted">The plan targets about 2¼ hours a week. Tuition days and holidays don't count as planned days.</p></div>
      <div class="card"><h2>🗓 Last 8 weeks</h2>
        <div class="heat"><div class="hmlabels">${['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map(x => `<span>${x}</span>`).join('')}</div>${cells}</div>
        <div class="legend hmlegend"><span><i class="l3"></i>30+ min</span><span><i class="l2"></i>15–30</span><span><i class="l1"></i>&lt;15</span><span><i class="miss"></i>planned, missed</span><span><i class="rest"></i>rest/tuition day</span><span><i class="brk"></i>holiday</span></div></div>
    </div>

    <div class="card"><h2>📚 Subjects</h2>
      <table class="tbl"><thead><tr><th>Subject</th><th>Latest external test</th><th>App accuracy (4 weeks)</th><th>Last full app test</th><th>Mistakes to fix</th></tr></thead><tbody>${subjRows}
      <tr><td>✍️ <b>Writing</b></td><td>${csW ? `<span class="pct ${lvl(pct(csW.score, csW.total))}">${csW.score}/${csW.total}</span> <span class="muted">(rank ${csW.rank}/${csW.rankOf})</span>` : '–'}</td>
        <td colspan="2">${appW.length ? `${appW.length} task${appW.length > 1 ? 's' : ''}, latest self-mark ${appW[appW.length - 1].score}/${RUBRIC_TOTAL}` : '<span class="muted">no app writing yet</span>'}</td><td>–</td></tr></tbody></table>
      <p class="muted">▲/▼ compare the last 4 weeks with the 4 weeks before (5+ points).</p></div>

    <div class="two">
      <div class="card"><h2>🛠 Needs help</h2><p class="muted">Below 50%: app practice in the last 6 weeks (4+ questions), otherwise external tests.</p>
        ${help.length ? `<table class="tbl"><thead><tr><th>Topic</th><th>External tests</th><th>App (6 weeks)</th></tr></thead><tbody>${help.map(moverRow).join('')}</tbody></table>` : '<p>Nothing below 50%. 🎉</p>'}</div>
      <div class="card"><h2>🌱 Improving</h2><p class="muted">Now at 50%+ in the app and 15+ points above the external tests.</p>
        ${improving.length ? `<table class="tbl"><thead><tr><th>Topic</th><th>External tests</th><th>App (6 weeks)</th></tr></thead><tbody>${improving.map(moverRow).join('')}</tbody></table>` : '<p class="muted">Not enough practice yet. This fills in as she practises.</p>'}</div>
    </div>

    <div class="two">
      <div class="card"><h2>⏱ Exam habits (timed tests)</h2>
        <table class="tbl"><tbody>
          <tr><td>Timed tests done in app</td><td><b>${timed.length}</b> (${timed.filter(r => r.mode === 'mock').length} full, ${timed.filter(r => r.mode === 'mini').length} mini)</td></tr>
          <tr><td>Blank answers</td><td>${blankRate === null ? '<span class="muted">no timed tests yet</span>' : `<b class="${blankRate > 3 ? 'warn' : 'ok'}">${blankRate}%</b>`} <span class="muted">· external tests: ${blankText}</span></td></tr>
          ${pace.map(p => `<tr><td>${name(p.sub)} pace</td><td><b class="${p.avg > p.target * 1.2 ? 'warn' : 'ok'}">${p.avg}s</b> per question <span class="muted">(real test ≈ ${p.target}s)</span></td></tr>`).join('')}
          <tr><td>Ran out of time</td><td>${timeUps} test${timeUps === 1 ? '' : 's'}</td></tr>
          <tr><td>Past mistakes fixed</td><td>${pr.fixes}</td></tr>
        </tbody></table></div>
      <div class="card"><h2>✍️ Writing criteria</h2>
        <table class="tbl"><thead><tr><th>Criterion</th><th>Test No. 24</th><th>App avg (self-mark)</th></tr></thead><tbody>
          ${RUBRIC.map(c => `<tr><td>${esc(c.name)}</td><td>${csW ? `${csW.rubric[c.key]}/${c.max}` : '–'}</td><td>${wAvg(c.key) === null ? '<span class="muted">–</span>' : `${wAvg(c.key)}/${c.max}`}</td></tr>`).join('')}
        </tbody></table>
        <p class="muted">Self-marks can be generous. Marking one piece together each fortnight keeps them honest.</p></div>
    </div>

    ${trialCard()}
    <div class="card"><h2>🏆 External test history</h2>
      <table class="tbl"><thead><tr><th>Date</th><th>Exam</th><th>Subject</th><th>Score</th><th>Class avg</th><th>Rank</th></tr></thead><tbody>
      ${[...CS_EXAMS, ...all.filter(r => r.mode === 'exam').map(r => ({ date: localDay(r.finishedAt), name: r.topicLabel, subject: r.subject, score: r.score, total: r.total, avg: r.avg, rank: r.rank, rankOf: r.rankOf }))]
        .sort((a, b) => b.date.localeCompare(a.date)).map(e => `<tr><td>${fmtShort(e.date)}</td><td>${esc(e.name)}</td><td>${SUBJECTS[e.subject].icon} ${name(e.subject)}</td>
        <td><b>${e.score}/${e.total}</b> <span class="pct ${lvl(pct(e.score, e.total))}">${pct(e.score, e.total)}%</span></td><td>${e.avg ? Math.round(e.avg) + '%' : '–'}</td><td>${e.rank ? `${e.rank}/${e.rankOf}` : '–'}</td></tr>`).join('')}
      </tbody></table><p class="muted noprint">Add new external test results on the <a href="#/exams">Exams</a> page.</p></div>
    </div>`;

  document.getElementById('print').onclick = () => window.print();
  document.getElementById('email').onclick = () => {
    const to = (store.getSettings().parentEmails || '').trim();
    if (!to) { toast('Add your email addresses in ⚙️ Settings → Parent emails first.', 'warn'); location.hash = '#/settings'; return; }
    const subject = `${s.nickname}'s Selective prep summary – ${fmtShort(t)}`;
    const body = `${summaryText()}\n\nSuggested actions:\n${tips.map(x => '• ' + x.replace(/<[^>]+>/g, '')).join('\n')}\n\nFull page: ${location.origin}${location.pathname}#/parent`;
    location.href = `mailto:${encodeURIComponent(to).replace(/%2C/g, ',').replace(/%40/g, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  document.getElementById('copy').onclick = async () => {
    try { await navigator.clipboard.writeText(summaryText()); toast('Summary copied. Paste it into a message to the tutor 📋', 'ok'); }
    catch { prompt('Copy this summary:', summaryText()); }
  };
}
