import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { sampleRows } from "@/lib/sample-data";
import { summarize, formatNumber } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><Reports /></AppShell></RequireAuth>,
});

function Reports() {
  const { active } = useDatasets();
  const rows = active?.sample_rows?.length ? active.sample_rows : sampleRows;
  const sum = summarize(rows);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

  async function generateSummary() {
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Write a concise executive summary (markdown, ~250 words): 1) Headline findings, 2) Notable trends, 3) Risks/anomalies, 4) Recommended actions." }],
          dataset: { name: active?.name ?? "sample", rowCount: rows.length, columns: sum, sampleRows: rows.slice(0, 50) },
        }),
      });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setSummary("");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setSummary(acc);
      }
    } catch { toast.error("Could not generate summary"); }
    finally { setBusy(false); }
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Data");
    const statsRows = Object.entries(sum.stats).map(([col, s]) => ({ column: col, ...s }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsRows), "Summary");
    XLSX.writeFile(wb, `${active?.name ?? "trendsense"}-report.xlsx`);
  }

  function exportPDF() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${active?.name ?? "TrendSense Report"}</title>
      <style>body{font-family:Inter,sans-serif;padding:40px;max-width:800px;margin:auto;color:#222}
      h1{border-bottom:2px solid #F59E0B;padding-bottom:8px}table{border-collapse:collapse;width:100%;margin:16px 0}
      td,th{border:1px solid #ddd;padding:6px;text-align:left;font-size:12px}</style></head>
      <body><h1>${active?.name ?? "TrendSense Report"}</h1>
      <p><strong>${rows.length}</strong> rows, <strong>${Object.keys(sum.types).length}</strong> columns.</p>
      <h2>Summary</h2><pre style="white-space:pre-wrap">${summary || "Generate an AI summary first."}</pre>
      <h2>Numeric stats</h2><table><tr><th>Column</th><th>Sum</th><th>Mean</th><th>Min</th><th>Max</th></tr>
      ${Object.entries(sum.stats).map(([c, s]) => `<tr><td>${c}</td><td>${formatNumber(s.sum)}</td><td>${formatNumber(s.mean)}</td><td>${formatNumber(s.min)}</td><td>${formatNumber(s.max)}</td></tr>`).join("")}
      </table></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Export your dataset and get an AI-written executive summary.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button onClick={generateSummary} disabled={busy}>
          {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
          AI Executive Summary
        </Button>
        <Button variant="outline" onClick={exportExcel}><Download className="mr-2 size-4" />Export Excel</Button>
        <Button variant="outline" onClick={exportPDF}><FileText className="mr-2 size-4" />Export PDF</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {summary ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click "AI Executive Summary" to generate.</p>
        )}
      </div>
    </div>
  );
}
