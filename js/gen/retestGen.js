// Generators added from a review of skills missed in an external mock (November). Original questions:
// reverse percentages (% of vs % off), cutting pieces, cubes into a prism, rounding error, travelling in
// opposite directions, next number with all-different digits, quadrilateral Venn regions (maths), and
// spend combinations, break-even with fees, percentage change of area, and averages to counts (thinking).
// Every answer is computed here and re-solved independently in tools/audit-generators.mjs.
import { int, pick, sample, shuffle, options, sortedOptions, NAMES, money } from './util.js';

const N5 = 5, N4 = 4;
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // 41 750
const distinct = n => new Set(String(n)).size === String(n).length;

// Most specific shapes, so that each belongs to exactly the groups listed.
const QUADS = {
  Square: { twoPar: 1, onePar: 1, right: 1, eqSides: 1 },
  Rectangle: { twoPar: 1, onePar: 1, right: 1, eqSides: 0 },
  Rhombus: { twoPar: 1, onePar: 1, right: 0, eqSides: 1 },
  Parallelogram: { twoPar: 1, onePar: 1, right: 0, eqSides: 0 },
  Trapezium: { twoPar: 0, onePar: 1, right: 0, eqSides: 0 },
  Kite: { twoPar: 0, onePar: 0, right: 0, eqSides: 0 },
};
const PROPS = {
  twoPar: 'two pairs of parallel sides',
  onePar: 'at least one pair of parallel sides',
  right: 'four right angles',
  eqSides: 'four equal sides',
};

export const retestMaths = [
  { key: 'pctOf', topic: 'Percentages', diff: 3, make(r) {
    const mode = pick(r, ['of', 'off']); const p = pick(r, mode === 'of' ? [20, 25, 40, 50, 60, 75, 80] : [10, 20, 25, 30, 40, 50]);
    const P = int(r, 8, 90) * 100; const keep = mode === 'of' ? p : 100 - p; const S = P * keep / 100; if (!Number.isInteger(S)) return null;
    const other = mode === 'of' ? S * 100 / (100 - p) : S * 100 / p;
    const item = pick(r, ['car', 'boat', 'piano', 'motorbike', 'caravan']);
    const { opts, a } = sortedOptions(r, P, [other, Math.round(S * (100 + p) / 1000) * 10, Math.round(S * 100 / (100 + p) / 10) * 10, P + P / 10, P - P / 10, S * 2].filter(x => Number.isInteger(x) && x !== P), N5, x => `$${sp(x)}`);
    if (!opts) return null;
    return { q: `A ${item} is on sale. The sale price is <b>${p}% ${mode}</b> the original price.<br>The sale price is $${sp(S)}. What was the original price?`, opts, a,
      exp: `${mode === 'of' ? `"${p}% <b>of</b>" means the sale price IS ${p}% of the original.` : `"${p}% <b>off</b>" means ${p}% is taken away, so the sale price is ${100 - p}% of the original.`}<br>${keep}% = $${sp(S)}, so 1% = $${sp(S)} ÷ ${keep} = $${sp(S / keep)}, and 100% = <b>$${sp(P)}</b>.<br><b>Trap:</b> read "of" and "off" carefully. Check: ${keep}% of $${sp(P)} = $${sp(S)} ✔` };
  } },
  { key: 'cutPieces', topic: 'Whole Numbers', diff: 2, make(r) {
    const n = int(r, 6, 20), k = int(r, 2, 5), c = int(r, 3, Math.min(n, 9)); const m = n + c * (k - 1);
    const item = pick(r, ['sheets of card', 'ribbons', 'sticks of clay', 'pizzas', 'paper strips']);
    const { opts, a } = sortedOptions(r, c, [m - n, Math.round((m - n) / k), c + 1, Math.round(m / k), c * k, n - c].filter(x => x !== c && x > 0), N5);
    if (!opts || opts.includes('0')) return null;
    return { q: `There were ${n} ${item}. Some of them were cut into ${k} pieces each. Now there are ${m} pieces altogether.<br>How many of the ${item} were cut?`, opts, a,
      exp: `Cutting one into ${k} pieces turns 1 piece into ${k}, so each cut adds <b>${k - 1}</b> extra pieces.<br>Extra pieces: ${m} − ${n} = ${m - n}.<br>Number cut: ${m - n} ÷ ${k - 1} = <b>${c}</b>.<br><b>Trap:</b> ${m - n} ÷ ${k} is wrong, because each cut piece was already counted once.` };
  } },
  { key: 'cubePrism', topic: 'Volume and Capacity', diff: 3, make(r) {
    const half = int(r, 5, 11), P = half * 2; const x = int(r, 1, half - 1), y = half - x, h = int(r, 2, 6); const N = x * y * h;
    const fits = []; for (let a = 1; a <= half / 2; a++) { const b = half - a; if (N % (a * b) === 0) fits.push([a, b, N / (a * b)]); }
    if (fits.length !== 1) return null; const name = pick(r, NAMES);
    const { opts, a } = sortedOptions(r, h, [Math.round(N / P), x, y, h + 1, h + 2, h * 2, Math.round(N / half)].filter(v => v !== h && v > 0), N5, v => `${v} cm`);
    if (!opts || opts.includes('0 cm')) return null;
    return { q: `${name} uses all ${N} cubes, each 1 cm long, to build a solid rectangular prism. The base of the prism has a perimeter of ${P} cm.<br>What is the height of the prism?`, opts, a,
      exp: `Perimeter ${P} cm means length + width = ${half} cm. Try each base:<br>${Array.from({ length: Math.floor(half / 2) }, (_, i) => { const a1 = i + 1, b1 = half - a1, ar = a1 * b1; return `${a1} × ${b1} = ${ar} cm² → ${N} ÷ ${ar} ${N % ar ? '✘ not whole' : `= ${N / ar} ✔`}`; }).join('<br>')}<br>Only a ${fits[0][0]} × ${fits[0][1]} base works, so the height is <b>${h} cm</b>.` };
  } },
  { key: 'roundErr', topic: 'Decimals', diff: 3, make(r) {
    const mk = () => { const w = int(r, 1, 9), t = int(r, 0, 9), hh = int(r, 1, 9); if (t === 5 || hh === 5 || (t === 4 && hh > 5)) return null; return w * 100 + t * 10 + hh; };
    const A = mk(), B = mk(); if (!A || !B) return null;
    const t10 = v => Math.round(v / 10), w1 = v => Math.round(v / 100);
    const tenth = t10(A) * t10(B), whole = w1(A) * w1(B) * 100; const d = Math.abs(tenth - whole); if (d === 0) return null; // hundredths
    const f = v => (v / 100).toFixed(2);
    const exact = Math.abs(A * B / 100 - whole) / 100;
    const { opts, a } = sortedOptions(r, d / 100, [tenth / 100, whole / 100, Math.round(exact * 100) / 100, Math.abs(A * B / 100 - tenth) / 100].map(v => Math.round(v * 100) / 100).filter(v => Math.abs(v - d / 100) >= 0.05 && v >= 0.05), N5, v => v.toFixed(2));
    if (!opts || opts.some(o => o !== (d / 100).toFixed(2) && (Math.abs(+o - d / 100) < 0.05 || +o < 0.05))) return null; const name = pick(r, NAMES);
    return { q: `${name} has to work out ${f(A)} × ${f(B)}. ${name} is told to round both numbers to the <b>nearest whole number</b> before multiplying, but instead rounds them to the <b>nearest tenth</b>.<br>How far is ${name}'s answer from the answer ${name} was meant to get?`, opts, a,
      exp: `Meant to do: ${w1(A)} × ${w1(B)} = ${whole / 100}.<br>Actually did: ${(t10(A) / 10).toFixed(1)} × ${(t10(B) / 10).toFixed(1)} = ${f(tenth)}.<br>Difference: ${f(Math.max(tenth, whole))} − ${f(Math.min(tenth, whole))} = <b>${f(d)}</b>.` };
  } },
  { key: 'oppTravel', topic: 'Length', diff: 3, make(r) {
    const [A, B] = sample(r, NAMES, 2); const s1 = int(r, 60, 95), s2 = int(r, 60, 95); if (s1 === s2) return null; const t1 = int(r, 8, 18), extra = int(r, 2, 6), t2 = t1 + extra;
    const v = s1 * t1 + s2 * t2;
    const { opts, a } = sortedOptions(r, v, [(s1 + s2) * t1, (s1 + s2) * t2, s1 * t2 + s2 * t1, s1 * t1, Math.abs(s1 * t1 - s2 * t2)].filter(x => x !== v), N5, x => `${sp(x)} m`);
    if (!opts) return null;
    return { q: `${A} and ${B} start at the same corner and ride their bikes in <b>opposite directions</b> along a straight road.<br>${A} rides at ${s1} m per minute and stops after ${t1} minutes. ${B} rides at ${s2} m per minute and stops ${extra} minutes after ${A} stops.<br>How far apart are they when both have stopped?`, opts, a,
      exp: `${A}: ${s1} × ${t1} = ${s1 * t1} m.<br>${B} rides for ${t1} + ${extra} = ${t2} minutes: ${s2} × ${t2} = ${s2 * t2} m.<br>Opposite directions, so add: ${s1 * t1} + ${s2 * t2} = <b>${sp(v)} m</b>.<br><b>Trap:</b> ${B} rode for ${t2} minutes, not ${t1}.` };
  } },
  { key: 'nextDistinct', topic: 'Whole Numbers', diff: 3, make(r) {
    let n = 0, k = 0; // keep trying readings until the next all-different one is a real search away
    for (let t = 0; t < 400 && !(k >= 9 && k <= 400); t++) { const digs = shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); if (digs[0] === 0) continue; n = +digs.slice(0, 6).join(''); k = 1; while (!distinct(n + k)) k++; }
    if (k < 9 || k > 400) return null;
    const { opts, a } = sortedOptions(r, k, [k + 9, k - 1, k + 10, k + 1, (10 - (n % 10)) % 10 || 10].filter(x => x !== k && x > 0), N5, x => `${x} km`);
    if (!opts) return null;
    return { q: `A car's distance meter shows <b>${sp(n)}</b> km. All six digits are different.<br>After how many more kilometres will it next show a number whose digits are all different again?`, opts, a,
      exp: `Count up and check each reading for a repeated digit. Jump past whole blocks that keep a repeat.<br>The next reading with six different digits is <b>${sp(n + k)}</b>.<br>${sp(n + k)} − ${sp(n)} = <b>${k} km</b>.` };
  } },
  { key: 'quadVenn', topic: '2D Space', diff: 2, make(r) {
    const [pb, pc] = sample(r, Object.keys(PROPS), 2); const region = pick(r, ['both', 'bOnly', 'cOnly']);
    const inR = s => { const b = QUADS[s][pb], c = QUADS[s][pc]; return region === 'both' ? b && c : region === 'bOnly' ? b && !c : !b && c; };
    const yes = Object.keys(QUADS).filter(inR), no = Object.keys(QUADS).filter(s => !inR(s)); if (!yes.length || no.length < 4) return null;
    const ans = pick(r, yes); const { opts, a } = options(r, ans, shuffle(r, no), N5); if (!opts) return null;
    const desc = { both: 'inside <b>both</b> circle B and circle C', bOnly: 'inside circle B but <b>outside</b> circle C', cOnly: 'inside circle C but <b>outside</b> circle B' }[region];
    return { q: `A diagram sorts quadrilaterals into circles.<br>• Circle A holds all quadrilaterals.<br>• Circle B holds quadrilaterals with <b>${PROPS[pb]}</b>.<br>• Circle C holds quadrilaterals with <b>${PROPS[pc]}</b>.<br>Each name means the general shape (a rhombus here is not a square, and a rectangle is not a square).<br>Which shape goes in the region that is ${desc}?`, opts, a,
      exp: `Check each shape against both rules:<br>${Object.keys(QUADS).map(s => `${s}: B ${QUADS[s][pb] ? '✔' : '✘'}, C ${QUADS[s][pc] ? '✔' : '✘'}`).join('<br>')}<br>The region needs B ${region === 'cOnly' ? '✘' : '✔'} and C ${region === 'bOnly' ? '✘' : '✔'}, so the answer is <b>${ans}</b>.` };
  } },
];

export const retestThinking = [
  { key: 'spendCombo', topic: 'Finding Procedures', diff: 3, make(r) {
    const [pa, pb] = sample(r, [45, 60, 75, 80, 90, 120, 125, 150, 180], 2); const [A, B] = pick(r, [['drink', 'sandwich'], ['pencil', 'notebook'], ['sticker sheet', 'comic'], ['juice', 'muffin']]);
    const x = int(r, 1, 8), y = int(r, x + 1, 15); const T = pa * x + pb * y;
    const sols = []; for (let i = 1; i * pa < T; i++) { const rest = T - i * pa; if (rest % pb === 0 && rest / pb > i) sols.push([i, rest / pb]); }
    if (sols.length !== 1) return null; const allS = []; for (let i = 1; i * pa < T; i++) { const rest = T - i * pa; if (rest % pb === 0) allS.push(i + rest / pb); }
    const name = pick(r, NAMES);
    const { opts, a } = sortedOptions(r, x + y, [...allS.filter(v => v !== x + y), x + y + 1, x + y - 1, y, x + y + 2], N4);
    if (!opts) return null;
    return { q: `${name} buys some ${A}s at ${money(pa / 100)} each and some ${B}s at ${money(pb / 100)} each, spending exactly ${money(T / 100)}.<br>${name} buys at least one ${A}, and buys <b>more ${B}s than ${A}s</b>.<br>How many items does ${name} buy altogether?`, opts, a,
      exp: `Work in cents: ${pa} × (${A}s) + ${pb} × (${B}s) = ${T}.<br>Try 1, 2, 3 … ${A}s and see if the rest divides exactly by ${pb}:<br>${allS.length > 1 ? 'More than one combination adds up, but ' : ''}only ${x} ${A}${x > 1 ? 's' : ''} and ${y} ${B}s has more ${B}s than ${A}s.<br>Total: ${x} + ${y} = <b>${x + y}</b>.` };
  } },
  { key: 'breakEven', topic: 'Finding Procedures', diff: 3, make(r) {
    const N = pick(r, [500, 1000, 2000]), p = int(r, 120, 480), F = pick(r, [10, 15, 20, 25, 30, 40, 50]); const extra = 2 * F * 100 / N; if (!Number.isInteger(extra)) return null; // cents per share
    const v = p + extra; const name = pick(r, NAMES);
    const { opts, a } = sortedOptions(r, v, [...new Set([p, p + extra / 2, p + extra * 2, v + extra / 2, v + 10, p - 10, p + 2 * F])].filter(x => Number.isInteger(x) && Math.abs(x - v) >= 3), N4, x => money(x / 100));
    if (!opts || opts.some(o => Math.abs(parseFloat(o.slice(1)) * 100 - v) < 3 && o !== money(v / 100))) return null;
    return { q: `${name} buys ${sp(N)} shares at ${money(p / 100)} each. There is a $${F} fee to buy them and another $${F} fee to sell them.<br>What price per share must ${name} sell at to get back exactly what was spent, including both fees?`, opts, a,
      exp: `Spent: ${sp(N)} × ${money(p / 100)} = $${sp(N * p / 100)}, plus $${F} buying fee = $${sp(N * p / 100 + F)}.<br>Selling costs another $${F}, so the sale must bring in $${sp(N * p / 100 + 2 * F)}.<br>Per share: $${sp(N * p / 100 + 2 * F)} ÷ ${sp(N)} = <b>${money(v / 100)}</b>.<br><b>Trap:</b> don't forget the selling fee.` };
  } },
  { key: 'areaChange', topic: 'Finding Procedures', diff: 3, make(r) {
    const up = pick(r, [10, 20, 25, 50]), down = pick(r, [10, 20, 25, 40, 50]); const v = (100 + up) * (100 - down) / 100; if (!Number.isInteger(v) || v === 100 + up - down) return null;
    const shape = pick(r, [['rectangle', 'length', 'width'], ['triangle', 'base', 'height']]); const first = pick(r, [0, 1]);
    const sides = first ? [shape[1], shape[2]] : [shape[2], shape[1]];
    const { opts, a } = sortedOptions(r, v, [100 + up - down, 100, 100 - down, 100 + up].filter(x => x !== v), N4, x => `${x}%`);
    if (!opts) return null;
    return { q: `A ${shape[0]}'s ${sides[0]} is <b>increased by ${up}%</b> and its ${sides[1]} is <b>decreased by ${down}%</b>.<br>The new ${shape[0]}'s area is what percentage of the original area?`, opts, a,
      exp: `Areas multiply, so multiply the changes: ${100 + up}% × ${100 - down}% = ${(100 + up) / 100} × ${(100 - down) / 100} = ${v / 100}.<br>That is <b>${v}%</b> of the original area.<br><b>Trap:</b> adding the changes (${up} − ${down}) gives ${100 + up - down}%, which is wrong.` };
  } },
  { key: 'avgCount', topic: 'Relevant Selection', diff: 2, make(r) {
    const [A, B] = sample(r, NAMES, 2); const la = pick(r, [10, 12, 15, 20, 25, 30]), lb = pick(r, [10, 12, 15, 20, 25, 30]); if (la === lb) return null;
    const na = int(r, 4, 14), nb = int(r, 4, 14); if (na === nb) return null; const ta = la * na, tb = lb * nb;
    const more = na > nb ? A : B, d = Math.abs(na - nb); const fmt = (w, k) => `${w}, ${k} more`;
    const wrongs = [fmt(more === A ? B : A, d), fmt(more, d + 1), fmt(more === A ? B : A, Math.abs(ta - tb) % 9 + 1)];
    if (d > 1) wrongs.push(fmt(more, d - 1));
    const { opts, a } = options(r, fmt(more, d), wrongs, N4); if (!opts) return null;
    const what = pick(r, [['music lessons', 'lesson'], ['swimming sessions', 'session'], ['dentist appointments', 'appointment']]);
    return { q: `Last term, ${A} spent ${ta} minutes in total at ${what[0]}, and ${B} spent ${tb} minutes.<br>${A}'s ${what[1]}s were ${la} minutes long on average. ${B}'s were ${lb} minutes long on average.<br>Who had more ${what[1]}s, and how many more?`, opts, a,
      exp: `Number of ${what[1]}s = total time ÷ average length.<br>${A}: ${ta} ÷ ${la} = ${na}. ${B}: ${tb} ÷ ${lb} = ${nb}.<br><b>${fmt(more, d)}</b>.<br><b>Trap:</b> more total time does not always mean more ${what[1]}s.` };
  } },
];

export default retestMaths;
