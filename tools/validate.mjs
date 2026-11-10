// Checks the question banks of every exam pack for structural mistakes. Run: node tools/validate.mjs
import { PACK, SUBJECTS, TOPIC_STRANDS, RUBRIC, BANKS, WRITING_TASKS as writing, CONCEPTS as concepts } from '../js/pack.js';
const { maths, thinking, reading } = BANKS;
import { balance } from '../js/balance.js';

let errors = 0;
const err = m => { errors++; console.error('✘', m); };
const ids = new Set();

function check(q, subject, nOpts) {
  if (ids.has(q.id)) err(`duplicate id ${q.id}`); ids.add(q.id);
  for (const f of ['id', 'topic', 'q', 'opts', 'exp']) if (!q[f]) err(`${q.id}: missing ${f}`);
  if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.opts.length) err(`${q.id}: bad answer index ${q.a}`);
  if (nOpts && q.opts.length !== nOpts) err(`${q.id}: expected ${nOpts} options, got ${q.opts.length}`);
  if (new Set(q.opts).size !== q.opts.length) err(`${q.id}: duplicate options`);
  if (!(q.topic in TOPIC_STRANDS[subject])) err(`${q.id}: unknown topic "${q.topic}"`);
  if (!concepts[q.topic]) err(`${q.id}: no concept notes for "${q.topic}"`);
  if (![1, 2, 3].includes(q.diff)) err(`${q.id}: diff must be 1-3`);
}

const dist = (qs) => qs.reduce((m, q) => { m['ABCDEFG'[q.a]] = (m['ABCDEFG'[q.a]] || 0) + 1; return m; }, {});
const count = (qs, key) => qs.reduce((m, q) => { m[key(q)] = (m[key(q)] || 0) + 1; return m; }, {});

maths.forEach(q => check(q, 'maths', 5));
thinking.forEach(q => check(q, 'thinking', 4));
const rq = reading.flatMap(p => p.questions.map(q => ({ ...q, type: p.type })));
reading.forEach(p => { if (!SUBJECTS.reading.strands.includes(p.type)) err(`${p.id}: unknown type ${p.type}`); });
rq.forEach(q => check(q, 'reading', null));
writing.forEach(w => { if (!w.prompt || !w.model) err(`${w.id}: incomplete`); });
if (RUBRIC.some(r => r.levels.length !== r.max)) err('rubric levels must match max');
if (RUBRIC.reduce((a, c) => a + c.max, 0) !== 25) err('rubric must total 25');

console.log(`Maths: ${maths.length} questions`, count(maths, q => TOPIC_STRANDS.maths[q.topic]), 'answers', dist(maths));
console.log(`Thinking: ${thinking.length} questions`, count(thinking, q => TOPIC_STRANDS.thinking[q.topic]), 'answers', dist(thinking));
console.log(`Reading: ${reading.length} texts, ${rq.length} questions`, count(rq, q => q.type));
const rb = reading.flatMap(p => balance(p.questions));
console.log('Answer spread shown to student → maths', dist(balance(maths)), '· thinking', dist(balance(thinking)), '· reading', dist(rb));
console.log(`Writing: ${writing.length} prompts`);

// ---- structure rules (keep the engine independent of any one exam or family) ----
import { readFileSync, readdirSync } from 'node:fs';
for (const f of ['id', 'name', 'shortName', 'region', 'student', 'defaultExamDate', 'sections', 'sectionOrder', 'taxonomy', 'reading', 'writing', 'concepts', 'banks', 'generators']) if (!PACK[f]) err(`pack ${PACK.id}: missing "${f}"`);
for (const k of PACK.sectionOrder) if (!PACK.sections[k]?.mock) err(`pack ${PACK.id}: section "${k}" has no mock format`);
const engine = [...readdirSync('js').filter(f => f.endsWith('.js')).map(f => `js/${f}`), ...readdirSync('js/gen').map(f => `js/gen/${f}`)];
for (const f of engine) {
  const src = readFileSync(f, 'utf8');
  if (f !== 'js/pack.js' && /from '\.\.?\/(\.\.\/)?packs\//.test(src)) err(`${f}: imports a pack directly. Use js/pack.js so other exams can plug in.`);
  if (/\bNSW\b|Selective/.test(src.replace(/\/\/.*$/gm, '')) && f !== 'js/pack.js') err(`${f}: names a specific exam. Use PACK.name / PACK.shortName.`);
  if (/India trip|Tamil|Boxing|Tuition/.test(src)) err(`${f}: contains family details. They belong in data/family.json.`);
}
if (errors) { console.error(`\n${errors} problem(s) found`); process.exit(1); }
console.log('\n✔ Question banks look good');
