import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { sampleRows } from "@/lib/sample-data";
import { summarize, timeSeriesAggregate, groupBy, formatNumber } from "@/lib/analytics";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><Dashboard /></AppShell></RequireAuth>,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const { active } = useDatasets();
  const rows = active?.sample_rows?.length ? active.sample_rows : sampleRows;
  const sum = useMemo(() => summarize(rows), [rows]);
  const dateCol = sum.dateCols[0];
  const valueCol = sum.numericCols[0];
  const catCol = sum.stringCols[0];

  const trend = useMemo(
    () => (dateCol && valueCol ? timeSeriesAggregate(rows, dateCol, valueCol) : []),
    [rows, dateCol, valueCol]
  );
  const byCat = useMemo(
    () => (catCol && valueCol ? groupBy(rows, catCol, valueCol) : []),
    [rows, catCol, valueCol]
  );

  const kpis = sum.numericCols.slice(0, 4).map((c, i) => ({
    label: c,
    value: formatNumber(sum.stats[c].sum),
    sub: `avg ${formatNumber(sum.stats[c].mean)}`,
    icon: [DollarSign, ShoppingCart, Users, TrendingUp][i] ?? TrendingUp,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {active ? `Showing ${active.name} (${active.row_count.toLocaleString()} rows)` : "Showing sample dataset — upload a CSV to see your own."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <k.icon className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">Trend over time</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#a)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Top by {catCol ?? "category"}</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Breakdown</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <BarChart data={byCat}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
