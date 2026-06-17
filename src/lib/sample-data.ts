// Sample dataset used on the dashboard before a real upload is selected.
export const sampleRows = (() => {
  const products = ["Falcon", "Atlas", "Nimbus", "Vortex", "Quasar"];
  const regions = ["NA", "EU", "APAC", "LATAM"];
  const channels = ["Direct", "Partner", "Online"];
  const rows: Record<string, unknown>[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 89);
  let r = 12000;
  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const trend = i * 60;
    const seasonal = (dow === 0 || dow === 6) ? -1800 : 800;
    const noise = (Math.random() - 0.5) * 1500;
    const rev = Math.max(1000, r + trend + seasonal + noise);
    rows.push({
      date: d.toISOString().slice(0, 10),
      revenue: Math.round(rev),
      orders: Math.round(rev / 85 + (Math.random() - 0.5) * 8),
      customers: Math.round(rev / 140 + (Math.random() - 0.5) * 5),
      product: products[i % products.length],
      region: regions[i % regions.length],
      channel: channels[i % channels.length],
    });
  }
  return rows;
})();
