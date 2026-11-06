// Registry for generated questions. ID format: g:<subject>:<key>:<seed>
import { rng } from './util.js';
import mathsGen from './mathsGen.js';
import thinkingGen from './thinkingGen.js';

export const SEEDS = 6; // versions of each generator that appear in the question pools
const GENS = { maths: mathsGen, thinking: thinkingGen };
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function generate(subject, key, seed) {
  const g = GENS[subject]?.find(x => x.key === key);
  if (!g) return null;
  const r = rng(seed * 7919 + hash(key));
  for (let i = 0; i < 60; i++) {
    const out = g.make.call(g, r);
    if (out && out.opts && out.a >= 0) return { id: `g:${subject}:${key}:${seed}`, topic: g.topic, diff: g.diff, generated: true, ...out };
  }
  throw new Error(`generator ${key} failed for seed ${seed}`);
}

export function fromId(id) {
  const [, subject, key, seed] = id.split(':');
  return generate(subject, key, Number(seed));
}

export function allGenerated(subject) {
  return (GENS[subject] || []).flatMap(g => Array.from({ length: SEEDS }, (_, i) => generate(subject, g.key, i + 1)));
}

export const generatorsFor = subject => GENS[subject] || [];
