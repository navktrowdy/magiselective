// Potalien rendering (SVG) and progress maths (XP, stardust, streak, mood, badges).
// Progress is derived from saved results, so it is identical on every device.

import { SPECIES, STAGES, SHOP, BADGES, TALK } from './data/pets.js';
import { BASELINE, ROUTINE } from './data/config.js';
import { isBreakDay, today as todayLocal } from './breaks.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const speciesById = id => SPECIES.find(s => s.id === id) || SPECIES[0];
export const say = (kind, vars = {}) => pick(TALK[kind]).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

// ------------------------------------------------------------------ progress
const dayKey = iso => iso.slice(0, 10);
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Planned rest days (e.g. tuition days) never break a streak or make the pet sad.
const isRestDay = d => ROUTINE[DOW[new Date(d + 'T00:00:00').getDay()]]?.mins === 0 || isBreakDay(d);
const prevPlanned = d => { let x = addDays(d, -1); for (let i = 0; i < 7 && isRestDay(x); i++) x = addDays(x, -1); return x; };
const localToday = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export function xpForResult(r, lastOutcome) {
  let xp = 0;
  for (const it of r.items || []) {
    if (it.chosen !== null) xp += 2;
    if (it.correct) xp += 10;
    if (it.correct && lastOutcome.get(it.qid) === false) xp += 5; // fixed a past mistake
  }
  if (r.mode === 'mock' && r.subject !== 'writing') xp += 30;
  if (r.mode === 'mini') xp += 15;
  if (r.subject === 'writing') xp += 40 + (r.score || 0) * 2;
  if (r.mode === 'exam') xp += 50;
  return xp;
}

export function computeProgress(results, profile) {
  const rs = [...results].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
  const last = new Map();
  let xp = 0, totalQ = 0, fixes = 0;
  const earned = new Set();
  const subjects = new Set();
  const topicStats = {};
  let writing = 0;
  for (const r of rs) {
    xp += xpForResult(r, last);
    if (r.mode !== 'exam') subjects.add(r.subject);
    if (r.subject === 'writing' && r.mode !== 'exam') writing++;
    const items = r.items || [];
    for (const it of items) {
      if (it.correct && last.get(it.qid) === false) fixes++;
      last.set(it.qid, it.correct);
      totalQ++;
      const t = topicStats[it.topic] || (topicStats[it.topic] = { c: 0, n: 0 });
      t.n++; if (it.correct) t.c++;
    }
    if (r.mode === 'exam') continue;
    earned.add('liftoff');
    if (items.length >= 5 && items.every(i => i.correct)) earned.add('perfect');
    if (r.mode === 'mock' && r.subject !== 'writing') {
      earned.add('mission');
      if (items.every(i => i.chosen !== null)) earned.add('noblanks');
      const avg = BASELINE[r.subject]?.cohortAverage;
      if (avg && (r.score / r.total) * 100 > avg) earned.add('abovecrowd');
    }
  }
  if (['reading', 'maths', 'thinking', 'writing'].every(s => subjects.has(s))) earned.add('explorer');
  if (totalQ >= 100) earned.add('q100'); if (totalQ >= 500) earned.add('q500'); if (totalQ >= 1000) earned.add('q1000');
  if (fixes >= 10) earned.add('comeback');
  if (writing >= 3) earned.add('writer');
  if (Object.values(topicStats).some(t => t.n >= 8 && t.c / t.n >= 0.8)) earned.add('skillstar');

  // streak of consecutive days with practice (today or yesterday counts as "alive")
  const days = new Set(rs.filter(r => r.mode !== 'exam').map(r => dayKey(new Date(new Date(r.finishedAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString())));
  const today = localToday();
  let streak = 0; let d = days.has(today) || isRestDay(today) ? today : prevPlanned(today);
  if (!days.has(d)) d = prevPlanned(d);
  while (days.has(d)) { streak++; d = prevPlanned(d); }
  let best = 0, run = 0, prev = null;
  for (const day of [...days].sort()) { run = prev && (prevPlanned(day) === prev || addDays(prev, 1) === day) ? run + 1 : 1; best = Math.max(best, run); prev = day; }
  if (best >= 3) earned.add('streak3'); if (best >= 7) earned.add('streak7'); if (best >= 14) earned.add('streak14');

  const lastDay = [...days].sort().pop();
  // gap counted in planned practice days only
  let gap = 99;
  if (lastDay) { gap = 0; let x = today; while (x > lastDay && gap < 99) { if (!isRestDay(x)) gap++; x = addDays(x, -1); } }
  const mood = isBreakDay(todayLocal()) ? 'holiday' : !lastDay || gap === 0 ? 'happy' : gap === 1 ? 'content' : gap <= 3 ? 'missing' : 'sleepy';

  let stageIdx = 0;
  STAGES.forEach((s, i) => { if (xp >= s.xp) stageIdx = i; });
  const next = STAGES[stageIdx + 1];
  const coins = Math.floor(xp / 4) - (profile?.spent || 0);
  return {
    xp, coins, totalQ, fixes, streak, bestStreak: best, mood, practisedToday: gap === 0,
    stageIdx, stage: STAGES[stageIdx], next,
    stagePct: next ? Math.round(((xp - STAGES[stageIdx].xp) / (next.xp - STAGES[stageIdx].xp)) * 100) : 100,
    badges: BADGES.map(b => ({ ...b, earned: earned.has(b.id) })),
  };
}

export const shopItem = id => SHOP.find(s => s.id === id);

// ------------------------------------------------------------------ SVG
const BG = {
  moon: `<rect width="200" height="200" rx="28" fill="#1f2a44"/><ellipse cx="100" cy="205" rx="140" ry="40" fill="#c9c9d1"/><circle cx="60" cy="190" r="7" fill="#aeb0bb"/><circle cx="150" cy="185" r="5" fill="#aeb0bb"/>`,
  farm: `<rect width="200" height="200" rx="28" fill="#bfe3f5"/><ellipse cx="100" cy="210" rx="150" ry="50" fill="#7cb46b"/><circle cx="165" cy="35" r="14" fill="#ffe082"/>`,
  mars: `<rect width="200" height="200" rx="28" fill="#5a2a27"/><ellipse cx="100" cy="208" rx="150" ry="45" fill="#c8553d"/><circle cx="40" cy="40" r="10" fill="#f4a261" opacity=".6"/>`,
  galaxy: `<rect width="200" height="200" rx="28" fill="#2a1b4d"/><ellipse cx="100" cy="100" rx="95" ry="30" fill="#7b5ea7" opacity=".35" transform="rotate(-25 100 100)"/>`,
  nebula: `<defs><linearGradient id="neb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a9e"/><stop offset=".5" stop-color="#a18cd1"/><stop offset="1" stop-color="#84fab0"/></linearGradient></defs><rect width="200" height="200" rx="28" fill="url(#neb)"/>`,
};
const STARS = [[20, 30], [45, 70], [170, 60], [150, 20], [30, 120], [180, 130], [95, 15], [125, 45]]
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff" opacity=".8"/>`).join('');

const EYE_POS = { 1: [[100, 100, 21]], 2: [[82, 100, 13], [118, 100, 13]], 3: [[78, 100, 10], [100, 86, 10], [122, 100, 10]] };

function eyes(n, mood) {
  if (mood === 'holiday') return '';
  return EYE_POS[n].map(([x, y, r]) => {
    if (mood === 'sleepy') return `<path d="M${x - r} ${y} q${r} ${r * 0.8} ${2 * r} 0" stroke="#3b2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const p = mood === 'excited' ? r * 0.62 : r * 0.5;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#3b2a1a" stroke-width="2"/><circle cx="${x}" cy="${y + 1}" r="${p}" fill="#2b1d12"/><circle cx="${x + p * 0.4}" cy="${y - p * 0.4}" r="${p * 0.35}" fill="#fff"/>`;
  }).join('');
}

const MOUTHS = {
  happy: '<path d="M84 128 q16 16 32 0" stroke="#3b2a1a" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
  excited: '<path d="M84 126 q16 22 32 0 z" fill="#7a2e2e" stroke="#3b2a1a" stroke-width="3"/><path d="M92 136 q8 6 16 0" fill="#ff8a80"/>',
  content: '<path d="M88 130 q12 9 24 0" stroke="#3b2a1a" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
  missing: '<path d="M88 136 q12 -9 24 0" stroke="#3b2a1a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M128 108 q3 7 0 10 q-3 -3 0 -10" fill="#64b5f6"/>',
  sleepy: '<ellipse cx="100" cy="132" rx="6" ry="4" fill="#3b2a1a"/><text x="140" y="60" font-size="18" fill="#fff" stroke="#3b2a1a" stroke-width=".6" font-weight="700">z</text><text x="152" y="44" font-size="13" fill="#fff" stroke="#3b2a1a" stroke-width=".5" font-weight="700">z</text>',
  oops: '<path d="M86 132 q5 -6 10 0 q5 6 10 0 q5 -6 10 0" stroke="#3b2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>',
};

function antennae(n, glow) {
  const xs = n === 1 ? [100] : n === 2 ? [84, 116] : [78, 100, 122];
  return xs.map((x, i) => {
    const tip = x + (x - 100) * 0.5; const ty = n === 3 && i === 1 ? 14 : 22;
    return `<path d="M${x} 56 Q${(x + tip) / 2} ${ty + 18} ${tip} ${ty}" stroke="#5d4630" stroke-width="3" fill="none"/>` +
      (glow ? `<circle cx="${tip}" cy="${ty}" r="11" fill="#b2ff59" opacity=".35"/>` : '') +
      `<circle cx="${tip}" cy="${ty}" r="6" fill="${glow ? '#b2ff59' : '#8bc34a'}" stroke="#3b2a1a" stroke-width="1.5"/>`;
  }).join('');
}

const ACC = {
  helmet: '<circle cx="100" cy="108" r="78" fill="#bde3ff" opacity=".22" stroke="#90caf9" stroke-width="4"/><path d="M50 80 q20 -40 60 -45" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>',
  crown: '<polygon points="72,58 76,28 89,45 100,22 111,45 124,28 128,58" fill="#ffd54f" stroke="#c79a00" stroke-width="2.5"/><circle cx="100" cy="40" r="4" fill="#e53935"/>',
  partyhat: '<polygon points="82,58 100,6 118,58" fill="#f48fb1" stroke="#c2185b" stroke-width="2"/><path d="M88 42 L112 42 M85 50 L115 50" stroke="#fff59d" stroke-width="3"/><circle cx="100" cy="7" r="6" fill="#fff176"/>',
  bow: '<path d="M118 52 l18 -14 l0 26 z M118 52 l-18 -14 l0 26 z" fill="#f06292" stroke="#ad1457" stroke-width="2"/><circle cx="118" cy="52" r="5" fill="#ad1457"/>',
  wizard: '<polygon points="74,60 112,0 126,60" fill="#5e35b1" stroke="#311b92" stroke-width="2"/><ellipse cx="100" cy="60" rx="38" ry="7" fill="#4527a0"/><text x="98" y="40" font-size="13" fill="#ffd54f">★</text>',
  headphones: '<path d="M50 104 Q50 34 100 34 Q150 34 150 104" stroke="#37474f" stroke-width="7" fill="none"/><rect x="38" y="92" width="18" height="30" rx="8" fill="#e53935"/><rect x="144" y="92" width="18" height="30" rx="8" fill="#e53935"/>',
  roundglasses: '<circle cx="82" cy="100" r="17" fill="none" stroke="#263238" stroke-width="3.5"/><circle cx="118" cy="100" r="17" fill="none" stroke="#263238" stroke-width="3.5"/><path d="M99 100 h2" stroke="#263238" stroke-width="3.5"/>',
  starglasses: '<g fill="#ff4081" fill-opacity=".35" stroke="#c51162" stroke-width="3"><polygon points="82,80 87,94 102,94 90,103 95,118 82,109 69,118 74,103 62,94 77,94"/><polygon points="118,80 123,94 138,94 126,103 131,118 118,109 105,118 110,103 98,94 113,94"/></g>',
  bowtie: '<path d="M100 150 l-18 -10 l0 20 z M100 150 l18 -10 l0 20 z" fill="#1e88e5" stroke="#0d47a1" stroke-width="2"/><circle cx="100" cy="150" r="4" fill="#0d47a1"/>',
  scarf: '<path d="M58 140 q42 20 84 0 l2 12 q-44 22 -88 0 z" fill="#e53935"/><path d="M120 150 l8 30 l12 -4 l-6 -28 z" fill="#c62828"/>',
};
const CAPE = '<path d="M62 120 L40 190 Q100 205 160 190 L138 120 Z" fill="#c62828" stroke="#8e0000" stroke-width="2"/>';

/**
 * Draw a Potalien. opts: {species, stage, mood, equipped:{head,face,neck,bg}, size, bg:boolean}
 */
export function petSvg({ species = 'spudnik', stage = 0, mood = 'happy', equipped = {}, size = 160, bg = true } = {}) {
  const sp = speciesById(species);
  const parts = [];
  if (bg) parts.push(`<g clip-path="url(#bgclip)">${BG[equipped.bg] || BG.moon}${['moon', 'galaxy', 'mars'].includes(equipped.bg || 'moon') ? STARS : ''}</g>`);
  if (stage >= 4) parts.push('<circle cx="100" cy="112" r="80" fill="url(#aura)"/>');
  if (sp.tail) parts.push('<path d="M45 125 Q5 115 -5 150 Q25 130 48 140 Z" fill="#ffb74d" opacity=".9"/><path d="M45 132 Q15 128 5 150 Q28 138 48 142 Z" fill="#fff176"/>');
  if (equipped.neck === 'cape') parts.push(CAPE);
  parts.push(antennae(sp.antennae, stage >= 2));
  // body
  parts.push(`<path d="M100 50 C142 47 166 80 163 118 C160 156 132 178 98 176 C62 174 37 150 40 112 C43 76 63 52 100 50 Z" fill="${sp.body}" stroke="#5d4630" stroke-width="3"/>`);
  parts.push(`<ellipse cx="60" cy="125" rx="5" ry="3.5" fill="${sp.spots}"/><ellipse cx="140" cy="135" rx="6" ry="4" fill="${sp.spots}"/><ellipse cx="128" cy="68" rx="4" ry="3" fill="${sp.spots}"/><ellipse cx="75" cy="160" rx="5" ry="3" fill="${sp.spots}"/>`);
  // arms & feet
  const wave = mood === 'excited';
  parts.push(`<path d="M42 122 q-16 ${wave ? -26 : 4} -20 ${wave ? -30 : 14}" stroke="#5d4630" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M158 122 q16 ${wave ? -26 : 4} 20 ${wave ? -30 : 14}" stroke="#5d4630" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="80" cy="177" rx="13" ry="6" fill="#5d4630"/><ellipse cx="120" cy="177" rx="13" ry="6" fill="#5d4630"/>`);
  if (stage >= 1) parts.push('<path d="M98 51 q-4 -18 -18 -22 q2 16 18 22 z" fill="#66bb6a" stroke="#2e7d32" stroke-width="1.5"/><path d="M100 51 q6 -14 18 -14 q-4 12 -18 14 z" fill="#81c784" stroke="#2e7d32" stroke-width="1.5"/>');
  parts.push(eyes(sp.eyes, mood));
  parts.push('<ellipse cx="66" cy="122" rx="8" ry="5" fill="#ff8a80" opacity=".55"/><ellipse cx="134" cy="122" rx="8" ry="5" fill="#ff8a80" opacity=".55"/>');
  parts.push(MOUTHS[mood] || MOUTHS.happy);
  if (mood === 'holiday') parts.push('<g><rect x="62" y="88" width="34" height="22" rx="9" fill="#1d1d1d"/><rect x="104" y="88" width="34" height="22" rx="9" fill="#1d1d1d"/><path d="M96 96 h8" stroke="#1d1d1d" stroke-width="4"/><path d="M68 93 l8 -3" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M60 58 q40 -30 80 0 q-40 -12 -80 0" fill="#ffcc4d" stroke="#c79a00" stroke-width="2"/><ellipse cx="100" cy="58" rx="52" ry="9" fill="#ffd966" stroke="#c79a00" stroke-width="2"/></g>');
  if (stage >= 3) parts.push('<polygon points="100,140 104,150 115,150 106,157 109,168 100,161 91,168 94,157 85,150 96,150" fill="#ffd54f" stroke="#c79a00" stroke-width="1.5"/>');
  for (const slot of ['neck', 'face', 'head']) if (equipped[slot] && ACC[equipped[slot]]) parts.push(ACC[equipped[slot]]);
  if (stage >= 5) parts.push('<g fill="#fff59d"><text x="30" y="70" font-size="16">✦</text><text x="160" y="90" font-size="14">✦</text><text x="150" y="170" font-size="12">✦</text><text x="28" y="165" font-size="12">✦</text></g>');
  return `<svg viewBox="-10 -5 220 210" width="${size}" height="${size}" class="potalien" role="img" aria-label="${sp.name}">
    <defs><clipPath id="bgclip"><rect width="200" height="200" rx="28"/></clipPath><radialGradient id="aura"><stop offset=".55" stop-color="#ffe082" stop-opacity=".0"/><stop offset=".8" stop-color="#ffd54f" stop-opacity=".55"/><stop offset="1" stop-color="#ffd54f" stop-opacity="0"/></radialGradient></defs>
    ${parts.join('')}</svg>`;
}
