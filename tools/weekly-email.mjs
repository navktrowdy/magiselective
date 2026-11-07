// Weekly parent summary email, run by .github/workflows/weekly-email.yml (or locally).
// Reads results from data/results/*.json and the Potalien profile from data/profile.json,
// builds the same summary as the Parent page, and emails it via SMTP.
//
// Environment: SMTP_USER, SMTP_PASS (e.g. a Gmail app password), EMAIL_TO ("a@x.com, b@y.com"),
// optional SMTP_HOST (default smtp.gmail.com), SMTP_PORT (default 465), APP_URL, DRY_RUN=1.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';

// ---- give the browser modules the data they expect ----
const results = existsSync('data/results') ? readdirSync('data/results').filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`data/results/${f}`, 'utf8'))) : [];
const profile = existsSync('data/profile.json') ? JSON.parse(readFileSync('data/profile.json', 'utf8')) : null;
const mem = { 'ms.results': JSON.stringify(results), 'ms.profile': JSON.stringify(profile), 'ms.settings': JSON.stringify({ github: { token: 'ci' } }) };
globalThis.localStorage = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };

const { computeSummary, emailHtml } = await import('../js/summary.js');
const { activeBreak } = await import('../js/breaks.js');
const { fmtShort } = await import('../js/breaks.js');

const x = computeSummary();
const brk = activeBreak();
if (brk && x.s0.sessions === 0) { console.log(`On ${brk.name}: no study this week, so no email.`); process.exit(0); }

const subject = `👽🥔 ${x.s.nickname}'s week: ${x.a0.done}/${x.a0.planned} planned days, ${x.s0.questions} questions (${fmtShort(x.t)})`;
const html = emailHtml(x, process.env.APP_URL || undefined);
const text = `${x.summaryText()}\n\nSuggested actions:\n${x.tips.map(t => '• ' + t.replace(/<[^>]+>/g, '')).join('\n')}`;

writeFileSync('weekly-email.html', html);
if (process.env.DRY_RUN || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_TO) {
  console.log('Dry run (no SMTP settings): wrote weekly-email.html');
  console.log(subject + '\n\n' + text);
  process.exit(0);
}

const nodemailer = (await import('nodemailer')).default;
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', port: Number(process.env.SMTP_PORT || 465), secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
const info = await transport.sendMail({ from: `Potalien Prep <${process.env.SMTP_USER}>`, to: process.env.EMAIL_TO, subject, text, html });
console.log('Sent:', info.messageId, 'to', process.env.EMAIL_TO.split(',').length, 'recipient(s)');
