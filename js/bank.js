// Question bank access, test assembly and progress analytics.

import { PACK, SUBJECTS, TOPIC_STRANDS, BANKS, WRITING_TASKS } from './pack.js';
import { BASELINE } from './family.js';
import { getResults, getProfile, saveProfile } from './store.js';
import { balance } from './balance.js';
import { allGenerated, fromId } from './gen/index.js';

const { maths, thinking, reading } = BANKS;
const writing = WRITING_TASKS;
const LETTERS = 'ABCDEFG';
export const letter = i => (i === null || i === undefined ? '–' : LETTERS[i]);

// ---------- reported questions ----------
// A question reported as wrong is kept out of every future test until a parent marks it fixed.
// For a generated question the whole generator is paused (a bug would affect every version).
const reportKey = id => (id.startsWith('g:') ? id.split(':').slice(0, 3).join(':') : id);
export const getReported = () => (getProfile()?.reported || []);
export const isReported = id => getReported().some(r => r.key === reportKey(id));
export async function reportQuestion(id, note = '') {
  const p = getProfile() || {};
  p.reported = (p.reported || []).filter(r => r.key !== reportKey(id));
  p.reported.push({ key: reportKey(id), id, note: String(note).slice(0, 300), at: new Date().toISOString() });
  await saveProfile(p);
}
export async function unreportQuestion(key) {
  const p = getProfile(); if (!p) return;
  p.reported = (p.reported || []).filter(r => r.key !== key);
  await saveProfile(p);
}

// ---------- flatten banks ----------
const index = new Map();
const banks = { maths: [], thinking: [], reading: [] };

for (const q of balance(maths)) { const x = { ...q, subject: 'maths', strand: TOPIC_STRANDS.maths[q.topic] }; banks.maths.push(x); index.set(q.id, x); }
for (const q of balance(thinking)) { const x = { ...q, subject: 'thinking', strand: TOPIC_STRANDS.thinking[q.topic] }; banks.thinking.push(x); index.set(q.id, x); }
// Generated questions (fresh numbers each version; answers computed in code)
for (const subject of ['maths', 'thinking']) {
  for (const q of allGenerated(subject)) { const x = { ...q, subject, strand: TOPIC_STRANDS[subject][q.topic] }; banks[subject].push(x); index.set(q.id, x); }
}
for (const p of reading) {
  p.questions = balance(p.questions);
  for (const q of p.questions) {
    const x = { ...q, subject: 'reading', strand: p.type, passageId: p.id };
    banks.reading.push(x); index.set(q.id, x);
  }
}
export const passages = new Map(reading.map(p => [p.id, p]));
export const writingTasks = writing;
export const getQuestion = id => {
  if (index.has(id)) return index.get(id);
  if (id.startsWith('g:')) { // a generated version outside the current pool (e.g. from an older app version)
    try { const q = fromId(id); const subject = id.split(':')[1]; const x = { ...q, subject, strand: TOPIC_STRANDS[subject][q.topic] }; index.set(id, x); return x; } catch { return null; }
  }
  return null;
};
export const bankFor = subject => banks[subject] || [];
export const topicsFor = subject => [...new Set(bankFor(subject).map(q => q.topic))];

// ---------- helpers ----------
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** How many times each question has been seen, and the last outcome for each. */
export function questionHistory() {
  const seen = new Map(); const last = new Map();
  for (const r of getResults()) {
    for (const it of r.items || []) {
      seen.set(it.qid, (seen.get(it.qid) || 0) + 1);
      last.set(it.qid, it.correct);
    }
  }
  return { seen, last };
}

const leastSeenFirst = (qs, seen) => shuffle(qs).sort((a, b) => (seen.get(a.id) || 0) - (seen.get(b.id) || 0));

/** Pick n questions covering every strand, spread across topics, preferring unseen ones. */
function stratifiedPick(pool, n, seen) {
  if (pool.length <= n) return leastSeenFirst(pool, seen);
  const byStrand = new Map();
  for (const q of pool) { if (!byStrand.has(q.strand)) byStrand.set(q.strand, []); byStrand.get(q.strand).push(q); }
  const strands = [...byStrand.keys()];
  // Allocate: at least one per strand, the rest proportional to strand size.
  const alloc = new Map(strands.map(s => [s, 1]));
  let left = n - strands.length;
  const weights = strands.map(s => byStrand.get(s).length);
  const totalW = weights.reduce((a, b) => a + b, 0);
  strands.forEach((s, i) => { const extra = Math.floor((weights[i] / totalW) * left); alloc.set(s, alloc.get(s) + extra); });
  left = n - [...alloc.values()].reduce((a, b) => a + b, 0);
  for (const s of shuffle(strands)) { if (left <= 0) break; if (alloc.get(s) < byStrand.get(s).length) { alloc.set(s, alloc.get(s) + 1); left--; } }

  const picked = [];
  for (const s of strands) {
    // round-robin across topics inside the strand
    const byTopic = new Map();
    for (const q of leastSeenFirst(byStrand.get(s), seen)) { if (!byTopic.has(q.topic)) byTopic.set(q.topic, []); byTopic.get(q.topic).push(q); }
    const queues = shuffle([...byTopic.values()]);
    let need = Math.min(alloc.get(s), byStrand.get(s).length);
    while (need > 0) {
      for (const qu of queues) { if (need > 0 && qu.length) { picked.push(qu.shift()); need--; } }
    }
  }
  return picked;
}

/** Order like a real paper: broadly easier → harder, shuffled within each difficulty. */
const examOrder = qs => [1, 2, 3].flatMap(d => shuffle(qs.filter(q => (q.diff || 2) === d)));

/** Build the list of question ids for a test. */
export function buildTest(subject, mode, opts = {}) {
  const { seen, last } = questionHistory();
  if (subject === 'reading') return buildReading(mode, opts, seen).filter(id => !isReported(id));

  let pool = bankFor(subject).filter(q => !isReported(q.id));
  if (mode === 'practice') {
    const count = opts.count || 10;
    if (opts.topic === 'mistakes') {
      pool = pool.filter(q => last.get(q.id) === false);
      return shuffle(pool).slice(0, count).map(q => q.id);
    }
    if (opts.topic === 'focus') {
      const weak = weakTopics(subject, 4).map(t => t.topic);
      const focusPool = pool.filter(q => weak.includes(q.topic));
      return stratifiedPickTopics(focusPool, count, seen).map(q => q.id);
    }
    if (opts.topic && opts.topic !== 'all') {
      return leastSeenFirst(pool.filter(q => q.topic === opts.topic), seen).slice(0, count).map(q => q.id);
    }
    return examOrder(stratifiedPick(pool, count, seen)).map(q => q.id);
  }
  const n = SUBJECTS[subject][mode].questions;
  return examOrder(stratifiedPick(pool, n, seen)).map(q => q.id);
}

function stratifiedPickTopics(pool, n, seen) {
  const byTopic = new Map();
  for (const q of leastSeenFirst(pool, seen)) { if (!byTopic.has(q.topic)) byTopic.set(q.topic, []); byTopic.get(q.topic).push(q); }
  const queues = [...byTopic.values()]; const out = [];
  while (out.length < n && queues.some(q => q.length)) for (const qu of queues) if (out.length < n && qu.length) out.push(qu.shift());
  return shuffle(out);
}

// A full reading test = single questions on passages + one of each multi-part set (defined by the exam pack).
export const MULTI_PART = PACK.reading.multiPartTypes;
const PASSAGE_QS = PACK.reading.passageQuestions;

function buildReading(mode, opts, seen) {
  const all = [...passages.values()];
  const pSeen = p => p.questions.reduce((s, q) => s + (seen.get(q.id) || 0), 0) / p.questions.length;
  const ordered = shuffle(all).sort((a, b) => pSeen(a) - pSeen(b));
  const std = ordered.filter(p => !MULTI_PART.includes(p.type));
  const multi = ordered.filter(p => MULTI_PART.includes(p.type));
  const ids = ps => ps.flatMap(p => p.questions.map(q => q.id));

  if (mode === 'practice' && opts.topic === 'mistakes') {
    const { last } = questionHistory();
    return banks.reading.filter(q => last.get(q.id) === false).map(q => q.id);
  }
  if (mode === 'practice' && opts.topic && !['all', 'focus'].includes(opts.topic)) {
    const ps = ordered.filter(p => p.type === opts.topic);
    return ids(ps.slice(0, ps[0]?.questions.length < 5 ? 2 : 1));
  }
  if (mode === 'practice' || mode === 'mini') {
    // one passage + one multi-part set (least seen first)
    return ids([std[0], multi[0]].filter(Boolean));
  }
  // full mock: the passage questions, then one of each multi-part set
  const out = []; const types = new Set();
  for (const p of std) {
    if (out.length >= PASSAGE_QS) break;
    if (types.has(p.type) && std.some(x => !types.has(x.type) && !out.includes(x.questions[0].id))) continue;
    types.add(p.type);
    out.push(...p.questions.slice(0, PASSAGE_QS - out.length).map(q => q.id));
  }
  for (const t of MULTI_PART) { const p = multi.find(x => x.type === t); if (p) out.push(...p.questions.map(q => q.id)); }
  return out;
}

// ---------- scoring & analytics ----------
export function scoreItems(items) {
  const byStrand = {}; const byTopic = {};
  for (const it of items) {
    for (const [map, key] of [[byStrand, it.strand], [byTopic, it.topic]]) {
      map[key] = map[key] || { correct: 0, total: 0 };
      map[key].total++; if (it.correct) map[key].correct++;
    }
  }
  return { score: items.filter(i => i.correct).length, total: items.length, byStrand, byTopic };
}

/** Accuracy per topic across all saved attempts (+ the external test baseline as a starting point). */
export function topicMastery(subject) {
  const m = {};
  const base = BASELINE[subject]?.topics || {};
  for (const [t, [c, n]] of Object.entries(base)) m[t] = { correct: c, total: n, baseline: true };
  for (const r of getResults()) {
    if (r.subject !== subject) continue;
    for (const it of r.items || []) {
      const x = m[it.topic] || (m[it.topic] = { correct: 0, total: 0 });
      x.total++; if (it.correct) x.correct++; x.baseline = false;
    }
  }
  for (const t of topicsFor(subject)) if (!m[t]) m[t] = { correct: 0, total: 0 };
  return Object.entries(m)
    .filter(([t]) => topicsFor(subject).includes(t))
    .map(([topic, v]) => ({ topic, ...v, pct: v.total ? Math.round((v.correct / v.total) * 100) : null }));
}

export function weakTopics(subject, n = 3) {
  const all = topicMastery(subject);
  const tried = all.filter(t => t.pct !== null).sort((a, b) => a.pct - b.pct || b.total - a.total); // ties: more evidence first
  const untried = all.filter(t => t.pct === null);
  return [...tried.filter(t => t.pct < 80), ...untried, ...tried.filter(t => t.pct >= 80)].slice(0, n);
}

export function mistakesCount(subject) {
  const { last } = questionHistory();
  return bankFor(subject).filter(q => last.get(q.id) === false).length;
}
