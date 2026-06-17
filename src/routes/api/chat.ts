import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const body = (await request.json()) as {
          messages: { role: "user" | "assistant"; content: string }[];
          dataset?: { name: string; rowCount: number; columns: unknown; sampleRows: unknown[] };
        };
        const gateway = createLovableAiGatewayProvider(key);
        const datasetCtx = body.dataset
          ? `You are analyzing the dataset "${body.dataset.name}" (${body.dataset.rowCount} rows).
Column profile: ${JSON.stringify(body.dataset.columns).slice(0, 4000)}
Sample rows (first 50): ${JSON.stringify(body.dataset.sampleRows).slice(0, 6000)}`
          : "No dataset provided.";

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: `You are TrendSense AI, an expert business analyst & decision-intelligence copilot.
You explain trends, identify drivers, forecast, detect anomalies, and recommend actions.
Always ground answers in the provided dataset. Be concise, use markdown, and add a "Recommended actions" section when appropriate.

DATASET CONTEXT:
${datasetCtx}`,
          messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
        });

        return result.toTextStreamResponse();
      },
    },
  },
});
