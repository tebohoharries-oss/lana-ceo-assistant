import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ExecutiveShell } from "@/components/ExecutiveShell";
import { Markdown } from "@/components/Markdown";
import { lanaPlan } from "@/lib/lana.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Executive Schedule Optimizer — Lana" },
      {
        name: "description",
        content:
          "Turn executive tasks, priorities and deadlines into an optimized day of deep work, leadership meetings and delegation.",
      },
      { property: "og:title", content: "Executive Schedule Optimizer — Lana" },
      {
        property: "og:description",
        content:
          "Optimized high-impact time blocks and time-management guidance for the CEO's day.",
      },
    ],
  }),
  component: PlannerPage,
});

type Task = { title: string; priority: string; duration: string; deadline: string };

const PRIORITIES = [
  "High / Board-Level",
  "Medium / Operational",
  "Low / Administrative",
];

const empty: Task = {
  title: "",
  priority: PRIORITIES[0]!,
  duration: "60 min",
  deadline: "",
};

function PlannerPage() {
  const plan = useServerFn(lanaPlan);
  const [tasks, setTasks] = useState<Task[]>([{ ...empty }]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = tasks.filter((t) => t.title.trim());
    if (!valid.length || busy) return;
    setBusy(true);
    setError(null);
    setOutput(null);
    try {
      const res = await plan({ data: { tasks: valid, notes } });
      setOutput(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

  return (
    <ExecutiveShell
      title="Executive Schedule Optimizer"
      subtitle="Sequence the day around board impact, deep work and delegation."
    >
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="panel space-y-4 p-5 lg:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Executive tasks
          </h2>

          {tasks.map((t, i) => (
            <div key={i} className="space-y-3 rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  value={t.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Task, e.g. Finalize Q3 board deck"
                  className={field}
                />
                {tasks.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove task"
                    onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))}
                    className="shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={t.priority}
                  onChange={(e) => update(i, { priority: e.target.value })}
                  className={field}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  value={t.duration}
                  onChange={(e) => update(i, { duration: e.target.value })}
                  placeholder="Duration"
                  className={field}
                />
                <input
                  type="date"
                  value={t.deadline}
                  onChange={(e) => update(i, { deadline: e.target.value })}
                  className={field}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setTasks([...tasks, { ...empty }])}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" /> Add task
          </button>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Constraints (optional): working hours, fixed meetings, travel…"
            className={`${field} resize-none`}
          />

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? "Optimizing schedule" : "Generate optimized schedule"}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <div className="panel p-5 lg:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Optimized day
          </h2>
          <div className="mt-4">
            {busy && (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-muted"
                    style={{ width: `${90 - i * 12}%` }}
                  />
                ))}
              </div>
            )}
            {!busy && output && <Markdown content={output} />}
            {!busy && !output && (
              <p className="text-sm text-muted-foreground">
                Enter tasks to receive time-blocked scheduling and two executive
                time-management tips.
              </p>
            )}
          </div>
        </div>
      </div>
    </ExecutiveShell>
  );
}
