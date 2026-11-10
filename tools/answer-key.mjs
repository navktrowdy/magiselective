// Independent answer key for the hand-written Maths questions.
// Each answer is RE-COMPUTED here (separately from the pack's maths.js) and compared with the marked option.
// Run: node tools/answer-key.mjs   (exits with an error if any answer disagrees)
import maths from '../js/packs/nsw-selective/content/maths.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const KEY = {
  m01: 4 * 1000 + 15 * 100 + 3 * 10 + 12,
  m02: 3079, // smallest 4-digit from 7,0,3,9: cannot start with 0 → 3,0,7,9
  m03: Math.round(47562 / 1000) * 1000,
  m04: 250 - 68.5 - 47.25,
  m05: Math.floor((384 + 358) / 10) % 10,
  m06: Math.ceil(350 / 12),
  m07: [126, 148, 162, 180, 198].filter(n => n % 4 === 0 && n % 9 === 0)[0],
  m08: 48 * 25,
  m09: 7 * 13 + 5,
  m10: ['3/5', '5/8', '2/3', '7/12', '4/7'].reduce((b, x) => (eval(x) > eval(b) ? x : b)),
  m11: (() => { const n = 12 - 3 - 4, d = 12; return `${n / gcd(n, d)}/${d / gcd(n, d)}`; })(),
  m12: (30 - 30 * 2 / 5) / 3,
  m13: (27 / 3 * 4) * 2 / 3,
  m14: '3 + 7/100',
  m15: Math.round(4.5 / 0.3),
  m16: 80 * 0.75,
  m17: (25 - 15) / 25 * 100,
  m18: 47 * 2 + 1,
  m19: 3 * 20 + 1,
  m20: 18 + 29,
  m21: ['▲', '●', '■', '■'][(50 - 1) % 4],
  m22: (26 + 4) / 3,
  m23: (() => { const m = { '2.3 km': 2300, '2030 m': 2030, '230 000 cm': 2300, '2 km 290 m': 2290, '2 400 000 mm': 2400 }; return Object.keys(m).reduce((b, k) => (m[k] > m[b] ? k : b)); })(),
  m24: 36 / 4 + 1,
  m25: (() => { const w = 30 / 2 / 3; return 2 * w * w; })(),
  m26: 2 * (8 + 6),
  m27: 8 * 6 - 4 * 3,
  m28: (2 * (9 + 5) / 4) ** 2,
  m29: 12 * 7 / 2,
  m30: (600 / 50) * (400 / 50),
  m31: 10 * 6 * 5,
  m32: 3 * 1500 / 250,
  m33: 50 * 40 * 30 / 2 / 1000,
  m34: (() => { const t = 19 * 60 + 45 + 2 * 60 + 35; return `${Math.floor(t / 60) - 12}:${String(t % 60).padStart(2, '0')} pm`; })(),
  m35: (() => { const d = (17 * 60 + 15) - (14 * 60 + 50); return `${Math.floor(d / 60)} h ${d % 60} min`; })(),
  m36: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][(0 + 31) % 7],
  m37: 4 * 30,
  m38: 180 - 47,
  m39: 180 - 65 - 48,
  m40: `${(180 - 40) / 2}° and ${(180 - 40) / 2}°`,
  m41: ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'][135 / 45],
  m42: 360 - 110 - 85 - 90,
  m43: [90, 179, 180, 210, 360].filter(a => a > 180 && a < 360)[0],
  m44: Math.abs(2 * 30 + 30 * 0.5 - 30 * 6),
  m45: 6,
  m46: 'Trapezium',
  m47: 5 * (5 - 3) / 2,
  m48: 'Rhombus',
  m49: `(${2 + 4}, −${-(3 - 5)})`,
  m50: 'N',
  m51: '8 edges, 5 faces, 5 vertices',
  m52: 12 * (3 - 2),
  m53: (7 - 1) + (7 - 2) + (7 - 3),
  m54: 8 * 5 - (6 + 9 + 7 + 10),
  m55: [4, 7, 7, 9, 3, 7, 5].sort((a, b) => a - b)[3],
  m56: (() => { const n = 3 + 2, d = 10; return `${n / gcd(n, d)}/${d / gcd(n, d)}`; })(),
  m57: (() => { const out = ['HH', 'HT', 'TH', 'TT'].filter(o => o.split('').filter(c => c === 'H').length === 1).length; return `${out / gcd(out, 4)}/${4 / gcd(out, 4)}`; })(),
  m58: (() => { const n = [1, 2, 3, 4, 5, 6, 7, 8].filter(x => x > 5 && x % 2 === 0).length; return `${n / gcd(n, 8)}/${8 / gcd(n, 8)}`; })(),
  m59: (56 - 20 * 2) / 2,
  m60: (() => { for (let b = 1; b < 50; b++) if (3 * b + 5 === 2 * (b + 5)) return 3 * b; })(),
  m61: (20 + 4) / 2,
  m62: Array.from({ length: 100 }, (_, i) => i + 1).filter(n => String(n).includes('7')).length,
  m63: 1 / (1 / 6 + 1 / 3),
  m64: 18 / 3 * 2,
  m65: (() => { let pos = 0, steps = 0; for (;;) { for (let i = 0; i < 5; i++) { pos++; steps++; if (pos === 20) return steps; } for (let i = 0; i < 3; i++) { pos--; steps++; } } })(),
  m66: [[12, 8], [15, 10], [9, 14], [18, 7], [21, 11]].filter(([p, s]) => p - s > 5).length,
  m67: 14 / (8 + 10 + 14 + 7 + 11) * 100,
  m68: '9:24',
  m69: (() => { const d = [[8 * 60 + 5, 8 * 60 + 50], [8 * 60 + 40, 9 * 60 + 24], [9 * 60 + 20, 10 * 60 + 2]].map(([a, b]) => b - a); return `Bus ${d.indexOf(Math.max(...d)) + 1}`; })(),
  m70: (40 - 14 - 8 - 6) * 360 / 40,
  m71: (1250 + 750) / 1000,
  m72: 1200 / 8,
  m73: (2700 - 300) / 6,
};

const num = s => parseFloat(String(s).replace(/[$,°%]/g, '').replace(/(\d) (\d)/g, '$1$2').replace(/[^\d.\-]/g, ' ').trim().split(' ')[0]);
let bad = 0, checked = 0;
for (const q of maths) {
  if (!(q.id in KEY)) { console.log(`✘ ${q.id}: no independent answer in the key — add one`); bad++; continue; }
  const want = KEY[q.id], got = q.opts[q.a]; checked++;
  const ok = typeof want === 'number' ? Math.abs(num(got) - want) < 1e-9 : String(want).replace(/−/g, '-') === String(got).replace(/−/g, '-');
  if (!ok) { console.log(`✘ ${q.id}: answer key says ${want}, question marks "${got}"`); bad++; }
}
console.log(bad ? `\n${bad} problem(s) in the Maths answer key check` : `✔ Maths answer key: all ${checked} hand-written answers independently confirmed`);
process.exit(bad ? 1 : 0);
