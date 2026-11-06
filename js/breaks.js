// Holidays / breaks (e.g. the family trip to India). Stored in the synced Potalien profile.
// During a break: no study is planned, streaks are protected and the Potalien goes on holiday too.
import * as store from './store.js';

const localDate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const today = () => localDate();
export const addDays = (iso, n) => { const x = new Date(iso + 'T00:00:00'); x.setDate(x.getDate() + n); return localDate(x); };
export const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

export const getBreaks = () => [...(store.getProfile()?.breaks || [])].sort((a, b) => a.start.localeCompare(b.start));
export const breakOn = iso => getBreaks().find(b => iso >= b.start && iso <= b.end) || null;
export const isBreakDay = iso => Boolean(breakOn(iso));
export const activeBreak = () => breakOn(today());
export const nextBreak = () => getBreaks().find(b => b.start > today()) || null;
export const lastEndedBreak = () => [...getBreaks()].reverse().find(b => b.end < today()) || null;

/** Calendar days from today to the exam that are NOT break days. */
export function studyDaysUntil(examDate) {
  const t = today(); const total = daysBetween(t, examDate);
  if (total <= 0) return 0;
  let n = 0;
  for (let i = 0; i < total; i++) if (!isBreakDay(addDays(t, i))) n++;
  return n;
}

export async function saveBreaks(list) {
  const p = store.getProfile(); if (!p) return;
  p.breaks = list; await store.saveProfile(p);
}

export const fmtShort = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
