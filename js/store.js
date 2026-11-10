// Storage: results are cached in localStorage and saved to the GitHub repo
// (one JSON file per attempt under data/results/) so progress follows her
// to any device. Writes need a fine-grained token with Contents: read & write.

import { DEFAULT_SETTINGS } from './data/config.js';

const K_SETTINGS = 'ms.settings';
const K_RESULTS = 'ms.results';
const K_PENDING = 'ms.pending';
const K_INPROGRESS = 'ms.inprogress';

const read = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function getSettings() {
  const s = read(K_SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...s, github: { ...DEFAULT_SETTINGS.github, ...(s.github || {}) } };
}
export function saveSettings(s) { write(K_SETTINGS, s); }

export function getResults() {
  return read(K_RESULTS, []).sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
}
export function getResult(id) { return getResults().find(r => r.id === id); }

function putLocal(result) {
  const all = read(K_RESULTS, []).filter(r => r.id !== result.id);
  all.push(result);
  write(K_RESULTS, all);
}

// ---- in-progress test (survives an accidental refresh) ----
export const saveInProgress = (state) => write(K_INPROGRESS, state);
export const getInProgress = () => read(K_INPROGRESS, null);
export const clearInProgress = () => localStorage.removeItem(K_INPROGRESS);

// ---- GitHub sync ----
const b64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
};
const unb64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), c => c.charCodeAt(0)));

function gh(path, opts = {}) {
  const { github } = getSettings();
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (github.token) headers.Authorization = `Bearer ${github.token}`;
  return fetch(`https://api.github.com/repos/${github.owner}/${github.repo}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
}

export function syncConfigured() {
  const { github } = getSettings();
  return Boolean(github.owner && github.repo && github.token);
}

async function putJson(file, obj, message) {
  const { github } = getSettings();
  const body = { message, content: b64(JSON.stringify(obj, null, 2)), branch: github.branch };
  // If the file already exists, GitHub needs its sha to replace it.
  const existing = await gh(`/contents/${file}?ref=${github.branch}`);
  if (existing.ok) body.sha = (await existing.json()).sha;
  const res = await gh(`/contents/${file}`, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GitHub save failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

async function getJson(file) {
  const { github } = getSettings();
  const res = await gh(`/contents/${file}?ref=${github.branch}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  return JSON.parse(unb64((await res.json()).content));
}

const profileFile = () => `${getSettings().github.path.replace(/\/[^/]*$/, '')}/profile.json`;

function uploadResult(result) {
  const { github } = getSettings();
  return putJson(`${github.path}/${result.id}.json`, result, `Result: ${result.subject} ${result.mode} ${result.score}/${result.total}`);
}

// ---- Potalien profile (pet choice, outfits, purchases) ----
const K_PROFILE = 'ms.profile';
const K_PROFILE_PENDING = 'ms.profilePending';
export const getProfile = () => read(K_PROFILE, null);
export async function saveProfile(p) {
  p.updatedAt = new Date().toISOString();
  write(K_PROFILE, p);
  if (!syncConfigured()) { write(K_PROFILE_PENDING, true); return; }
  try { await putJson(profileFile(), p, 'Update Potalien profile'); localStorage.removeItem(K_PROFILE_PENDING); }
  catch { write(K_PROFILE_PENDING, true); }
}

async function syncProfile(report) {
  try {
    const remote = await getJson(profileFile());
    const local = getProfile();
    if (remote && (!local || remote.updatedAt > local.updatedAt)) { write(K_PROFILE, remote); localStorage.removeItem(K_PROFILE_PENDING); report.profile = 'downloaded'; }
    else if (local && syncConfigured() && (read(K_PROFILE_PENDING, false) || !remote || local.updatedAt > remote.updatedAt)) {
      await putJson(profileFile(), local, 'Update Potalien profile'); localStorage.removeItem(K_PROFILE_PENDING); report.profile = 'uploaded';
    }
  } catch (e) { report.errors.push(e.message); }
}

/** Save a finished attempt locally, then try GitHub. Returns {synced, error}. */
export async function saveResult(result) {
  putLocal(result);
  if (!syncConfigured()) {
    addPending(result.id);
    return { synced: false, error: 'GitHub saving is not set up yet (Settings).' };
  }
  try {
    await uploadResult(result);
    removePending(result.id);
    return { synced: true };
  } catch (e) {
    addPending(result.id);
    return { synced: false, error: e.message };
  }
}

const addPending = (id) => write(K_PENDING, [...new Set([...read(K_PENDING, []), id])]);
const removePending = (id) => write(K_PENDING, read(K_PENDING, []).filter(x => x !== id));
export const pendingCount = () => read(K_PENDING, []).length;

/** Upload anything not yet saved, then download results made on other devices. */
export async function syncAll() {
  const { github } = getSettings();
  const report = { uploaded: 0, downloaded: 0, errors: [] };
  const pendingAtStart = new Set(read(K_PENDING, [])); // just uploaded: GitHub's file list can lag behind
  if (syncConfigured()) {
    for (const id of read(K_PENDING, [])) {
      const r = getResult(id);
      if (!r) { removePending(id); continue; }
      try { await uploadResult(r); removePending(id); report.uploaded++; } catch (e) { report.errors.push(e.message); }
    }
  }
  if (!github.owner || !github.repo) return report;
  try {
    const res = await gh(`/contents/${github.path}?ref=${github.branch}`);
    if (res.status === 404) { await syncProfile(report); return report; } // no results folder yet
    if (!res.ok) throw new Error(`GitHub list failed (${res.status})`);
    const files = (await res.json()).filter(f => f.name.endsWith('.json'));
    // A result deleted on GitHub (e.g. an empty attempt a parent removed) is removed here too,
    // unless it is still waiting to be uploaded from this device.
    const remote = new Set(files.map(f => f.name.replace(/\.json$/, '')));
    const kept = read(K_RESULTS, []).filter(r => remote.has(r.id) || pendingAtStart.has(r.id));
    report.removed = read(K_RESULTS, []).length - kept.length;
    if (report.removed) write(K_RESULTS, kept);
    const have = new Set(kept.map(r => r.id));
    for (const f of files) {
      const id = f.name.replace(/\.json$/, '');
      if (have.has(id)) continue;
      const fr = await gh(`/contents/${github.path}/${f.name}?ref=${github.branch}`);
      if (!fr.ok) continue;
      putLocal(JSON.parse(unb64((await fr.json()).content)));
      report.downloaded++;
    }
  } catch (e) { report.errors.push(e.message); }
  await syncProfile(report);
  return report;
}

export async function testConnection() {
  const res = await gh('');
  if (!res.ok) return { ok: false, message: `Cannot reach repo (${res.status}). Check owner/repo/token.` };
  const repo = await res.json();
  if (!repo.permissions?.push) return { ok: false, message: 'Token can read but cannot write. Give it "Contents: Read and write".' };
  return { ok: true, message: `Connected to ${repo.full_name} with write access.` };
}

// ---- backup ----
export function exportAll() {
  return JSON.stringify({ exportedAt: new Date().toISOString(), results: read(K_RESULTS, []), profile: getProfile() }, null, 2);
}
export function importAll(json) {
  const data = JSON.parse(json);
  (data.results || []).forEach(putLocal);
  if (data.profile) write(K_PROFILE, data.profile);
  return (data.results || []).length;
}
