// Whole-number, algebra, problem-solving and position generators added from a review of exam-style
// question types (repeated subtraction, hidden digits, primes, price ranges, fraction chains, symbol
// equations, unit chains, circle patterns, working backwards, two equations, best buy, ratios,
// houses on a line, compass walks, robot turns). Original questions.
// Every answer is computed here and re-solved independently in tools/audit-generators.mjs.
import { int, pick, shuffle, sample, options, sortedOptions, gcd, NAMES, dollars } from './util.js';

const N5 = 5;
const frac = (n, d) => { const g = gcd(n, d); return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`; };
const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const DIRS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];

export default [
  // ---------------- Whole Numbers ----------------
  { key: 'repSub', topic: 'Whole Numbers', diff: 2, make(r) {
    const k = int(r, 6, 11); const rems = sample(r, Array.from({ length: k }, (_, i) => i), 5);
    const nums = rems.map(x => x + k * int(r, 2, 8)); if (new Set(nums).size < 5) return null;
    const best = nums[rems.indexOf(Math.max(...rems))]; const name = pick(r, NAMES);
    const opts = shuffle(r, nums.map(String)); const a = opts.indexOf(String(best));
    return { q: `${name} starts with each of these numbers in turn and keeps subtracting ${k}, stopping just before the answer would go below zero.<br><b>${nums.join(' &nbsp; ')}</b><br>Which starting number leaves the <b>largest</b> number at the end?`, opts, a,
      exp: `Subtracting ${k} again and again until you can't is the same as dividing by ${k} and keeping the <b>remainder</b>.<br>${nums.map(n => `${n} = ${k} × ${Math.floor(n / k)} + <b>${n % k}</b>`).join('<br>')}<br>The largest remainder is ${Math.max(...rems)}, from <b>${best}</b>.<br><b>Trap:</b> the biggest starting number doesn't always leave the most.` };
  } },
  { key: 'primeRem', topic: 'Whole Numbers', diff: 3, make(r) {
    const lo = pick(r, [10, 20, 30, 40, 50, 60]), hi = lo + 20, m = pick(r, [10, 10, 6, 5]);
    const ps = []; for (let n = lo + 1; n < hi; n++) if (isPrime(n)) ps.push(n);
    const set = arr => [...new Set(arr.map(n => n % m))].sort((a, b) => a - b).join(', ');
    const right = set(ps); const odds = []; for (let n = lo + 1; n < hi; n++) if (n % 2 && !isPrime(n)) odds.push(n);
    const wrong = [set([...ps, ...odds]), set(ps.slice(1)), set([...ps, lo + 2]), set(ps.slice(0, -1)), set([...ps, ...odds.slice(0, 1)]), set([...ps.map(p => p + 1)])];
    const { opts, a } = options(r, right, wrong, N5); if (!opts) return null;
    return { q: `Find all the <b>prime numbers</b> between ${lo} and ${hi}. Each one is divided by ${m}. Which list shows all the different remainders?`, opts, a,
      exp: `A prime number has exactly two factors: 1 and itself.<br>Primes between ${lo} and ${hi}: <b>${ps.join(', ')}</b>.${odds.length ? ` (${odds.join(', ')} ${odds.length > 1 ? 'are' : 'is'} odd but not prime.)` : ''}<br>${ps.map(p => `${p} ÷ ${m} = ${Math.floor(p / m)} r <b>${p % m}</b>`).join('<br>')}<br>Different remainders: <b>${right}</b>.` };
  } },

  // ---------------- Patterns and algebra ----------------
  { key: 'seqDigit', topic: 'Patterns', diff: 3, make(r) {
    const d = int(r, 3, 9), a0 = int(r, 1, 9), len = 9; const terms = Array.from({ length: len }, (_, i) => a0 + i * d);
    const digits = [...'0123456789'].filter(c => { const hits = terms.filter(t => String(t).includes(c)).length; return hits >= 2 && hits <= len - 3; });
    if (!digits.length) return null; const D = pick(r, digits);
    const shown = terms.map(t => String(t).replaceAll(D, '☺'));
    // the digit must be the only one that rebuilds an even step
    const fits = [...'0123456789'].filter(c => { const v = shown.map(s => s.replaceAll('☺', c)); if (v.some(s => /^0\d/.test(s))) return false; const n = v.map(Number); return n.every((x, i) => i === 0 || x - n[i - 1] === n[1] - n[0]); });
    if (fits.length !== 1) return null;
    const { opts, a } = sortedOptions(r, +D, [+D + 1, +D - 1, +D + 2, d, (a0 + 1) % 10], N5);
    return { q: `In this number pattern, one digit has been replaced by ☺ <b>every time</b> it appears:<br><b>${shown.join(', ')}, …</b><br>Which digit does ☺ stand for?`, opts, a,
      exp: `Look for two terms next to each other with no ☺ to find the step: the pattern goes up by <b>${d}</b> each time.<br>Rebuild the full pattern: ${terms.join(', ')}.<br>Every ☺ is a <b>${D}</b>. Check another term to be sure, e.g. ${shown.find(s => s.includes('☺'))} → ${terms[shown.findIndex(s => s.includes('☺'))]}.` };
  } },
  { key: 'symEq', topic: 'Patterns', diff: 2, make(r) {
    const s = int(r, 3, 9), t = int(r, 2, 9); if (s === t) return null; const a = int(r, 3, 20), c = pick(r, [2, 3, 4, 6]);
    if ((s * t) % c) return null; const b = s * s - a, d = s * t / c; if (b < 1) return null;
    const { opts, a: ai } = sortedOptions(r, t, [s, d, d * c / s + 1, Math.round(d / c), t * 2], N5);
    return { q: `■ always stands for the same whole number, and △ stands for a different whole number.<br>■ × ■ − ${a} = ${b}<br>(■ × △) ÷ ${c} = ${d}<br>What number is △?`, opts, a: ai,
      exp: `First equation: ■ × ■ = ${b} + ${a} = ${s * s}, so ■ = ${s} (because ${s} × ${s} = ${s * s}).<br>Second equation, working backwards: ■ × △ = ${d} × ${c} = ${s * t}.<br>△ = ${s * t} ÷ ${s} = <b>${t}</b>.<br>Check: (${s} × ${t}) ÷ ${c} = ${d} ✔` };
  } },
  { key: 'circlePat', topic: 'Patterns', diff: 3, make(r) {
    const k = pick(r, [2, 3, 4]); const tri = () => { const t = int(r, 3, 20), ri = int(r, 2, 15); return [t, k * (t + ri), ri]; };
    const c1 = tri(), c2 = tri(), [t3, ans, r3] = tri(); if (c1[0] === c2[0] || c1[2] === c2[2]) return null;
    // reject if another simple rule also fits both examples
    const rules = []; for (let j = 0; j <= 12; j++) rules.push((x, y) => x * y + j, (x, y) => x * y - j, (x, y) => x * j + y, (x, y) => y * j + x, (x, y) => x + y + j);
    for (const f of rules) if (f(c1[0], c1[2]) === c1[1] && f(c2[0], c2[2]) === c2[1] && f(t3, r3) !== ans) return null;
    const circ = ([t, b, ri], x) => `<g transform="translate(${x},0)"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#333" stroke-width="2"/><line x1="4" y1="50" x2="96" y2="50" stroke="#333" stroke-width="2"/><line x1="50" y1="50" x2="50" y2="96" stroke="#333" stroke-width="2"/><text x="50" y="36" text-anchor="middle" font-size="17">${t}</text><text x="28" y="78" text-anchor="middle" font-size="17">${b}</text><text x="72" y="78" text-anchor="middle" font-size="17">${ri}</text></g>`;
    const svg = `<svg viewBox="0 0 340 100" width="340" class="qsvg" role="img" aria-label="three circles">${circ(c1, 0)}${circ(c2, 120)}${circ([t3, '?', r3], 240)}</svg>`;
    const { opts, a } = sortedOptions(r, ans, [t3 * r3, t3 + r3 + k, (t3 + r3) * (k + 1), t3 * k + r3, ans + k], N5);
    return { q: `The numbers in each circle follow the same rule.${svg}What is the missing number?`, opts, a,
      exp: `Compare the bottom-left number with the other two.<br>${c1[0]} + ${c1[2]} = ${c1[0] + c1[2]}, and ${c1[1]} = ${k} × ${c1[0] + c1[2]}.<br>${c2[0]} + ${c2[2]} = ${c2[0] + c2[2]}, and ${c2[1]} = ${k} × ${c2[0] + c2[2]}.<br>Rule: add the top and right numbers, then multiply by ${k}.<br>${k} × (${t3} + ${r3}) = <b>${ans}</b>.<br><b>Tip:</b> test a rule on <b>every</b> circle before trusting it.` };
  } },

  // ---------------- Decimals, fractions, capacity ----------------
  { key: 'priceRange', topic: 'Decimals', diff: 2, make(r) {
    const c1 = int(r, 40, 70) * 5, c2 = c1 + int(r, 4, 12) * 5, a1 = c2 + int(r, 30, 80) * 5, a2 = a1 + int(r, 4, 14) * 5; const big = r() < 0.6;
    const v = big ? a2 - c1 : a1 - c2; const f = x => `$${(x / 100).toFixed(2)}`;
    const cand = [...new Set([a2 - c2, a1 - c1, big ? a1 - c2 : a2 - c1, v + 5, v - 5, a2 - c1 + 10, a1 - c2 - 10].filter(x => x > 0 && x !== v))];
    if (cand.length < 4) return null;
    const opts = [v, ...sample(r, cand, 4)].sort((x, y) => x - y).map(f); const a = opts.indexOf(f(v)); // prices in cents, shown in dollars
    return { q: `An adult ticket must cost between ${f(a1)} and ${f(a2)}. A child ticket must cost between ${f(c1)} and ${f(c2)}. What is the <b>${big ? 'greatest' : 'smallest'}</b> possible difference between the price of an adult ticket and a child ticket?`, opts, a,
      exp: big ? `For the biggest gap, take the <b>most expensive</b> adult ticket and the <b>cheapest</b> child ticket:<br>${f(a2)} − ${f(c1)} = <b>${f(v)}</b>.` : `For the smallest gap, take the <b>cheapest</b> adult ticket and the <b>most expensive</b> child ticket:<br>${f(a1)} − ${f(c2)} = <b>${f(v)}</b>.` };
  } },
  { key: 'fracChain', topic: 'Fractions', diff: 2, make(r) {
    const [n1, d1] = pick(r, [[3, 4], [2, 3], [3, 5], [4, 5], [5, 6]]), [n2, d2] = pick(r, [[3, 4], [2, 3], [4, 5], [1, 2], [5, 6]]);
    const L = d1 * d2 * int(r, 3, 12) * 5; if (L > 1200) return null; const R = L * n1 / d1, S = R * n2 / d2;
    const item = pick(r, [['smoothie', 'mL'], ['bag of rice', 'g'], ['bottle of juice', 'mL']]); const ask = pick(r, ['small', 'small', 'regular']); const v = ask === 'small' ? S : R;
    const { opts, a } = sortedOptions(r, v, [L * n2 / d2, ask === 'small' ? R : S, L - R, L * n1 / d1 * n2, L - S].filter(x => Number.isInteger(x) && x > 0), N5, x => `${x} ${item[1]}`);
    return { q: `A shop sells a ${item[0]} in three sizes.<br>• A large holds ${L} ${item[1]}.<br>• A regular holds ${n1}/${d1} of a large.<br>• A small holds ${n2}/${d2} of a regular.<br>How much does a <b>${ask}</b> hold?`, opts, a,
      exp: `Regular = ${n1}/${d1} of ${L}: ${L} ÷ ${d1} = ${L / d1}, × ${n1} = ${R} ${item[1]}.${ask === 'small' ? `<br>Small = ${n2}/${d2} of the <b>regular</b> (not the large): ${R} ÷ ${d2} = ${R / d2}, × ${n2} = ${S} ${item[1]}.` : ''}<br>Answer: <b>${v} ${item[1]}</b>.` };
  } },
  { key: 'unitChain', topic: 'Volume and Capacity', diff: 3, make(r) {
    const [u1, u2, u3, u4] = pick(r, [['zip', 'zop', 'zap', 'zoop'], ['blip', 'blop', 'bloop', 'blam'], ['tick', 'tock', 'tack', 'tuck']]);
    const x = int(r, 2, 6), y = int(r, 2, 4), z = int(r, 2, 6); const v = x * y * z;
    const part = { 2: 'half', 3: 'one-third', 4: 'one-quarter' }[y];
    const l2 = r() < 0.5 ? `1 ${u2} is ${part === 'half' ? 'half' : part} of a ${u3}` : `${y} ${u2}s equal 1 ${u3}`;
    const { opts, a } = sortedOptions(r, v, [x + y + z, x * z, x * y + z, x * z * (y === 2 ? 1 : 2), v * 2], N5);
    return { q: `On a made-up planet, capacity is measured in ${u1}s, ${u2}s, ${u3}s and ${u4}s.<br>• ${x} ${u1}s equal 1 ${u2}.<br>• ${l2}.<br>• ${z} ${u3}s equal 1 ${u4}.<br>How many ${u1}s equal 1 ${u4}?`, opts, a,
      exp: `Build up one step at a time:<br>1 ${u3} = ${y} ${u2}s = ${y} × ${x} = ${x * y} ${u1}s.<br>1 ${u4} = ${z} ${u3}s = ${z} × ${x * y} = <b>${v} ${u1}s</b>.<br><b>Trap:</b> if 1 ${u2} is ${part} of a ${u3}, then a ${u3} is the <b>bigger</b> unit: it holds ${y} ${u2}s.` };
  } },

  // ---------------- Problem Solving ----------------
  { key: 'halfChain', topic: 'Problem Solving', diff: 2, make(r) {
    const u = int(r, 10, 60) * 2, fixed = int(r, 4, 20) * 5; const total = 7 * u + fixed; const ask = pick(r, ['Monday', 'Tuesday']); const v = ask === 'Monday' ? 4 * u : 2 * u;
    const { opts, a } = sortedOptions(r, v, [u, ask === 'Monday' ? 2 * u : 4 * u, Math.round((total - fixed) / 3), total - fixed - u, 4 * u + fixed], N5);
    return { q: `A cinema sold ${total} tickets from Monday to Thursday.<br>• On Tuesday it sold half as many as on Monday.<br>• On Wednesday it sold half as many as on Tuesday.<br>• On Thursday it sold ${fixed} tickets.<br>How many tickets were sold on <b>${ask}</b>?`, opts, a,
      exp: `Use units. Wednesday = 1 unit, Tuesday = 2 units, Monday = 4 units.<br>4 + 2 + 1 = 7 units, plus ${fixed} on Thursday = ${total}.<br>7 units = ${total} − ${fixed} = ${7 * u}, so 1 unit = ${u}.<br>${ask} = ${ask === 'Monday' ? 4 : 2} × ${u} = <b>${v}</b>.` };
  } },
  { key: 'timesCmp', topic: 'Problem Solving', diff: 3, make(r) {
    const k = int(r, 2, 6), m = int(r, 2, 6); if (k === m || gcd(k, m) !== 1) return null; const [A, B, C] = sample(r, NAMES, 3);
    const v = frac(k, m); const opts0 = [v, frac(m, k), `${k * m}`, `${k + m}`, frac(k, k + m), `${k}`].filter((x, i, s) => s.indexOf(x) === i).slice(0, 5);
    const { opts, a } = options(r, v, opts0.filter(x => x !== v), N5); if (!opts) return null;
    return { q: `${A}, ${B} and ${C} each think of a different number.<br>• ${A}'s number is ${k} times ${C}'s number.<br>• ${C}'s number is 1/${m} of ${B}'s number.<br>${A}'s number is how many times ${B}'s number?`, opts, a,
      exp: `Try a number that makes it easy: let ${B}'s number be ${m * 6}.<br>${C}'s = 1/${m} of ${m * 6} = 6. ${A}'s = ${k} × 6 = ${k * 6}.<br>${A} ÷ ${B} = ${k * 6} ÷ ${m * 6} = <b>${v}</b>.<br>In one step: ${A} = ${k} × (1/${m} of ${B}) = ${k}/${m} of ${B}.` };
  } },
  { key: 'bestBuy', topic: 'Problem Solving', diff: 3, make(r) {
    const p1 = pick(r, [4, 5, 6, 8]), x1 = int(r, 5, 12) * 100, cents = pick(r, [50, 60, 75, 80]), p2 = pick(r, [10, 12, 15, 20]), x2 = int(r, 8, 18) * 100, B = int(r, 15, 30) * 100;
    let best = 0, how = null; for (let i = 0; i * x1 <= B; i++) for (let j = 0; i * x1 + j * x2 <= B; j++) { const k = Math.floor((B - i * x1 - j * x2) / cents); const n = i * p1 + j * p2 + k; if (n > best) { best = n; how = [i, j, k]; } }
    const unit = [x1 / p1, cents, x2 / p2]; if (Math.min(...unit) === cents) return null; // make bulk buying matter
    const cheap = Math.floor(B / Math.min(...unit)); const singles = Math.floor(B / cents);
    const { opts, a } = sortedOptions(r, best, [singles, cheap === best ? best + 2 : cheap, best - 1, Math.floor(B / x2) * p2, best + 3], N5);
    const f = c => `$${(c / 100).toFixed(2)}`;
    return { q: `Three shops sell the same birthday cards.<br>• Shop A: a pack of ${p1} cards for ${f(x1)}<br>• Shop B: single cards for ${cents} cents each<br>• Shop C: a pack of ${p2} cards for ${f(x2)}<br>You have ${f(B)} and can buy from any shops. What is the <b>largest</b> number of cards you can buy?`, opts, a,
      exp: `Cost per card: A ${f(Math.round(unit[0]))}, B ${f(cents)}, C ${f(Math.round(unit[2]))}. Buy as many of the cheapest packs as fit, then use the change on other shops.<br>Best plan: ${[how[0] ? `${how[0]} pack${how[0] > 1 ? 's' : ''} from A` : '', how[1] ? `${how[1]} pack${how[1] > 1 ? 's' : ''} from C` : '', how[2] ? `${how[2]} single card${how[2] > 1 ? 's' : ''} from B` : ''].filter(Boolean).join(', ')} = ${f(how[0] * x1 + how[1] * x2 + how[2] * cents)}.<br>Cards: <b>${best}</b>.<br><b>Trap:</b> the cheapest pack can leave money unspent; check whether singles use up the change.` };
  } },
  { key: 'multRange', topic: 'Problem Solving', diff: 3, make(r) {
    const step = pick(r, [10, 50, 100]), X = int(r, 20, 80) * step, n1 = int(r, 3, 6), n2 = n1 + int(r, 2, 4);
    const ps = []; for (let p = step; p * n2 <= X * 3; p += step) if (n1 * p < X && n2 * p > X) ps.push(p);
    if (ps.length < 2) return null; const v = ps[ps.length - 1] - ps[0]; const item = pick(r, ['bike', 'surfboard', 'guitar']);
    const { opts, a } = sortedOptions(r, v, [v + step, v - step, ps.length * step, X / n1 - X / n2, ps[ps.length - 1]].filter(x => x > 0 && Number.isInteger(x)), N5, x => `$${x}`);
    return { q: `A shop sells a ${item} at a price that is a multiple of $${step}.<br>• Selling ${n1} of them earns <b>less than</b> $${X}.<br>• Selling ${n2} of them earns <b>more than</b> $${X}.<br>More than one price fits. What is the difference between the highest and lowest possible prices?`, opts, a,
      exp: `${n1} × price < ${X} → price < $${Math.round(X / n1 * 100) / 100}.<br>${n2} × price > ${X} → price > $${Math.round(X / n2 * 100) / 100}.<br>Multiples of $${step} in between: ${ps.map(p => `$${p}`).join(', ')}.<br>Difference: $${ps[ps.length - 1]} − $${ps[0]} = <b>$${v}</b>.` };
  } },
  { key: 'ratioClass', topic: 'Problem Solving', diff: 3, make(r) {
    const r1 = int(r, 2, 3), r2 = int(r, 2, 3), parts = 1 + r1 + r1 * r2, k = int(r, 2, 5), N = parts * k;
    const ask = pick(r, ['ms', 'm', 's', 'e']); const vals = { e: k, m: r1 * k, s: r1 * r2 * k }; const v = ask === 'ms' ? vals.m + vals.s : vals[ask];
    const label = { ms: 'liked <b>either Maths or Science</b>', m: 'liked <b>Maths</b>', s: 'liked <b>Science</b>', e: 'liked <b>English</b>' }[ask];
    const { opts, a } = sortedOptions(r, v, [vals.e, vals.m, vals.s, vals.e + vals.m, N - vals.m].filter(x => x !== v), N5);
    return { q: `In a class of ${N} students, each student's favourite subject is Maths, English or Science.<br>• For every student who likes English, ${r1} students like Maths.<br>• The ratio of Maths to Science is 1 : ${r2}.<br>How many students ${label}?`, opts, a,
      exp: `Use parts. English = 1 part, Maths = ${r1} parts, Science = ${r2} × ${r1} = ${r1 * r2} parts.<br>Total: 1 + ${r1} + ${r1 * r2} = ${parts} parts = ${N} students, so 1 part = ${k}.<br>English ${vals.e}, Maths ${vals.m}, Science ${vals.s} → answer <b>${v}</b>.` };
  } },
  { key: 'twoEq', topic: 'Problem Solving', diff: 3, make(r) {
    const S = int(r, 2, 9), H = int(r, 2, 9); if (S === H) return null; const a1 = int(r, 1, 5), b1 = int(r, 1, 5), a2 = int(r, 1, 6), b2 = int(r, 1, 6);
    if (a1 * b2 - a2 * b1 === 0 || (a1 === a2 && b1 === b2)) return null; const T1 = a1 * S + b1 * H, T2 = a2 * S + b2 * H;
    const ask = pick(r, ['sum', 'star', 'heart']); const v = ask === 'sum' ? S + H : ask === 'star' ? S : H;
    const icons = (n, c) => `<span style="color:${c === '★' ? '#e0a100' : '#d6336c'};font-size:1.25em;letter-spacing:2px">${c.repeat(n)}</span>`;
    const { opts, a } = sortedOptions(r, v, [S + H, S, H, Math.abs(T2 - T1), S * H, T1 - T2 > 0 ? T1 - T2 : T2 - T1 + 1].filter(x => x !== v && x > 0), N5);
    return { q: `In a game, every ★ is worth the same number of points, and every ♥ is worth a different number of points.<br>${icons(a1, '★')}${icons(b1, '♥')} = ${T1} points<br>${icons(a2, '★')}${icons(b2, '♥')} = ${T2} points<br>How many points ${ask === 'sum' ? 'is <b>one ★ and one ♥</b> together' : ask === 'star' ? 'is <b>one ★</b>' : 'is <b>one ♥</b>'} worth?`, opts, a,
      exp: `Write it as ${a1} stars + ${b1} hearts = ${T1} and ${a2} stars + ${b2} hearts = ${T2}.<br>Try values: a star worth ${S} and a heart worth ${H} gives ${a1} × ${S} + ${b1} × ${H} = ${T1} ✔ and ${a2} × ${S} + ${b2} × ${H} = ${T2} ✔.<br>(Or compare the two lines to remove one shape, then find the other.)<br>Answer: <b>${v}</b>.` };
  } },
  { key: 'moneyBack', topic: 'Problem Solving', diff: 3, make(r) {
    const q = pick(r, [3, 4, 5]), L = int(r, 3, 12), gift = L * q, left = gift * 2, spent = int(r, 2, 30), M = left + spent; const [A, B] = sample(r, NAMES, 2);
    const { opts, a } = sortedOptions(r, spent, [gift, M - gift, M - L * 2, left - spent, M - L * q], N5, x => `$${x}`);
    return { q: `${A} had $${M}. ${A} spent some money in a shop, then gave <b>half</b> of what was left to ${B}. ${B} spent <b>1/${q}</b> of that gift on lunch, which cost $${L}. How much did ${A} spend in the shop?`, opts, a,
      exp: `Work backwards from the lunch.<br>$${L} is 1/${q} of the gift, so the gift = $${L} × ${q} = $${gift}.<br>The gift was half of what ${A} had left, so ${A} had $${gift} × 2 = $${left} after the shop.<br>Spent in the shop: $${M} − $${left} = <b>$${spent}</b>.` };
  } },

  // ---------------- Position ----------------
  { key: 'lineDist', topic: '2D Space', diff: 3, make(r) {
    const [P, Q, R, S, T] = sample(r, NAMES, 5); const ratio = int(r, 2, 4), x = int(r, 2, 8) * 25; const PR = (ratio + 1) * x, gap = int(r, 2, 12) * 25, PT = PR + x + gap;
    const { opts, a } = sortedOptions(r, gap, [PT - PR, PT - PR - 2 * x, x, PR - x, gap + x], N5, v => `${v} m`);
    return { q: `Five friends live along a straight road in this order: <b>${P}, ${Q}, ${R}, ${S}, ${T}</b>.<br>• ${P} lives ${PR} m from ${R} and ${PT} m from ${T}.<br>• ${Q} lives ${ratio} times as far from ${P} as from ${R}.<br>• ${Q} and ${S} live the same distance from ${R}.<br>How far does ${S} live from ${T}?`, opts, a,
      exp: `Draw the road. ${Q}–${R} = 1 part and ${P}–${Q} = ${ratio} parts, so ${P}–${R} = ${ratio + 1} parts = ${PR} m and 1 part = ${x} m.<br>${R}–${S} = ${Q}–${R} = ${x} m, so ${P}–${S} = ${PR} + ${x} = ${PR + x} m.<br>${S}–${T} = ${PT} − ${PR + x} = <b>${gap} m</b>.` };
  } },
  { key: 'compassWalk', topic: '2D Space', diff: 2, make(r) {
    const moves = []; let x = 0, y = 0; const D = { north: [0, 1], east: [1, 0], south: [0, -1], west: [-1, 0] };
    const seq = shuffle(r, ['north', 'east', 'south', 'west']).slice(0, 3); if (seq.includes('north') && seq.includes('south') && seq.includes('east') && seq.includes('west')) return null;
    for (const d of seq) { const k = int(r, 1, 9); moves.push([d, k]); x += D[d][0] * k; y += D[d][1] * k; }
    if (x === 0 || y === 0) return null;
    const say = (dx, dy) => `${Math.abs(dx)} km ${dx > 0 ? 'east' : 'west'} and ${Math.abs(dy)} km ${dy > 0 ? 'north' : 'south'}`;
    const right = say(x, y); const wrong = [say(-x, y), say(x, -y), say(y || 1, x || 1), say(x + (x > 0 ? 1 : -1), y), say(-x, -y), say(x, y + (y > 0 ? 2 : -2))];
    const { opts, a } = options(r, right, wrong, N5); if (!opts) return null; const name = pick(r, NAMES);
    return { q: `${name} leaves home and walks <b>${moves.map(([d, k]) => `${k} km ${d}`).join('</b>, then <b>')}</b>. Where is ${name} now, compared with home?`, opts, a,
      exp: `Add up each direction separately (north is +, south is −; east is +, west is −).<br>East–west: ${moves.filter(([d]) => d === 'east' || d === 'west').map(([d, k]) => `${d === 'east' ? '+' : '−'}${k}`).join(' ')} = ${x > 0 ? '' : '−'}${Math.abs(x)} → ${Math.abs(x)} km ${x > 0 ? 'east' : 'west'}.<br>North–south: ${moves.filter(([d]) => d === 'north' || d === 'south').map(([d, k]) => `${d === 'north' ? '+' : '−'}${k}`).join(' ')} = ${y > 0 ? '' : '−'}${Math.abs(y)} → ${Math.abs(y)} km ${y > 0 ? 'north' : 'south'}.<br>Answer: <b>${right}</b>. Drawing a quick sketch helps.` };
  } },
  { key: 'robotTurns', topic: 'Angles', diff: 3, make(r) {
    const start = int(r, 0, 7), cw = int(r, 10, 99), acw = int(r, 10, 99); if (cw === acw) return null;
    const net = ((cw - acw) % 4 + 4) % 4; const end = (start + 2 * net) % 8;
    const wrong = [(start + 2 * ((acw - cw) % 4 + 4)) % 8, start, (end + 4) % 8, (end + 1) % 8, (end + 7) % 8].map(i => DIRS[i]);
    const { opts, a } = options(r, DIRS[end], wrong, N5);
    return { q: `A robot is facing <b>${DIRS[start]}</b>. It makes <b>${cw} quarter-turns clockwise</b>, then <b>${acw} quarter-turns anticlockwise</b>. Which direction is it facing now?`, opts, a,
      exp: `Turns in opposite directions cancel: ${Math.max(cw, acw)} − ${Math.min(cw, acw)} = ${Math.abs(cw - acw)} quarter-turns ${cw > acw ? 'clockwise' : 'anticlockwise'}.<br>4 quarter-turns make a full turn, so only the remainder matters: ${Math.abs(cw - acw)} ÷ 4 = ${Math.floor(Math.abs(cw - acw) / 4)} r <b>${Math.abs(cw - acw) % 4}</b>.<br>${Math.abs(cw - acw) % 4 === 0 ? 'No change: still ' : `${Math.abs(cw - acw) % 4} quarter-turn${Math.abs(cw - acw) % 4 > 1 ? 's' : ''} ${cw > acw ? 'clockwise' : 'anticlockwise'} from ${DIRS[start]} → `}<b>${DIRS[end]}</b>.` };
  } },
];
