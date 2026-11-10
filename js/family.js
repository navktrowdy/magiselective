// THIS FAMILY'S DATA: external test results, weekly routine and planned breaks.
// It is loaded at runtime from data/family.json, so none of it lives in the app code or in an exam pack.
// With no file (a brand-new family) the app works with sensible empty defaults.
// Later this file is replaced by per-account data from a backend; nothing else needs to change.
const DEFAULT_ROUTINE = {
  Mon: { icon: '🏠', busy: 'School night', mins: 25 }, Tue: { icon: '🏠', busy: 'School night', mins: 25 },
  Wed: { icon: '🏠', busy: 'School night', mins: 25 }, Thu: { icon: '🏠', busy: 'School night', mins: 25 },
  Fri: { icon: '🌙', busy: 'Rest', mins: 0 }, Sat: { icon: '🌤️', busy: 'Weekend', mins: 30 }, Sun: { icon: '🌤️', busy: 'Weekend', mins: 45 },
};

async function load() {
  try {
    const url = new URL('../data/family.json', import.meta.url);
    if (url.protocol === 'file:') { const { readFileSync } = await import('node:fs'); return JSON.parse(readFileSync(url, 'utf8')); }
    const res = await fetch(url, { cache: 'no-cache' });
    return res.ok ? await res.json() : {};
  } catch { return {}; }
}
const data = await load();

export const HAS_FAMILY_FILE = Object.keys(data).length > 0;
export const SYNC_DEFAULTS = data.sync || null;
export const ROUTINE = data.routine || DEFAULT_ROUTINE;
export const BREAKS = (data.breaks || []).map(b => ({ ...b, builtIn: true }));
export const EXTERNAL_TESTS = data.externalTests || [];
export const TRIALS = data.trials || [];
export const WRITING_RECURRING = data.writingRecurring || [];
export const PLAN_NOTE = data.planNote || 'Fits around school and activities. Skip a day if homework is heavy; your Potalien will understand 💛';
export const REST_NOTE = data.restNote || 'No app today. Enjoy the rest! 💪';
export const BREAK_NAME = data.breakNameSuggestion || 'Holiday';
export const WEEKLY_MINUTES = Object.values(ROUTINE).reduce((a, d) => a + (d.mins || 0), 0);

// Summary per subject used across the app: latest external test + all external topic counts combined.
export const BASELINE = (() => {
  const out = {};
  const sorted = [...EXTERNAL_TESTS].sort((a, b) => a.date.localeCompare(b.date));
  for (const e of sorted) {
    const prev = out[e.subject] || { topics: {} };
    const topics = { ...prev.topics };
    for (const [t, [c, n]] of Object.entries(e.topics || {})) { const x = topics[t] || [0, 0]; topics[t] = [x[0] + c, x[1] + n]; }
    out[e.subject] = { score: Math.round((e.score / e.total) * 10000) / 100, cohortAverage: e.avg, strands: e.strands || {}, topics, date: e.date, name: e.name, rank: e.rank, rankOf: e.rankOf };
  }
  return out;
})();

/** Trend facts from the trial history (null when there is none), used by the Exams page, Parent page and email. */
export function trialTrends(trials = TRIALS) {
  if (!trials.length) return null;
  const avg = (arr, k) => Math.round(arr.reduce((a, t) => a + t[k], 0) / arr.length);
  const half = Math.floor(trials.length / 2);
  const early = trials.slice(0, half), late = trials.slice(half), last3 = trials.slice(-3);
  const subjects = ['maths', 'thinking', 'reading', 'writing'].map(k => ({
    key: k, early: avg(early, k), late: avg(late, k), last3: avg(last3, k),
    best: Math.max(...trials.map(t => t[k])), bestAt: trials.find(t => t[k] === Math.max(...trials.map(x => x[k]))).tests,
    latest: trials[trials.length - 1][k],
  }));
  const ahead = t => Math.round((1 - t.rank / t.of) * 100);
  return { subjects, ahead, latest: trials[trials.length - 1], best: trials.reduce((m, t) => (t.total > m.total ? t : m)), aheadAvg: Math.round(trials.reduce((a, t) => a + ahead(t), 0) / trials.length) };
}
