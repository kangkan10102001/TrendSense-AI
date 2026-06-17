import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Upload as UploadIcon, FileSpreadsheet, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { summarize } from "@/lib/analytics";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload data — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><Upload /></AppShell></RequireAuth>,
});

function Upload() {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ rows: Record<string, unknown>[]; cols: string[]; name: string; type: string } | null>(null);
  const navigate = useNavigate();

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let rows: Record<string, unknown>[] = [];
      if (ext === "csv") {
        const text = await file.text();
        const res = Papa.parse<Record<string, unknown>>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
        rows = res.data;
      } else if (ext === "xlsx" || ext === "xls") {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      } else {
        toast.error("Please upload a CSV or Excel file.");
        return;
      }
      if (!rows.length) { toast.error("File is empty."); return; }
      setPreview({ rows, cols: Object.keys(rows[0]), name: file.name, type: ext! });
    } catch (e) {
      console.error(e);
      toast.error("Could not parse file.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!preview) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast.error("Sign in first"); setBusy(false); return; }
    const sum = summarize(preview.rows);
    const sample = preview.rows.slice(0, 1000);
    const { data, error } = await supabase.from("datasets").insert({
      user_id: u.user.id,
      name: preview.name,
      file_type: preview.type,
      row_count: preview.rows.length,
      column_names: preview.cols as never,
      sample_rows: sample as never,
      summary: sum as never,
    }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data) localStorage.setItem("ts.active_dataset", data.id);
    toast.success("Dataset saved");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Upload a dataset</h1>
        <p className="text-sm text-muted-foreground">CSV or Excel. First sheet is used. We store up to 1,000 sample rows for preview & AI context.</p>
      </header>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center transition hover:border-primary/60 hover:bg-accent/30">
        <UploadIcon className="size-10 text-primary" />
        <div className="mt-4 font-medium">Drop a file or click to browse</div>
        <div className="mt-1 text-xs text-muted-foreground">.csv, .xlsx, .xls</div>
        <input type="file" accept=".csv,.xlsx,.xls" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
      </label>

      {preview && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-primary" />
              <span className="font-semibold">{preview.name}</span>
              <span className="text-xs text-muted-foreground">{preview.rows.length.toLocaleString()} rows · {preview.cols.length} columns</span>
            </div>
            <Button onClick={save} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Save & analyze"}
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <tr>{preview.cols.map((c) => <th key={c} className="p-2 font-medium">{c}</th>)}</tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {preview.cols.map((c) => <td key={c} className="p-2 font-mono text-xs">{String(r[c] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
