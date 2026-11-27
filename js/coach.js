// 💬 Question coach: after a test, the student can ask Claude about one question she got wrong or
// didn't understand. It knows the question, her answer, the correct answer and the explanation, and
// teaches step by step (her thinking first, then hints, then the working) instead of handing out answers.
//
// Privacy: chat text stays in THIS browser only (localStorage), because synced data lives in a public
// repository. Only a "still stuck" flag (question id + time, no text) is saved to the synced profile.
// Limits: messages per question and minutes per day, both set by a parent in Settings.
import { PACK } from './pack.js';
import { getSettings, getProfile, saveProfile } from './store.js';

const MODEL = 'claude-opus-5-5';
const K_CHATS = 'ms.coachChats';
const MAX_CHATS = 120;
export const DEFAULT_MSGS = 6, DEFAULT_MINS = 20;

const plain = html => String(html || '')
  .replace(/<svg[\s\S]*?<\/svg>/g, m => `\n[diagram as SVG: ${m.replace(/\s+/g, ' ').slice(0, 6000)}]\n`)
  .replace(/<\/(p|h\d|li|tr|div)>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

// ---------- storage ----------
const readChats = () => { try { return JSON.parse(localStorage.getItem(K_CHATS)) || {}; } catch { return {}; } };
const writeChats = c => {
  const keep = Object.entries(c).sort((a, b) => (b[1].last || '').localeCompare(a[1].last || '')).slice(0, MAX_CHATS);
  localStorage.setItem(K_CHATS, JSON.stringify(Object.fromEntries(keep)));
};
export const chatKey = (resultId, qid) => `${resultId}|${qid}`;
export const getChat = key => readChats()[key] || null;
export const allChats = () => Object.values(readChats()).sort((a, b) => (b.last || '').localeCompare(a.last || ''));
function saveChat(chat) { const c = readChats(); c[chat.key] = chat; writeChats(c); }

export const limits = () => {
  const s = getSettings();
  return { msgs: Number(s.coachMsgs) || DEFAULT_MSGS, mins: s.coachMins === 0 ? 0 : Number(s.coachMins) || DEFAULT_MINS };
};
const localDay = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
/** Minutes of coach time used today (each chat counts from its first to its last message today, at least 1 minute). */
export function minutesToday() {
  const today = localDay();
  return allChats().reduce((sum, c) => {
    const ts = c.msgs.filter(m => localDay(new Date(m.at)) === today).map(m => new Date(m.at).getTime());
    return ts.length ? sum + Math.max(1, (Math.max(...ts) - Math.min(...ts)) / 60000) : sum;
  }, 0);
}
export const kidMessages = chat => (chat?.msgs || []).filter(m => m.role === 'user').length;

// ---------- "still stuck" (synced, no text) ----------
export const getStuck = () => getProfile()?.stuck || [];
export async function markStuck(qid, topic) {
  const p = getProfile() || {};
  p.stuck = (p.stuck || []).filter(s => s.qid !== qid);
  p.stuck.push({ qid, topic, at: new Date().toISOString() });
  await saveProfile(p);
}
export async function clearStuck(qid) {
  const p = getProfile(); if (!p?.stuck?.some(s => s.qid === qid)) return;
  p.stuck = p.stuck.filter(s => s.qid !== qid); await saveProfile(p);
}

// ---------- Claude ----------
function systemPrompt(ctx) {
  const nick = getSettings().nickname || 'the student';
  return [{
    type: 'text', cache_control: { type: 'ephemeral' },
    text: `You are the friendly study coach inside a practice app for the ${PACK.name}. You speak as "Potalien", a small, kind potato-alien mascot. You are helping ${nick}, a Year 5 student (about 10 years old), understand ONE question from a test she has just finished.

How to teach:
- Your goal is understanding, not just the answer. She can already see the correct answer and an explanation; she is asking because something didn't make sense.
- Start by finding out what she thought or where she got stuck, unless her message already says. Then give ONE hint or ask ONE guiding question at a time.
- If she is still stuck after a couple of hints, or asks to see it, show the working step by step, then ask her to do the last step or check it herself.
- If her own reasoning was nearly right, say exactly which step went wrong. Name the trap if there is one.
- When she seems to understand, check with one quick, similar mini-question that uses different numbers or words (not the same question), and tell her she can press "Try similar questions".
- Keep every reply short: at most about 70 words, plain sentences a 10-year-old understands, Australian spelling. No markdown headings or tables. Use line breaks for steps. One emoji at most.
- Be warm and encouraging, never sarcastic. Praise effort and good thinking specifically.

Boundaries:
- Only talk about this question, its topic and how to study for the test. If she asks about anything else, kindly bring her back to the question.
- Never ask for or repeat personal details (full name, school, address, photos, contacts).
- If she seems upset or says she wants to stop, be kind and suggest a short break or asking a grown-up.
- If you think the marked answer itself is wrong or the question is unclear, say so gently and suggest she press "🚩 Something looks wrong with this question" so a parent can check. Do not just agree with her to be nice.`,
  }, {
    type: 'text',
    text: `THE QUESTION (${ctx.subject}, topic: ${ctx.topic})
${ctx.passage ? `Reading text "${ctx.passage.title}":\n${plain(ctx.passage.text)}\n\n` : ''}${plain(ctx.q.q)}

Options:
${ctx.q.opts.map((o, i) => `${'ABCDEFG'[i]}. ${plain(o)}`).join('\n')}

Her answer: ${ctx.chosen === null ? 'she left it blank' : `${'ABCDEFG'[ctx.chosen]}`}
Correct answer: ${'ABCDEFG'[ctx.q.a]}
Explanation shown to her: ${plain(ctx.q.exp)}
Time she spent on it: ${ctx.timeSec} seconds`,
  }];
}

/** Send her message and get the coach's reply. Saves the chat locally. Returns the updated chat. */
export async function ask(ctx, text) {
  const apiKey = (getSettings().claudeKey || '').trim();
  if (!apiKey) throw new Error('A grown-up needs to add the Claude API key in ⚙️ Settings first.');
  const { msgs, mins } = limits();
  const now = new Date().toISOString();
  const chat = getChat(ctx.key) || { key: ctx.key, qid: ctx.qid, resultId: ctx.resultId, subject: ctx.subject, topic: ctx.topic, start: now, msgs: [] };
  if (kidMessages(chat) >= msgs) throw new Error(`That's the ${msgs}-message limit for this question. Try the similar questions, or ask a grown-up 😊`);
  if (mins && minutesToday() >= mins) throw new Error(`That's your ${mins} minutes of coach time for today. Great effort! Try again tomorrow.`);

  const message = String(text).trim().slice(0, 600);
  if (!message) throw new Error('Type your question first.');
  const history = [...chat.msgs.map(m => ({ role: m.role, content: m.text })), { role: 'user', content: message }];

  const { default: Anthropic } = await import('./vendor/anthropic.mjs');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL, max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
      output_config: { effort: 'low' },
      system: systemPrompt(ctx),
      messages: history,
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('The Claude API key was not accepted. Ask a grown-up to check it in ⚙️ Settings.');
    if (e instanceof Anthropic.RateLimitError) throw new Error('The coach is busy right now. Try again in a minute.');
    if (e instanceof Anthropic.APIError) throw new Error(`The coach couldn't answer (${e.status ?? 'network'}). Try again.`);
    throw new Error('Could not reach the coach. Check the internet and try again.');
  }
  const reply = res.stop_reason === 'refusal'
    ? "Let's keep our chat about this question 😊 What part of it is confusing?"
    : res.content.filter(b => b.type === 'text').map(b => b.text).join('').trim() || 'Hmm, can you ask that another way?';
  chat.msgs.push({ role: 'user', text: message, at: now }, { role: 'assistant', text: reply, at: new Date().toISOString() });
  chat.last = new Date().toISOString();
  saveChat(chat);
  return chat;
}

export function setOutcome(key, outcome) {
  const chat = getChat(key); if (!chat) return;
  chat.outcome = outcome; chat.last = chat.last || new Date().toISOString(); saveChat(chat);
}
export function deleteChats() { localStorage.removeItem(K_CHATS); }
