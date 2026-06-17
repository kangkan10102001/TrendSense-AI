import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Upload, MessageSquare, LineChart, FileText,
  Database, Shield, LogOut, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/routes/index";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/copilot", label: "AI Copilot", icon: MessageSquare },
  { to: "/forecast", label: "Forecast", icon: LineChart },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [path]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold tracking-tight">TrendSense<span className="text-primary">.ai</span></span>
            </Link>
            <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="size-5" /></button>
          </div>
          <nav className="space-y-1 p-3">
            {NAV.map((item) => {
              const active = path === item.to;
              return (
                <Link key={item.to} to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}>
                  <item.icon className="size-4" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute inset-x-0 bottom-0 border-t border-sidebar-border p-3">
            <div className="mb-2 truncate px-2 text-xs text-muted-foreground">{user?.email}</div>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="min-h-screen">
          <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur lg:px-8">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
            <div className="font-mono text-xs text-muted-foreground">{path}</div>
            <Link to="/upload"><Button size="sm"><Upload className="mr-2 size-4" /> Upload data</Button></Link>
          </header>
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
