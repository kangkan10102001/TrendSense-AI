import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, BarChart3, Bot, LineChart, ShieldCheck, Sparkles,
  Upload, Zap, Check, ArrowRight, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrendSense AI — Decision Intelligence for Modern Teams" },
      { name: "description", content: "Upload CSV or Excel, get KPI dashboards, forecasts, anomaly alerts, and an AI Business Copilot that explains your numbers." },
      { property: "og:title", content: "TrendSense AI" },
      { property: "og:description", content: "AI-powered Business Analytics & Decision Intelligence." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold tracking-tight">TrendSense<span className="text-primary">.ai</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm">Get started</Button></Link>
        </div>
      </div>
    </header>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground ${className}`}>
      <TrendingUp className="size-4" strokeWidth={2.5} />
    </span>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-radial-amber">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 text-center">
        <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="mr-1 size-3" /> Powered by Gemini & Lovable AI
        </Badge>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Decision intelligence,<br />
          <span className="text-gradient-amber">distilled from your data.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          Upload a spreadsheet. Get an executive-grade dashboard, forecasts, and a chat copilot
          that explains <em>why</em> — not just <em>what</em>.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth"><Button size="lg" className="gap-2">Start free <ArrowRight className="size-4" /></Button></Link>
          <a href="#features"><Button variant="outline" size="lg">See features</Button></a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card. CSV & Excel supported.</p>

        <div className="relative mx-auto mt-16 max-w-5xl rounded-xl border border-border bg-card p-1 shadow-2xl shadow-primary/10">
          <div className="rounded-lg bg-background p-6">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const kpis = [
    { label: "Revenue", value: "$1.42M", delta: "+12.4%" },
    { label: "Orders", value: "8,214", delta: "+6.1%" },
    { label: "AOV", value: "$172", delta: "+2.8%" },
    { label: "Churn", value: "3.2%", delta: "-0.4%" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4 text-left">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-success">{k.delta}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 h-44 rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Revenue trend</div>
          <FakeLine />
        </div>
        <div className="h-44 rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Top products</div>
          <FakeBars />
        </div>
      </div>
    </div>
  );
}

function FakeLine() {
  const pts = [40, 55, 48, 70, 65, 80, 72, 95, 90, 110, 105, 125];
  const max = 140;
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * 100},${100 - (p / max) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="mt-2 h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={path} fill="none" stroke="var(--primary)" strokeWidth="1.5" />
      <polygon points={`0,100 ${path} 100,100`} fill="url(#g)" />
    </svg>
  );
}
function FakeBars() {
  const bars = [80, 64, 50, 38, 28];
  return (
    <div className="mt-3 flex h-32 items-end gap-2">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${b}%`, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

function Logos() {
  const items = ["Atlas Co.", "Falcon Labs", "Quasar", "Nimbus", "Vortex", "Orbit"];
  return (
    <section className="border-y border-border/60 bg-card/30 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Trusted by analytics teams at</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-muted-foreground/70">
          {items.map((i) => <span key={i} className="font-mono text-sm">{i}</span>)}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Upload, title: "Drop any spreadsheet", desc: "CSV & Excel up to millions of rows. Auto-detect schema, types, and cleaning rules." },
    { icon: BarChart3, title: "Auto-generated KPIs", desc: "Revenue, customers, churn, AOV — surfaced from your columns the moment you upload." },
    { icon: Bot, title: "AI Business Copilot", desc: "Ask 'why did sales dip?' — get a grounded, data-backed answer with recommended actions." },
    { icon: LineChart, title: "Forecast & anomalies", desc: "Trend projection and outlier detection out of the box, no Python notebook required." },
    { icon: Activity, title: "Trend analytics", desc: "Slice by region, channel, product, and time — instantly comparable." },
    { icon: ShieldCheck, title: "Enterprise security", desc: "Row-level security, encrypted at rest, your data never trains a model." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight">Everything an analyst does, in minutes.</h2>
        <p className="mt-3 text-muted-foreground">Six surfaces, one workflow — from raw spreadsheet to boardroom narrative.</p>
      </div>
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {feats.map((f) => (
          <div key={f.title} className="group bg-card p-7 transition hover:bg-accent/50">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Upload", desc: "Drag your CSV or Excel. Preview & validate columns." },
    { n: "02", title: "Explore", desc: "Auto-built dashboard with KPIs, trends, and breakdowns." },
    { n: "03", title: "Ask", desc: "Chat with the AI copilot. Get insights, forecasts, and exec summaries." },
  ];
  return (
    <section id="how" className="border-y border-border/60 bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold tracking-tight">From file to decision in three steps</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-8">
              <div className="font-mono text-sm text-primary">{s.n}</div>
              <div className="mt-3 text-xl font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Starter", price: "$0", desc: "For solo analysts & students.",
      features: ["3 datasets", "Up to 50K rows", "AI copilot (50 msgs/mo)", "PDF & Excel export"], cta: "Start free" },
    { name: "Pro", price: "$29", featured: true, desc: "For growing teams.",
      features: ["Unlimited datasets", "Up to 5M rows", "Unlimited copilot", "Forecasting & anomaly alerts", "Branded reports"], cta: "Start 14-day trial" },
    { name: "Business", price: "$99", desc: "SSO, audit, admin.",
      features: ["Everything in Pro", "SSO & SAML", "Admin controls", "Priority support", "Custom integrations"], cta: "Contact sales" },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="text-center text-4xl font-bold tracking-tight">Simple, honest pricing</h2>
      <p className="mt-3 text-center text-muted-foreground">Pick a plan that scales with your data.</p>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name}
               className={`rounded-2xl border p-8 ${p.featured ? "border-primary bg-card shadow-xl shadow-primary/10" : "border-border bg-card"}`}>
            {p.featured && <Badge className="mb-3">Most popular</Badge>}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <div className="mt-3"><span className="text-4xl font-bold">{p.price}</span><span className="text-sm text-muted-foreground">/mo</span></div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-primary" />{f}</li>
              ))}
            </ul>
            <Link to="/auth" className="mt-6 block">
              <Button className="w-full" variant={p.featured ? "default" : "outline"}>{p.cta}</Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "We replaced three Looker dashboards in an afternoon.", a: "Maya R.", role: "Head of Growth, Falcon Labs" },
    { q: "Forecast accuracy is genuinely close to our data-science team's.", a: "Jin O.", role: "FP&A Lead, Atlas Co." },
    { q: "The copilot caught a churn anomaly two weeks before we did.", a: "Priya S.", role: "VP Ops, Quasar" },
  ];
  return (
    <section className="border-y border-border/60 bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold tracking-tight">Loved by ops, finance, and growth teams</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.a} className="rounded-2xl border border-border bg-card p-7">
              <Zap className="mb-3 size-5 text-primary" />
              <blockquote className="text-pretty">"{t.q}"</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">{t.a} — {t.role}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-24">
      <div className="overflow-hidden rounded-3xl border border-border bg-card p-12 text-center">
        <h2 className="text-4xl font-bold tracking-tight">Ready to see your data tell its story?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Spin up an account, drop your first CSV, and ask the copilot anything.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/auth"><Button size="lg">Get started — it's free</Button></Link>
          <a href="mailto:hello@trendsense.ai"><Button variant="outline" size="lg">hello@trendsense.ai</Button></a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Logo /> <span>© {new Date().getFullYear()} TrendSense AI</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
