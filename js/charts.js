// Tiny dependency-free SVG line chart for progress over time (0–100%).

export function lineChart(series, { width = 560, height = 240 } = {}) {
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const dates = [...new Set(series.flatMap(s => s.points.map(p => p.x)))].sort();
  if (!dates.length) return '<p class="muted">No data yet.</p>';
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const t0 = new Date(dates[0]).getTime(), t1 = new Date(dates[dates.length - 1]).getTime();
  const x = d => pad.l + (t1 === t0 ? W / 2 : ((new Date(d).getTime() - t0) / (t1 - t0)) * W);
  const y = v => pad.t + H - (v / 100) * H;
  const grid = [0, 25, 50, 75, 100].map(v =>
    `<line x1="${pad.l}" x2="${width - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="#e0e0e0"/><text x="${pad.l - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#777">${v}%</text>`).join('');
  const fmt = d => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  const xl = [dates[0], dates[dates.length - 1]].filter((d, i, a) => a.indexOf(d) === i)
    .map(d => `<text x="${x(d)}" y="${height - 8}" font-size="10" text-anchor="middle" fill="#777">${fmt(d)}</text>`).join('');
  const lines = series.map(s => {
    const pts = s.points.map(p => `${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round"/>` +
      s.points.map(p => `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="4" fill="#fff" stroke="${s.color}" stroke-width="2"><title>${s.name}: ${Math.round(p.y)}% (${p.label}, ${fmt(p.x)})</title></circle>`).join('');
  }).join('');
  const legend = series.map(s => `<span class="lg"><i style="background:${s.color}"></i>${s.name}</span>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Progress chart">${grid}${xl}${lines}</svg><div class="legend">${legend}</div>`;
}

/** Radar ("progress map") chart. axes: [{label, value: 0–100 or null}] */
export function radarChart(axes, { size = 340, color = '#c9a55c' } = {}) {
  const n = axes.length; if (n < 3) return '';
  const cx = size / 2, cy = size / 2, R = size / 2 - 62;
  const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const ring = f => axes.map((_, i) => pt(i, R * f).map(v => v.toFixed(1)).join(',')).join(' ');
  const grid = [1 / 3, 2 / 3, 1].map(f => `<polygon points="${ring(f)}" fill="none" stroke="#e6ddd0"/>`).join('') +
    axes.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e6ddd0"/>`; }).join('');
  const vals = axes.map(a => (a.value ?? 0) / 100);
  const shape = vals.map((v, i) => pt(i, R * Math.max(v, 0.03)).map(x => x.toFixed(1)).join(',')).join(' ');
  const dots = vals.map((v, i) => { const [x, y] = pt(i, R * Math.max(v, 0.03)); return `<circle cx="${x}" cy="${y}" r="5.5" fill="${color}" stroke="#fff" stroke-width="2"><title>${axes[i].label}: ${axes[i].value ?? 'not tried'}${axes[i].value === null ? '' : '%'}</title></circle>`; }).join('');
  const labels = axes.map((a, i) => {
    const [x, y] = pt(i, R + 22); const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
    const words = a.label.split(' '); const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [a.label];
    return `<text x="${x}" y="${y - (lines.length - 1) * 6}" font-size="11.5" fill="#7a6f62" font-weight="600" text-anchor="${anchor}" dominant-baseline="middle">${lines.map((l, k) => `<tspan x="${x}" dy="${k ? 13 : 0}">${l}</tspan>`).join('')}</text>`;
  }).join('');
  return `<svg viewBox="-70 0 ${size + 140} ${size}" class="radar" role="img" aria-label="Progress map">${grid}<polygon points="${shape}" fill="${color}" fill-opacity=".18" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}

/** Line chart with category labels on the x-axis (e.g. test numbers). series: [{name, color, values[], dashed?}] */
export function categoryChart(labels, series, { width = 640, height = 260 } = {}) {
  const pad = { l: 36, r: 12, t: 12, b: 34 };
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const x = i => pad.l + (labels.length === 1 ? W / 2 : (i / (labels.length - 1)) * W);
  const y = v => pad.t + H - (v / 100) * H;
  const grid = [0, 25, 50, 75, 100].map(v => `<line x1="${pad.l}" x2="${width - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="#e0e0e0"/><text x="${pad.l - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#888">${v}%</text>`).join('');
  const xl = labels.map((l, i) => `<text x="${x(i)}" y="${height - 14}" font-size="10" text-anchor="middle" fill="#888">${l}</text>`).join('');
  const lines = series.map(s => `<polyline points="${s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${s.color}" stroke-width="${s.bold ? 3.5 : 2}" ${s.dashed ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>` +
    s.values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${s.bold ? 4 : 3}" fill="#fff" stroke="${s.color}" stroke-width="2"><title>${s.name} · Test ${labels[i]}: ${v}%</title></circle>`).join('')).join('');
  const legend = series.map(s => `<span class="lg"><i style="background:${s.color}"></i>${s.name}</span>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Trial test trend">${grid}${xl}<text x="${width / 2}" y="${height - 1}" font-size="10" text-anchor="middle" fill="#888">CS trial test numbers</text>${lines}</svg><div class="legend">${legend}</div>`;
}
