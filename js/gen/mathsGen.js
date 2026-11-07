// Mathematical Reasoning question generators. Each make(r) returns { q, opts, a, exp }.
// Answers are computed, never typed, so they are always correct.
import { int, pick, sample, options, sortedOptions, money, dollars, ordinal, NAMES, DAYS, fmtClock, fmt24, fmtDur } from './util.js';

const tbl = (head, rows) => `<table class="qtable"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const N5 = 5;

export default [
  // ===================== Number and Algebra =====================
  { key: 'pv', topic: 'Whole Numbers', diff: 1, make(r) {
    const th = int(r, 2, 8), hu = int(r, 11, 19), te = int(r, 2, 9), on = int(r, 11, 19);
    const v = th * 1000 + hu * 100 + te * 10 + on;
    const naive = Number(`${th}${hu}${te}${on}`);
    const { opts, a } = sortedOptions(r, v, [v - 1000, v + 1000, v - 10, naive > 100000 ? null : naive, th * 1000 + (hu % 10) * 100 + te * 10 + (on % 10)], N5);
    return { q: `Which number is made of <b>${th} thousands, ${hu} hundreds, ${te} tens and ${on} ones</b>?`, opts, a,
      exp: `Turn each part into a number and add:<br>${th} thousands = ${th * 1000}<br>${hu} hundreds = ${hu * 100}<br>${te} tens = ${te * 10}<br>${on} ones = ${on}<br>Total = <b>${v}</b>.<br><b>Trap:</b> ${hu} hundreds is more than 1000, so it spills into the thousands place.` };
  } },
  { key: 'round', topic: 'Whole Numbers', diff: 1, make(r) {
    const n = int(r, 10000, 99999); const place = pick(r, [10, 100, 1000]);
    const v = Math.round(n / place) * place; const down = Math.floor(n / place) * place, up = Math.ceil(n / place) * place;
    const name = { 10: 'ten', 100: 'hundred', 1000: 'thousand' }[place];
    const { opts, a } = sortedOptions(r, v, [down === v ? up : down, Math.round(n / (place * 10)) * place * 10, v + place * 2, v - place * 2], N5);
    const look = String(n)[String(n).length - String(place).length + 1];
    return { q: `Round <b>${n.toLocaleString('en-AU').replace(/,/g, ' ')}</b> to the nearest ${name}.`, opts: opts.map(o => Number(o).toLocaleString('en-AU').replace(/,/g, ' ')), a,
      exp: `Look at the digit just to the right of the ${name}s place: it is <b>${look}</b>.<br>${Number(look) >= 5 ? '5 or more → round UP' : 'Less than 5 → round DOWN'}.<br>${n} → <b>${v}</b>.` };
  } },
  { key: 'missdig', topic: 'Addition and Subtraction', diff: 2, make(r) {
    const b = int(r, 213, 489), c = int(r, 214, 499); const total = b + c; const s = String(total);
    const pos = int(r, 1, s.length - 2); const d = Number(s[pos]); const shown = s.slice(0, pos) + '□' + s.slice(pos + 1);
    const { opts, a } = sortedOptions(r, d, [(d + 1) % 10, (d + 9) % 10, (d + 2) % 10, (d + 8) % 10], N5);
    return { q: `In the subtraction <b>${shown} − ${b} = ${c}</b>, what is the missing digit?`, opts, a,
      exp: `Use the inverse operation: if ${shown} − ${b} = ${c}, then ${shown} = ${c} + ${b} = ${total}.<br>The missing digit is <b>${d}</b>.` };
  } },
  { key: 'change', topic: 'Addition and Subtraction', diff: 1, make(r) {
    const nm = pick(r, NAMES); const have = pick(r, [50, 100, 150, 200]); const p1 = int(r, 1200, 4500) / 100, p2 = int(r, 800, 3500) / 100;
    if (p1 + p2 >= have) return null;
    const left = Math.round((have - p1 - p2) * 100) / 100;
    const { opts, a } = options(r, left, [Math.round((have - p1 + p2) * 100) / 100, Math.round((p1 + p2) * 100) / 100, left + 1, left - 1, left + 0.1], N5, money);
    return { q: `${nm} had ${money(have)}. ${nm} spent ${money(p1)} on a book and ${money(p2)} on a game. How much money is left?`, opts, a,
      exp: `Total spent: ${money(p1)} + ${money(p2)} = ${money(p1 + p2)}.<br>Left: ${money(have)} − ${money(p1 + p2)} = <b>${money(left)}</b>.<br><b>Tip:</b> line up the decimal points.` };
  } },
  { key: 'boxes', topic: 'Multiplication and Division', diff: 1, make(r) {
    const per = pick(r, [6, 8, 12, 15, 24]); const need = per * int(r, 8, 30) + int(r, 1, per - 1); const v = Math.ceil(need / per);
    const thing = pick(r, [['pencils', 'boxes'], ['students', 'buses'], ['eggs', 'cartons'], ['cupcakes', 'trays']]);
    const { opts, a } = sortedOptions(r, v, [v - 1, v + 1, v - 2, v + 2], N5);
    return { q: `Each of the ${thing[1]} holds ${per} ${thing[0]}. What is the smallest number of ${thing[1]} needed for <b>${need}</b> ${thing[0]}?`, opts, a,
      exp: `${need} ÷ ${per} = ${Math.floor(need / per)} remainder ${need % per}.<br>${Math.floor(need / per)} ${thing[1]} are not enough (${need % per} ${thing[0]} would be left over), so you need one more: <b>${v}</b>.<br><b>Concept:</b> "how many containers" questions round UP.` };
  } },
  { key: 'remrev', topic: 'Multiplication and Division', diff: 2, make(r) {
    const d = int(r, 4, 9), qt = int(r, 11, 25), rem = int(r, 1, d - 1); const v = d * qt + rem;
    const { opts, a } = sortedOptions(r, v, [d * qt, d * qt - rem, v + d, d * (qt + rem)], N5);
    return { q: `When a number is divided by ${d}, the answer is ${qt} remainder ${rem}. What is the number?`, opts, a,
      exp: `Number = divisor × answer + remainder = ${d} × ${qt} + ${rem} = ${d * qt} + ${rem} = <b>${v}</b>.<br>Check: ${v} ÷ ${d} = ${qt} r ${rem} ✔` };
  } },
  { key: 'fracrem', topic: 'Fractions', diff: 2, make(r) {
    const [n1, d1] = pick(r, [[1, 4], [2, 5], [1, 3], [3, 8], [2, 3], [3, 5]]); const [n2, d2] = pick(r, [[1, 2], [1, 3], [1, 4], [2, 3]]);
    const total = d1 * d2 * int(r, 1, 4) * (d1 === 8 ? 1 : 2); const first = (total / d1) * n1; const rest = total - first; const v = (rest / d2) * n2;
    if (!Number.isInteger(v)) return null;
    const { opts, a } = sortedOptions(r, v, [(total / d2) * n2, first, rest, rest - v], N5);
    return { q: `There are ${total} students. ${n1}/${d1} of them play soccer. ${n2}/${d2} of the <b>remaining</b> students play tennis. How many play tennis?`, opts, a,
      exp: `Soccer: ${n1}/${d1} of ${total} = ${total} ÷ ${d1} × ${n1} = ${first}.<br>Remaining: ${total} − ${first} = ${rest}.<br>Tennis: ${n2}/${d2} of ${rest} = <b>${v}</b>.<br><b>Trap:</b> ${n2}/${d2} of ${total} uses the wrong total. Read "of the remaining" carefully.` };
  } },
  { key: 'fracwhole', topic: 'Fractions', diff: 2, make(r) {
    const [n, d] = pick(r, [[3, 4], [2, 3], [3, 5], [5, 6], [4, 7]]); const [n2, d2] = pick(r, [[1, 2], [2, 3], [3, 4], [1, 3]]);
    const whole = d * d2 * int(r, 1, 3); const given = (whole / d) * n; const v = (whole / d2) * n2;
    const { opts, a } = sortedOptions(r, v, [whole, given, Number.isInteger((given / d2) * n2) ? (given / d2) * n2 : null, v + n2], N5);
    return { q: `${n}/${d} of a number is ${given}. What is ${n2}/${d2} of the number?`, opts, a,
      exp: `${n} parts = ${given}, so 1 part (1/${d}) = ${given} ÷ ${n} = ${given / n}.<br>Whole number = ${d} × ${given / n} = ${whole}.<br>${n2}/${d2} of ${whole} = ${whole} ÷ ${d2} × ${n2} = <b>${v}</b>.<br><b>Concept:</b> find ONE part first, then build what you need.` };
  } },
  { key: 'fraccmp', topic: 'Fractions', diff: 2, make(r) {
    const pool = sample(r, [[1, 2], [2, 3], [3, 4], [3, 5], [5, 8], [4, 7], [7, 12], [5, 6], [2, 5], [7, 10], [4, 9], [5, 9]], 5);
    const big = pool.reduce((m, f) => (f[0] / f[1] > m[0] / m[1] ? f : m)); const fmt = f => `${f[0]}/${f[1]}`;
    const { opts, a } = options(r, fmt(big), pool.filter(f => f !== big).map(fmt), N5);
    return { q: 'Which fraction is the <b>largest</b>?', opts, a,
      exp: `Convert each to a decimal:<br>${pool.map(f => `${fmt(f)} ≈ ${(f[0] / f[1]).toFixed(3)}`).join('<br>')}<br>Largest: <b>${fmt(big)}</b>.<br><b>Tip:</b> compare each fraction with ½ first, then look at how far each is from 1.` };
  } },
  { key: 'decdiv', topic: 'Decimals', diff: 2, make(r) {
    const piece = pick(r, [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75]); const n = int(r, 6, 24); const len = Math.round(piece * n * 100) / 100;
    const { opts, a } = sortedOptions(r, n, [n * 10, n + 1, n - 1, n + 2], N5);
    return { q: `A ribbon ${len} m long is cut into pieces that are each ${piece} m long. How many pieces are there?`, opts, a,
      exp: `${len} ÷ ${piece}: change to centimetres to remove the decimals: ${Math.round(len * 100)} cm ÷ ${Math.round(piece * 100)} cm = <b>${n}</b>.<br>Check: ${n} × ${piece} = ${len} ✔` };
  } },
  { key: 'discount', topic: 'Percentages', diff: 1, make(r) {
    const p = pick(r, [10, 20, 25, 30, 40, 50, 15]); const price = pick(r, [40, 60, 80, 120, 160, 200, 240]); const off = price * p / 100; const v = price - off;
    if (!Number.isInteger(off)) return null;
    const { opts, a } = sortedOptions(r, v, [off, price - p, v - 5, v + 5], N5, x => `$${x}`);
    return { q: `A jacket normally costs $${price}. It is on sale for <b>${p}% off</b>. What is the sale price?`, opts, a,
      exp: `${p}% of $${price} = $${price} ÷ 100 × ${p} = $${off} (the discount).<br>Sale price = $${price} − $${off} = <b>$${v}</b>.<br><b>Trap:</b> $${off} is the discount, not the price.` };
  } },
  { key: 'pctgroup', topic: 'Percentages', diff: 1, make(r) {
    const total = pick(r, [20, 25, 40, 50]); const g = int(r, 3, total - 3); const b = total - g; const v = b * 100 / total;
    if (!Number.isInteger(v)) return null;
    const { opts, a } = sortedOptions(r, v, [100 - v, b, g, v + 10], N5, x => `${x}%`);
    return { q: `In a club of ${total} children, ${g} are girls. What percentage of the club are boys?`, opts, a,
      exp: `Boys = ${total} − ${g} = ${b}.<br>${b} out of ${total} = ${b}/${total} = ${v}/100 = <b>${v}%</b>.<br><b>Trap:</b> ${100 - v}% is the girls.` };
  } },
  { key: 'seq', topic: 'Patterns', diff: 2, make(r) {
    const type = pick(r, ['double+1', 'diffgrow', 'fib', 'x3']); let s, v, why;
    if (type === 'double+1') { s = [int(r, 1, 4)]; for (let i = 0; i < 4; i++) s.push(s[i] * 2 + 1); v = s[4] * 2 + 1; why = 'Each term = previous × 2 + 1 (the differences double each time).'; }
    else if (type === 'diffgrow') { const st = int(r, 2, 9), d0 = int(r, 1, 3), inc = int(r, 1, 3); s = [st]; let d = d0; for (let i = 0; i < 4; i++) { s.push(s[i] + d); d += inc; } v = s[4] + d; why = `The differences grow by ${inc} each time: ${s.slice(1).map((x, i) => `+${x - s[i]}`).join(', ')}, so the next difference is +${d}.`; }
    else if (type === 'fib') { s = [int(r, 1, 5), int(r, 2, 6)]; for (let i = 2; i < 5; i++) s.push(s[i - 1] + s[i - 2]); v = s[3] + s[4]; why = 'Each number is the sum of the two numbers before it.'; }
    else { s = [int(r, 1, 3)]; for (let i = 0; i < 3; i++) s.push(s[i] * 3); s = s.slice(0, 4); s.push(s[3] * 3); v = s[4] * 3; why = 'Each number is 3 times the one before it.'; }
    const { opts, a } = sortedOptions(r, v, [v - 1, v + 1, s[4] + (s[4] - s[3]), v + 2], N5);
    return { q: `What number comes next? <b>${s.join(', ')}, …</b>`, opts, a, exp: `${why}<br>Next: <b>${v}</b>.<br><b>Strategy:</b> write the differences under the numbers. If they aren't equal, look for a pattern in the differences.` };
  } },
  { key: 'match', topic: 'Patterns', diff: 2, make(r) {
    const shape = pick(r, [['squares', 4, 3], ['triangles', 3, 2], ['pentagons', 5, 4], ['hexagons', 6, 5]]); const n = int(r, 12, 40);
    const [nm, first, add] = shape; const v = first + add * (n - 1);
    const { opts, a } = sortedOptions(r, v, [first * n, add * n, v + add, v - 1], N5);
    return { q: `${nm[0].toUpperCase() + nm.slice(1)} are made in a row from matchsticks, each new one sharing a side with the one before. 1 shape uses ${first} matchsticks, 2 shapes use ${first + add}, 3 shapes use ${first + 2 * add}. How many matchsticks are needed for <b>${n}</b> shapes?`, opts, a,
      exp: `Each new shape adds ${add} matchsticks (one side is shared).<br>Rule: ${first} + ${add} × (shapes − 1).<br>For ${n}: ${first} + ${add} × ${n - 1} = <b>${v}</b>.<br><b>Trap:</b> ${first} × ${n} = ${first * n} counts every shared side twice.` };
  } },
  { key: 'machine', topic: 'Patterns', diff: 1, make(r) {
    const m = int(r, 2, 6), s = int(r, 1, 9); const inp = int(r, 4, 15); const out = inp * m - s;
    const { opts, a } = sortedOptions(r, inp, [out * m - s, Math.round((out - s) / m) === inp ? inp + 2 : Math.round((out - s) / m), (out + s) * m, inp + 1], N5);
    return { q: `A number machine follows the rule "<b>multiply by ${m}, then subtract ${s}</b>". The output is ${out}. What was the input?`, opts, a,
      exp: `Work backwards with opposite operations in reverse order:<br>${out} + ${s} = ${out + s}, then ${out + s} ÷ ${m} = <b>${inp}</b>.<br>Check: ${inp} × ${m} − ${s} = ${out} ✔` };
  } },
  { key: 'repeat', topic: 'Patterns', diff: 2, make(r) {
    const shapes = ['▲', '●', '■', '★', '◆']; const len = int(r, 3, 5); const block = sample(r, shapes, len);
    const n = int(r, 30, 99); const rem = n % len; const v = block[rem === 0 ? len - 1 : rem - 1];
    const uniq = [...new Set([...block, ...shapes])];
    const { opts, a } = options(r, v, uniq.filter(x => x !== v), Math.min(5, uniq.length), String);
    return { q: `A pattern repeats: <b>${[...block, ...block, block[0]].join(' ')} …</b> What is the <b>${ordinal(n)}</b> shape?`, opts, a,
      exp: `The repeating block is ${block.join(' ')} (${len} shapes).<br>${n} ÷ ${len} = ${Math.floor(n / len)} remainder ${rem}.<br>${rem === 0 ? `Remainder 0 means the LAST shape of the block` : `Remainder ${rem} means the ${ordinal(rem)} shape of the block`} → <b>${v}</b>.` };
  } },

  // ===================== Measurement and Geometry =====================
  { key: 'perarea', topic: 'Perimeter', diff: 2, make(r) {
    const w = int(r, 2, 9), k = int(r, 2, 4); const l = w * k; const P = 2 * (l + w); const v = l * w;
    const { opts, a } = sortedOptions(r, v, [P, l + w, (P / 4) ** 2, v + w], N5, x => `${x} cm²`);
    return { q: `A rectangle has a perimeter of ${P} cm. Its length is ${k} times its width. What is its area?`, opts, a,
      exp: `Half the perimeter = length + width = ${P / 2} cm.<br>Length = ${k} widths, so ${k + 1} widths = ${P / 2} → width = ${w} cm, length = ${l} cm.<br>Area = ${l} × ${w} = <b>${v} cm²</b>.` };
  } },
  { key: 'lshape', topic: 'Area', diff: 2, make(r) {
    const W = int(r, 7, 12), H = int(r, 5, 10), cw = int(r, 2, W - 3), ch = int(r, 2, H - 3); const ask = pick(r, ['area', 'perimeter']);
    const v = ask === 'area' ? W * H - cw * ch : 2 * (W + H); const unit = ask === 'area' ? 'm²' : 'm';
    const { opts, a } = sortedOptions(r, v, ask === 'area' ? [W * H, W * H + cw * ch, 2 * (W + H), v - cw] : [2 * (W + H) - cw - ch, 2 * (W + H) + 2 * cw, W * H - cw * ch, W + H], N5, x => `${x} ${unit}`);
    return { q: `A garden is an L-shape made by cutting a ${cw} m × ${ch} m rectangle out of one corner of a ${W} m × ${H} m rectangle. What is the <b>${ask}</b> of the garden?`, opts, a,
      exp: ask === 'area'
        ? `Whole rectangle: ${W} × ${H} = ${W * H} m². Cut-out corner: ${cw} × ${ch} = ${cw * ch} m².<br>Garden = ${W * H} − ${cw * ch} = <b>${v} m²</b>.`
        : `Cutting a corner does NOT change the perimeter: the two new inside edges are exactly as long as the two edges removed.<br>Perimeter = 2 × (${W} + ${H}) = <b>${v} m</b>.<br>Check: ${W} + ${H - ch} + ${cw} + ${ch} + ${W - cw} + ${H} = ${v} ✔` };
  } },
  { key: 'tri', topic: 'Area', diff: 1, make(r) {
    const b = int(r, 4, 20), h = int(r, 3, 15) * (b % 2 ? 2 : 1); const v = b * h / 2;
    const { opts, a } = sortedOptions(r, v, [b * h, b + h, 2 * (b + h), v + b], N5, x => `${x} cm²`);
    return { q: `A triangle has a base of ${b} cm and a perpendicular height of ${h} cm. What is its area?`, opts, a,
      exp: `Area of a triangle = ½ × base × height = ½ × ${b} × ${h} = <b>${v} cm²</b>.<br><b>Why half?</b> A triangle is half of a rectangle with the same base and height.` };
  } },
  { key: 'tiles', topic: 'Area', diff: 2, make(r) {
    const t = pick(r, [20, 25, 50]); const per = 100 / t; const L = int(r, 2, 6), W = int(r, 2, 5); const v = L * per * W * per;
    const { opts, a } = sortedOptions(r, v, [L * W, L * W * per, v / 2, v * 2], N5);
    return { q: `A floor ${L} m by ${W} m is covered with square tiles that are ${t} cm on each side. How many tiles are needed?`, opts, a,
      exp: `${t} cm tiles: ${per} tiles fit along each metre.<br>Along ${L} m: ${L * per} tiles. Along ${W} m: ${W * per} tiles.<br>Total = ${L * per} × ${W * per} = <b>${v}</b>.<br><b>Trap:</b> ${L * W * per} only multiplies by ${per} once. Both directions need converting.` };
  } },
  { key: 'tank', topic: 'Volume and Capacity', diff: 3, make(r) {
    const l = pick(r, [20, 30, 40, 50, 60]), w = pick(r, [10, 20, 25, 30]), h = pick(r, [20, 30, 40]); const frac = pick(r, [[1, 2], [3, 4], [1, 4]]);
    const full = l * w * h; const v = full * frac[0] / frac[1] / 1000;
    if (!Number.isInteger(v * 10)) return null;
    const { opts, a } = sortedOptions(r, v, [full / 1000, v * 10, v / 10, full * frac[0] / frac[1] / 100], N5, x => `${x} L`);
    return { q: `A fish tank is ${l} cm long, ${w} cm wide and ${h} cm high. It is ${frac[0]}/${frac[1]} full of water. How many litres of water are in it? (1000 cm³ = 1 L)`, opts, a,
      exp: `Full volume = ${l} × ${w} × ${h} = ${full} cm³.<br>${frac[0]}/${frac[1]} full = ${full * frac[0] / frac[1]} cm³.<br>÷ 1000 = <b>${v} L</b>.` };
  } },
  { key: 'endtime', topic: 'Time', diff: 1, make(r) {
    const start = int(r, 15 * 12, 20 * 12) * 5; const dur = int(r, 7, 40) * 5; const end = start + dur;
    const { opts, a } = options(r, fmtClock(end), [fmtClock(end + 10), fmtClock(end - 10), fmtClock(end + 60), fmtClock(start + Math.floor(dur / 60) * 60 + (dur % 60) * 10 % 60)], N5);
    return { q: `A movie starts at ${fmtClock(start)} and runs for ${fmtDur(dur)}. What time does it finish?`, opts, a,
      exp: `${dur >= 60 ? `Add the hours first: ${fmtClock(start)} + ${Math.floor(dur / 60)} h = ${fmtClock(start + Math.floor(dur / 60) * 60)}.<br>Then add` : 'Add'} ${dur % 60} minutes, remembering there are 60 minutes in an hour → <b>${fmtClock(end)}</b>.` };
  } },
  { key: 'dur24', topic: 'Time', diff: 2, make(r) {
    const s = int(r, 6 * 12, 15 * 12) * 5; const d = int(r, 10, 60) * 5; const e = s + d;
    const wrong = (Math.floor(e / 60) * 100 + e % 60) - (Math.floor(s / 60) * 100 + s % 60);
    const naive = wrong % 100 >= 60 ? `${Math.floor(wrong / 100)} h ${wrong % 100} min` : null; // e.g. "1 h 65 min" trap
    const { opts, a } = options(r, fmtDur(d), [naive, fmtDur(d + 60), d > 60 ? fmtDur(d - 60) : null, fmtDur(d + 10), fmtDur(d > 20 ? d - 10 : d + 20), fmtDur(d + 30), fmtDur(d + 40)], N5);
    return { q: `A train leaves at <b>${fmt24(s)}</b> and arrives at <b>${fmt24(e)}</b>. How long is the trip?`, opts, a,
      exp: `Count on in chunks: ${fmt24(s)} → ${fmt24(Math.ceil(s / 60) * 60)} is ${Math.ceil(s / 60) * 60 - s} min, then on to ${fmt24(e)}.<br>Total = <b>${fmtDur(d)}</b>.<br><b>Trap:</b> subtracting the times like normal numbers treats an hour as 100 minutes.` };
  } },
  { key: 'dayof', topic: 'Time', diff: 3, make(r) {
    const d0 = int(r, 0, 6); const n = int(r, 15, 100); const v = DAYS[(d0 + n) % 7];
    const { opts, a } = options(r, v, [DAYS[(d0 + n + 1) % 7], DAYS[(d0 + n + 6) % 7], DAYS[(d0 + n % 10) % 7], DAYS[(d0 + n + 2) % 7]], N5);
    return { q: `Today is <b>${DAYS[d0]}</b>. What day of the week will it be in <b>${n} days</b>?`, opts, a,
      exp: `Every 7 days the weekday repeats. ${n} ÷ 7 = ${Math.floor(n / 7)} weeks and ${n % 7} days left over.<br>Move ${n % 7} day${n % 7 === 1 ? '' : 's'} on from ${DAYS[d0]} → <b>${v}</b>.` };
  } },
  { key: 'triang', topic: 'Angles', diff: 1, make(r) {
    const x = int(r, 25, 90), y = int(r, 20, 150 - x); const v = 180 - x - y;
    const { opts, a } = sortedOptions(r, v, [360 - x - y, v < 90 ? 90 - v : null, x + y, 180 - x], N5, z => `${z}°`);
    return { q: `Two angles of a triangle are ${x}° and ${y}°. What is the third angle?`, opts, a,
      exp: `The angles in a triangle add to <b>180°</b>.<br>${x} + ${y} = ${x + y}, so the third angle = 180 − ${x + y} = <b>${v}°</b>.` };
  } },
  { key: 'iso', topic: 'Angles', diff: 2, make(r) {
    const apex = int(r, 10, 70) * 2; const base = (180 - apex) / 2; const askApex = r() < 0.4;
    if (askApex) {
      const { opts, a } = sortedOptions(r, apex, [180 - base, 180 - 2 * apex > 0 ? 180 - 2 * apex : null, base, 90 - base], N5, z => `${z}°`);
      return { q: `In an isosceles triangle, each of the two equal base angles is ${base}°. What is the third angle?`, opts, a,
        exp: `The two base angles are equal: ${base} + ${base} = ${2 * base}°.<br>Third angle = 180 − ${2 * base} = <b>${apex}°</b>.` };
    }
    const { opts, a } = sortedOptions(r, base, [apex, 180 - apex, 180 - 2 * apex > 0 ? 180 - 2 * apex : null, 90 - apex / 2 + 10], N5, z => `${z}°`);
    return { q: `In an isosceles triangle, the angle between the two equal sides is ${apex}°. What size is each of the other two angles?`, opts, a,
      exp: `The other two (base) angles are equal.<br>180 − ${apex} = ${180 - apex}, shared equally: ${180 - apex} ÷ 2 = <b>${base}°</b> each.` };
  } },
  { key: 'clock', topic: 'Angles', diff: 3, make(r) {
    const h = int(r, 1, 11), m = pick(r, [0, 30, 0, 30, 15]); const hourA = (h % 12) * 30 + m * 0.5, minA = m * 6;
    let v = Math.abs(hourA - minA); if (v > 180) v = 360 - v;
    let naive = Math.abs((h % 12) * 30 - minA); if (naive > 180) naive = 360 - naive;
    const { opts, a } = sortedOptions(r, v, [naive, 360 - v, v + 15, v - 15 > 0 ? v - 15 : null], N5, z => `${z}°`);
    return { q: `What is the smaller angle between the hands of a clock at <b>${h}:${String(m).padStart(2, '0')}</b>?`, opts, a,
      exp: `Each hour mark is 30° apart, and the hour hand moves 0.5° every minute.<br>Minute hand: ${m} min × 6° = ${minA}° from 12.<br>Hour hand: ${h} × 30° + ${m} × 0.5° = ${hourA}° from 12.<br>Difference = ${Math.abs(hourA - minA)}°${Math.abs(hourA - minA) > 180 ? ` → the smaller angle is 360 − ${Math.abs(hourA - minA)} = <b>${v}°</b>` : ` → <b>${v}°</b>`}.${m ? `<br><b>Trap:</b> ${naive}° forgets the hour hand has moved past the ${h}.` : ''}` };
  } },
  { key: 'compass', topic: 'Angles', diff: 2, make(r) {
    const pts = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West']; const s = int(r, 0, 7); const turn = pick(r, [45, 90, 135, 180, 225, 270]); const cw = r() < 0.5;
    const e = (s + (cw ? 1 : -1) * turn / 45 + 16) % 8; const v = pts[e]; const wrong = pts[(s + (cw ? -1 : 1) * turn / 45 + 16) % 8];
    const { opts, a } = options(r, v, [wrong, pts[(e + 1) % 8], pts[(e + 7) % 8], pts[(e + 2) % 8]], N5);
    return { q: `Kai faces <b>${pts[s]}</b> and turns <b>${turn}° ${cw ? 'clockwise' : 'anticlockwise'}</b>. Which direction is Kai facing now?`, opts, a,
      exp: `The 8 compass points are 45° apart, so ${turn}° = ${turn / 45} steps ${cw ? 'clockwise (N → NE → E …)' : 'anticlockwise (N → NW → W …)'}.<br>From ${pts[s]}, ${turn / 45} steps → <b>${v}</b>.<br><b>Trap:</b> turning the wrong way gives ${wrong}.` };
  } },
  { key: 'pointline', topic: 'Angles', diff: 1, make(r) {
    if (r() < 0.5) { const x = int(r, 20, 160); const v = 180 - x;
      const { opts, a } = sortedOptions(r, v, [90 - x > 0 ? 90 - x : null, 360 - x, x, v + 10], N5, z => `${z}°`);
      return { q: `Two angles sit side by side on a straight line. One is ${x}°. What is the other?`, opts, a, exp: `Angles on a straight line add to <b>180°</b>: 180 − ${x} = <b>${v}°</b>.` }; }
    const x = int(r, 60, 130), y = int(r, 40, 110), z = int(r, 30, 90); const v = 360 - x - y - z; if (v < 15) return null;
    const { opts, a } = sortedOptions(r, v, [180 - x - y - z > 0 ? 180 - x - y - z : null, v + 10, v - 10, 360 - x - y], N5, t => `${t}°`);
    return { q: `Four angles meet at a point. Three of them are ${x}°, ${y}° and ${z}°. What is the fourth angle?`, opts, a, exp: `Angles around a point add to <b>360°</b>.<br>${x} + ${y} + ${z} = ${x + y + z}. 360 − ${x + y + z} = <b>${v}°</b>.` };
  } },
  { key: 'polygon', topic: '2D Space', diff: 2, make(r) {
    const [nm, n] = pick(r, [['pentagon', 5], ['hexagon', 6], ['octagon', 8], ['heptagon', 7]]); const ask = pick(r, ['diag', 'sym', 'sum']);
    if (ask === 'diag') { const v = n * (n - 3) / 2; const { opts, a } = sortedOptions(r, v, [n * (n - 3), n, n - 3, v + 2], N5);
      return { q: `How many diagonals does a ${nm} (${n} sides) have?`, opts, a, exp: `From each corner, draw a diagonal to every corner except itself and its 2 neighbours: ${n} − 3 = ${n - 3}.<br>${n} × ${n - 3} = ${n * (n - 3)}, but each diagonal is counted twice → ÷ 2 = <b>${v}</b>.` }; }
    if (ask === 'sym') { const { opts, a } = sortedOptions(r, n, [n / 2 % 1 ? n + 1 : n / 2, 2 * n, n - 1, 1], N5);
      return { q: `How many lines of symmetry does a <b>regular</b> ${nm} have?`, opts, a, exp: `A regular polygon with n sides has <b>n</b> lines of symmetry, so a regular ${nm} has <b>${n}</b>.` }; }
    const v = (n - 2) * 180; const { opts, a } = sortedOptions(r, v, [n * 180, 360, (n - 1) * 180, v + 180 * 2], N5, z => `${z}°`);
    return { q: `What do the interior angles of a ${nm} add up to?`, opts, a, exp: `A polygon with n sides can be split into (n − 2) triangles from one corner, and each triangle is 180°.<br>(${n} − 2) × 180° = <b>${v}°</b>.` };
  } },
  { key: 'coord', topic: '2D Space', diff: 2, make(r) {
    const x = int(r, -3, 6), y = int(r, -3, 6), dx = int(r, 1, 6) * (r() < 0.5 ? 1 : -1), dy = int(r, 1, 6) * (r() < 0.5 ? 1 : -1);
    const f = (a, b) => `(${a}, ${b})`; const v = f(x + dx, y + dy);
    const desc = `${Math.abs(dx)} units ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} units ${dy > 0 ? 'up' : 'down'}`;
    const { opts, a } = options(r, v, [f(x + dy, y + dx), f(x - dx, y - dy), f(x + dx, y - dy), f(y + dy, x + dx)], N5);
    return { q: `Point P is at ${f(x, y)}. It moves ${desc}. Where is it now?`, opts, a,
      exp: `Left/right changes the <b>first</b> number (x). Up/down changes the <b>second</b> number (y).<br>x: ${x} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${x + dx}. y: ${y} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${y + dy}.<br>New point: <b>${v}</b>.` };
  } },
  { key: 'paint', topic: '3D Space', diff: 3, make(r) {
    const n = int(r, 3, 5); const ask = pick(r, [3, 2, 1, 0]); const vals = { 3: 8, 2: 12 * (n - 2), 1: 6 * (n - 2) ** 2, 0: (n - 2) ** 3 }; const v = vals[ask];
    const { opts, a } = sortedOptions(r, v, Object.values(vals).filter(x => x !== v).concat([n ** 3 - v]), N5);
    const label = { 3: 'exactly three', 2: 'exactly two', 1: 'exactly one', 0: 'no' }[ask];
    return { q: `A large cube is built from ${n ** 3} small cubes (${n} × ${n} × ${n}) and its outside is painted. How many small cubes have paint on <b>${label}</b> face${ask === 1 ? '' : 's'}?`, opts, a,
      exp: `For an ${n} × ${n} × ${n} cube:<br>• 3 faces: the 8 corners → 8<br>• 2 faces: edge cubes that aren't corners → 12 edges × ${n - 2} = ${vals[2]}<br>• 1 face: middle of each face → 6 × ${n - 2}² = ${vals[1]}<br>• 0 faces: the hidden inside → ${n - 2}³ = ${vals[0]}<br>Check: 8 + ${vals[2]} + ${vals[1]} + ${vals[0]} = ${n ** 3} ✔ → answer <b>${v}</b>.` };
  } },
  { key: 'mass', topic: 'Mass', diff: 2, make(r) {
    const k = int(r, 3, 8), each = int(r, 6, 30) * 25, box = int(r, 2, 8) * 50; const total = k * each + box; const kg = total / 1000;
    const { opts, a } = sortedOptions(r, each, [Math.round(total / k), each + box, Math.round(total / k / 25) * 25 === each ? each + 50 : Math.round(total / k / 25) * 25, each - 50], N5, x => `${x} g`);
    return { q: `A box holding ${k} identical tins has a total mass of <b>${kg} kg</b>. The empty box has a mass of ${box} g. What is the mass of one tin?`, opts, a,
      exp: `Change to grams: ${kg} kg = ${total} g.<br>Remove the box: ${total} − ${box} = ${k * each} g for ${k} tins.<br>One tin = ${k * each} ÷ ${k} = <b>${each} g</b>.<br><b>Trap:</b> dividing ${total} by ${k} forgets to take away the box first.` };
  } },
  { key: 'lencmp', topic: 'Length', diff: 2, make(r) {
    const base = int(r, 21, 48) * 100; const vals = sample(r, [-150, -70, -20, 30, 90, 160], 4).map(d => base + d); const mx = Math.max(...vals, base);
    const all = [base, ...vals]; const forms = [m => `${m / 1000} km`, m => `${m} m`, m => `${m * 100} cm`, m => `${Math.floor(m / 1000)} km ${m % 1000} m`, m => `${m * 1000} mm`];
    const shown = all.map((m, i) => ({ m, t: forms[i % 5](m).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') }));
    const v = shown.find(s => s.m === mx).t;
    const { opts, a } = options(r, v, shown.filter(s => s.t !== v).map(s => s.t), N5);
    return { q: 'Which of these lengths is the <b>longest</b>?', opts, a,
      exp: `Change everything to metres:<br>${shown.map(s => `${s.t} = ${s.m} m`).join('<br>')}<br>Longest: <b>${v}</b>.<br><b>Remember:</b> 10 mm = 1 cm · 100 cm = 1 m · 1000 m = 1 km.` };
  } },
  { key: 'posts', topic: 'Length', diff: 2, make(r) {
    const gap = pick(r, [2, 3, 4, 5, 6]), n = int(r, 6, 20); const len = gap * n; const loop = r() < 0.3; const v = loop ? n : n + 1;
    const { opts, a } = sortedOptions(r, v, [n, n + 1, n - 1, n + 2], N5);
    return { q: loop ? `Posts are placed every ${gap} m around a <b>closed loop</b> track that is ${len} m long. How many posts are there?` : `Fence posts are placed every ${gap} m along a <b>straight</b> ${len} m fence, with a post at each end. How many posts are there?`, opts, a,
      exp: `${len} ÷ ${gap} = ${n} gaps.<br>${loop ? 'In a closed loop the last gap joins back to the first post, so posts = gaps' : 'In a straight line there is always one more post than gaps'} → <b>${v}</b>.` };
  } },

  // ===================== Statistics and Probability =====================
  { key: 'mean', topic: 'Data', diff: 2, make(r) {
    const n = int(r, 4, 6), m = int(r, 6, 20); const known = Array.from({ length: n - 1 }, () => int(r, m - 5, m + 5)); const v = m * n - known.reduce((s, x) => s + x, 0);
    if (v < 1) return null;
    const { opts, a } = sortedOptions(r, v, [m, v + 1, v - 1, Math.round(known.reduce((s, x) => s + x, 0) / (n - 1))], N5);
    return { q: `The mean (average) of ${n} numbers is ${m}. ${n - 1} of the numbers are ${known.join(', ')}. What is the missing number?`, opts, a,
      exp: `Total of all ${n} numbers = mean × count = ${m} × ${n} = ${m * n}.<br>Known numbers add to ${known.reduce((s, x) => s + x, 0)}.<br>Missing = ${m * n} − ${known.reduce((s, x) => s + x, 0)} = <b>${v}</b>.` };
  } },
  { key: 'median', topic: 'Data', diff: 1, make(r) {
    const n = pick(r, [5, 7, 9]); const xs = Array.from({ length: n }, () => int(r, 1, 20)); const sorted = [...xs].sort((a, b) => a - b); const v = sorted[(n - 1) / 2];
    const { opts, a } = sortedOptions(r, v, [xs[(n - 1) / 2], Math.round(xs.reduce((s, x) => s + x, 0) / n), sorted[n - 1] - sorted[0], v + 1], N5);
    return { q: `Find the <b>median</b> of these scores: ${xs.join(', ')}`, opts, a,
      exp: `Sort first: ${sorted.join(', ')}.<br>The median is the middle value (position ${(n + 1) / 2} of ${n}) → <b>${v}</b>.<br><b>Trap:</b> the middle of the unsorted list is ${xs[(n - 1) / 2]}.` };
  } },
  { key: 'probnot', topic: 'Probability', diff: 1, make(r) {
    const c = { red: int(r, 1, 6), blue: int(r, 1, 6), green: int(r, 1, 6), yellow: int(r, 0, 4) }; const t = Object.values(c).reduce((s, x) => s + x, 0);
    const col = pick(r, ['red', 'blue', 'green']); const num = t - c[col];
    const g = (a, b) => (b ? g(b, a % b) : a); const fr = (n, d) => `${n / g(n, d)}/${d / g(n, d)}`;
    const { opts, a } = options(r, fr(num, t), [fr(c[col], t), fr(num, t + 1), fr(Math.max(num - 1, 1), t), fr(c[col], num || 1), fr(num + 1, t + 1), fr(1, 2), fr(num, t - 1)], N5);
    return { q: `A bag has ${c.red} red, ${c.blue} blue, ${c.green} green${c.yellow ? ` and ${c.yellow} yellow` : ''} marbles. One is picked without looking. What is the probability it is <b>not ${col}</b>?`, opts, a,
      exp: `Total marbles = ${t}. Not ${col} = ${t} − ${c[col]} = ${num}.<br>P(not ${col}) = ${num}/${t} = <b>${fr(num, t)}</b>.` };
  } },
  { key: 'spin', topic: 'Probability', diff: 2, make(r) {
    const n = pick(r, [8, 10, 12]); const k = int(r, 3, n - 3); const parity = pick(r, ['even', 'odd']);
    const hits = []; for (let i = k + 1; i <= n; i++) if ((i % 2 === 0) === (parity === 'even')) hits.push(i);
    const g = (a, b) => (b ? g(b, a % b) : a); const fr = (x, d) => (x === 0 ? '0' : `${x / g(x, d)}/${d / g(x, d)}`);
    const { opts, a } = options(r, fr(hits.length, n), [fr(n - k, n), fr(n / 2, n), fr(hits.length + 1, n), fr(hits.length, n - k), fr(Math.max(hits.length - 1, 1), n), fr(hits.length + 2, n), fr(1, n)], N5);
    return { q: `A spinner has ${n} equal sections numbered 1 to ${n}. What is the probability of spinning a number that is <b>greater than ${k} AND ${parity}</b>?`, opts, a,
      exp: `Greater than ${k}: ${Array.from({ length: n - k }, (_, i) => k + 1 + i).join(', ')}.<br>Of those, ${parity}: ${hits.join(', ') || 'none'} → ${hits.length} number${hits.length === 1 ? '' : 's'}.<br>P = ${hits.length}/${n} = <b>${fr(hits.length, n)}</b>.<br><b>AND</b> means both conditions must be true.` };
  } },

  // ===================== Problem Solving =====================
  { key: 'legs', topic: 'Problem Solving', diff: 3, make(r) {
    const [a1, l1, a2, l2] = pick(r, [['chickens', 2, 'cows', 4], ['bicycles', 2, 'tricycles', 3], ['ducks', 2, 'sheep', 4], ['stools', 3, 'chairs', 4]]);
    const y = int(r, 4, 15), x = int(r, 4, 15); const heads = x + y, legs = x * l1 + y * l2;
    const { opts, a } = sortedOptions(r, y, [x, heads - y + 1, y + 2, Math.round(legs / l2)], N5);
    const unit = a1 === 'bicycles' ? ['vehicles', 'wheels'] : a1 === 'stools' ? ['seats', 'legs'] : ['animals', 'legs'];
    return { q: `There are only ${a1} and ${a2}: ${heads} ${unit[0]} altogether with ${legs} ${unit[1]}. How many <b>${a2}</b> are there?`, opts, a,
      exp: `<b>Assume-all strategy:</b> if all ${heads} were ${a1}: ${heads} × ${l1} = ${heads * l1} ${unit[1]}.<br>Extra ${unit[1]}: ${legs} − ${heads * l1} = ${legs - heads * l1}. Each of the ${a2} adds ${l2 - l1} extra.<br>${a2[0].toUpperCase() + a2.slice(1)} = ${legs - heads * l1} ÷ ${l2 - l1} = <b>${y}</b> (and ${x} ${a1}).<br>Check: ${x} × ${l1} + ${y} × ${l2} = ${legs} ✔` };
  } },
  { key: 'sumdiff', topic: 'Problem Solving', diff: 2, make(r) {
    const small = int(r, 3, 30), diff = int(r, 2, 15); const big = small + diff; const tot = small + big;
    const [x1, x2] = pick(r, [['book', 'pen'], ['bat', 'ball'], ['bag', 'hat'], ['game', 'puzzle']]);
    const { opts, a } = sortedOptions(r, big, [small, tot - diff, tot / 2, big + diff], N5, dollars);
    return { q: `A ${x1} costs $${diff} more than a ${x2}. Together they cost $${tot}. How much does the <b>${x1}</b> cost?`, opts, a,
      exp: `Take away the extra $${diff}: $${tot} − $${diff} = $${tot - diff}, which is two equal ${x2} prices.<br>${x2[0].toUpperCase() + x2.slice(1)} = $${small}, ${x1} = $${small} + $${diff} = <b>$${big}</b>.<br>Check: ${big} + ${small} = ${tot} ✔` };
  } },
  { key: 'ages', topic: 'Problem Solving', diff: 3, make(r) {
    const k = pick(r, [3, 4]); const b = int(r, 3, 9); const A = k * b; const yrs = (k - 2) * b; const [nm, nm2] = sample(r, NAMES, 2);
    if (yrs < 1) return null;
    const { opts, a } = sortedOptions(r, A, [b, A + yrs, 2 * b, A - k], N5);
    return { q: `${nm} is ${k} times as old as ${nm2}. In ${yrs} years, ${nm} will be twice as old as ${nm2}. How old is ${nm} now?`, opts, a,
      exp: `<b>Guess and check</b> with "${nm} = ${k} × ${nm2}":<br>${nm2} ${b}, ${nm} ${A} → in ${yrs} years: ${b + yrs} and ${A + yrs}. Is ${A + yrs} = 2 × ${b + yrs}? ${2 * (b + yrs)} ✔<br>${nm} is <b>${A}</b>.<br><b>Concept:</b> the age gap (${A - b} years) never changes.` };
  } },
  { key: 'rate', topic: 'Problem Solving', diff: 3, make(r) {
    const [t1, t2, t] = pick(r, [[6, 3, 2], [12, 4, 3], [10, 15, 6], [12, 6, 4], [20, 5, 4], [6, 12, 4]]);
    const { opts, a } = sortedOptions(r, t, [(t1 + t2) / 2, Math.abs(t1 - t2) || null, t1 + t2, Math.min(t1, t2)], N5, x => `${x} hour${x === 1 ? '' : 's'}`);
    return { q: `Mia can paint a fence in ${t1} hours. Sam can paint the same fence in ${t2} hours. How long will it take if they work together?`, opts, a,
      exp: `In ONE hour: Mia paints 1/${t1}, Sam paints 1/${t2} of the fence.<br>Together: 1/${t1} + 1/${t2} = 1/${t} of the fence per hour → whole fence in <b>${t} hours</b>.<br><b>Sense check:</b> together must be faster than the faster person alone (${Math.min(t1, t2)} h).` };
  } },

  // ===================== Data Interpretation =====================
  { key: 'tblsales', topic: 'Data Interpretation', diff: 2, make(r) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; const A = days.map(() => int(r, 5, 25)), B = days.map(() => int(r, 5, 25));
    const [x, y] = pick(r, [['Pies', 'Sushi'], ['Apples', 'Bananas'], ['Comics', 'Novels']]); const k = int(r, 2, 6);
    const v = days.filter((_, i) => A[i] - B[i] > k).length; const ge = days.filter((_, i) => A[i] - B[i] >= k).length;
    const { opts, a } = sortedOptions(r, v, [ge, days.filter((_, i) => A[i] > B[i]).length, v + 1, Math.max(v - 1, 0)], N5);
    return { q: `The table shows a canteen's sales.<br>${tbl(['Day', x, y], days.map((d, i) => [d, A[i], B[i]]))}On how many days did ${x.toLowerCase()} sales exceed ${y.toLowerCase()} sales by <b>more than ${k}</b>?`, opts, a,
      exp: `Work out ${x} − ${y} each day:<br>${days.map((d, i) => `${d}: ${A[i]} − ${B[i]} = ${A[i] - B[i]} ${A[i] - B[i] > k ? '✔' : '✘'}`).join('<br>')}<br>Answer: <b>${v}</b>.<br><b>Trap:</b> "more than ${k}" does not include exactly ${k}.` };
  } },
  { key: 'pie', topic: 'Data Interpretation', diff: 3, make(r) {
    const tot = pick(r, [30, 36, 40, 45, 60, 72]); const per = 360 / tot; const a1 = int(r, 3, tot / 3), a2 = int(r, 3, tot / 4), a3 = int(r, 2, tot / 5); const rest = tot - a1 - a2 - a3;
    if (rest < 2) return null;
    const v = rest * per;
    const { opts, a } = sortedOptions(r, v, [rest, rest * 10, v + per * 2, 360 - v], N5, x => `${x}°`);
    return { q: `${tot} students chose a favourite fruit: apple ${a1}, banana ${a2}, mango ${a3}, and the rest chose grapes. In a pie chart, what angle is the <b>grapes</b> sector?`, opts, a,
      exp: `Grapes = ${tot} − ${a1} − ${a2} − ${a3} = ${rest}.<br>Each student = 360° ÷ ${tot} = ${per}°.<br>Grapes = ${rest} × ${per}° = <b>${v}°</b>.` };
  } },
  { key: 'bus', topic: 'Data Interpretation', diff: 2, make(r) {
    const stops = ['Central', 'Park St', 'Library', 'Beach']; const starts = [int(r, 84, 96) * 5, 0, 0]; starts[1] = starts[0] + int(r, 6, 9) * 5; starts[2] = starts[1] + int(r, 6, 9) * 5;
    const legs = [int(r, 2, 4) * 5, int(r, 2, 4) * 5, int(r, 2, 4) * 5]; const times = starts.map(s => { const t = [s]; legs.forEach(l => t.push(t[t.length - 1] + l + int(r, 0, 1))); return t; });
    const stopI = int(r, 1, 2); const arrive = times[0][stopI] + int(r, 1, 4); const bus = times.findIndex(t => t[stopI] >= arrive); if (bus < 0) return null;
    const v = fmtClock(times[bus][3]).replace(' am', '').replace(' pm', '');
    const f = m => fmtClock(m).replace(' am', '').replace(' pm', '');
    const { opts, a } = options(r, v, [f(times[0][3]), f(times[Math.min(bus + 1, 2)][3]), f(times[bus][stopI]), f(times[bus][3] + 5)], N5);
    return { q: `Bus timetable:<br>${tbl(['Stop', 'Bus 1', 'Bus 2', 'Bus 3'], stops.map((s, i) => [s, ...times.map(t => f(t[i]))]))}Ella reaches the <b>${stops[stopI]}</b> stop at ${f(arrive)} and catches the next bus. What time does she arrive at the Beach?`, opts, a,
      exp: `At ${f(arrive)}, Bus 1 has already left ${stops[stopI]} (${f(times[0][stopI])}).<br>The next bus from ${stops[stopI]} is Bus ${bus + 1} at ${f(times[bus][stopI])}.<br>Follow Bus ${bus + 1}'s column down to the Beach: <b>${v}</b>.` };
  } },
];
