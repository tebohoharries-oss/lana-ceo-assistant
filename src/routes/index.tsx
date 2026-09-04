import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { ExecutiveShell } from "@/components/ExecutiveShell";
import { Markdown } from "@/components/Markdown";
import { lanaChat } from "@/lib/lana.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lana — Executive AI Assistant for CEOs" },
      {
        name: "description",
        content:
          "Lana is an executive AI assistant for CEOs: decision-grade chat, schedule optimization and instant executive briefings.",
      },
      { property: "og:title", content: "Lana — Executive AI Assistant for CEOs" },
      {
        property: "og:description",
        content:
          "Decision-grade AI chat, schedule optimization and executive briefings, built for the CEO's day.",
      },
    ],
  }),
  component: ChatPage,
});

const WELCOME =
  "Good day, Chief Executive Officer. I am Lana, your executive AI assistant. How can I streamline your decision-making today?";

const QUICK_ACTIONS = [
  "Draft Board Update",
  "Prep for Investor Call",
  "Review Strategic Risks",
];

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const chat = useServerFn(lanaChat);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await chat({
        data: { messages: next.filter((m) => m.content !== WELCOME) },
      });
      setMessages([...next, { role: "assistant", content: res.content }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ExecutiveShell
      title="Executive Assistant Chat"
      subtitle="Direct, decision-grade support from Lana."
    >
      <div className="panel mx-auto flex h-[calc(100vh-14rem)] min-h-[30rem] w-full max-w-4xl flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-5 lg:p-7">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-lg rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground"
                    : "max-w-[90%] rounded-lg rounded-bl-sm bg-secondary px-4 py-3 text-secondary-foreground"
                }
              >
                {m.role === "user" ? m.content : <Markdown content={m.content} />}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Lana is analysing
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4 lg:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((q) => (
              <button
                key={q}
                disabled={busy}
                onClick={() => send(q)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder="Brief Lana…"
              className="min-h-[3rem] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              aria-label="Send message"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </button>
          </form>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Lana is an AI assistant. Please verify financial, legal, and board-level
            decisions.
          </p>
        </div>
      </div>
    </ExecutiveShell>
  );
}
