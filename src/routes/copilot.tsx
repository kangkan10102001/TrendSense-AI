import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { sampleRows } from "@/lib/sample-data";
import { summarize } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/copilot")({
  head: () => ({ meta: [{ title: "AI Copilot — TrendSense AI" }] }),
  component: () => <RequireAuth><AppShell><Copilot /></AppShell></RequireAuth>,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why might revenue have changed recently?",
  "Which product performs best?",
  "Forecast next month's revenue.",
  "Which segments are underperforming?",
];

function Copilot() {
  const { active } = useDatasets();
  const rows = active?.sample_rows?.length ? active.sample_rows : sampleRows;
  const ctx = summarize(rows);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          dataset: {
            name: active?.name ?? "sample",
            rowCount: rows.length,
            columns: ctx,
            sampleRows: rows.slice(0, 50),
          },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't generate a response. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Business Copilot</h1>
        <p className="text-sm text-muted-foreground">
          Grounded on {active?.name ?? "sample dataset"} · {rows.length.toLocaleString()} rows
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-6" />
            </div>
            <p className="mt-4 font-medium">Ask anything about your data</p>
            <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="rounded-lg border border-border bg-background p-3 text-left text-sm hover:border-primary/50">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground">{m.content}</div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-foreground">
                <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data…"
          className="min-h-12 resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
        />
        <Button type="submit" disabled={busy || !input.trim()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
