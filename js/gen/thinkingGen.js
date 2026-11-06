// Thinking Skills (problem solving) question generators. 4 options each.
import { int, pick, sample, shuffle, options, sortedOptions, money, lcm, NAMES, DAYS, fmtClock, fmtDur, ordinal } from './util.js';

const N4 = 4;
const ord = ordinal;
const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default [
  { key: 'order', topic: 'Finding Procedures', diff: 2, make(r) {
    const names = sample(r, NAMES, 5); // true finishing order
    const rel = [];
    for (let i = 0; i < 4; i++) rel.push(r() < 0.5 ? `${names[i]} finished before ${names[i + 1]}.` : `${names[i + 1]} finished after ${names[i]}.`);
    const pos = int(r, 2, 4);
    const { opts, a } = options(r, names[pos - 1], names.filter((_, i) => i !== pos - 1), N4);
    return { q: `Five friends ran a race with no ties.<br>${shuffle(r, rel).join('<br>')}<br><br>Who finished <b>${ord(pos)}</b>?`, opts, a,
      exp: `Link the clues into one chain (write it down!):<br>${names.join(' → ')}<br>So ${ord(pos)} place is <b>${names[pos - 1]}</b>.<br><b>Strategy:</b> start with a clue, then attach the others to the front or back of your chain.` };
  } },
  { key: 'backsched', topic: 'Finding Procedures', diff: 2, make(r) {
    const nm = pick(r, NAMES);
    const steps = sample(r, ['tidy the room', 'practise piano', 'walk the dog', 'finish homework', 'pack the school bag', 'help cook lunch'], 3).map(n => [n, int(r, 3, 12) * 5]);
    const ready = int(r, 9, 16) * 60 + pick(r, [0, 15, 30, 45]); const total = steps.reduce((s2, x) => s2 + x[1], 0); const v = fmtClock(ready - total);
    const { opts, a } = options(r, v, [fmtClock(ready - total + steps[2][1]), fmtClock(ready - total - 15), fmtClock(ready - total + 30), fmtClock(ready - total + 10)], N4);
    return { q: `${nm} must ${steps.map(([n, m]) => `${n} (${m} min)`).join(', ')}, one after another with no breaks. Everything must be finished by <b>${fmtClock(ready)}</b>.<br><br>What is the <b>latest</b> time ${nm} can start?`, opts, a,
      exp: `Total time: ${steps.map(x => x[1]).join(' + ')} = ${total} min (${fmtDur(total)}).<br><b>Work backwards</b> from ${fmtClock(ready)}: ${fmtClock(ready)} − ${fmtDur(total)} = <b>${v}</b>.` };
  } },
  { key: 'lcmday', topic: 'Finding Procedures', diff: 3, make(r) {
    const [x, y] = pick(r, [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [6, 8]]); const d0 = int(r, 0, 6); const L2 = lcm(x, y); const v = DAYS[(d0 + L2) % 7];
    const { opts, a } = options(r, v, [DAYS[(d0 + x * y) % 7], DAYS[(d0 + L2 + 1) % 7], DAYS[(d0 + x + y) % 7], DAYS[(d0 + L2 + 6) % 7]], N4);
    return { q: `A plant is watered every ${x} days and fed every ${y} days. Today is <b>${DAYS[d0]}</b> and both happened today.<br><br>On which day will both next happen together?`, opts, a,
      exp: `Both happen together every <b>lowest common multiple</b> of ${x} and ${y} = ${L2} days.<br>${L2} days = ${Math.floor(L2 / 7)} week${Math.floor(L2 / 7) === 1 ? '' : 's'} + ${L2 % 7} day${L2 % 7 === 1 ? '' : 's'}. ${DAYS[d0]} + ${L2 % 7} → <b>${v}</b>.${x * y !== L2 ? `<br><b>Trap:</b> ${x} × ${y} = ${x * y} is a common multiple, but not the lowest.` : ''}` };
  } },
  { key: 'tickets', topic: 'Finding Procedures', diff: 2, make(r) {
    const ad = int(r, 12, 25), ch = int(r, 5, ad - 3), na = int(r, 1, 3), nc = int(r, 2, 6); const tot = na * ad + nc * ch;
    const { opts, a } = sortedOptions(r, nc, [nc + 1, nc - 1 || nc + 2, Math.round(tot / ch) === nc ? nc + 3 : Math.round(tot / ch)], N4);
    return { q: `Tickets cost $${ad} for adults and $${ch} for children. A family with ${na} adult${na > 1 ? 's' : ''} paid $${tot} in total.<br><br>How many children were there?`, opts, a,
      exp: `Adults: ${na} × $${ad} = $${na * ad}.<br>Left for children: $${tot} − $${na * ad} = $${nc * ch}.<br>$${nc * ch} ÷ $${ch} = <b>${nc} children</b>.` };
  } },
  { key: 'swap', topic: 'Finding Procedures', diff: 3, make(r) {
    const [A, B, C] = pick(r, [['apples', 'oranges', 'melons'], ['marbles', 'stickers', 'cards'], ['shells', 'stones', 'crystals']]);
    const a1 = int(r, 2, 5), b1 = int(r, 2, 6); const b2 = int(r, 2, 4); const k = int(r, 2, 4);
    const v = (k * b2 * a1) / b1; if (!Number.isInteger(v) || a1 === b1) return null;
    const { opts, a } = sortedOptions(r, v, [k * b2, (k * b2 * b1) / a1 % 1 ? v + 2 : (k * b2 * b1) / a1, v + a1], N4);
    return { q: `${a1} ${A} are worth the same as ${b1} ${B}. ${b2} ${B} are worth the same as 1 of the ${C}.<br><br>How many ${A} are worth the same as ${k} ${C}?`, opts, a,
      exp: `Change everything into ${B}:<br>${k} ${C} = ${k} × ${b2} = ${k * b2} ${B}.<br>${b1} ${B} = ${a1} ${A}, so ${k * b2} ${B} = ${k * b2} ÷ ${b1} × ${a1} = <b>${v} ${A}</b>.<br><b>Strategy:</b> convert everything into ONE item, step by step.` };
  } },
  { key: 'cheapest', topic: 'Relevant Selection', diff: 3, make(r) {
    const box = pick(r, [4, 5, 6]); const boxP = int(r, box * 3, box * 5 - 2) / 2 + 0.5; const single = Math.round((boxP / box + int(r, 2, 8) / 10) * 2) / 2; const need = int(r, box + 2, box * 3 - 1);
    let best = Infinity, how = '';
    const all = [];
    for (let b = 0; b <= Math.ceil(need / box); b++) { const s = Math.max(0, need - b * box); const c = Math.round((b * boxP + s * single) * 100) / 100; all.push([c, b, s]); if (c < best) { best = c; how = `${b} box${b === 1 ? '' : 'es'} + ${s} single${s === 1 ? '' : 's'}`; } }
    const others = all.map(x => x[0]).filter(c => c !== best);
    const { opts, a } = sortedOptions(r, best, [...others, best + single], N4, money);
    return { q: `Ella needs <b>at least ${need}</b> cupcakes. A shop sells boxes of ${box} for ${money(boxP)}, or single cupcakes for ${money(single)} each.<br><br>What is the cheapest amount she can pay?`, opts, a,
      exp: `Try every combination:<br>${all.map(([c, b, s]) => `${b} box${b === 1 ? '' : 'es'} + ${s} single${s === 1 ? '' : 's'} = ${money(c)}${c === best ? ' ✔' : ''}`).join('<br>')}<br>Cheapest: <b>${money(best)}</b> (${how}).<br><b>Strategy:</b> list all options in a table. Don't stop at the first one.` };
  } },
  { key: 'recipe', topic: 'Relevant Selection', diff: 1, make(r) {
    const base = pick(r, [2, 4, 6]); const target = pick(r, [3, 5, 8, 9, 10, 12].filter(x => x !== base)); const ing = pick(r, [['flour', 'g', 50], ['milk', 'mL', 25], ['sugar', 'g', 20], ['oats', 'g', 30]]);
    const per = ing[2] * int(r, 1, 4); const amt = per * base; const v = per * target;
    const { opts, a } = sortedOptions(r, v, [amt + (target - base), amt * target, amt + per], N4, x => `${x} ${ing[1]}`);
    return { q: `A recipe for ${base} people uses ${amt} ${ing[1]} of ${ing[0]}, 3 eggs, a pinch of salt and 1 teaspoon of vanilla.<br><br>How much <b>${ing[0]}</b> is needed for ${target} people?`, opts, a,
      exp: `Ignore the eggs, salt and vanilla. Only ${ing[0]} matters.<br>${base} people → ${amt} ${ing[1]}, so 1 person → ${per} ${ing[1]}.<br>${target} people → ${target} × ${per} = <b>${v} ${ing[1]}</b>.` };
  } },
  { key: 'traindeadline', topic: 'Relevant Selection', diff: 3, make(r) {
    const trip = int(r, 5, 15) * 5 + 30; const dl = int(r, 12, 17) * 60 + pick(r, [0, 30]); const latestStart = dl - trip; const v = Math.floor(latestStart / 60) * 60;
    const { opts, a } = options(r, fmtClock(v), [fmtClock(v + 60), fmtClock(latestStart), fmtClock(v - 60)], N4);
    return { q: `A train trip takes ${Math.floor(trip / 60)} h ${trip % 60} min. Trains leave every hour <b>on the hour</b>. Ray must arrive by <b>${fmtClock(dl)}</b> and wants to leave as late as possible.<br><br>Which train should he catch?`, opts, a,
      exp: `Latest he could leave: ${fmtClock(dl)} − ${trip} min = ${fmtClock(latestStart)}.<br>Trains only leave on the hour, so the latest one at or before ${fmtClock(latestStart)} is <b>${fmtClock(v)}</b> (arrives ${fmtClock(v + trip)}).${latestStart % 60 ? `<br>${fmtClock(latestStart)} isn't a real departure time. The ${fmtClock(v + 60)} train would arrive ${fmtClock(v + 60 + trip)}, which is too late.` : ''}` };
  } },
  { key: 'lettergap', topic: 'Identifying Similarities and Patterns', diff: 2, make(r) {
    const s0 = int(r, 0, 4), g0 = int(r, 1, 2), inc = pick(r, [0, 1]); const idx = [s0]; let g = g0; for (let i = 0; i < 4; i++) { idx.push(idx[i] + g); g += inc; } const nx = idx[4] + g;
    if (nx > 25) return null;
    const v = L[nx];
    const { opts, a } = options(r, v, [L[nx + 1], L[nx - 1], L[idx[4] + (idx[4] - idx[3])] === v ? L[nx + 2] : L[idx[4] + (idx[4] - idx[3])]].filter(Boolean), N4);
    return { q: `What letter comes next? <b>${idx.map(i => L[i]).join(', ')}, ?</b>`, opts, a,
      exp: `Change letters to positions: ${idx.map(i => `${L[i]}=${i + 1}`).join(', ')}.<br>Gaps: ${idx.slice(1).map((x, i) => `+${x - idx[i]}`).join(', ')} → next gap +${g}.<br>${idx[4] + 1} + ${g} = ${nx + 1} = <b>${v}</b>.` };
  } },
  { key: 'shiftcode', topic: 'Identifying Similarities and Patterns', diff: 2, make(r) {
    const k = pick(r, [1, 2, 3, -1, -2]); const enc = w => w.split('').map(c => L[(L.indexOf(c) + k + 26) % 26]).join('');
    const [w1, w2] = sample(r, ['CAT', 'DOG', 'SUN', 'MAP', 'FISH', 'BIRD', 'STAR', 'MOON', 'TREE', 'LAMP', 'BOOK'], 2);
    const v = enc(w2); const wrongShift = w2.split('').map(c => L[(L.indexOf(c) - k + 26) % 26]).join('');
    const { opts, a } = options(r, v, [wrongShift, w2.split('').map(c => L[(L.indexOf(c) + k + 27) % 26]).join(''), v.split('').reverse().join('')], N4);
    return { q: `In a secret code, <b>${w1}</b> is written as <b>${enc(w1)}</b>. How is <b>${w2}</b> written in the same code?`, opts, a,
      exp: `Compare letter by letter: ${w1[0]} → ${enc(w1)[0]} is ${Math.abs(k)} place${Math.abs(k) > 1 ? 's' : ''} ${k > 0 ? 'forward' : 'back'} in the alphabet (check the other letters too).<br>Apply the same shift to ${w2}: <b>${v}</b>.` };
  } },
  { key: 'rowrule', topic: 'Identifying Similarities and Patterns', diff: 3, make(r) {
    const rule = pick(r, [{ f: (a, b) => (a + b) * 2, t: '(first + last) × 2' }, { f: (a, b) => a * b - 1, t: 'first × last − 1' }, { f: (a, b) => a * b + a, t: 'first × last + first' }, { f: (a, b) => 2 * a + b, t: '2 × first + last' }]);
    const rows = Array.from({ length: 4 }, () => [int(r, 1, 9), int(r, 1, 9)]); const [qa, qb] = rows[3]; const v = rule.f(qa, qb);
    const { opts, a } = sortedOptions(r, v, [qa + qb, qa * qb, v + 2], N4);
    return { q: `Each group follows the same rule:<br>${rows.slice(0, 3).map(([x, y]) => `<b>(${x}, ${rule.f(x, y)}, ${y})</b>`).join(' &nbsp; ')}<br><br>What is the missing number in <b>(${qa}, ?, ${qb})</b>?`, opts, a,
      exp: `Rule: middle = <b>${rule.t}</b>.<br>${rows.slice(0, 3).map(([x, y]) => `(${x}, ${y}) → ${rule.f(x, y)} ✔`).join('<br>')}<br>So (${qa}, ${qb}) → <b>${v}</b>.<br><b>Strategy:</b> try +, ×, then combinations, and test your rule on every group.` };
  } },
  { key: 'oddone', topic: 'Identifying Similarities and Patterns', diff: 1, make(r) {
    const type = pick(r, ['mult', 'square', 'even']); let good, odd, why;
    if (type === 'mult') { const k = pick(r, [3, 4, 6, 7, 9]); good = sample(r, Array.from({ length: 12 }, (_, i) => k * (i + 2)), 3); do { odd = int(r, k * 2, k * 13); } while (odd % k === 0); why = `are all multiples of ${k}`; }
    else if (type === 'square') { good = sample(r, [16, 25, 36, 49, 64, 81, 100], 3); odd = pick(r, [18, 24, 32, 45, 50, 60, 72].filter(x => !good.includes(x))); why = 'are all square numbers (a number times itself)'; }
    else { good = sample(r, [12, 18, 24, 30, 36, 42, 48, 54], 3); odd = pick(r, [15, 21, 27, 33, 45]); why = 'are all multiples of 6'; }
    const { opts, a } = sortedOptions(r, odd, good, N4);
    return { q: `Which number is the <b>odd one out</b>?`, opts, a, exp: `${good.join(', ')} ${why}.<br><b>${odd}</b> is not.` };
  } },
  { key: 'fold', topic: 'Spatial Reasoning', diff: 2, make(r) {
    const f = int(r, 1, 3), p = int(r, 1, 3); const v = p * 2 ** f;
    const { opts, a } = sortedOptions(r, v, [p * f * 2 === v ? p * 2 ** f * 2 : p * f * 2, p * (f + 1), v * 2, p], N4);
    return { q: `A square of paper is folded in half ${f === 1 ? 'once' : `${f} times`}. Then ${p} hole${p > 1 ? 's are' : ' is'} punched through all the layers.<br><br>How many holes are there when the paper is unfolded?`, opts, a,
      exp: `Each fold doubles the layers: ${Array.from({ length: f + 1 }, (_, i) => 2 ** i).join(' → ')} layers.<br>Each punch goes through ${2 ** f} layers: ${p} × ${2 ** f} = <b>${v} holes</b>.` };
  } },
  { key: 'stack', topic: 'Spatial Reasoning', diff: 1, make(r) {
    const n = int(r, 3, 5); const v = Array.from({ length: n }, (_, i) => (i + 1) ** 2).reduce((s, x) => s + x, 0);
    const { opts, a } = sortedOptions(r, v, [n ** 3, v - n, n * (n + 1) / 2 * n === v ? v + 1 : n * (n + 1) / 2 * n, v + 1], N4);
    return { q: `A pyramid of cubes has a ${n} × ${n} bottom layer, then ${n - 1} × ${n - 1}, and so on up to 1 cube on top.<br><br>How many cubes are there altogether?`, opts, a,
      exp: `Add each layer: ${Array.from({ length: n }, (_, i) => `${n - i}×${n - i}`).join(' + ')} = ${Array.from({ length: n }, (_, i) => (n - i) ** 2).join(' + ')} = <b>${v}</b>.<br><b>Tip:</b> count layer by layer, including the hidden cubes.` };
  } },
];
