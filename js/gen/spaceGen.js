// 2D/3D Space and Perimeter/Area generators: hidden cubes, painted blocks, cube nets, nets of solids,
// fold-and-punch paper, symmetry completion, cutting shapes into squares and the "pinwheel" of rectangles.
// Every answer is computed here and re-solved independently in tools/audit-generators.mjs.
import { int, pick, shuffle, sample, options, sortedOptions } from './util.js';

const N5 = 5;
const C = 22; // option grid cell size (px)

// ---------- small SVG helpers ----------
const svgWrap = (w, h, body, label, cls = '') => `<svg viewBox="-2 -2 ${w + 4} ${h + 4}" width="${w + 4}" class="qsvg spacesvg ${cls}" role="img" aria-label="${label}">${body}</svg>`;
const cellRects = (cells, c = C, cls = 'cell') => cells.map(([x, y]) => `<rect class="${cls}" x="${x * c}" y="${y * c}" width="${c}" height="${c}" fill="#f6c453" stroke="#5a4500" stroke-width="1.5"/>`).join('');
const norm = cells => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const key = cells => norm(cells).map(c => c.join(',')).join(' ');
const transform = (cells, t) => norm(cells.map(([x, y]) => [[x, y], [-y, x], [-x, -y], [y, -x], [-x, y], [y, x], [x, -y], [-y, -x]][t]));
const netSvg = cells => { const n = norm(cells); const w = Math.max(...n.map(c => c[0])) + 1, h = Math.max(...n.map(c => c[1])) + 1; return svgWrap(w * C, h * C, cellRects(n), 'net'); };

// Cube nets: all 11 (as families) and hexominoes that are definitely NOT nets.
const VALID_NETS = [
  ...[0, 1, 2, 3].flatMap(a => [0, 1, 2, 3].map(b => [[0, 1], [1, 1], [2, 1], [3, 1], [a, 0], [b, 2]])), // 1-4-1 (6 shapes)
  ...[1, 2, 3].map(b => [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [b, 2]]), // 2-3-1 (3 shapes)
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], // 2-2-2 staircase
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]], // 3-3
];
const INVALID_NETS = [
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], // straight line of 6
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], // 2 × 3 block
  ...[0, 1, 2].map(a => [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [a, 0]]), // 5 in a row + 1
  ...[0, 1, 2].map(a => [[0, 1], [1, 1], [2, 1], [3, 1], [a, 0], [a + 1, 0]]), // 4 in a row, two on the same side side by side
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], // contains a 2 × 2 square
  [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2], [2, 2]], // contains a 2 × 2 square
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2]], // a U shape: two faces would overlap
  [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [3, 0]], // 4 in a row with both ends turned up the same way
];
const canon = cells => [0, 1, 2, 3, 4, 5, 6, 7].map(t => key(transform(cells, t))).sort()[0];
const distinctShapes = (r, list, n) => { const seen = new Set(), out = []; for (const s of shuffle(r, list)) { const k = canon(s); if (seen.has(k)) continue; seen.add(k); out.push(transform(s, int(r, 0, 7))); if (out.length === n) break; } return out; };

export default [
  // ---------------- 3D Space ----------------
  { key: 'cubeSee', topic: '3D Space', diff: 2, make(r) {
    const n = int(r, 3, 6), N = n ** 3; const table = r() < 0.5;
    const v = table ? (n - 1) * (n - 2) ** 2 : (n - 2) ** 3;
    const { opts, a } = sortedOptions(r, v, [table ? (n - 2) ** 3 : (n - 1) * (n - 2) ** 2, N - v, (n - 2) ** 2, n * (n - 2) ** 2, 8], N5);
    return { q: table
      ? `A large cube is built from ${N} identical small cubes (${n} × ${n} × ${n}). It is glued to a table, so you can walk all the way around it and look down on it, but you can't lift it. How many small cubes can you <b>not</b> see?`
      : `A large cube is built from ${N} identical small cubes (${n} × ${n} × ${n}). You can pick it up and look at it from every direction. How many small cubes can you <b>not</b> see?`, opts, a,
      exp: table
        ? `You can see the top and the four sides, but not the bottom.<br>Take away the top layer: ${n - 1} layers are left. In each of those layers, the outside ring touches a side, so only the inside ${n - 2} × ${n - 2} = ${(n - 2) ** 2} cubes are hidden.<br>Hidden = ${n - 1} × ${(n - 2) ** 2} = <b>${v}</b>.<br><b>Trap:</b> the bottom layer's middle cubes are hidden too, because you can't look underneath.`
        : `You can see every outside face, so only the cubes completely inside are hidden.<br>Peel one layer off every side: the inside is (${n} − 2) × (${n} − 2) × (${n} − 2) = ${n - 2} × ${n - 2} × ${n - 2} = <b>${v}</b>.<br>Check: you can see ${N} − ${v} = ${N - v} cubes.` };
  } },
  { key: 'cuboidPaint', topic: '3D Space', diff: 3, make(r) {
    const d = shuffle(r, [int(r, 2, 4), int(r, 3, 5), int(r, 3, 6)]); const [a, b, c] = d; if (a === b && b === c) return null;
    const ia = a - 2, ib = b - 2, ic = c - 2;
    const E = { 0: ia * ib * ic, 1: 2 * (ia * ib + ia * ic + ib * ic), 2: 4 * (ia + ib + ic), 3: 8 };
    const ask = pick(r, ['0', '1', '2', 'le1']); const v = ask === 'le1' ? E[0] + E[1] : E[+ask];
    const label = { 0: 'no faces', 1: 'exactly one face', 2: 'exactly two faces', le1: 'one face or no faces' }[ask];
    const { opts, a: ai } = sortedOptions(r, v, [E[0], E[1], E[2], E[0] + E[1], a * b * c - v, 8].filter(x => x !== v), N5);
    return { q: `A block ${a} × ${b} × ${c} is made from ${a * b * c} unit cubes. The whole outside of the block is painted. How many unit cubes have paint on <b>${label}</b>?`, opts, a: ai,
      exp: `Think of each direction separately: along a length of ${a}, the 2 end cubes are on the outside and ${ia} ${ia === 1 ? 'is' : 'are'} inside (same for ${b} → ${ib} inside, ${c} → ${ic} inside).<br>
        • No paint: inside in every direction → ${ia} × ${ib} × ${ic} = ${E[0]}<br>
        • One face: the middle of each face → 2 × (${ia}×${ib} + ${ia}×${ic} + ${ib}×${ic}) = ${E[1]}<br>
        • Two faces: edge cubes that aren't corners → 4 × (${ia} + ${ib} + ${ic}) = ${E[2]}<br>
        • Three faces: the 8 corners<br>Check: ${E[0]} + ${E[1]} + ${E[2]} + 8 = ${a * b * c} ✔ → answer <b>${v}</b>.` };
  } },
  { key: 'netSolid', topic: '3D Space', diff: 2, make(r) {
    const solids = [
      { name: 'Cube', net: '6 squares' },
      { name: 'Rectangular prism', net: '2 squares and 4 rectangles' },
      { name: 'Triangular prism', net: '2 triangles and 3 rectangles' },
      { name: 'Pentagonal prism', net: '2 pentagons and 5 rectangles' },
      { name: 'Hexagonal prism', net: '2 hexagons and 6 rectangles' },
      { name: 'Triangular pyramid', net: '4 triangles' },
      { name: 'Square pyramid', net: '1 square and 4 triangles' },
      { name: 'Pentagonal pyramid', net: '1 pentagon and 5 triangles' },
      { name: 'Hexagonal pyramid', net: '1 hexagon and 6 triangles' },
    ];
    const s = pick(r, solids);
    const near = solids.filter(x => x !== s && (x.name.split(' ')[0] === s.name.split(' ')[0] || x.name.split(' ')[1] === s.name.split(' ')[1]));
    const { opts, a } = options(r, s.name, [...shuffle(r, near).map(x => x.name), ...shuffle(r, solids).map(x => x.name)], N5);
    return { q: `A net is made of exactly <b>${s.net}</b> (all joined edge to edge). Which solid does it fold into?`, opts, a,
      exp: `• A <b>prism</b> has two identical end faces joined by rectangles, one rectangle for each side of the end shape.<br>• A <b>pyramid</b> has one base joined to triangles, one triangle for each side of the base.<br>${s.net} → <b>${s.name}</b>.` };
  } },
  { key: 'cubeNet', topic: '3D Space', diff: 3, seeds: 8, make(r) {
    const notMode = r() < 0.5; // "which will NOT fold"
    const odd = distinctShapes(r, notMode ? INVALID_NETS : VALID_NETS, 1)[0];
    const rest = distinctShapes(r, notMode ? VALID_NETS : INVALID_NETS, 4);
    const all = shuffle(r, [odd, ...rest]); const a = all.indexOf(odd);
    return { q: notMode ? 'Four of these nets fold up to make a cube. Which net will <b>not</b> make a cube?' : 'Only one of these nets folds up to make a cube. Which one?', opts: all.map(netSvg), a,
      exp: `Picture folding each net around one square as the base.<br>• A cube net never contains a 2 × 2 block of squares, a row of 5 or more, or two squares that fold onto the same face.<br>• Every cube net has at most 4 squares in a row, and the squares that stick out of a row of 4 must be on <b>opposite</b> sides of it.<br>The odd one out is <b>${'ABCDE'[a]}</b>. Try it with paper: cut out the net and fold it.` };
  } },

  // ---------------- 2D Space ----------------
  { key: 'foldPunch', topic: '2D Space', diff: 3, seeds: 8, make(r) {
    const two = r() < 0.6; const G = 4;
    // Fold 1: left half over onto the right half. Fold 2 (optional): bottom half up onto the top half.
    const region = [[2, 3], two ? [0, 1] : [0, 1, 2, 3]];
    const cand = region[0].flatMap(x => region[1].map(y => [x, y]));
    const holes = sample(r, cand, two ? int(r, 1, 2) : 2);
    const unfold = (hs, mx, my) => { const s = new Set(); for (const [x, y] of hs) { s.add(`${x},${y}`); if (mx) s.add(`${G - 1 - x},${y}`); if (my) s.add(`${x},${G - 1 - y}`); if (mx && my) s.add(`${G - 1 - x},${G - 1 - y}`); } return [...s].sort(); };
    const right = unfold(holes, true, two);
    const variants = [
      unfold(holes, false, two), unfold(holes, true, false), unfold(holes.map(([x, y]) => [x - 2, y]), false, two).concat(holes.map(h => h.join(','))),
      unfold(holes.map(([x, y]) => [x, two ? y : 3 - y]), true, two).map(s => { const [x, y] = s.split(','); return `${x},${(+y + 1) % G}`; }),
      [...new Set(holes.flatMap(([x, y]) => [`${x},${y}`, `${x - 2},${y}`, ...(two ? [`${x},${y + 2}`, `${x - 2},${y + 2}`] : [])]))].sort(),
      right.map(s => { const [x, y] = s.split(','); return `${y},${x}`; }).sort(),
    ].map(v => [...new Set(v)].sort()).filter(v => v.join(' ') !== right.join(' ') && v.every(s => s.split(',').every(n => +n >= 0 && +n < G)));
    const uniq = []; const seen = new Set([right.join(' ')]);
    for (const v of variants) { const k = v.join(' '); if (!seen.has(k)) { seen.add(k); uniq.push(v); } }
    if (uniq.length < 4) return null;
    const S = 22, paper = G * S;
    const grid = sel => svgWrap(paper, paper, `<rect x="0" y="0" width="${paper}" height="${paper}" fill="#fff" stroke="#555" stroke-width="1.5"/>${[1, 2, 3].map(i => `<line x1="${i * S}" y1="0" x2="${i * S}" y2="${paper}" stroke="#ddd"/><line x1="0" y1="${i * S}" x2="${paper}" y2="${i * S}" stroke="#ddd"/>`).join('')}${sel.map(s => { const [x, y] = s.split(',').map(Number); return `<circle class="hole" cx="${x * S + S / 2}" cy="${y * S + S / 2}" r="6" fill="#222"/>`; }).join('')}`, 'paper');
    const fx = 2 * S, fy = 0, fw = 2 * S, fh = (two ? 2 : 4) * S;
    const qsvg = svgWrap(paper, paper, `<rect x="0" y="0" width="${paper}" height="${paper}" fill="none" stroke="#bbb" stroke-dasharray="4 3"/><rect class="folded" x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#fff8e1" stroke="#333" stroke-width="2"/>${holes.map(([x, y]) => `<circle class="punch" cx="${x * S + S / 2}" cy="${y * S + S / 2}" r="6" fill="#222"/>`).join('')}`, 'folded paper with holes');
    const optsSel = shuffle(r, [right, ...uniq.slice(0, 4)]); const a = optsSel.findIndex(v => v.join(' ') === right.join(' '));
    return { q: `A square piece of paper is folded in half <b>from left to right</b>${two ? ', then folded in half again <b>from bottom to top</b>' : ''}. ${holes.length === 1 ? 'A hole is' : 'Holes are'} then punched right through all the layers, as shown (the dashed square is where the whole paper was before folding).${qsvg}Which picture shows the paper when it is unfolded?`,
      opts: optsSel.map(grid), a,
      exp: `Unfold one step at a time, in reverse order. Each fold is a mirror line, so every hole gets a <b>mirror image</b> across it.<br>${two ? '• Undo the bottom-to-top fold: each hole is reflected down across the middle line, doubling the holes.<br>' : ''}• Undo the left-to-right fold: every hole is reflected across the middle line onto the left half.<br>${holes.length} hole${holes.length > 1 ? 's' : ''} × ${two ? 4 : 2} layers = <b>${right.length} holes</b>, arranged symmetrically about ${two ? 'both fold lines' : 'the fold line'} → <b>${'ABCDE'[a]}</b>.` };
  } },
  { key: 'symFill', topic: '2D Space', diff: 2, make(r) {
    const W = 8, H = 5, S = 20; const mirror = x => W - 1 - x;
    const left = []; for (let x = 0; x < W / 2; x++) for (let y = 0; y < H; y++) if (r() < 0.38) left.push([x, y]);
    if (left.length < 4) return null;
    const already = sample(r, left, int(r, 0, Math.min(3, left.length - 2))).map(([x, y]) => [mirror(x), y]);
    const shaded = [...left, ...already]; const v = left.length - already.length;
    const svg = svgWrap(W * S, H * S, `${Array.from({ length: W * H }, (_, i) => `<rect x="${(i % W) * S}" y="${Math.floor(i / W) * S}" width="${S}" height="${S}" fill="#fff" stroke="#ccc"/>`).join('')}${shaded.map(([x, y]) => `<rect class="tile" x="${x * S}" y="${y * S}" width="${S}" height="${S}" fill="#333" stroke="#ccc"/>`).join('')}<line class="mirror" x1="${W / 2 * S}" y1="-2" x2="${W / 2 * S}" y2="${H * S + 2}" stroke="#d33" stroke-width="2.5" stroke-dasharray="6 4"/>`, 'tile pattern with a line of symmetry');
    const { opts, a } = sortedOptions(r, v, [left.length, v + 1, v - 1, already.length, shaded.length], N5);
    return { q: `Some squares in this grid are shaded. What is the <b>smallest</b> number of extra squares that must be shaded so that the red dashed line is a line of symmetry?${svg}`, opts, a,
      exp: `Each shaded square on the left needs a partner the same distance from the line on the right.<br>Left side: ${left.length} shaded squares. ${already.length ? `${already.length} of them already have a partner on the right.` : 'None of them has a partner yet.'}<br>Extra squares needed = ${left.length} − ${already.length} = <b>${v}</b>.<br><b>Tip:</b> count row by row, matching each shaded square with its mirror square.` };
  } },

  // ---------------- Perimeter ----------------
  { key: 'sqCut', topic: 'Perimeter', diff: 2, make(r) {
    const k = int(r, 2, 4), s = int(r, 2, 9); const big = 4 * k * s; const pieces = k * k; const ask = pick(r, ['one', 'total', 'more']);
    const v = ask === 'one' ? 4 * s : ask === 'total' ? pieces * 4 * s : pieces * 4 * s - big;
    const S = 30, svg = svgWrap(k * S, k * S, Array.from({ length: pieces }, (_, i) => `<rect x="${(i % k) * S}" y="${Math.floor(i / k) * S}" width="${S}" height="${S}" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.5"/>`).join(''), 'square cut into smaller squares');
    const { opts, a } = sortedOptions(r, v, [big / pieces, big / k, big, pieces * 4 * s, 4 * s, pieces * 4 * s - big, 4 * s * k].filter(x => Number.isInteger(x) && x !== v), N5, x => `${x} cm`);
    return { q: `A square has a perimeter of ${big} cm. It is cut into ${pieces} equal smaller squares, as shown.${svg}${ask === 'one' ? 'What is the perimeter of <b>one</b> small square?' : ask === 'total' ? 'What is the <b>total</b> perimeter of all the small squares added together?' : 'How much <b>longer</b> is the total perimeter of all the small squares than the perimeter of the original square?'}`, opts, a,
      exp: `Big square side = ${big} ÷ 4 = ${k * s} cm. There are ${k} small squares along each side, so each small side = ${k * s} ÷ ${k} = ${s} cm.<br>One small square: 4 × ${s} = ${4 * s} cm.${ask !== 'one' ? `<br>All ${pieces}: ${pieces} × ${4 * s} = ${pieces * 4 * s} cm.` : ''}${ask === 'more' ? `<br>Longer by ${pieces * 4 * s} − ${big} = ${v} cm.` : ''}<br>Answer: <b>${v} cm</b>.<br><b>Trap:</b> dividing the perimeter by the number of pieces doesn't work: cutting creates new edges.` };
  } },
  { key: 'rectSquares', topic: 'Perimeter', diff: 3, make(r) {
    const rr = int(r, 1, 3), cc = int(r, rr + 1, 5), s = int(r, 1, 4); const P = 2 * (rr + cc) * s; const n = rr * cc; const tot = 4 * n * s; const diff = tot - P;
    const fmt = x => (x >= 0 ? `Larger by ${x} m` : `Smaller by ${-x} m`);
    const { opts, a } = options(r, diff, [-diff, tot, -P / 2, P - n * s, diff - 2 * s, diff + 2 * s].filter(x => x !== 0), N5, fmt);
    if (!opts) return null;
    const S = 30, svg = svgWrap(cc * S, rr * S, Array.from({ length: n }, (_, i) => `<rect x="${(i % cc) * S}" y="${Math.floor(i / cc) * S}" width="${S}" height="${S}" fill="#fce4ec" stroke="#ad1457" stroke-width="1.2" stroke-dasharray="3 2"/>`).join('') + `<rect x="0" y="0" width="${cc * S}" height="${rr * S}" fill="none" stroke="#ad1457" stroke-width="2.5"/>`, 'rectangle made of squares');
    return { q: `A rectangular mat has a perimeter of ${P} m. It is cut along the dashed lines into ${n} identical squares.${svg}Compared with the original mat, is the total perimeter of all ${n} squares larger or smaller, and by how much?`, opts, a,
      exp: `The mat is ${cc} squares long and ${rr} ${rr === 1 ? 'square' : 'squares'} wide, so its perimeter is ${2 * (rr + cc)} square sides = ${P} m → one side = ${s} m.<br>${n} squares × 4 sides × ${s} m = ${tot} m.<br>${tot} − ${P} = ${diff} → <b>${fmt(diff)}</b>.<br>Cutting always adds edges, so the total perimeter gets <b>larger</b>.` };
  } },

  // ---------------- Area ----------------
  { key: 'pinwheel', topic: 'Area', diff: 3, make(r) {
    const w = int(r, 2, 6), L = w + int(r, 2, 7); const A = w * L; const hole = L - w; const ask = pick(r, ['side', 'area', 'outer']);
    const v = ask === 'side' ? hole : ask === 'area' ? hole * hole : (L + w) * (L + w);
    const k = 150 / (L + w); const R = (x, y, ww, hh, fill) => `<rect x="${(x * k).toFixed(1)}" y="${(y * k).toFixed(1)}" width="${(ww * k).toFixed(1)}" height="${(hh * k).toFixed(1)}" fill="${fill}" stroke="#333" stroke-width="1.5"/>`;
    const svg = svgWrap(150, 150, R(0, 0, L, w, '#fff') + R(L, 0, w, L, '#fff') + R(w, L, L, w, '#fff') + R(0, w, w, L, '#fff') + R(w, w, hole, hole, '#90a4ae'), 'four rectangles around a square');
    const unit = ask === 'side' ? 'cm' : 'cm²';
    const { opts, a } = sortedOptions(r, v, (ask === 'side' ? [L, L + w, w, hole + 1] : ask === 'area' ? [L * L, w * w, A, (hole + 1) ** 2, (hole - 1) ** 2] : [A * 4, (L + w) * (L + w) - hole * hole, L * L, 4 * A + hole]).filter(x => x > 0 && x !== v), N5, x => `${x} ${unit}`);
    return { q: `Four identical white rectangles are arranged around a shaded square, as shown (not to scale). Each rectangle is ${w} cm wide and has an area of ${A} cm².${svg}${ask === 'side' ? 'What is the side length of the shaded square?' : ask === 'area' ? 'What is the area of the shaded square?' : 'What is the area of the whole large square?'}`, opts, a,
      exp: `Length of each rectangle = area ÷ width = ${A} ÷ ${w} = ${L} cm.<br>Look along one side: a rectangle's length = its neighbour's width + the shaded square's side, so the shaded side = ${L} − ${w} = ${hole} cm.${ask === 'area' ? `<br>Shaded area = ${hole} × ${hole} = ${v} cm².` : ''}${ask === 'outer' ? `<br>The large square's side = length + width = ${L} + ${w} = ${L + w} cm, so its area = ${L + w} × ${L + w} = ${v} cm².<br>Check: 4 × ${A} + ${hole}² = ${4 * A + hole * hole} ✔` : ''}<br>Answer: <b>${v} ${unit}</b>.` };
  } },
];
