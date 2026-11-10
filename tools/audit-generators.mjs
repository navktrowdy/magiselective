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
  // ---- 2D/3D space & perimeter/area (spaceGen) ----
  cubeSee: q => { const n = +q.match(/\((\d+) × /)[1]; const table = /glued to a table/.test(q); let hid = 0;
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) { // z = 0 is the bottom layer
      const seen = x === 0 || x === n - 1 || y === 0 || y === n - 1 || z === n - 1 || (!table && z === 0); if (!seen) hid++; }
    return hid; },
  cuboidPaint: q => { const m = q.match(/block (\d+) × (\d+) × (\d+)/); const [a, b, c] = [+m[1], +m[2], +m[3]]; const want = q.match(/paint on (no faces|exactly one face|exactly two faces|one face or no faces)/)[1]; let k = 0;
    for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) for (let z = 0; z < c; z++) { const f = (x === 0) + (x === a - 1) + (y === 0) + (y === b - 1) + (z === 0) + (z === c - 1);
      if ({ 'no faces': f === 0, 'exactly one face': f === 1, 'exactly two faces': f === 2, 'one face or no faces': f <= 1 }[want]) k++; }
    return k; },
  netSolid: q => { const cnt = {}; for (const m of q.match(/exactly (.*?) \(all/)[1].matchAll(/(\d+) (triangle|square|pentagon|hexagon|rectangle)s?/g)) cnt[m[2]] = +m[1];
    const sides = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 }, adj = { 3: 'Triangular', 4: 'Square', 5: 'Pentagonal', 6: 'Hexagonal' }; const ks = Object.keys(cnt);
    if (ks.length === 1 && cnt.square === 6) return 'Cube';
    if (ks.length === 1 && cnt.triangle === 4) return 'Triangular pyramid';
    const base = ks.find(k => k !== 'rectangle' && k !== 'triangle') || 'triangle';
    if (cnt[base] === 2 && cnt.rectangle === sides[base]) return base === 'square' ? 'Rectangular prism' : `${adj[sides[base]]} prism`;
    if (cnt[base] === 1 && cnt.triangle === sides[base]) return `${adj[sides[base]]} pyramid`; },
  cubeNet: (q, o) => { const folds = svg => { const cells = [...svg.matchAll(/class="cell" x="(\d+)" y="(\d+)"/g)].map(m => [m[1] / 22, m[2] / 22]);
      // roll a die across the net: state = [down, up, north, south, east, west]
      const at = new Map([[cells[0].join(), ['D', 'U', 'N', 'S', 'E', 'W']]]); const todo = [cells[0]];
      const roll = (st, dx, dy) => { const [d, u, n, s, e, w] = st; if (dx === 1) return [e, w, n, s, u, d]; if (dx === -1) return [w, e, n, s, d, u]; if (dy === 1) return [s, n, d, u, e, w]; return [n, s, u, d, e, w]; };
      while (todo.length) { const [x, y] = todo.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = [x + dx, y + dy].join(); if (!at.has(k) && cells.some(c => c.join() === k)) { at.set(k, roll(at.get([x, y].join()), dx, dy)); todo.push([x + dx, y + dy]); } } }
      return cells.length === 6 && new Set([...at.values()].map(st => st[0])).size === 6; };
    const ok = o.map(folds); const want = !/will not make/.test(q); const hits = o.filter((_, i) => ok[i] === want); return hits.length === 1 ? ['eq', hits[0]] : ['eq', 'AMBIGUOUS']; },
  foldPunch: (q, o, h) => { const S = 22, G = 4; const two = /again from bottom to top/.test(q);
    const punches = [...h.matchAll(/class="punch" cx="([\d.]+)" cy="([\d.]+)"/g)].map(m => [(m[1] - S / 2) / S, (m[2] - S / 2) / S]);
    let holes = punches.map(p => p.join()); const mir = (list, f) => [...new Set([...list, ...list.map(s => f(s.split(',').map(Number)).join())])];
    if (two) holes = mir(holes, ([x, y]) => [x, G - 1 - y]); // undo the last fold first
    holes = mir(holes, ([x, y]) => [G - 1 - x, y]); const want = holes.sort().join(' ');
    const hits = o.filter(svg => [...svg.matchAll(/class="hole" cx="([\d.]+)" cy="([\d.]+)"/g)].map(m => [(m[1] - S / 2) / S, (m[2] - S / 2) / S].join()).sort().join(' ') === want);
    return hits.length === 1 ? ['eq', hits[0]] : ['eq', 'AMBIGUOUS']; },
  symFill: (q, o, h) => { const S = 20; const mx = +h.match(/class="mirror" x1="([\d.]+)"/)[1] / S; const t = new Set([...h.matchAll(/class="tile" x="(\d+)" y="(\d+)"/g)].map(m => `${m[1] / S},${m[2] / S}`));
    return [...t].filter(c => { const [x, y] = c.split(',').map(Number); return !t.has(`${2 * mx - 1 - x},${y}`); }).length; },
  sqCut: q => { const m = q.match(/perimeter of (\d+) cm\. It is cut into (\d+) equal/); const P = +m[1], n = +m[2], k = Math.round(Math.sqrt(n)), s = P / 4 / k;
    return /perimeter of one small/.test(q) ? 4 * s : /total perimeter of all the small squares added/.test(q) ? n * 4 * s : n * 4 * s - P; },
  rectSquares: (q, o, h) => { const P = +q.match(/perimeter of (\d+) m/)[1]; const m = h.match(/<rect x="0" y="0" width="(\d+)" height="(\d+)" fill="none"/); const cc = m[1] / 30, rr = m[2] / 30; const s = P / (2 * (cc + rr)); const d = 4 * cc * rr * s - P;
    return ['eq', d >= 0 ? `Larger by ${d} m` : `Smaller by ${-d} m`]; },
  pinwheel: q => { const m = q.match(/(\d+) cm wide and has an area of (\d+) cm²/); const w = +m[1], L = +m[2] / w;
    return /side length of the shaded/.test(q) ? L - w : /area of the shaded/.test(q) ? (L - w) ** 2 : (L + w) ** 2; },
  // ---- numberGen ----
  remOdd: (q, o) => { const d = +q.match(/divided by (\d+)/)[1]; const rs = o.map(x => +x % d); const odd = o.filter((x, i) => rs.filter(y => y === rs[i]).length === 1); return odd.length === 1 && rs.filter(y => y !== (+odd[0] % d)).length === 4 ? ['eq', odd[0]] : ['eq', 'AMBIGUOUS']; },
  lcmTrays: q => { const ns = [...q.matchAll(/with (\d+) cups|one with (\d+) cups/g)].map(m => +(m[1] || m[2])); for (let t = 1; t < 10000; t++) if (ns.every(n => t % n === 0)) return t; },
  multDiff: q => { const N = +q.match(/less than (\d+)\./)[1], a = +q.match(/multiple of (\d+)\./)[1], b = +q.match(/even number that is a multiple of (\d+)/)[1];
    let big = 0, small = Infinity; for (let x = 1; x < N; x++) { if (x % a === 0) big = Math.max(big, x); if (x % 2 === 0 && x % b === 0) small = Math.min(small, x); } return big - small; },
  ineqSum: q => { const [, p, A] = q.match(/multiplies it by (\d+), the answer is less than (\d+)/), [, k, B] = q.match(/multiplies it by (\d+), the answer is greater than (\d+)/); let s = 0; for (let x = 1; x < 1000; x++) if (p * x < A && k * x > B) s += x; return s; },
  wallPaint: (q, o, h) => { const n = +q.match(/split into (\d+) equal/)[1]; const pre = (h.match(/class="pre"/g) || []).length; const [, a, b] = q.match(/paints (\d+)\/(\d+) of the whole wall/); let white = n - pre - n * a / b;
    const m = q.match(/paints (\d+)\/(\d+) of the sections that are still white/); if (m) white -= white * m[1] / m[2]; return white; },
  containerMass: q => { const f = t => ({ 'completely full': 1, 'half full': 0.5, 'one-quarter full': 0.25, 'three-quarters full': 0.75 })[t];
    const m = q.match(/is (completely full|half full|one-quarter full|three-quarters full) of .*?mass of (\d+) g\. When it is (completely full|half full|one-quarter full|three-quarters full), they have a mass of (\d+) g/);
    const C = (m[4] - m[2]) / (f(m[3]) - f(m[1])), E = m[2] - f(m[1]) * C; const ask = /mass of the empty/.test(q) ? 0 : f(q.match(/when the \w+ is (completely full|half full|one-quarter full|three-quarters full)\?/)[1]); return E + ask * C; },
  outfits: (q, o) => { const [, A, t1, s1, B, t2, s2] = q.match(/(\w+) has (\d+) different pairs of shorts and (\d+) different tops\. (\w+) has (\d+) different pairs of shorts and (\d+) different tops/); const d = t1 * s1 - t2 * s2;
    return ['eq', o.find(x => (d === 0 ? /same number/.test(x) : new RegExp(`^${d > 0 ? A : B} has ${Math.abs(d)} more`).test(x)))]; },
  probRatio: q => { const same = q.match(/same number of (\w+) discs as (\w+) discs/); const [, k, x, y] = q.match(/(\d+) times as many (\w+) discs as (\w+) discs/);
    const parts = { [y]: 1 }; parts[x] = +k; parts[same[1] === x ? same[2] : same[1]] = +k; const ask = q.match(/probability that it is (\w+)\?/)[1]; const tot = Object.values(parts).reduce((a, b) => a + b, 0); return ['eq', frac(parts[ask], tot)]; },
  twoDice: q => { let n = 0; const sm = q.match(/add up to (\d+)\?/), so = q.match(/add up to more than (\d+)/);
    for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (/second number is larger/.test(q) ? y > x : so ? x + y > +so[1] : sm ? x + y === +sm[1] : x % 2 === 0 && y % 2 === 0) n++; return ['eq', frac(n, 36)]; },
  cardArr: q => { const d = q.match(/show the digits ([\d, ]+)\./)[1].split(', '); const all = new Set(); for (const a of d) for (const b of d) for (const c of d) if (new Set([a, b, c]).size === 3) all.add(a + b + c);
    const gt = q.match(/greater than (\d+)/); const ok = [...all].filter(t => (/even number/.test(q) ? +t % 2 === 0 : gt ? +t > +gt[1] : +t % 5 === 0)).length; return ['eq', frac(ok, all.size)]; },
  missingBars: (q, o, h) => { const N = +q.match(/^(\d+) children/)[1]; const k = +q.match(/is (\d+) times the number/)[1]; const top = +[...h.matchAll(/font-size="11">(\d+)<\/text>/g)].map(m => m[1]).pop();
    const H = 150, seen = [...h.matchAll(/class="gbar" x="[\d.]+" y="[\d.]+" width="\d+" height="([\d.]+)"/g)].reduce((s, m) => s + Math.round(+m[1] / (H / top)), 0);
    const three = (N - seen) / (k + 1); return /How many children have 2 pets/.test(q) ? k * three : three; },
  meanNew: q => { const [, n, m] = q.match(/(\d+) students sat a \w+ test and their average mark was (\d+)/); const m2 = +q.match(/rose to (\d+)/)[1]; return (+n + 1) * m2 - n * m; },
  kthRow: (q, o, h) => { const cells = rows(h); const vals = cells[1].slice(1).map(Number); const k = +q.match(/the (\d+)\w\w largest/)[1]; const v = [...vals].sort((a, b) => b - a)[k - 1]; return ['eq', `${cells[0][0]} ${vals.indexOf(v) + 1}`]; },
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
process.exit(bad || skipped.size ? 1 : 0);
