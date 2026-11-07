// Independent answer checker: re-solves every generated question from what the student sees.
// Run: node tools/audit-generators.mjs [versions per type, default 200]
const { generate, generatorsFor } = await import('../js/gen/index.js');
const N = Number(process.argv[2] || 200);
const txt = h => h.replace(/<\/?(b|i|u|small)>/g, '').replace(/<text[^>]*>(.*?)<\/text>/g, ' [$1] ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const labels = h => [...h.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(m => m[1]);
const degs = h => labels(h).filter(l => /^\d+°$/.test(l)).map(l => parseInt(l));
const num = s => parseFloat(String(s).replace(/[$,°]/g, '').replace(/(\d) (\d)/g, '$1$2').replace(/[^\d.\-]/g, ' ').trim().split(' ')[0]);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const gcd = (a, b) => (b ? gcd(b, a % b) : a); const frac = (n, d) => (n === 0 ? '0' : `${n / gcd(n, d)}/${d / gcd(n, d)}`);
const clock = s => { const m = s.match(/(\d+):(\d+)\s*(am|pm)?/); let h = +m[1] % 12; if (m[3] === 'pm') h += 12; if (!m[3]) h = +m[1]; return h * 60 + +m[2]; };
const dur = s => { const h = s.match(/(\d+) h/), m = s.match(/(\d+) min/); return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0); };
const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const rows = h => [...h.matchAll(/<tr>(.*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<t[dh]>(.*?)<\/t[dh]>/g)].map(c => c[1]));

// Each solver returns the expected answer (number or string) or undefined if it can't parse.
const S = {
  pv: q => { const m = q.match(/(\d+) thousands, (\d+) hundreds, (\d+) tens and (\d+) ones/); return +m[1] * 1000 + +m[2] * 100 + +m[3] * 10 + +m[4]; },
  round: q => { const m = q.match(/Round ([\d ]+) to the nearest (ten|hundred|thousand)/); const n = +m[1].replace(/ /g, ''), p = { ten: 10, hundred: 100, thousand: 1000 }[m[2]]; return Math.round(n / p) * p; },
  missdig: q => { const m = q.match(/(\d)□(\d) − (\d+) = (\d+)/); return Math.floor((+m[3] + +m[4]) / 10) % 10; },
  change: q => { const m = q.match(/had \$([\d.]+)\..*?spent \$([\d.]+) on a book and \$([\d.]+)/); return Math.round((+m[1] - +m[2] - +m[3]) * 100) / 100; },
  boxes: q => { const m = q.match(/holds (\d+) \w+\..*?for (\d+) /); return Math.ceil(+m[2] / +m[1]); },
  remrev: q => { const m = q.match(/divided by (\d+), the answer is (\d+) remainder (\d+)/); return +m[1] * +m[2] + +m[3]; },
  fracrem: q => { const m = q.match(/There are (\d+) students\. (\d+)\/(\d+) of them.*?(\d+)\/(\d+) of the remaining/); const t = +m[1], f = t * +m[2] / +m[3]; return (t - f) * +m[4] / +m[5]; },
  fracwhole: q => { const m = q.match(/(\d+)\/(\d+) of a number is (\d+)\. What is (\d+)\/(\d+)/); const w = +m[3] / +m[1] * +m[2]; return w / +m[5] * +m[4]; },
  fraccmp: (q, o) => o.reduce((b, x) => (eval(x) > eval(b) ? x : b)),
  decdiv: q => { const m = q.match(/ribbon ([\d.]+) m long.*?each ([\d.]+) m/); return Math.round(+m[1] / +m[2]); },
  discount: q => { const m = q.match(/costs \$(\d+)\. It is on sale for (\d+)% off/); return +m[1] * (100 - +m[2]) / 100; },
  pctgroup: q => { const m = q.match(/club of (\d+) children, (\d+) are girls/); return (+m[1] - +m[2]) * 100 / +m[1]; },
  seq: q => { const a = q.match(/next\? ([\d, ]+), …/)[1].split(',').map(Number); const n = a.length; const c = [];
    if (a.every((x, i) => i === 0 || x === a[i - 1] * 2 + 1)) c.push(a[n - 1] * 2 + 1);
    if (a.every((x, i) => i < 2 || x === a[i - 1] + a[i - 2])) c.push(a[n - 1] + a[n - 2]);
    if (a[0] && a.every((x, i) => i === 0 || x === a[i - 1] * (a[1] / a[0]))) c.push(a[n - 1] * a[1] / a[0]);
    const d = a.slice(1).map((x, i) => x - a[i]); const dd = d.slice(1).map((x, i) => x - d[i]); if (dd.every(x => x === dd[0])) c.push(a[n - 1] + d[d.length - 1] + dd[0]);
    return ['unique', [...new Set(c)]]; },
  match: q => { const m = q.match(/1 shape uses (\d+) matchsticks, 2 shapes use (\d+).*?for (\d+)|1 shape uses (\d+) matchsticks, 2 shapes use (\d+).*?for (\d+) shapes/); const f = +(m[1] || m[4]), s = +(m[2] || m[5]), n = +(m[3] || m[6]); return f + (n - 1) * (s - f); },
  machine: q => { const m = q.match(/multiply by (\d+), then subtract (\d+).*?output is (\d+)/); return (+m[3] + +m[2]) / +m[1]; },
  repeat: q => { const m = q.match(/repeats: (.*?) … What is the (\d+)\w\w shape/); const seq = m[1].split(' '); let p = 1; while (p < seq.length && !seq.every((x, i) => x === seq[i % p])) p++; const n = +m[2]; return seq[(n - 1) % p]; },
  perarea: q => { const m = q.match(/perimeter of (\d+) cm\. Its length is (\d+) times/); const w = +m[1] / 2 / (+m[2] + 1); return +m[2] * w * w; },
  lshape: q => { const m = q.match(/cutting a (\d+) m × (\d+) m rectangle out of one corner of a (\d+) m × (\d+) m rectangle\. What is the (area|perimeter)/); return m[5] === 'area' ? m[3] * m[4] - m[1] * m[2] : 2 * (+m[3] + +m[4]); },
  tri: q => { const m = q.match(/base of (\d+) cm and a perpendicular height of (\d+) cm/); return m[1] * m[2] / 2; },
  tiles: q => { const m = q.match(/floor (\d+) m by (\d+) m.*?tiles that are (\d+) cm/); return (m[1] * 100 / m[3]) * (m[2] * 100 / m[3]); },
  tank: q => { const m = q.match(/(\d+) cm long, (\d+) cm wide and (\d+) cm high\. It is (\d+)\/(\d+) full/); return m[1] * m[2] * m[3] * m[4] / m[5] / 1000; },
  endtime: (q, o) => { const m = q.match(/starts at ([\d:]+ [ap]m) and runs for (.*?)\. What/); const t = clock(m[1]) + dur(m[2]); return ['eq', o.find(x => clock(x) === t % 1440)]; },
  dur24: (q, o) => { const m = q.match(/leaves at (\d+:\d+) and arrives at (\d+:\d+)/); const d = clock(m[2]) - clock(m[1]); return ['eq', o.find(x => dur(x) === d && !/ (6\d|[7-9]\d) min/.test(x))]; },
  dayof: q => { const m = q.match(/Today is (\w+)\. What day.*?in (\d+) days/); return DAYS[(DAYS.indexOf(m[1]) + +m[2]) % 7]; },
  triang: q => { const m = q.match(/are (\d+)° and (\d+)°/); return 180 - m[1] - m[2]; },
  iso: q => { let m = q.match(/each of the two equal base angles is (\d+)°/); if (m) return 180 - 2 * m[1]; m = q.match(/angle between the two equal sides is (\d+)°/); return (180 - m[1]) / 2; },
  clock: q => { const m = q.match(/clock at (\d+):(\d+)/); const h = +m[1], mi = +m[2]; let d = Math.abs((h % 12) * 30 + mi * 0.5 - mi * 6); if (d > 180) d = 360 - d; return d; },
  compass: q => { const P = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West']; const m = q.match(/faces (\S+) and turns (\d+)° (clockwise|anticlockwise)/); return P[(P.indexOf(m[1]) + (m[3] === 'clockwise' ? 1 : -1) * m[2] / 45 + 16) % 8]; },
  pointline: q => { let m = q.match(/straight line\. One is (\d+)°/); if (m) return 180 - m[1]; m = q.match(/Three of them are (\d+)°, (\d+)° and (\d+)°/); return 360 - m[1] - m[2] - m[3]; },
  polygon: q => { const n = +q.match(/\((\d+) sides\)/)?.[1] || { pentagon: 5, hexagon: 6, octagon: 8, heptagon: 7 }[q.match(/(pentagon|hexagon|octagon|heptagon)/)[1]];
    if (/diagonals/.test(q)) return n * (n - 3) / 2; if (/lines of symmetry/.test(q)) return n; return (n - 2) * 180; },
  coord: q => { const m = q.match(/at \((-?\d+), (-?\d+)\)\. It moves (\d+) units (right|left) and (\d+) units (up|down)/); return `(${+m[1] + (m[4] === 'right' ? 1 : -1) * m[3]}, ${+m[2] + (m[6] === 'up' ? 1 : -1) * m[5]})`; },
  paint: q => { const n = +q.match(/\((\d+) × /)[1]; const k = q.match(/(exactly three|exactly two|exactly one|no)/)[1]; return { 'exactly three': 8, 'exactly two': 12 * (n - 2), 'exactly one': 6 * (n - 2) ** 2, no: (n - 2) ** 3 }[k]; },
  mass: q => { const m = q.match(/holding (\d+) identical tins has a total mass of ([\d.]+) kg\. The empty box has a mass of (\d+) g/); return (m[2] * 1000 - m[3]) / m[1]; },
  lencmp: (q, o) => { const toM = s => { s = s.replace(/(\d) (\d)/g, '$1$2'); let m; if ((m = s.match(/^(\d+) km (\d+) m$/))) return m[1] * 1000 + +m[2]; if ((m = s.match(/^([\d.]+) km$/))) return m[1] * 1000; if ((m = s.match(/^(\d+) m$/))) return +m[1]; if ((m = s.match(/^(\d+) cm$/))) return m[1] / 100; if ((m = s.match(/^(\d+) mm$/))) return m[1] / 1000; }; return ['eq', o.reduce((b, x) => (toM(x) > toM(b) ? x : b))]; },
  posts: q => { let m = q.match(/every (\d+) m around a closed loop track that is (\d+) m/); if (m) return m[2] / m[1]; m = q.match(/every (\d+) m along a straight (\d+) m fence/); return m[2] / m[1] + 1; },
  mean: q => { const m = q.match(/of (\d+) numbers is (\d+)\. \d+ of the numbers are ([\d, ]+)\./); return m[1] * m[2] - m[3].split(',').reduce((a, x) => a + +x, 0); },
  median: q => { const a = q.match(/scores: ([\d, ]+)/)[1].split(',').map(Number).sort((x, y) => x - y); return a[(a.length - 1) / 2]; },
  probnot: q => { const g = c => +(q.match(new RegExp(`(\\d+) ${c}`)) || [0, 0])[1]; const t = g('red') + g('blue') + g('green') + g('yellow'); const col = q.match(/not (\w+)/)[1]; return frac(t - g(col), t); },
  spin: q => { const m = q.match(/has (\d+) equal sections.*?greater than (\d+) AND (even|odd)/); let c = 0; for (let i = +m[2] + 1; i <= +m[1]; i++) if ((i % 2 === 0) === (m[3] === 'even')) c++; return frac(c, +m[1]); },
  legs: q => { const per = { chickens: 2, cows: 4, bicycles: 2, tricycles: 3, ducks: 2, sheep: 4, stools: 3, chairs: 4 }; const m = q.match(/only (\w+) and (\w+): (\d+) \w+ altogether with (\d+)/); return (m[4] - m[3] * per[m[1]]) / (per[m[2]] - per[m[1]]); },
  sumdiff: q => { const m = q.match(/costs \$(\d+) more.*?Together they cost \$(\d+)/); return (+m[2] + +m[1]) / 2; },
  ages: q => { const m = q.match(/is (\d+) times as old as \w+\. In (\d+) years/); const b = m[2] / (m[1] - 2); return m[1] * b; },
  rate: q => { const m = q.match(/in (\d+) hours\. \w+ can paint the same fence in (\d+) hours/); return m[1] * m[2] / (+m[1] + +m[2]); },
  tblsales: (q, o, h) => { const k = +q.match(/more than (\d+)/)[1]; return rows(h).slice(1).filter(r => r[1] - r[2] > k).length; },
  pie: q => { const m = q.match(/(\d+) students chose.*?apple (\d+), banana (\d+), mango (\d+)/); return (m[1] - m[2] - m[3] - m[4]) * 360 / m[1]; },
  bus: (q, o, h) => { const t = rows(h); const stop = q.match(/reaches the (.*?) stop at ([\d:]+)/); const arr = clock(stop[2]); const row = t.find(r => r[0] === stop[1]); const beach = t.find(r => r[0] === 'Beach');
    const toM = s => { const [a, b] = s.split(':').map(Number); return a * 60 + b; }; const i = row.slice(1).findIndex(x => toM(x) >= toM(stop[2])); return beach[i + 1]; },
  // ---- thinking ----
  order: (q, o) => { const rel = [...q.matchAll(/(\w+) finished (before|after) (\w+)\./g)].map(m => (m[2] === 'before' ? [m[1], m[3]] : [m[3], m[1]]));
    const names = [...new Set(rel.flat())]; const ord = []; const rem = new Set(names); while (rem.size) { const f = [...rem].find(n => !rel.some(([a, b]) => b === n && rem.has(a))); ord.push(f); rem.delete(f); }
    return ord[+q.match(/(\d)\w\w/)[1] - 1]; },
  backsched: (q, o) => { const tot = [...q.matchAll(/\((\d+) min\)/g)].reduce((a, m) => a + +m[1], 0); const by = clock(q.match(/finished by ([\d:]+ [ap]m)/)[1]); return ['eq', o.find(x => clock(x) === by - tot)]; },
  lcmday: q => { const m = q.match(/every (\d+) days and fed every (\d+) days\. Today is (\w+)/); const l = m[1] * m[2] / gcd(+m[1], +m[2]); return DAYS[(DAYS.indexOf(m[3]) + l) % 7]; },
  tickets: q => { const m = q.match(/cost \$(\d+) for adults and \$(\d+) for children\. A family with (\d+) adults? paid \$(\d+)/); return (m[4] - m[3] * m[1]) / m[2]; },
  swap: q => { const m = q.match(/(\d+) \w+ are worth the same as (\d+) \w+\. (\d+) \w+ are worth the same as 1 of the \w+\.\s+How many \w+ are worth the same as (\d+)/); return m[4] * m[3] * m[1] / m[2]; },
  cheapest: q => { const m = q.match(/at least (\d+) cupcakes\. A shop sells boxes of (\d+) for \$([\d.]+), or single cupcakes for \$([\d.]+)/); const [n, b, bp, sp] = [+m[1], +m[2], +m[3], +m[4]]; let best = 1e9; for (let k = 0; k <= Math.ceil(n / b); k++) best = Math.min(best, k * bp + Math.max(0, n - k * b) * sp); return Math.round(best * 100) / 100; },
  recipe: q => { const m = q.match(/for (\d+) people uses (\d+) (g|mL) of (\w+).*?for (\d+) people/); return m[2] / m[1] * m[5]; },
  traindeadline: (q, o) => { const t = dur(q.match(/takes (.*?)\. Trains/)[1]); const dl = clock(q.match(/arrive by (\d+:\d+ [ap]m)/)[1]); return ['eq', o.find(x => clock(x) === Math.floor((dl - t) / 60) * 60)]; },
  lettergap: q => { const a = q.match(/next\? ([A-Z, ]+), \?/)[1].split(', ').map(c => L.indexOf(c)); const d = a.slice(1).map((x, i) => x - a[i]); const inc = d[1] - d[0]; return L[a[a.length - 1] + d[d.length - 1] + inc]; },
  shiftcode: q => { const m = q.match(/(\w+) is written as (\w+)\. How is (\w+)/); const k = (L.indexOf(m[2][0]) - L.indexOf(m[1][0]) + 26) % 26; return m[3].split('').map(c => L[(L.indexOf(c) + k) % 26]).join(''); },
  rowrule: q => { const g = [...q.matchAll(/\((\d+), (\d+), (\d+)\)/g)].map(m => m.slice(1).map(Number)); const qa = q.match(/\((\d+), \?, (\d+)\)/); const A = +qa[1], B = +qa[2];
    const rules = [(a, b) => (a + b) * 2, (a, b) => a * b - 1, (a, b) => a * b + a, (a, b) => 2 * a + b, (a, b) => a + b, (a, b) => a * b];
    return ['unique', [...new Set(rules.filter(f => g.every(([a, m, b]) => f(a, b) === m)).map(f => f(A, B)))]]; },
  oddone: (q, o) => { const v = o.map(Number); const sq = x => Number.isInteger(Math.sqrt(x)); const out = [];
    for (const x of v) { const rest = v.filter(y => y !== x);
      if (rest.every(sq) && !sq(x)) out.push(x); if (!rest.some(sq) && sq(x)) out.push(x);
      const g2 = rest.reduce(gcd); if (g2 > 1 && x % g2 !== 0) out.push(x);
      if (rest.every(y => y % 2 === 0) && x % 2) out.push(x); if (rest.every(y => y % 2) && x % 2 === 0) out.push(x); }
    return ['unique', [...new Set(out)]]; },
  fold: q => { const f = /once/.test(q) ? 1 : +q.match(/in half (\d+) times/)[1]; const p = +q.match(/Then (\d+) holes?/)[1]; return p * 2 ** f; },
  stack: q => { const n = +q.match(/has a (\d+) ×/)[1]; let s = 0; for (let i = 1; i <= n; i++) s += i * i; return s; },
  // ---- angles (read the diagram labels) ----
  angLine: (q, o, h) => 180 - degs(h)[0],
  angLine3: (q, o, h) => 180 - degs(h).reduce((a, b) => a + b, 0),
  angPoint: (q, o, h) => 360 - degs(h).reduce((a, b) => a + b, 0),
  angVert: (q, o, h) => { const a = degs(h)[0]; return /vertically opposite<\/b> angles \(across/.test(h) ? a : [a, 180 - a]; },
  angTriD: (q, o, h) => 180 - degs(h).reduce((a, b) => a + b, 0),
  angRightTri: (q, o, h) => 90 - degs(h)[0],
  angIsoD: (q, o, h) => { const g = degs(h)[0]; return [(180 - g) / 2, 180 - 2 * g].filter(x => x > 0); },
  angExt: (q, o, h) => degs(h).reduce((a, b) => a + b, 0),
  angQuadD: (q, o, h) => 360 - degs(h).reduce((a, b) => a + b, 0),
  angRatio: q => { const m = q.match(/A (right|straight) angle is split into two angles, a and (\d+)a\. What is the size of (\d*)a/); const t = m[1] === 'right' ? 90 : 180; const a = t / (+m[2] + 1); return m[3] ? a * +m[3] : a; },
  angTurn: q => ({ 'a quarter of a turn': 90, 'half a turn': 180, 'three-quarters of a turn': 270, 'one-third of a turn': 120, 'two-thirds of a turn': 240, 'one-eighth of a turn': 45, 'one-sixth of a turn': 60, 'five-sixths of a turn': 300, 'three-eighths of a turn': 135 })[q.match(/are in (.*?)\?/)[1].trim()],
  angClockMove: q => { let m = q.match(/minute hand.*?between (\d+):(\d+) and (\d+):(\d+)/); if (m) return ((m[3] * 60 + +m[4]) - (m[1] * 60 + +m[2])) * 6; m = q.match(/from (\d+):00 to (\d+):00/); return (m[2] - m[1]) * 30; },
  angPolyExt: q => { const n = { pentagon: 5, hexagon: 6, octagon: 8 }[q.match(/regular (\w+)/)[1]] || +q.match(/\((\d+) sides\)/)[1]; return /interior/.test(q) ? 180 - 360 / n : 360 / n; },
  angKind: (q, o, h) => { const ls = [...h.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)].map(m => m.slice(1).map(Number)); const [x1, y1, x2, y2] = ls[1];
    let a = Math.round(Math.atan2(-(y2 - y1), x2 - x1) * 180 / Math.PI); if (a < 0) a += 360; const reflex = /A\d+ \d+ 0 1 0/.test(h) || /A\d+(\.\d+)? \d+(\.\d+)? 0 1 0/.test(h); if (reflex && a < 180) a = 360 - a;
    if (/What type/.test(q)) return a === 90 ? 'Right' : a === 180 ? 'Straight' : a < 90 ? 'Acute' : a < 180 ? 'Obtuse' : 'Reflex';
    return ['near', a]; },
  angIsoExt: (q, o, h) => { const e = degs(h)[0]; return 180 - 2 * (180 - e); },
};

let total = 0, bad = 0, skipped = new Set(); const fails = [];
for (const subject of ['maths', 'thinking']) for (const g of generatorsFor(subject)) {
  if (!S[g.key]) { skipped.add(g.key); continue; }
  for (let s = 1; s <= N; s++) {
    const Q = generate(subject, g.key, s); const ans = Q.opts[Q.a]; const qt = txt(Q.q).replace(/\[.*?\]/g, ''); total++;
    let exp; try { exp = S[g.key](txt(Q.q.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<table[\s\S]*?<\/table>/g, ' ')), Q.opts, Q.q + Q.exp); } catch (e) { if (fails.filter(f => f.startsWith(g.key + '#')).length < 2) fails.push(`${g.key}#${s} PARSE ERROR ${e.message} :: ${qt.slice(0, 120)}`); bad++; continue; }
    let ok;
    if (Array.isArray(exp) && exp[0] === 'unique') ok = exp[1].length === 1 && Math.abs(num(ans) - num(exp[1][0])) < 0.01 && (typeof exp[1][0] === 'number' || String(exp[1][0]) === ans);
    else if (Array.isArray(exp) && exp[0] === 'eq') ok = exp[1] === ans;
    else if (Array.isArray(exp) && exp[0] === 'near') ok = Math.abs(num(ans) - exp[1]) <= 5 && Q.opts.filter(x => Math.abs(num(x) - exp[1]) <= 5).length === 1;
    else if (Array.isArray(exp)) ok = exp.some(e => (typeof e === 'number' ? Math.abs(num(ans) - e) < 0.01 : String(e) === ans)) && exp.length > 0;
    else ok = typeof exp === 'number' ? Math.abs(num(ans) - exp) < 0.01 : String(exp) === ans;
    // the expected answer must appear exactly once among the options
    if (ok && typeof exp === 'number') { const hits = Q.opts.filter(x => Math.abs(num(x) - exp) < 0.01).length; if (hits !== 1) ok = false; }
    if (!ok) { bad++; if (fails.filter(f => f.startsWith(g.key + '#')).length < 3) fails.push(`${g.key}#${s} expected ${JSON.stringify(exp)} but marked "${ans}" :: ${qt.slice(0, 160)} | opts: ${Q.opts.join(' / ')}`); }
  }
}
console.log(`Re-solved ${total} generated questions (${N} versions × ${total / N} types). Mismatches: ${bad}.`);
if (skipped.size) console.log('No independent solver for:', [...skipped].join(', '));
console.log(fails.join('\n'));
