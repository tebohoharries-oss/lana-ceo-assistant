import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ExecutiveShell } from "@/components/ExecutiveShell";
import { Markdown } from "@/components/Markdown";
import { lanaBrief } from "@/lib/lana.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Executive Briefing Generator — Lana" },
      {
        name: "description",
        content:
          "Paste reports, market analyses or competitor data and receive a structured executive briefing with insights and recommended decisions.",
      },
      { property: "og:title", content: "Executive Briefing Generator — Lana" },
      {
        property: "og:description",
        content:
          "Long reports condensed into an executive summary, three strategic insights and recommended next steps.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const brief = useServerFn(lanaBrief);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (source.trim().length < 20 || busy) return;
    setBusy(true);
    setError(null);
    setOutput(null);
    try {
      const res = await brief({ data: { source: source.trim() } });
      setOutput(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ExecutiveShell
      title="Briefing & Intelligence Generator"
      subtitle="Long-form intelligence compressed into a decision-ready briefing."
    >
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="panel space-y-4 p-5 lg:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Source material
          </h2>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            rows={16}
            placeholder="Paste a report, market analysis, competitor teardown or board pack…"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {source.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="submit"
              disabled={busy || source.trim().length < 20}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Synthesizing briefing" : "Generate executive briefing"}
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <div className="panel p-5 lg:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Executive briefing
          </h2>
          <div className="mt-4">
            {busy && (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-muted"
                    style={{ width: `${95 - i * 10}%` }}
                  />
                ))}
              </div>
            )}
            {!busy && output && <Markdown content={output} />}
            {!busy && !output && (
              <p className="text-sm text-muted-foreground">
                Output arrives in three sections: Executive Summary, Core Strategic
                Insights, Recommended Decisions & Next Steps.
              </p>
            )}
          </div>
        </div>
      </div>
    </ExecutiveShell>
  );
}
