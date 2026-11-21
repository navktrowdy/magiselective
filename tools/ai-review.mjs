// AI question checker: Claude solves each question WITHOUT seeing the answer key, then any disagreement
// is reviewed a second time with the key and explanation shown.
// It finds wrong answer keys, questions with more than one defensible answer, and wording a Year 5 child
// could misread. It complements the exact checks (validate, gencheck, audit-generators, answer-key).
//
//   node tools/ai-review.mjs --changed origin/main   questions added or edited since that git ref (pull requests)
//   node tools/ai-review.mjs --sample 40             a random sample of the whole bank
//   node tools/ai-review.mjs --all                   every hand-written question + 2 versions of every generator
//   node tools/ai-review.mjs --ids t149,m12,g:maths:pctOf:3
//   add --dry-run to list what would be checked without calling Claude.
//
// Needs ANTHROPIC_API_KEY (a GitHub Actions secret in CI). Without it the script explains and exits 0.
// Exit code 1 only when Claude is confident an answer key is WRONG; other findings are warnings.
import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { BANKS } from '../js/pack.js';

const { generate, generatorsFor } = await import('../js/gen/index.js');
const MODEL = 'claude-opus-5-5';
const CONCURRENCY = 4;
const MAX_ITEMS = Number(process.env.AI_REVIEW_MAX || 600); // cost guard
const L = 'ABCDEFG';

// ---------- collect the questions ----------
const args = process.argv.slice(2);
const flag = k => args.includes(k);
const val = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };

function allItems() {
  const out = [];
  for (const q of BANKS.maths) out.push({ id: q.id, subject: 'maths', topic: q.topic, q: q.q, opts: q.opts, a: q.a, exp: q.exp });
  for (const q of BANKS.thinking) out.push({ id: q.id, subject: 'thinking', topic: q.topic, q: q.q, opts: q.opts, a: q.a, exp: q.exp });
  for (const p of BANKS.reading) for (const q of p.questions) out.push({ id: q.id, subject: 'reading', topic: q.topic, passage: `${p.title}\n${p.text}`, q: q.q, opts: q.opts, a: q.a, exp: q.exp });
  return out;
}
const genItem = (subject, key, seed) => { const g = generate(subject, key, seed); return { id: g.id, subject, topic: g.topic, q: g.q, opts: g.opts, a: g.a, exp: g.exp }; };
const genKeys = () => ['maths', 'thinking'].flatMap(s => generatorsFor(s).map(g => [s, g.key]));

function changedSelection(base) {
  const diff = execSync(`git diff --unified=0 ${base}...HEAD -- js/packs js/gen`, { encoding: 'utf8', maxBuffer: 1 << 26 });
  const added = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));
  const ids = new Set(added.flatMap(l => [...l.matchAll(/\bid: *'([^']+)'/g)].map(m => m[1])));
  const keys = new Set(added.flatMap(l => [...l.matchAll(/\bkey: *'([^']+)'/g)].map(m => m[1])));
  // an edit inside a question (not on its id line) still counts: find the id of the enclosing question
  for (const file of new Set([...diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map(m => m[1]))) {
    const lines = execSync(`git show HEAD:${file}`, { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n');
    const hunks = [...diff.split(`+++ b/${file}`)[1]?.split(/^diff --git/m)[0].matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm) || []];
    for (const h of hunks) {
      const start = +h[1], n = h[2] === undefined ? 1 : +h[2];
      for (let ln = start; ln < start + Math.max(n, 1); ln++) for (let k = ln - 1; k >= 0 && k > ln - 40; k--) {
        const m = lines[k]?.match(/\b(id|key): *'([^']+)'/); if (m) { (m[1] === 'id' ? ids : keys).add(m[2]); break; }
      }
    }
  }
  const items = allItems().filter(x => ids.has(x.id));
  for (const [s, k] of genKeys()) if (keys.has(k)) for (const seed of [11, 222, 3333]) items.push(genItem(s, k, seed));
  return items;
}

function select() {
  if (val('--ids')) {
    const want = val('--ids').split(',');
    return [...allItems().filter(x => want.includes(x.id)),
      ...want.filter(w => w.startsWith('g:')).map(w => { const [, s, k, seed] = w.split(':'); return genItem(s, k, +seed); })];
  }
  if (val('--changed')) return changedSelection(val('--changed'));
  const pool = [...allItems(), ...genKeys().flatMap(([s, k]) => [genItem(s, k, 101), genItem(s, k, 202)])];
  if (flag('--all')) return pool;
  const n = Number(val('--sample') || 40);
  return pool.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).slice(0, n).map(x => x[1]);
}

// ---------- Claude ----------
const SOLVE_SYSTEM = `You check multiple-choice questions written for a Year 5–6 student preparing for a selective school entry test (Reading, Mathematical Reasoning, Thinking Skills).
Solve the question yourself, carefully, as an expert would. The question may contain HTML and inline SVG diagrams: read the SVG coordinates and labels as the diagram.
Then judge the question itself:
- other_defensible: letters of any OTHER options a careful expert could also defend as correct (empty if exactly one option is right).
- issues: concrete problems only (missing information, a diagram that contradicts the text, two right answers, wording a 10-year-old could reasonably misread, an answer that needs knowledge beyond Year 6). Empty if none. Never list style preferences.`;

const SOLVE_SCHEMA = { type: 'object', additionalProperties: false, required: ['answer', 'confidence', 'working', 'other_defensible', 'issues'],
  properties: {
    answer: { type: 'string', description: 'The single best option letter, e.g. "C".' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    working: { type: 'string', description: 'Short working, at most 4 sentences.' },
    other_defensible: { type: 'array', items: { type: 'string' } },
    issues: { type: 'array', items: { type: 'string' } },
  } };

const REVIEW_SYSTEM = `You review a disputed answer key for a Year 5–6 selective-test practice question. A solver who did not see the key chose a different option.
Decide which is right. verdict:
- "key_correct": the marked answer is right and the solver made a mistake.
- "key_wrong": the marked answer is wrong; give the correct letter.
- "ambiguous": more than one option is defensible, or the question is missing information; say what to change.
Be decisive and only say key_wrong when you are sure.`;

const REVIEW_SCHEMA = { type: 'object', additionalProperties: false, required: ['verdict', 'correct_answer', 'reason', 'fix'],
  properties: {
    verdict: { type: 'string', enum: ['key_correct', 'key_wrong', 'ambiguous'] },
    correct_answer: { type: 'string', description: 'Letter you believe is correct.' },
    reason: { type: 'string', description: 'At most 3 sentences.' },
    fix: { type: 'string', description: 'Suggested change to the question, options or key; empty if none.' },
  } };

const render = (x) => `${x.passage ? `PASSAGE:\n${x.passage}\n\n` : ''}SUBJECT: ${x.subject} · TOPIC: ${x.topic}\n\nQUESTION:\n${x.q}\n\nOPTIONS:\n${x.opts.map((o, i) => `${L[i]}. ${o}`).join('\n')}`;

let client, Anthropic;
async function ask(system, user, schema, effort) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await client.beta.messages.create({
        model: MODEL, max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
        output_config: { effort, format: { type: 'json_schema', schema } },
        system, messages: [{ role: 'user', content: user }],
      });
      if (res.stop_reason === 'refusal') return { refused: true };
      const txt = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
      return { ...JSON.parse(txt), usage: res.usage };
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) throw new Error('ANTHROPIC_API_KEY was not accepted.');
      if (e instanceof Anthropic.BadRequestError) throw e;
      if (attempt === 2) throw e; // the SDK already retries 429/5xx; this covers bad JSON and network drops
    }
  }
}

async function check(x) {
  const solved = await ask(SOLVE_SYSTEM, render(x), SOLVE_SCHEMA, 'medium');
  if (solved.refused) return { x, status: 'refused' };
  const key = L[x.a], mine = String(solved.answer).trim().toUpperCase().slice(0, 1);
  const result = { x, key, solved, status: 'ok' };
  if (mine !== key) {
    const review = await ask(REVIEW_SYSTEM, `${render(x)}\n\nMARKED ANSWER: ${key}\nAUTHOR'S EXPLANATION:\n${x.exp}\n\nSOLVER CHOSE: ${mine}\nSOLVER'S WORKING: ${solved.working}`, REVIEW_SCHEMA, 'high');
    result.review = review;
    result.status = review.refused ? 'refused' : review.verdict === 'key_wrong' ? 'wrong' : review.verdict === 'ambiguous' ? 'ambiguous' : 'ok';
  } else if (solved.other_defensible?.some(l => l !== key)) result.status = 'ambiguous';
  if (result.status === 'ok' && solved.issues?.length) result.status = 'note';
  return result;
}

// ---------- run ----------
let items = select();
if (items.length > MAX_ITEMS) { console.log(`Limiting ${items.length} questions to ${MAX_ITEMS} (set AI_REVIEW_MAX to change).`); items = items.slice(0, MAX_ITEMS); }
console.log(`AI review: ${items.length} question(s) with ${MODEL}.`);
if (!items.length) process.exit(0);
if (flag('--dry-run')) { for (const x of items) console.log(`· ${x.id} (${x.subject}, ${x.topic}) key ${L[x.a]}`); process.exit(0); }
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('Skipped: no ANTHROPIC_API_KEY. Add it as a repository secret (Settings → Secrets and variables → Actions) to turn on AI review.');
  process.exit(0);
}
({ default: Anthropic } = await import('../js/vendor/anthropic.mjs'));
client = new Anthropic();

const results = []; let next = 0, done = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < items.length) {
    const x = items[next++];
    try { results.push(await check(x)); } catch (e) { results.push({ x, status: 'error', error: e.message }); if (/not accepted/.test(e.message)) { next = items.length; } }
    if (++done % 10 === 0) console.log(`  ${done}/${items.length}`);
  }
}));

const tokens = results.reduce((t, r) => { for (const u of [r.solved?.usage, r.review?.usage]) if (u) { t.in += u.input_tokens; t.out += u.output_tokens; } return t; }, { in: 0, out: 0 });
const cost = (tokens.in * 4 + tokens.out * 20) / 1e6;
const by = s => results.filter(r => r.status === s);
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const short = h => esc(String(h).replace(/<svg[\s\S]*?<\/svg>/g, '[diagram]').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 140);

let md = `## AI question review\n\n${results.length} checked · **${by('wrong').length} wrong key** · ${by('ambiguous').length} ambiguous · ${by('note').length} notes · ${by('error').length + by('refused').length} not checked · about $${cost.toFixed(2)} (${tokens.in} in / ${tokens.out} out tokens)\n\n`;
if (by('wrong').length) md += `### ✘ Answer key looks wrong\n| Question | Key | Should be | Why | Fix |\n|---|---|---|---|---|\n${by('wrong').map(r => `| \`${r.x.id}\` ${short(r.x.q)} | ${r.key} | ${esc(r.review.correct_answer)} | ${esc(r.review.reason)} | ${esc(r.review.fix)} |`).join('\n')}\n\n`;
if (by('ambiguous').length) md += `### ⚠ More than one defensible answer, or missing information\n| Question | Key | Detail |\n|---|---|---|\n${by('ambiguous').map(r => `| \`${r.x.id}\` ${short(r.x.q)} | ${r.key} | ${esc(r.review ? `${r.review.reason} ${r.review.fix}` : `Also defensible: ${r.solved.other_defensible.join(', ')}. ${r.solved.issues.join(' ')}`)} |`).join('\n')}\n\n`;
if (by('note').length) md += `### ℹ Wording notes (answer agreed)\n${by('note').map(r => `- \`${r.x.id}\`: ${esc(r.solved.issues.join(' '))}`).join('\n')}\n\n`;
if (by('error').length || by('refused').length) md += `### Not checked\n${[...by('error'), ...by('refused')].map(r => `- \`${r.x.id}\`: ${r.error || 'Claude declined'}`).join('\n')}\n\n`;
md += `_The checker can be wrong too: treat findings as prompts to look again, then fix the question or move on._\n`;

console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
if (results.some(r => /not accepted/.test(r.error || ''))) { console.error('✘ The API key was rejected, so nothing was checked.'); process.exit(1); }
process.exit(by('wrong').length ? 1 : 0);
