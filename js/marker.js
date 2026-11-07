// ✍️ AI writing marker: sends a finished piece to Claude, which marks it against the same
// 7-criterion rubric (total 25) used in her external writing reports and returns kind, specific feedback.
// The parent's Claude API key is stored only in this browser (Settings), like the GitHub token.
import { RUBRIC, RUBRIC_TOTAL } from './data/writing.js';

const MODEL = 'claude-opus-5-5';
const plain = html => String(html || '').replace(/<\/(p|h\d|li)>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

const keyed = (type) => Object.fromEntries(RUBRIC.map(c => [c.key, { type }]));
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['scores', 'comments', 'strengths', 'next_steps', 'better_sentence', 'summary'],
  properties: {
    scores: { type: 'object', additionalProperties: false, required: RUBRIC.map(c => c.key), properties: keyed('integer') },
    comments: { type: 'object', additionalProperties: false, required: RUBRIC.map(c => c.key), properties: keyed('string') },
    strengths: { type: 'array', items: { type: 'string' } },
    next_steps: { type: 'array', items: { type: 'string' } },
    better_sentence: { type: 'object', additionalProperties: false, required: ['original', 'improved', 'why'],
      properties: { original: { type: 'string' }, improved: { type: 'string' }, why: { type: 'string' } } },
    summary: { type: 'string' },
  },
};

const SYSTEM = `You are an experienced NSW Selective High School Placement Test writing marker. You mark 30-minute pieces by a Year 5 student (age 10) who is preparing for the test.

Mark against this rubric (total ${RUBRIC_TOTAL}). Each criterion's score is a whole number from 1 to its maximum; the descriptor for each score is given.
${RUBRIC.map(c => `- ${c.key} (${c.name}, max ${c.max}):\n${c.levels.map((l, i) => `    ${i + 1}: ${l}`).join('\n')}`).join('\n')}

How to mark:
- Mark at the standard of the Selective test, not general Year 5 expectations. Be accurate rather than generous: a top score means it would stand out among strong Selective candidates. Judge what is on the page, allowing for the 30-minute time limit.
- If the piece does not answer the task, or is very short or unfinished, reflect that in Content and Form.
- The model answer is a guide to a high-scoring response, not the only correct approach.
- Write to the student as "you", in short, warm, plain sentences a 10-year-old understands. Be specific: quote her own words when you praise or suggest.
- comments: one or two sentences per criterion explaining the score.
- strengths: 2 or 3 things done well. next_steps: the 2 or 3 changes that would raise the score most, each one a concrete action.
- better_sentence: pick one real sentence from her writing (copied exactly) and show a stronger version that she could realistically write, with a short reason.
- summary: one encouraging sentence with the overall verdict.
- Never invent text she did not write.`;

/** Mark a piece. Returns { scores, comments, strengths, next_steps, better_sentence, summary, total, model, markedAt }. */
export async function markWriting(task, text, apiKey) {
  if (!apiKey) throw new Error('No Claude API key. Add one in ⚙️ Settings.');
  if ((text.trim().match(/\S+/g) || []).length < 20) throw new Error('Write at least 20 words before asking for AI marking.');
  const { default: Anthropic } = await import('./vendor/anthropic.mjs');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const user = `Text type: ${task.type}\nTask title: ${task.title}\nTask: ${task.prompt}\n\nModel answer (for calibration):\n${plain(task.model)}\n\n---\nStudent's writing:\n${text}`;
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL, max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('The Claude API key was not accepted. Check it in ⚙️ Settings.');
    if (e instanceof Anthropic.PermissionDeniedError) throw new Error('This API key is not allowed to use Claude. Check the key in ⚙️ Settings.');
    if (e instanceof Anthropic.RateLimitError) throw new Error('Claude is busy right now. Try again in a minute.');
    if (e instanceof Anthropic.APIError) throw new Error(`Claude could not mark this (${e.status ?? 'network'}). ${e.message || ''}`.trim());
    throw new Error(`Could not reach Claude: ${e.message || e}`);
  }
  if (res.stop_reason === 'refusal') throw new Error('Claude declined to mark this piece. Please mark it with the rubric instead.');
  if (res.stop_reason === 'max_tokens') throw new Error('The marking was cut short. Please try again.');
  const txt = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
  let out;
  try { out = JSON.parse(txt); } catch { throw new Error('Claude returned an unreadable answer. Please try again.'); }
  for (const c of RUBRIC) out.scores[c.key] = Math.min(c.max, Math.max(1, Math.round(Number(out.scores[c.key]) || 1)));
  out.total = RUBRIC.reduce((a, c) => a + out.scores[c.key], 0);
  out.model = res.model; out.markedAt = new Date().toISOString();
  return out;
}

/** Feedback card shown after AI marking and on the saved result. */
export function aiFeedbackHtml(ai, esc) {
  if (!ai) return '';
  return `<div class="card aifeedback"><h2>🤖 AI marker's feedback <span class="muted small">${ai.total}/${RUBRIC_TOTAL}</span></h2>
    <p><b>${esc(ai.summary)}</b></p>
    <table class="tbl">${RUBRIC.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${ai.scores[c.key]}/${c.max}</td><td>${esc(ai.comments[c.key] || '')}</td></tr>`).join('')}</table>
    <div class="two"><div><h3>🌟 What you did well</h3><ul>${ai.strengths.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div><h3>🎯 To score higher next time</h3><ul>${ai.next_steps.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    ${ai.better_sentence?.original ? `<h3>✨ One sentence, levelled up</h3><p class="muted">You wrote:</p><blockquote>${esc(ai.better_sentence.original)}</blockquote>
      <p class="muted">Try:</p><blockquote class="better">${esc(ai.better_sentence.improved)}</blockquote><p>${esc(ai.better_sentence.why)}</p>` : ''}
    <p class="muted small">Marked by Claude against the 7-criterion rubric. AI marking is a guide: if a score looks wrong, a parent can change it before saving.</p></div>`;
}
