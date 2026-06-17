import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Dataset = {
  id: string;
  user_id: string;
  name: string;
  file_type: string;
  row_count: number;
  column_names: string[];
  sample_rows: Record<string, unknown>[];
  summary: unknown;
  created_at: string;
};

const STORAGE_KEY = "ts.active_dataset";

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveIdState] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null,
  );

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("datasets")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDatasets(data as unknown as Dataset[]);
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  function setActiveId(id: string | null) {
    setActiveIdState(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    }
  }

  const active = datasets.find((d) => d.id === activeId) ?? datasets[0] ?? null;

  return { datasets, active, activeId: active?.id ?? null, setActiveId, loading, refresh };
}
