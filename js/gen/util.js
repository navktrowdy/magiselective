// Seeded random helpers for question generators.
// Every generated question is fully determined by (generator key, seed), so it can be
// re-created exactly for reviews, mistake re-tries and other devices.

export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export function shuffle(r, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function sample(r, arr, n) { return shuffle(r, arr).slice(0, n); }

/**
 * Build n unique options: the correct answer plus distractors (common mistakes first),
 * topped up with nearby values if needed. Returns { opts, a }.
 * fmt turns a raw value into display text; values are compared by their formatted text.
 */
export function options(r, correct, distractors, n, fmt = String, filler) {
  const seen = new Set([fmt(correct)]);
  const list = [];
  for (const d of distractors) {
    const t = fmt(d);
    if (d === undefined || d === null || Number.isNaN(d) || seen.has(t)) continue;
    if (typeof d === 'number' && d < 0) continue;
    seen.add(t); list.push(t);
    if (list.length === n - 1) break;
  }
  let k = 1;
  while (list.length < n - 1) {
    if (!filler && typeof correct !== 'number') return { opts: null, a: -1 }; // not enough distractors: generator retries
    const cand = filler ? filler(k) : correct + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Number.isInteger(correct) ? 1 : 0.5);
    k++;
    const t = fmt(cand);
    if (seen.has(t) || (typeof cand === 'number' && cand < 0)) continue;
    seen.add(t); list.push(t);
    if (k > 200) break;
  }
  const opts = shuffle(r, [fmt(correct), ...list]);
  return { opts, a: opts.indexOf(fmt(correct)) };
}

/**
 * Numeric options in ascending order (as real papers show them), with the correct answer placed at a
 * RANDOM position so there is no "it's always B" pattern. Common-mistake distractors are used first;
 * nearby values fill the rest (step = a sensible gap, e.g. 5 or 10 for angles).
 */
export function sortedOptions(r, correct, distractors, n, fmt = String) {
  const val = x => parseFloat(String(fmt(x)).replace(/[^0-9.\-]/g, ''));
  const cv = val(correct);
  if (Number.isNaN(cv)) { const o = options(r, correct, distractors, n, fmt); return o; }
  const seen = new Set([fmt(correct)]);
  const ok = d => d !== undefined && d !== null && !Number.isNaN(d) && !(typeof d === 'number' && d < 0) && !seen.has(fmt(d));
  const lows = [], highs = [];
  for (const d of distractors) if (ok(d)) { seen.add(fmt(d)); (val(d) < cv ? lows : highs).push(d); }
  const step = Number.isInteger(cv) ? (cv >= 100 ? 10 : cv >= 20 ? 5 : 1) : 0.5;
  let want = Math.floor(r() * n); // index of the correct answer
  const fill = (arr, dir) => { for (let k = 1; arr.length < n - 1 && k < 60; k++) { const c = Math.round((cv + dir * k * step) * 100) / 100; if (c >= 0 && ok(c)) { seen.add(fmt(c)); arr.push(c); } } };
  if (lows.length < want) fill(lows, -1);
  want = Math.min(want, lows.length);
  if (highs.length < n - 1 - want) fill(highs, 1);
  if (highs.length < n - 1 - want) want = Math.min(lows.length, n - 1 - highs.length);
  const pickL = [...lows].sort((a, b) => val(b) - val(a)).slice(0, want);
  const pickH = [...highs].sort((a, b) => val(a) - val(b)).slice(0, n - 1 - want);
  const all = [...pickL, correct, ...pickH].sort((a, b) => val(a) - val(b)).map(fmt);
  if (all.length < n) return { opts: null, a: -1 };
  return { opts: all, a: all.indexOf(fmt(correct)) };
}

export const money = v => `$${v.toFixed(2)}`;
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export const lcm = (a, b) => (a * b) / gcd(a, b);
export const NAMES = ['Ava', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hari', 'Isla', 'Jai', 'Kiara', 'Leo', 'Maya', 'Noah', 'Olivia', 'Priya', 'Ravi', 'Sofia', 'Tom', 'Zara', 'Arjun', 'Mei', 'Lucas', 'Anika'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const fmtClock = (mins) => { mins = ((mins % 1440) + 1440) % 1440; const h = Math.floor(mins / 60), m = mins % 60; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
export const fmt24 = (mins) => { mins = ((mins % 1440) + 1440) % 1440; return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`; };
export const fmtDur = (mins) => { const h = Math.floor(mins / 60), m = mins % 60; return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`; };
export const ordinal = n => `${n}${(n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th')}`;
export const dollars = x => (Number.isInteger(x) ? `$${x}` : `$${x.toFixed(2)}`);
