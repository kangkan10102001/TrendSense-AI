import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceDot } from "recharts";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { sampleRows } from "@/lib/sample-data";
import { summarize, timeSeriesAggregate, forecastLinear, detectAnomalies } from "@/lib/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/forecast")({
  head: () => ({ meta: [{ title: "Forecast — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><Forecast /></AppShell></RequireAuth>,
});

function Forecast() {
  const { active } = useDatasets();
  const rows = active?.sample_rows?.length ? active.sample_rows : sampleRows;
  const sum = useMemo(() => summarize(rows), [rows]);
  const [dateCol, setDateCol] = useState(sum.dateCols[0] ?? "");
  const [valueCol, setValueCol] = useState(sum.numericCols[0] ?? "");
  const [horizon, setHorizon] = useState("14");

  const data = useMemo(() => {
    if (!dateCol || !valueCol) return { series: [], combined: [], anomalies: [] };
    const series = timeSeriesAggregate(rows, dateCol, valueCol);
    const fc = forecastLinear(series, parseInt(horizon, 10));
    const combined = [
      ...series.map((s) => ({ date: s.date, actual: s.value })),
      ...fc.map((s) => ({ date: s.date, forecast: s.value })),
    ];
    const anomalies = detectAnomalies(series);
    return { series, combined, anomalies };
  }, [rows, dateCol, valueCol, horizon]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Forecast & anomaly detection</h1>
        <p className="text-sm text-muted-foreground">Linear trend projection with z-score anomaly flagging.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Picker label="Date column" value={dateCol} onChange={setDateCol} options={sum.dateCols} />
        <Picker label="Value column" value={valueCol} onChange={setValueCol} options={sum.numericCols} />
        <Picker label="Forecast horizon" value={horizon} onChange={setHorizon} options={["7", "14", "30", "60"]} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">{valueCol || "value"} over time</h2>
        <div className="mt-4 h-96">
          <ResponsiveContainer>
            <LineChart data={data.combined}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
              {data.anomalies.map((a) => (
                <ReferenceDot key={a.date} x={a.date} y={a.value} r={5} fill="var(--destructive)" stroke="none" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {data.anomalies.length} anomalies detected (|z| &gt; 2).
        </p>
      </div>
    </div>
  );
}

function Picker({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
