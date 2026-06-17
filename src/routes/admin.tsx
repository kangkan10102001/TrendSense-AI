import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { Database, Users, MessageSquare, FileText } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><Admin /></AppShell></RequireAuth>,
});

function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ datasets: 0, conversations: 0, reports: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = (data ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) {
        const [d, c, r] = await Promise.all([
          supabase.from("datasets").select("id", { count: "exact", head: true }),
          supabase.from("conversations").select("id", { count: "exact", head: true }),
          supabase.from("reports").select("id", { count: "exact", head: true }),
        ]);
        setStats({ datasets: d.count ?? 0, conversations: c.count ?? 0, reports: r.count ?? 0 });
      }
    })();
  }, [user]);

  if (isAdmin === null) return <p className="text-muted-foreground">Checking permissions…</p>;
  if (!isAdmin) return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <h1 className="text-xl font-semibold">Admin only</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You don't have the admin role. To grant it, add a row to <code className="font-mono">user_roles</code> with your user id and role <code>admin</code>.
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Your id: {user?.id}</p>
    </div>
  );

  const cards = [
    { label: "Datasets", value: stats.datasets, icon: Database },
    { label: "Conversations", value: stats.conversations, icon: MessageSquare },
    { label: "Reports", value: stats.reports, icon: FileText },
    { label: "Your role", value: "admin", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Admin panel</h1>
        <p className="text-sm text-muted-foreground">System-wide stats. Visible only to users with the admin role.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <c.icon className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
