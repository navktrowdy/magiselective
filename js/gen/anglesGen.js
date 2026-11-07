// Angle question generators with diagrams drawn to scale (SVG). Each make(r) returns { q, opts, a, exp }.
import { int, pick, sortedOptions, options } from './util.js';

const N5 = 5;
const deg = d => `${d}°`;
const rad = d => (d * Math.PI) / 180;
const P = (x, y, r, a) => [x + r * Math.cos(rad(a)), y + r * Math.sin(rad(a))]; // maths orientation (y up)

/**
 * Tiny scene renderer. Coordinates are in maths orientation (y up); the scene is scaled to fit.
 * lines: [[x1,y1,x2,y2,dashed?]] · arcs: [{c:[x,y], a1, a2, label, right, r}] (a1→a2 anticlockwise, degrees)
 * labels: [{p:[x,y], t, dx, dy}] · dots: [[x,y]] · ticks: [[x1,y1,x2,y2,count]] (equal-side marks)
 */
function scene({ lines = [], arcs = [], labels = [], dots = [], ticks = [] }, W = 300, H = 190) {
  const pts = lines.flatMap(l => [[l[0], l[1]], [l[2], l[3]]]);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const pad = 34, s = Math.min((W - 2 * pad) / Math.max(maxx - minx, 1), (H - 2 * pad) / Math.max(maxy - miny, 1));
  const ox = (W - (maxx - minx) * s) / 2, oy = (H - (maxy - miny) * s) / 2;
  const T = ([x, y]) => [ox + (x - minx) * s, H - (oy + (y - miny) * s)];
  const f = n => n.toFixed(1);
  let out = '';
  for (const l of lines) { const [a, b] = [T([l[0], l[1]]), T([l[2], l[3]])]; out += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="currentColor" stroke-width="2.2" ${l[4] ? 'stroke-dasharray="5 4"' : ''} stroke-linecap="round"/>`; }
  for (const t of ticks) { const [a, b] = [T([t[0], t[1]]), T([t[2], t[3]])]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
    for (let k = 0; k < (t[4] || 1); k++) { const off = (k - ((t[4] || 1) - 1) / 2) * 5; const cx = mx + off * Math.cos(ang - Math.PI / 2), cy = my + off * Math.sin(ang - Math.PI / 2);
      out += `<line x1="${f(cx - 6 * Math.cos(ang))}" y1="${f(cy - 6 * Math.sin(ang))}" x2="${f(cx + 6 * Math.cos(ang))}" y2="${f(cy + 6 * Math.sin(ang))}" stroke="currentColor" stroke-width="2"/>`; } }
  for (const a of arcs) {
    const c = T(a.c); const r = a.r || 24; let span = ((a.a2 - a.a1) % 360 + 360) % 360;
    if (a.right) { const p1 = [c[0] + 12 * Math.cos(-rad(a.a1)), c[1] + 12 * Math.sin(-rad(a.a1))], p3 = [c[0] + 12 * Math.cos(-rad(a.a2)), c[1] + 12 * Math.sin(-rad(a.a2))];
      const p2 = [p1[0] + p3[0] - c[0], p1[1] + p3[1] - c[1]]; out += `<path d="M${f(p1[0])} ${f(p1[1])} L${f(p2[0])} ${f(p2[1])} L${f(p3[0])} ${f(p3[1])}" fill="none" stroke="#e53935" stroke-width="1.8"/>`; }
    else { const s1 = [c[0] + r * Math.cos(-rad(a.a1)), c[1] + r * Math.sin(-rad(a.a1))], s2 = [c[0] + r * Math.cos(-rad(a.a2)), c[1] + r * Math.sin(-rad(a.a2))];
      out += `<path d="M${f(s1[0])} ${f(s1[1])} A${r} ${r} 0 ${span > 180 ? 1 : 0} 0 ${f(s2[0])} ${f(s2[1])}" fill="none" stroke="#e53935" stroke-width="1.8"/>`; }
    if (a.label) { const mid = a.a1 + span / 2; const lr = (a.right ? 20 : r) + 15; out += `<text x="${f(c[0] + lr * Math.cos(-rad(mid)))}" y="${f(c[1] + lr * Math.sin(-rad(mid)) + 5)}" font-size="14" font-weight="700" text-anchor="middle" fill="#c62828">${a.label}</text>`; }
  }
  for (const d of dots) { const p = T(d); out += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="3" fill="currentColor"/>`; }
  for (const l of labels) { const p = T(l.p); out += `<text x="${f(p[0] + (l.dx || 0))}" y="${f(p[1] + (l.dy || 0))}" font-size="13" text-anchor="middle" fill="currentColor">${l.t}</text>`; }
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" class="qsvg anglesvg" role="img" aria-label="angle diagram">${out}</svg>`;
}
const note = '<br><small class="muted">Diagram not drawn exactly to scale.</small>';

/** Triangle from base angles A (left) and B (right): returns points [L, R, apex]. */
function tri(A, B, L = 10) { const d = (L * Math.sin(rad(B))) / Math.sin(rad(A + B)); return [[0, 0], [L, 0], P(0, 0, d, A)]; }
const dir = (p, q) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;

export default [
  { key: 'angLine', topic: 'Angles', seeds: 10, diff: 1, make(r) {
    const a = int(r, 25, 155); const v = 180 - a; const left = r() < 0.5;
    const ray = P(0, 0, 9, left ? 180 - a : a);
    const svg = scene({ lines: [[-10, 0, 10, 0], [0, 0, ray[0], ray[1]]], arcs: left
      ? [{ c: [0, 0], a1: 180 - a, a2: 180, label: deg(a) }, { c: [0, 0], a1: 0, a2: 180 - a, label: 'x', r: 30 }]
      : [{ c: [0, 0], a1: 0, a2: a, label: deg(a) }, { c: [0, 0], a1: a, a2: 180, label: 'x', r: 30 }], dots: [[0, 0]] });
    const { opts, a: ai } = sortedOptions(r, v, [360 - a, a, Math.abs(90 - a) || 45, v + 10], N5, deg);
    return { q: `The angles sit on a straight line. Find <b>x</b>.${svg}`, opts, a: ai,
      exp: `Angles on a <b>straight line add to 180°</b>.<br>x = 180° − ${a}° = <b>${v}°</b>.<br><b>Check:</b> ${a} + ${v} = 180 ✔` };
  } },
  { key: 'angLine3', topic: 'Angles', seeds: 10, diff: 2, make(r) {
    const a = int(r, 25, 80), b = int(r, 25, 80); const v = 180 - a - b; if (v < 15) return null;
    const r1 = P(0, 0, 9, a), r2 = P(0, 0, 9, a + v);
    const svg = scene({ lines: [[-10, 0, 10, 0], [0, 0, r1[0], r1[1]], [0, 0, r2[0], r2[1]]], dots: [[0, 0]],
      arcs: [{ c: [0, 0], a1: 0, a2: a, label: deg(a) }, { c: [0, 0], a1: a, a2: a + v, label: 'x', r: 32 }, { c: [0, 0], a1: a + v, a2: 180, label: deg(b) }] });
    const { opts, a: ai } = sortedOptions(r, v, [360 - a - b, 90 - Math.min(a, b), a + b, v + 20], N5, deg);
    return { q: `Three angles sit on a straight line. Find <b>x</b>.${svg}`, opts, a: ai,
      exp: `All the angles on a straight line add to <b>180°</b>.<br>${a}° + ${b}° = ${a + b}°, so x = 180° − ${a + b}° = <b>${v}°</b>.` };
  } },
  { key: 'angPoint', topic: 'Angles', seeds: 10, diff: 2, make(r) {
    const a = int(r, 50, 110), b = int(r, 50, 110), c = int(r, 40, 100); const v = 360 - a - b - c; if (v < 40 || v > 150) return null;
    const dirs = [0, a, a + b, a + b + c]; const rays = dirs.map(d => P(0, 0, 9, d + 15));
    const svg = scene({ lines: rays.map(p => [0, 0, p[0], p[1]]), dots: [[0, 0]],
      arcs: [{ c: [0, 0], a1: 15, a2: 15 + a, label: deg(a) }, { c: [0, 0], a1: 15 + a, a2: 15 + a + b, label: deg(b) }, { c: [0, 0], a1: 15 + a + b, a2: 15 + a + b + c, label: deg(c) }, { c: [0, 0], a1: 15 + a + b + c, a2: 375, label: 'x', r: 30 }] });
    const { opts, a: ai } = sortedOptions(r, v, [180 - (a + b + c - 180) > 0 ? Math.abs(180 - (a + b + c)) : null, a + b + c, v + 10, v - 10], N5, deg);
    return { q: `Four angles meet at a point. Find <b>x</b>.${svg}`, opts, a: ai,
      exp: `Angles <b>around a point add to 360°</b> (a full turn).<br>${a} + ${b} + ${c} = ${a + b + c}, so x = 360 − ${a + b + c} = <b>${v}°</b>.<br><b>Trap:</b> using 180° is for angles on a straight line, not around a point.` };
  } },
  { key: 'angVert', topic: 'Angles', seeds: 10, diff: 2, make(r) {
    const a = int(r, 30, 80); const ask = pick(r, ['opp', 'adj']); const v = ask === 'opp' ? a : 180 - a;
    const L1 = P(0, 0, 10, a), L2 = P(0, 0, 10, 0);
    const svg = scene({ lines: [[-L1[0], -L1[1], L1[0], L1[1]], [-10, 0, 10, 0]], dots: [[0, 0]],
      arcs: [{ c: [0, 0], a1: 0, a2: a, label: deg(a) }, ask === 'opp' ? { c: [0, 0], a1: 180, a2: 180 + a, label: 'x' } : { c: [0, 0], a1: a, a2: 180, label: 'x', r: 30 }] });
    const { opts, a: ai } = sortedOptions(r, v, [ask === 'opp' ? 180 - a : a, 360 - a, 90 - a, v + 10], N5, deg);
    return { q: `Two straight lines cross. Find <b>x</b>.${svg}`, opts, a: ai,
      exp: ask === 'opp'
        ? `x and ${a}° are <b>vertically opposite</b> angles (across the crossing point, like an X). Vertically opposite angles are <b>equal</b>, so x = <b>${a}°</b>.`
        : `x and ${a}° sit next to each other <b>on a straight line</b>, so they add to 180°.<br>x = 180° − ${a}° = <b>${v}°</b>.<br>(The angle opposite x is also ${v}°: vertically opposite angles are equal.)` };
  } },
  { key: 'angTriD', topic: 'Angles', seeds: 10, diff: 1, make(r) {
    const A = int(r, 30, 85), B = int(r, 30, 85); const C = 180 - A - B; if (C < 20) return null;
    const [p, q, t] = tri(A, B); const which = pick(r, ['top', 'left']);
    const arcs = [
      { c: p, a1: 0, a2: A, label: which === 'left' ? 'x' : deg(A) }, { c: q, a1: 180 - B, a2: 180, label: deg(B) },
      { c: t, a1: dir(t, p), a2: dir(t, q), label: which === 'top' ? 'x' : deg(C) }];
    const v = which === 'top' ? C : A; const shown = which === 'top' ? [A, B] : [B, C];
    const svg = scene({ lines: [[...p, ...q], [...q, ...t], [...t, ...p]], arcs });
    const { opts, a: ai } = sortedOptions(r, v, [360 - shown[0] - shown[1], 90 - Math.min(...shown), shown[0] + shown[1], v + 10], N5, deg);
    return { q: `Find <b>x</b> in the triangle.${svg}${note}`, opts, a: ai,
      exp: `The three angles in <b>any triangle add to 180°</b>.<br>${shown[0]} + ${shown[1]} = ${shown[0] + shown[1]}, so x = 180 − ${shown[0] + shown[1]} = <b>${v}°</b>.` };
  } },
  { key: 'angRightTri', topic: 'Angles', seeds: 10, diff: 1, make(r) {
    const A = int(r, 20, 70); const v = 90 - A; const [p, q, t] = [[0, 0], [10, 0], [0, 10 * Math.tan(rad(A))]];
    const svg = scene({ lines: [[...p, ...q], [...q, ...t], [...t, ...p]], arcs: [{ c: p, a1: 0, a2: 90, right: true }, { c: q, a1: 180 - A, a2: 180, label: deg(A) }, { c: t, a1: 270, a2: dir(t, q), label: 'x' }] });
    const { opts, a: ai } = sortedOptions(r, v, [180 - A, A, 180 - 90 - v + 10 === v ? v + 20 : 100 - A, v - 10], N5, deg);
    return { q: `This triangle has a right angle (the small square). Find <b>x</b>.${svg}${note}`, opts, a: ai,
      exp: `Triangle angles add to 180°, and the square marks a <b>right angle = 90°</b>.<br>x = 180 − 90 − ${A} = <b>${v}°</b>.<br><b>Shortcut:</b> in a right-angled triangle, the other two angles add to 90°.` };
  } },
  { key: 'angIsoD', topic: 'Angles', seeds: 10, diff: 2, make(r) {
    const base = int(r, 25, 80); const apex = 180 - 2 * base; if (apex < 20) return null;
    const askApex = r() < 0.5; const [p, q, t] = tri(base, base); const v = askApex ? apex : base;
    const svg = scene({ lines: [[...p, ...q], [...q, ...t], [...t, ...p]], ticks: [[...p, ...t, 1], [...q, ...t, 1]],
      arcs: askApex ? [{ c: p, a1: 0, a2: base, label: deg(base) }, { c: t, a1: dir(t, p), a2: dir(t, q), label: 'x' }] : [{ c: t, a1: dir(t, p), a2: dir(t, q), label: deg(apex) }, { c: q, a1: 180 - base, a2: 180, label: 'x' }] });
    const { opts, a: ai } = sortedOptions(r, v, askApex ? [180 - base, base, 90 - base, v + 10] : [180 - apex, apex, 90 - apex / 2 + 10, v + 15], N5, deg);
    return { q: `The two sides marked with a dash are equal (isosceles triangle). Find <b>x</b>.${svg}${note}`, opts, a: ai,
      exp: `Equal sides → the two <b>base angles</b> (opposite the equal sides) are equal.<br>${askApex ? `Both base angles are ${base}°: x = 180 − ${base} − ${base} = <b>${apex}°</b>.` : `180 − ${apex} = ${180 - apex}, shared equally: x = ${180 - apex} ÷ 2 = <b>${base}°</b>.`}` };
  } },
  { key: 'angExt', topic: 'Angles', seeds: 10, diff: 3, make(r) {
    const A = int(r, 30, 75), B = int(r, 35, 80); if (A + B > 150) return null; const v = 180 - B; // = A + C
    const [p, q, t] = tri(A, B); const ext = [14, 0];
    const svg = scene({ lines: [[...p, ...ext], [...q, ...t], [...t, ...p]], dots: [q],
      arcs: [{ c: p, a1: 0, a2: A, label: deg(A) }, { c: t, a1: dir(t, p), a2: dir(t, q), label: deg(180 - A - B) }, { c: q, a1: 0, a2: 180 - B, label: 'x', r: 22 }] });
    const C = 180 - A - B;
    const { opts, a: ai } = sortedOptions(r, v, [B, A + B, 180 - A, 360 - v], N5, deg);
    return { q: `The bottom side of the triangle is extended to make an outside angle <b>x</b>. Find <b>x</b>.${svg}${note}`, opts, a: ai,
      exp: `<b>Method 1:</b> the inside angle at the bottom right = 180 − ${A} − ${C} = ${B}°. It sits on a straight line with x, so x = 180 − ${B} = <b>${v}°</b>.<br><b>Shortcut:</b> an exterior angle of a triangle equals the <b>sum of the two inside angles that are not next to it</b>: ${A}° + ${C}° = ${A + C}°.` };
  } },
  { key: 'angQuadD', topic: 'Angles', seeds: 10, diff: 2, make(r) {
    const a = int(r, 60, 130), b = int(r, 60, 130), c = int(r, 60, 130); const v = 360 - a - b - c; if (v < 50 || v > 150) return null;
    // draw a convex quadrilateral whose angles really are a, b, c, x (solve the last two side lengths so it closes)
    const ints = [a, b, c, v]; const h = [0]; for (let i = 1; i < 4; i++) h.push(h[i - 1] + 180 - ints[i]);
    const u = h.map(d => [Math.cos(rad(d)), Math.sin(rad(d))]); const l0 = 10, l1 = int(r, 6, 9);
    const rx = -(l0 * u[0][0] + l1 * u[1][0]), ry = -(l0 * u[0][1] + l1 * u[1][1]); const det = u[2][0] * u[3][1] - u[3][0] * u[2][1];
    const l2 = (rx * u[3][1] - u[3][0] * ry) / det, l3 = (u[2][0] * ry - rx * u[2][1]) / det; if (!(l2 > 3 && l3 > 3)) return null;
    const lens = [l0, l1, l2, l3]; const pts = [[0, 0]]; for (let i = 0; i < 3; i++) pts.push(P(pts[i][0], pts[i][1], lens[i], h[i]));
    const lines = pts.map((p, i) => [...p, ...pts[(i + 1) % 4]]);
    const arcs = pts.map((p, i) => ({ c: p, a1: dir(p, pts[(i + 1) % 4]), a2: dir(p, pts[(i + 3) % 4]), label: i === 3 ? 'x' : deg(ints[i]) }));
    const svg = scene({ lines, arcs });
    const { opts, a: ai } = sortedOptions(r, v, [180 - (a + b + c - 180), Math.abs(180 - a - b - c) || null, v + 10, v - 10], N5, deg);
    return { q: `Find <b>x</b> in the four-sided shape (quadrilateral).${svg}${note}`, opts, a: ai,
      exp: `The angles inside <b>any quadrilateral add to 360°</b> (it splits into two triangles: 2 × 180°).<br>${a} + ${b} + ${c} = ${a + b + c}, so x = 360 − ${a + b + c} = <b>${v}°</b>.` };
  } },
  { key: 'angRatio', topic: 'Angles', seeds: 10, diff: 3, make(r) {
    const total = pick(r, [90, 180]); const k = pick(r, total === 90 ? [2, 3, 5] : [2, 3, 4, 5]); const x = total / (k + 1); if (!Number.isInteger(x)) return null;
    const askBig = r() < 0.5; const v = askBig ? k * x : x;
    const svg = total === 90
      ? scene({ lines: [[0, 0, 10, 0], [0, 0, 0, 10], [0, 0, ...P(0, 0, 10, x)]], dots: [[0, 0]], arcs: [{ c: [0, 0], a1: 0, a2: x, label: 'a', r: 34 }, { c: [0, 0], a1: x, a2: 90, label: `${k}a`, r: 24 }, { c: [0, 0], a1: 0, a2: 90, right: true }] })
      : scene({ lines: [[-10, 0, 10, 0], [0, 0, ...P(0, 0, 9, x)]], dots: [[0, 0]], arcs: [{ c: [0, 0], a1: 0, a2: x, label: 'a' }, { c: [0, 0], a1: x, a2: 180, label: `${k}a`, r: 30 }] });
    const { opts, a: ai } = sortedOptions(r, v, [askBig ? x : k * x, total / k, total - k, v + 10], N5, deg);
    return { q: `${total === 90 ? 'A right angle' : 'A straight angle'} is split into two angles, <b>a</b> and <b>${k}a</b>. What is the size of <b>${askBig ? `${k}a` : 'a'}</b>?${svg}`, opts, a: ai,
      exp: `a + ${k}a = ${k + 1}a, and together they make ${total}°.<br>${k + 1}a = ${total} → a = ${total} ÷ ${k + 1} = ${x}°.${askBig ? `<br>${k}a = ${k} × ${x} = <b>${k * x}°</b>.` : `<br>So <b>a = ${x}°</b>.`}<br><b>Strategy:</b> count the "parts" (1 + ${k} = ${k + 1}), share the total, then multiply.` };
  } },
  { key: 'angTurn', topic: 'Angles', seeds: 10, diff: 1, make(r) {
    const [fr, v] = pick(r, [['a quarter of a turn', 90], ['half a turn', 180], ['three-quarters of a turn', 270], ['one-third of a turn', 120], ['two-thirds of a turn', 240], ['one-eighth of a turn', 45], ['one-sixth of a turn', 60], ['five-sixths of a turn', 300], ['three-eighths of a turn', 135]]);
    const { opts, a: ai } = sortedOptions(r, v, [v / 2, v * 2 <= 360 ? v * 2 : v - 30, 360 - v === v ? v + 30 : 360 - v, v + 15], N5, deg);
    return { q: `How many degrees are in <b>${fr}</b>?`, opts, a: ai, exp: `A full turn = <b>360°</b>.<br>${fr.replace(' of a turn', '').replace(' a turn', '')} of 360° = <b>${v}°</b>.<br>Useful facts: quarter turn = 90° (right angle), half turn = 180° (straight line).` };
  } },
  { key: 'angClockMove', topic: 'Angles', seeds: 10, diff: 2, make(r) {
    if (r() < 0.6) { const m1 = int(r, 0, 5) * 5, mins = int(r, 2, 10) * 5; const v = mins * 6; if (v > 360) return null; const h = int(r, 1, 11);
      const t1 = `${h}:${String(m1).padStart(2, '0')}`, t2m = m1 + mins; const t2 = `${h + Math.floor(t2m / 60)}:${String(t2m % 60).padStart(2, '0')}`;
      const { opts, a: ai } = sortedOptions(r, v, [mins, mins * 30 > 360 ? mins * 2 : mins * 30, v / 2, v + 30], N5, deg);
      return { q: `Through how many degrees does the <b>minute hand</b> of a clock turn between <b>${t1}</b> and <b>${t2}</b>?`, opts, a: ai,
        exp: `The minute hand turns 360° in 60 minutes, so <b>6° every minute</b> (or 30° every 5 minutes).<br>${mins} minutes × 6° = <b>${v}°</b>.` }; }
    const h1 = int(r, 1, 6), hrs = int(r, 1, 5); const v = hrs * 30;
    const { opts, a: ai } = sortedOptions(r, v, [hrs * 6, hrs * 60, v + 15, hrs * 360 > 720 ? v * 2 : hrs * 360 / 4], N5, deg);
    return { q: `Through how many degrees does the <b>hour hand</b> turn from <b>${h1}:00</b> to <b>${h1 + hrs}:00</b>?`, opts, a: ai,
      exp: `The hour hand turns 360° in 12 hours, so <b>30° every hour</b>.<br>${hrs} hour${hrs > 1 ? 's' : ''} × 30° = <b>${v}°</b>.` };
  } },
  { key: 'angPolyExt', topic: 'Angles', seeds: 10, diff: 3, make(r) {
    const [nm, n] = pick(r, [['pentagon', 5], ['hexagon', 6], ['octagon', 8], ['nonagon (9 sides)', 9], ['decagon (10 sides)', 10], ['dodecagon (12 sides)', 12]]);
    const ext = 360 / n, int2 = 180 - ext; const askInt = r() < 0.6; const v = askInt ? int2 : ext;
    const { opts, a: ai } = sortedOptions(r, v, askInt ? [ext, (n * 180) / n, ((n - 2) * 180), 360 - ext] : [int2, 180 / n, 360 / (n - 1) % 1 ? ext + 10 : 360 / (n - 1), ext * 2], N5, deg);
    return { q: `What is the size of each <b>${askInt ? 'interior (inside)' : 'exterior (outside)'} angle</b> of a <b>regular ${nm}</b>?`, opts, a: ai,
      exp: `Walking around any polygon you turn through one full turn, so the <b>exterior angles add to 360°</b>.<br>Regular ${nm}: each exterior angle = 360 ÷ ${n} = ${ext}°.${askInt ? `<br>Interior + exterior make a straight line: interior = 180 − ${ext} = <b>${int2}°</b>.` : ` → <b>${ext}°</b>.`}<br>Check: ${n} × ${int2} = ${n * int2}° = (${n} − 2) × 180 ✔` };
  } },
  { key: 'angKind', topic: 'Angles', seeds: 10, diff: 1, make(r) {
    const a = pick(r, [int(r, 20, 75), int(r, 100, 165), int(r, 200, 330), 90, 180]);
    const name = a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : 'Reflex';
    const p = P(0, 0, 10, a);
    const svg = scene({ lines: [[0, 0, 10, 0], [0, 0, p[0], p[1]]], dots: [[0, 0]], arcs: a === 90 ? [{ c: [0, 0], a1: 0, a2: 90, right: true }] : [{ c: [0, 0], a1: 0, a2: a, label: '?' }] });
    const est = Math.round(a / 5) * 5;
    if (r() < 0.5) { const { opts, a: ai } = options(r, name, ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex'].filter(x => x !== name), N5);
      return { q: `What type of angle is marked?${svg}`, opts, a: ai, exp: `Acute &lt; 90° · Right = 90° · Obtuse between 90° and 180° · Straight = 180° · <b>Reflex</b> between 180° and 360°.<br>The marked angle is about ${est}°, so it is <b>${name.toLowerCase()}</b>.<br><b>Tip:</b> compare it with a square corner (90°) and a straight line (180°).` }; }
    if (a === 90 || a === 180) return null;
    const { opts, a: ai } = sortedOptions(r, est, [360 - est, 180 - est > 0 ? 180 - est : est + 90, Math.abs(90 - est) || est + 40, est + 60 < 360 ? est + 60 : est - 60], N5, deg);
    return { q: `Which is the <b>best estimate</b> for the marked angle?${svg}`, opts, a: ai,
      exp: `Compare with benchmarks: a square corner is 90°, a straight line 180°, three-quarters of a turn 270°.<br>This angle is ${name.toLowerCase()} and about <b>${est}°</b>.${a > 180 ? '<br><b>Trap:</b> the arc goes the LONG way round, so it is a reflex angle, not the small angle.' : ''}` };
  } },
  { key: 'angIsoExt', topic: 'Angles', seeds: 10, diff: 3, make(r) {
    const e = int(r, 100, 160); const base = 180 - e; const apex = 180 - 2 * base; if (apex < 15) return null;
    const [p, q, t] = tri(base, base); const ext = [14, 0];
    const svg = scene({ lines: [[...p, ...ext], [...q, ...t], [...t, ...p]], ticks: [[...p, ...t, 1], [...q, ...t, 1]], dots: [q],
      arcs: [{ c: q, a1: 0, a2: 180 - base, label: deg(e), r: 20 }, { c: t, a1: dir(t, p), a2: dir(t, q), label: 'x' }] });
    const { opts, a: ai } = sortedOptions(r, apex, [base, 180 - e, e - base, 2 * base], N5, deg);
    return { q: `The triangle is isosceles (dashes mark equal sides) and its base is extended. Find <b>x</b>.${svg}${note}`, opts, a: ai,
      exp: `Step 1: the inside angle next to ${e}° is on a straight line: 180 − ${e} = ${base}°.<br>Step 2: isosceles → the other base angle is also ${base}°.<br>Step 3: x = 180 − ${base} − ${base} = <b>${apex}°</b>.<br><b>Strategy:</b> fill in every angle you can, one rule at a time.` };
  } },
];
