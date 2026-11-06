export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const fmtTime = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export const fmtDuration = s => { const m = Math.round(s / 60); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`; };
export const fmtDate = iso => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
export const todayStr = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
export const level = p => (p === null || p === undefined ? '' : p < 50 ? 'bad' : p < 75 ? 'mid' : 'good');

export function toast(msg, kind = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${kind}`; t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}

export function applyTheme(id) { document.documentElement.dataset.theme = id || 'sand'; }
