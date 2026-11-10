// Number, mass, chance and data generators added from a review of exam-style question types:
// remainders, LCM, multiples, inequalities, fraction-of-a-wall, container + contents mass,
// combinations, ratio probability, two dice, card arrangements, missing bars, averages, ranking a table.
// Every answer is computed here and re-solved independently in tools/audit-generators.mjs.
import { int, pick, shuffle, sample, options, sortedOptions, gcd, lcm, NAMES, ordinal } from './util.js';

const N5 = 5;
const frac = (n, d) => { if (n === 0) return '0'; const g = gcd(n, d); return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`; };
const fracOptions = (r, num, den, wrong) => {
  const right = frac(num, den); const seen = new Set([right]); const list = [];
  for (const [n, d] of wrong) { if (n < 0 || d <= 0 || n > d) continue; const t = frac(n, d); if (!seen.has(t)) { seen.add(t); list.push(t); } }
  if (list.length < 4) return { opts: null, a: -1 };
  const opts = shuffle(r, [right, ...list.slice(0, 4)]).sort((a, b) => eval(a) - eval(b)); // eslint-disable-line no-eval
  return { opts, a: opts.indexOf(right) };
};
const tbl = (head, rows) => `<table class="qtable"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

export default [
  // ---------------- Whole Numbers ----------------
  { key: 'remOdd', topic: 'Whole Numbers', diff: 2, make(r) {
    const d = int(r, 3, 9), rem = int(r, 0, d - 1); let odd = int(r, 0, d - 1); if (odd === rem) odd = (rem + 1 + int(r, 0, d - 3)) % d; if (odd === rem) return null;
    const ks = sample(r, Array.from({ length: Math.floor(140 / d) - 2 }, (_, i) => i + 3), 5);
    const same = ks.slice(0, 4).map(k => k * d + rem), diff = ks[4] * d + odd;
    if (new Set([...same, diff]).size < 5) return null;
    const opts = [...same, diff].sort((a, b) => a - b).map(String);
    return { q: `Four of these numbers leave the <b>same remainder</b> when divided by ${d}. Which number leaves a <b>different</b> remainder?`, opts, a: opts.indexOf(String(diff)),
      exp: `Divide each by ${d}:<br>${[...same, diff].sort((a, b) => a - b).map(n => `${n} = ${d} × ${Math.floor(n / d)} + <b>${n % d}</b>`).join('<br>')}<br>Four leave remainder ${rem}; <b>${diff}</b> leaves ${odd}.<br><b>Shortcut:</b> find the nearest multiple of ${d} below each number and count up.` };
  } },
  { key: 'lcmTrays', topic: 'Whole Numbers', diff: 2, make(r) {
    const sizes = sample(r, [6, 8, 9, 10, 12, 15, 16, 18, 20, 24], 3).sort((a, b) => a - b); const [a, b, c] = sizes;
    const v = lcm(lcm(a, b), c); if (v > 240 || v === a * b * c) return null;
    const [n1, n2, n3] = sample(r, NAMES, 3);
    const { opts, a: ai } = sortedOptions(r, v, [lcm(a, b), lcm(b, c), a * b, b * c, 2 * v, v / 2].filter(x => Number.isInteger(x) && x !== v && x >= c), N5);
    return { q: `${n1} has a muffin tray with ${a} cups, ${n2} has one with ${b} cups and ${n3} has one with ${c} cups. They always fill every cup each time they bake. They each want to bake the <b>same</b> number of muffins. What is the smallest number of muffins each person can bake?`, opts, a: ai,
      exp: `Each total must be a multiple of ${a}, ${b} <b>and</b> ${c}, so we need the <b>lowest common multiple</b>.<br>Multiples of ${c}: ${Array.from({ length: v / c }, (_, i) => (i + 1) * c).join(', ')}<br>The first that ${a} and ${b} also divide is <b>${v}</b>.<br>(${n1} bakes ${v / a} trays, ${n2} ${v / b}, ${n3} ${v / c}.)` };
  } },
  { key: 'multDiff', topic: 'Whole Numbers', diff: 2, make(r) {
    const N = pick(r, [40, 50, 60, 80, 100]), a = pick(r, [4, 6, 7, 8, 9]), b = pick(r, [3, 5, 7, 9]); if (a === b) return null;
    const [p1, p2] = sample(r, NAMES, 2);
    const big = Math.floor((N - 1) / a) * a, small = lcm(2, b); const v = big - small;
    const { opts, a: ai } = sortedOptions(r, v, [big - b, N - small, big - 2 * b, (big + a <= N ? big + a : big - a) - small, big - small * 2].filter(x => x > 0 && x !== v), N5);
    return { q: `${p1} and ${p2} each think of a whole number that is greater than 0 and less than ${N}.<br>• ${p1}'s number is a multiple of ${a}.<br>• ${p2}'s number is an <b>even</b> number that is a multiple of ${b}.<br>What is the difference between the <b>largest</b> possible value of ${p1}'s number and the <b>smallest</b> possible value of ${p2}'s number?`, opts, a: ai,
      exp: `Largest multiple of ${a} below ${N}: <b>${big}</b>.<br>Multiples of ${b}: ${b}, ${2 * b}, ${3 * b} … the first even one is <b>${small}</b>.<br>Difference: ${big} − ${small} = <b>${v}</b>.<br><b>Trap:</b> ${b} itself is odd, so it doesn't count.` };
  } },
  { key: 'ineqSum', topic: 'Whole Numbers', diff: 3, make(r) {
    const p = pick(r, [2, 3, 4, 5]), q = pick(r, [5, 6, 7, 8, 9]); if (q <= p) return null;
    const A = p * int(r, 6, 12), B = q * int(r, 3, 8) - int(r, 1, q - 1);
    const xs = []; for (let x = 1; x < 200; x++) if (p * x < A && q * x > B) xs.push(x);
    if (xs.length < 2 || xs.length > 5) return null;
    const v = xs.reduce((s, x) => s + x, 0); const name = pick(r, NAMES);
    const { opts, a } = sortedOptions(r, v, [v - xs[0], v + xs[xs.length - 1] + 1, xs.length, xs[xs.length - 1], v + xs[0] - 1], N5);
    return { q: `${name} is thinking of a whole number.<br>• If ${name} multiplies it by ${p}, the answer is <b>less than ${A}</b>.<br>• If ${name} multiplies it by ${q}, the answer is <b>greater than ${B}</b>.<br>There is more than one number that works. What is the <b>sum</b> of all the numbers ${name} could be thinking of?`, opts, a,
      exp: `${p} × number < ${A} → number < ${A / p}, so at most ${Math.ceil(A / p) - 1}.<br>${q} × number > ${B} → number > ${Math.round(B / q * 100) / 100}, so at least ${xs[0]}.<br>Possible numbers: ${xs.join(', ')}.<br>Sum = ${xs.join(' + ')} = <b>${v}</b>.<br><b>Check the edges:</b> ${p} × ${xs[xs.length - 1] + 1} = ${p * (xs[xs.length - 1] + 1)} is not less than ${A}; ${q} × ${xs[0] - 1} = ${q * (xs[0] - 1)} is not greater than ${B}.` };
  } },

  // ---------------- Fractions ----------------
  { key: 'wallPaint', topic: 'Fractions', diff: 2, make(r) {
    const n = pick(r, [10, 12, 15, 16, 18, 20, 24]); const dens = [2, 3, 4, 5, 6, 8].filter(d => n % d === 0); const d = pick(r, dens); const k = int(r, 1, d - 1); if (gcd(k, d) !== 1) return null; // fractions in simplest form, as the test writes them
    const y = n * k / d; const pre = int(r, 1, n - y - 1); if (pre < 1 || y + pre >= n) return null;
    const two = r() < 0.5; const rest = n - pre - y;
    let red = 0, d2 = 0, k2 = 0; if (two) { const ds = [2, 3, 4, 5].filter(x => rest % x === 0 && rest / x >= 1); if (!ds.length) return null; d2 = pick(r, ds); k2 = int(r, 1, d2 - 1); if (gcd(k2, d2) !== 1) return null; red = rest * k2 / d2; }
    const v = rest - red; if (v < 1) return null; const name = pick(r, NAMES);
    const S = 26, cols = n % 6 === 0 && n > 12 ? 6 : n % 5 === 0 ? 5 : 4, rows = n / cols;
    const svg = Number.isInteger(rows) ? `<svg viewBox="-2 -2 ${cols * S + 4} ${rows * S + 4}" width="${cols * S + 4}" class="qsvg" role="img" aria-label="wall of sections">${Array.from({ length: n }, (_, i) => `<rect class="${i < pre ? 'pre' : 'blank'}" x="${(i % cols) * S}" y="${Math.floor(i / cols) * S}" width="${S}" height="${S}" fill="${i < pre ? '#7e57c2' : '#fff'}" stroke="#555"/>`).join('')}</svg>` : null;
    if (!svg) return null;
    const { opts, a } = sortedOptions(r, v, [rest, y, n - y, v + 1, v - 1, two ? rest - Math.round(n * k2 / d2) : n - y - pre + 1].filter(x => x > 0 && x !== v), N5);
    return { q: `${name}'s wall is split into ${n} equal sections. ${pre} ${pre === 1 ? 'section is' : 'sections are'} already painted purple, as shown.${svg}${name} paints <b>${k}/${d} of the whole wall</b> yellow.${two ? ` Then ${name} paints <b>${k2}/${d2} of the sections that are still white</b> red.` : ''} Finally, ${name} paints the rest of the wall green. How many sections are painted green?`, opts, a,
      exp: `${k}/${d} of the whole wall = ${k}/${d} × ${n} = ${y} sections yellow.<br>Still white: ${n} − ${pre} purple − ${y} yellow = ${rest}.${two ? `<br>${k2}/${d2} of those ${rest} = ${red} red, leaving ${rest} − ${red} = ${v}.` : ''}<br>Green: <b>${v}</b>.<br><b>Read carefully:</b> "of the whole wall" uses all ${n} sections${two ? '; "of the sections still white" uses only what is left' : ''}.` };
  } },

  // ---------------- Mass ----------------
  { key: 'containerMass', topic: 'Mass', diff: 3, make(r) {
    const item = pick(r, [['jar', 'jam'], ['bottle', 'juice'], ['tin', 'soup'], ['tank', 'water'], ['bucket', 'sand']]);
    const C = int(r, 8, 40) * 20, E = int(r, 3, 30) * 10; // full contents, empty container (g)
    const pairs = [[[1, 2], [1, 1]], [[1, 4], [1, 2]], [[1, 4], [3, 4]], [[1, 2], [3, 4]]]; const [[a1, b1], [a2, b2]] = pick(r, pairs);
    const m1 = E + C * a1 / b1, m2 = E + C * a2 / b2; if (!Number.isInteger(m1) || !Number.isInteger(m2)) return null;
    const lbl = (a, b) => (a === b ? 'completely full' : { '1/2': 'half full', '1/4': 'one-quarter full', '3/4': 'three-quarters full' }[`${a}/${b}`]);
    const used = new Set([`${a1}/${b1}`, `${a2}/${b2}`]); const askOpts = [['empty', 0, 1], ...[[1, 1], [3, 4], [1, 2]].filter(([a, b]) => !used.has(`${a}/${b}`)).map(([a, b]) => ['other', a, b])];
    const [kind, ka, kb] = pick(r, askOpts); const v = kind === 'empty' ? E : E + C * ka / kb; if (!Number.isInteger(v)) return null;
    const share = (m2 - m1) / (a2 / b2 - a1 / b1);
    const { opts, a } = sortedOptions(r, v, [m2 - m1, kind === 'empty' ? m1 - (m2 - m1) * 2 : v - E, m1 * 2, m2 + (m2 - m1), Math.round(share * ka / kb)].filter(x => x > 0 && x !== v), N5, x => `${x} g`);
    return { q: `When a ${item[0]} is <b>${lbl(a1, b1)}</b> of ${item[1]}, the ${item[0]} and ${item[1]} together have a mass of ${m1} g. When it is <b>${lbl(a2, b2)}</b>, they have a mass of ${m2} g. ${kind === 'empty' ? `What is the mass of the <b>empty</b> ${item[0]}?` : `What is the total mass when the ${item[0]} is <b>${lbl(ka, kb)}</b>?`}`, opts, a,
      exp: `The ${item[0]} weighs the same both times, so the difference is just ${item[1]}:<br>${lbl(a2, b2)} − ${lbl(a1, b1)} = ${a2 === b2 ? 1 : `${a2}/${b2}`} − ${a1}/${b1} of the ${item[1]} → ${m2} − ${m1} = ${m2 - m1} g.<br>So a full load of ${item[1]} = ${C} g.<br>Empty ${item[0]} = ${m1} − ${a1}/${b1} × ${C} = ${E} g.${kind === 'other' ? `<br>${lbl(ka, kb)}: ${E} + ${ka === kb ? '' : `${ka}/${kb} × `}${C} = ${v} g.` : ''}<br>Answer: <b>${v} g</b>.` };
  } },

  // ---------------- Probability & combinations ----------------
  { key: 'outfits', topic: 'Probability', diff: 2, make(r) {
    const [A, B] = sample(r, NAMES, 2); const t1 = int(r, 2, 5), s1 = int(r, 2, 6), t2 = int(r, 2, 5), s2 = int(r, 2, 6);
    const d = t1 * s1 - t2 * s2; if (Math.abs(d) > 4 || t1 + s1 === t2 + s2 && d !== 0) return null;
    const say = x => (x === 0 ? 'They have the same number of outfits.' : x > 0 ? `${A} has ${x} more outfit${x === 1 ? '' : 's'} than ${B}.` : `${B} has ${-x} more outfit${x === -1 ? '' : 's'} than ${A}.`);
    const vals = [...new Set([d, -d, d + 1, d - 1, d + 2, d - 2, 0, t1 + s1 - t2 - s2])].filter(x => x !== d);
    const opts = [d, ...sample(r, vals, 4)].sort((a, b) => b - a).map(say); if (new Set(opts).size < 5) return null;
    return { q: `${A} has ${t1} different pairs of shorts and ${s1} different tops. ${B} has ${t2} different pairs of shorts and ${s2} different tops. Each makes an outfit from their own clothes by choosing 1 pair of shorts and 1 top. Who can make more different outfits, and by how many?`, opts, a: opts.indexOf(say(d)),
      exp: `Each pair of shorts can go with every top, so <b>multiply</b>:<br>${A}: ${t1} × ${s1} = ${t1 * s1} outfits<br>${B}: ${t2} × ${s2} = ${t2 * s2} outfits<br>→ <b>${say(d)}</b><br><b>Trap:</b> adding (${t1} + ${s1} vs ${t2} + ${s2}) counts clothes, not outfits.` };
  } },
  { key: 'probRatio', topic: 'Probability', diff: 2, make(r) {
    const [c1, c2, c3] = sample(r, ['red', 'blue', 'yellow', 'green', 'purple'], 3); const k = pick(r, [2, 3, 4]); const ask = pick(r, [c1, c2, c3]);
    const parts = { [c1]: k, [c2]: k, [c3]: 1 }; const tot = 2 * k + 1; const num = parts[ask];
    const { opts, a } = fracOptions(r, num, tot, [[1, 3], [k, k + 1], [1, k + 1], [1, 2 * k], [k, 2 * k], [1, tot], [k, tot], [2, tot]].filter(([n, d]) => frac(n, d) !== frac(num, tot)));
    return { q: `A bag holds ${c1}, ${c2} and ${c3} discs only.<br>• There are the same number of ${c1} discs as ${c2} discs.<br>• There are ${k} times as many ${c2} discs as ${c3} discs.<br>One disc is taken out without looking. What is the probability that it is <b>${ask}</b>?`, opts, a,
      exp: `Think in parts. Let ${c3} = 1 part. Then ${c2} = ${k} parts and ${c1} = ${k} parts.<br>Total = ${k} + ${k} + 1 = ${tot} parts.<br>P(${ask}) = ${num}/${tot}${frac(num, tot) !== `${num}/${tot}` ? ` = ${frac(num, tot)}` : ''}.<br>Answer: <b>${frac(num, tot)}</b>. You don't need the actual number of discs.` };
  } },
  { key: 'twoDice', topic: 'Probability', diff: 3, make(r) {
    const kind = pick(r, ['gt', 'sum', 'both', 'sumOver']); const s = kind === 'sum' ? int(r, 4, 10) : kind === 'sumOver' ? int(r, 7, 10) : 0;
    let n = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (kind === 'gt' ? y > x : kind === 'sum' ? x + y === s : kind === 'both' ? x % 2 === 0 && y % 2 === 0 : x + y > s) n++;
    const name = pick(r, NAMES);
    const text = { gt: 'the <b>second</b> number is <b>larger</b> than the first', sum: `the two numbers add up to <b>${s}</b>`, both: 'both numbers are <b>even</b>', sumOver: `the two numbers add up to <b>more than ${s}</b>` }[kind];
    const { opts, a } = fracOptions(r, n, 36, [[n, 6], [n + 1, 36], [n - 1, 36], [n, 12], [1, 2], [1, 6], [n + 6, 36], [21, 36], [1, 3]].filter(([x, d]) => frac(x, d) !== frac(n, 36)));
    return { q: `${name} rolls an ordinary six-sided die twice. What is the probability that ${text}?`, opts, a,
      exp: `There are 6 × 6 = 36 equally likely results (first roll, second roll).<br>${kind === 'gt' ? 'Count pairs where the second is bigger: first 1 → 5 ways, 2 → 4, 3 → 3, 4 → 2, 5 → 1, 6 → 0. Total 15.' : kind === 'both' ? 'Each roll is even in 3 of 6 ways: 3 × 3 = 9 pairs.' : `List the pairs: ${(() => { const l = []; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (kind === 'sum' ? x + y === s : x + y > s) l.push(`${x}+${y}`); return l.join(', '); })()} → ${n} pairs.`}<br>P = ${n}/36 = <b>${frac(n, 36)}</b>.` };
  } },
  { key: 'cardArr', topic: 'Probability', diff: 3, make(r) {
    const digits = sample(r, [1, 2, 3, 4, 5, 6, 7, 8, 9], 3); const kind = pick(r, ['even', 'over', 'mult5']);
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(p => p.map(i => digits[i]).join(''));
    const X = kind === 'over' ? pick(r, perms.map(Number).sort((a, b) => a - b).slice(1, 5)) : 0;
    const good = perms.filter(t => (kind === 'even' ? +t % 2 === 0 : kind === 'over' ? +t > X : +t % 5 === 0)).length;
    if (kind === 'mult5' && !digits.includes(5)) return null;
    if (good === 0 || good === 6) return null; // certain or impossible: not a useful probability question
    const { opts, a } = fracOptions(r, good, 6, [[1, 9], [1, 6], [1, 3], [1, 2], [2, 3], [5, 6], [1, 4]].filter(([n, d]) => frac(n, d) !== frac(good, 6)));
    const name = pick(r, NAMES);
    const text = { even: 'an <b>even</b> number', over: `<b>greater than ${X}</b>`, mult5: 'a <b>multiple of 5</b>' }[kind];
    return { q: `Three cards show the digits <b>${digits.join(', ')}</b>. ${name} shuffles them, lays them in a row at random and reads the 3-digit number. What is the probability that the number is ${text}?`, opts, a,
      exp: `There are 3 × 2 × 1 = 6 possible orders: ${perms.join(', ')}.<br>${kind === 'even' ? 'A number is even when its <b>last</b> digit is even.' : kind === 'mult5' ? 'A multiple of 5 must end in 0 or 5.' : `Compare each with ${X}.`} ${good} of the 6 work${good === 1 ? 's' : ''}${good ? `: ${perms.filter(t => (kind === 'even' ? +t % 2 === 0 : kind === 'over' ? +t > X : +t % 5 === 0)).join(', ')}` : ''}.<br>P = ${good}/6 = <b>${frac(good, 6)}</b>.` };
  } },

  // ---------------- Data ----------------
  { key: 'missingBars', topic: 'Data Interpretation', diff: 2, make(r) {
    const cats = [0, 1, 2, 3, 4, 5]; const known = [int(r, 4, 12), int(r, 6, 15), 0, 0, int(r, 1, 4), int(r, 0, 3)]; const k = pick(r, [2, 3]);
    const y = int(r, 2, 5), x = k * y; known[2] = x; known[3] = y; const N = known.reduce((s, v) => s + v, 0);
    const ask = pick(r, [2, 3]); const v = known[ask];
    const H = 150, top = Math.max(...known) <= 15 ? 15 : 20, sc = H / top, BW = 28, G = 14;
    const bars = cats.map(i => (i === 2 || i === 3 ? '' : `<rect class="gbar" x="${30 + i * (BW + G)}" y="${(H - known[i] * sc).toFixed(1)}" width="${BW}" height="${(known[i] * sc).toFixed(1)}" fill="#64b5f6" stroke="#1565c0"/>`)).join('');
    const grid = Array.from({ length: top / 5 + 1 }, (_, i) => `<line x1="26" y1="${H - i * 5 * sc}" x2="${30 + 6 * (BW + G)}" y2="${H - i * 5 * sc}" stroke="#ddd"/><text x="22" y="${H - i * 5 * sc + 4}" text-anchor="end" font-size="11">${i * 5}</text>`).join('') + Array.from({ length: top + 1 }, (_, i) => (i % 5 ? `<line x1="26" y1="${H - i * sc}" x2="30" y2="${H - i * sc}" stroke="#999"/>` : '')).join('');
    const labels = cats.map(i => `<text x="${30 + i * (BW + G) + BW / 2}" y="${H + 16}" text-anchor="middle" font-size="12">${i}</text>`).join('');
    const svg = `<svg viewBox="0 -6 ${40 + 6 * (BW + G)} ${H + 40}" width="${40 + 6 * (BW + G)}" class="qsvg" role="img" aria-label="column graph">${grid}${bars}${labels}<text x="${20 + 3 * (BW + G)}" y="${H + 32}" text-anchor="middle" font-size="12">number of pets</text></svg>`;
    const { opts, a } = sortedOptions(r, v, [known[ask === 2 ? 3 : 2], x + y, N - (x + y), Math.round((x + y) / 2), v + k].filter(z => z > 0 && z !== v), N5);
    return { q: `${N} children were asked how many pets they have. The column graph shows the results, but the bars for <b>2 pets</b> and <b>3 pets</b> are missing. The number of children with 2 pets is <b>${k} times</b> the number with 3 pets.${svg}How many children have <b>${ask} pets</b>?`, opts, a,
      exp: `Read the bars you can see: ${cats.filter(i => i !== 2 && i !== 3).map(i => `${i} pets → ${known[i]}`).join(', ')}. Together: ${N - x - y}.<br>Missing: ${N} − ${N - x - y} = ${x + y} children have 2 or 3 pets.<br>Let 3 pets = 1 part, 2 pets = ${k} parts: ${k + 1} parts = ${x + y}, so 1 part = ${y}.<br>3 pets: ${y} · 2 pets: ${x} → answer <b>${v}</b>.` };
  } },
  { key: 'meanNew', topic: 'Data', diff: 3, make(r) {
    const n = int(r, 3, 6), m = int(r, 55, 80), m2 = m + int(r, 1, 4); const v = (n + 1) * m2 - n * m; if (v > 100) return null;
    const subj = pick(r, ['maths', 'spelling', 'science']); const name = pick(r, NAMES);
    const { opts, a } = sortedOptions(r, v, [m2, m2 + (m2 - m), (n + 1) * m2 - n * m2, m + n * (m2 - m), v - (m2 - m)].filter(x => x > 0 && x <= 100 && x !== v), N5);
    return { q: `${n} students sat a ${subj} test and their <b>average</b> mark was ${m}. Then ${name} sat the same test, and the average of all ${n + 1} students rose to ${m2}. What mark did ${name} get?`, opts, a,
      exp: `Average × number of students = total.<br>Before: ${n} × ${m} = ${n * m}.<br>After: ${n + 1} × ${m2} = ${(n + 1) * m2}.<br>${name}'s mark = ${(n + 1) * m2} − ${n * m} = <b>${v}</b>.<br><b>Check:</b> ${name} scored ${v - m2} above the new average, which lifts each of the other ${n} by ${m2 - m}: ${v - m2} = ${n} × ${m2 - m} ✔` };
  } },
  { key: 'kthRow', topic: 'Data Interpretation', diff: 1, make(r) {
    const n = int(r, 7, 9), vals = sample(r, Array.from({ length: 50 }, (_, i) => i + 10), n), k = int(r, 2, n - 2);
    const item = pick(r, [['Row', 'Potatoes'], ['Class', 'Books read'], ['Stall', 'Cakes sold']]);
    const sorted = [...vals].sort((a, b) => b - a); const target = sorted[k - 1]; const row = vals.indexOf(target) + 1;
    const near = [sorted[k - 2], sorted[k], sorted[n - k], vals[k - 1]].map(t => vals.indexOf(t) + 1);
    const { opts, a } = options(r, row, [...near, ...shuffle(r, vals.map((_, i) => i + 1))], N5, x => `${item[0]} ${x}`);
    return { q: `The table shows the ${item[1].toLowerCase()} for each ${item[0].toLowerCase()}.${tbl([item[0], ...vals.map((_, i) => i + 1)], [[item[1], ...vals]])}Which ${item[0].toLowerCase()} has the <b>${ordinal(k)} largest</b> number?`, opts, a,
      exp: `Order from largest: ${sorted.map((t, i) => (i === k - 1 ? `<b>${t}</b>` : t)).join(', ')}.<br>The ${ordinal(k)} largest is ${target}, in <b>${item[0]} ${row}</b>.<br><b>Tip:</b> cross out values as you count so none is skipped.` };
  } },
];
