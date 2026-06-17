// Lightweight analytics utilities run client-side on parsed dataset rows.

export type Row = Record<string, unknown>;

export function detectColumnTypes(rows: Row[]): Record<string, "number" | "date" | "string"> {
  const out: Record<string, "number" | "date" | "string"> = {};
  if (!rows.length) return out;
  const cols = Object.keys(rows[0]);
  for (const c of cols) {
    let nums = 0, dates = 0, total = 0;
    for (const r of rows.slice(0, 200)) {
      const v = r[c];
      if (v === null || v === undefined || v === "") continue;
      total++;
      const n = Number(v);
      if (!Number.isNaN(n) && typeof v !== "boolean") nums++;
      const d = new Date(String(v));
      if (!Number.isNaN(d.getTime()) && String(v).match(/\d{2,4}[-/]\d{1,2}/)) dates++;
    }
    if (total === 0) out[c] = "string";
    else if (dates / total > 0.6) out[c] = "date";
    else if (nums / total > 0.7) out[c] = "number";
    else out[c] = "string";
  }
  return out;
}

export function summarize(rows: Row[]) {
  const types = detectColumnTypes(rows);
  const numericCols = Object.entries(types).filter(([, t]) => t === "number").map(([k]) => k);
  const dateCols = Object.entries(types).filter(([, t]) => t === "date").map(([k]) => k);
  const stringCols = Object.entries(types).filter(([, t]) => t === "string").map(([k]) => k);

  const stats: Record<string, { sum: number; mean: number; min: number; max: number; count: number }> = {};
  for (const col of numericCols) {
    let sum = 0, count = 0, min = Infinity, max = -Infinity;
    for (const r of rows) {
      const n = Number(r[col]);
      if (!Number.isNaN(n)) { sum += n; count++; if (n < min) min = n; if (n > max) max = n; }
    }
    stats[col] = { sum, mean: count ? sum / count : 0, min: count ? min : 0, max: count ? max : 0, count };
  }
  return { types, numericCols, dateCols, stringCols, stats, rowCount: rows.length };
}

export function timeSeriesAggregate(rows: Row[], dateCol: string, valueCol: string) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(String(r[dateCol]));
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    const v = Number(r[valueCol]);
    if (Number.isNaN(v)) continue;
    map.set(key, (map.get(key) ?? 0) + v);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function groupBy(rows: Row[], key: string, valueCol: string, top = 8) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r[key] ?? "—");
    const v = Number(r[valueCol]);
    if (Number.isNaN(v)) continue;
    map.set(k, (map.get(k) ?? 0) + v);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}

// Linear regression forecast
export function forecastLinear(series: { date: string; value: number }[], periods = 7) {
  const n = series.length;
  if (n < 2) return [];
  const xs = series.map((_, i) => i);
  const ys = series.map((s) => s.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - xMean) * (ys[i] - yMean); den += (xs[i] - xMean) ** 2; }
  const slope = den ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const lastDate = new Date(series[n - 1].date);
  const out: { date: string; value: number; forecast: true }[] = [];
  for (let i = 1; i <= periods; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    out.push({ date: d.toISOString().slice(0, 10), value: Math.max(0, slope * (n - 1 + i) + intercept), forecast: true });
  }
  return out;
}

export function detectAnomalies(series: { date: string; value: number }[], z = 2) {
  if (series.length < 4) return [];
  const vals = series.map((s) => s.value);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  return series.filter((s) => std > 0 && Math.abs(s.value - mean) / std > z);
}

export function formatNumber(n: number) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}
