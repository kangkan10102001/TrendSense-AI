import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2, Database, Check } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/datasets")({
  head: () => ({ meta: [{ title: "Datasets — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><DatasetsPage /></AppShell></RequireAuth>,
});

function DatasetsPage() {
  const { datasets, activeId, setActiveId, refresh, loading } = useDatasets();

  async function remove(id: string) {
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); if (activeId === id) setActiveId(null); refresh(); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Datasets</h1>
          <p className="text-sm text-muted-foreground">Switch which dataset powers your dashboard and copilot.</p>
        </div>
        <Link to="/upload"><Button>Upload new</Button></Link>
      </header>

      {loading ? <p className="text-muted-foreground">Loading…</p> : datasets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Database className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">No datasets yet</p>
          <p className="text-sm text-muted-foreground">Upload your first CSV or Excel file.</p>
          <Link to="/upload"><Button className="mt-4">Upload</Button></Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {datasets.map((d) => (
            <div key={d.id} className={`flex items-center justify-between rounded-xl border bg-card p-4 ${activeId === d.id ? "border-primary" : "border-border"}`}>
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {d.name} {activeId === d.id && <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-xs text-primary"><Check className="size-3"/>Active</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {d.row_count.toLocaleString()} rows · {Array.isArray(d.column_names) ? d.column_names.length : 0} columns · {new Date(d.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setActiveId(d.id); toast.success("Active dataset updated"); }}>Use</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
