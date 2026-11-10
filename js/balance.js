// Spreads correct answers evenly across A–E so there is no "always pick C" pattern.
// Options are rotated (keeping their cyclic order). Questions whose explanation mentions
// option letters, whose options are themselves lettered (Extract A, gapped text), or that are marked
// fixedOrder (e.g. "X only / Y only / Both / Neither", which the real test always lists in that order), are left alone.

const LETTER_REF = /(^|[^\w'’])[A-E]([^\w'’]|$)/;
const lettered = opts => opts.some(o => /^(Extract [A-G]|[A-G]\.)/.test(o));

export function balance(questions) {
  if (!questions.length) return questions;
  const n = questions[0].opts.length;
  const counts = Array(n).fill(0);
  const fixed = [];
  const movable = [];
  for (const q of questions) {
    const canMove = q.opts.length === n && !LETTER_REF.test(q.exp.replace(/<[^>]+>/g, ' ')) && !lettered(q.opts) && !q.fixedOrder;
    if (canMove) movable.push(q); else { fixed.push(q); counts[q.a]++; }
  }
  const out = new Map(fixed.map(q => [q.id, q]));
  for (const q of movable) {
    const target = counts.indexOf(Math.min(...counts));
    const shift = (target - q.a + n) % n; // rotate right by shift
    const opts = q.opts.map((_, i) => q.opts[(i - shift + n) % n]);
    counts[target]++;
    out.set(q.id, { ...q, opts, a: target });
  }
  return questions.map(q => out.get(q.id));
}
