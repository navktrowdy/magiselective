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
