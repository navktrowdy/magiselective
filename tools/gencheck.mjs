// Stress-tests question generators: node tools/gencheck.mjs [seeds]
import { generate, generatorsFor } from '../js/gen/index.js';
const N = Number(process.argv[2] || 200);
let bad = 0;
for (const [subject, nOpts] of [['maths', 5], ['thinking', 4]]) {
  for (const g of generatorsFor(subject)) {
    const issues = new Map();
    const pos = [0, 0, 0, 0, 0];
    for (let s = 1; s <= N; s++) {
      let q;
      try { q = generate(subject, g.key, s); } catch (e) { issues.set('throw: ' + e.message, s); continue; }
      const txt = q.q + q.opts.join('|') + q.exp;
      if (/NaN|undefined|Infinity|\[object/.test(txt)) issues.set('bad text', s);
      if (new Set(q.opts).size !== q.opts.length) issues.set('dup opts ' + q.opts.join(' / '), s);
      if (q.opts.length < nOpts - (g.key === 'repeat' ? 1 : 0)) issues.set('few opts ' + q.opts.length, s);
      if (!(q.a >= 0 && q.a < q.opts.length)) issues.set('bad a', s);
      pos[q.a]++;
    }
    if (issues.size) { bad++; console.log(`✘ ${subject}/${g.key}:`, [...issues].slice(0, 4).map(([k, v]) => `${k} (seed ${v})`).join('; ')); }
    else console.log(`✔ ${subject}/${g.key}  answer spread ${pos.slice(0, nOpts).join('/')}`);
  }
}
process.exit(bad ? 1 : 0);
