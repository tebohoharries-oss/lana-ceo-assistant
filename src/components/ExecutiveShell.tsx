import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { MessageSquare, CalendarClock, FileSearch, Moon, Sun } from "lucide-react";

const NAV = [
  { to: "/", label: "Executive Chat", icon: MessageSquare },
  { to: "/planner", label: "Schedule Optimizer", icon: CalendarClock },
  { to: "/research", label: "Briefing Generator", icon: FileSearch },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lana-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("lana-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex w-full items-center justify-between rounded-md border border-sidebar-border px-3 py-2 text-xs font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <span>{dark ? "Dark" : "Light"} mode</span>
      {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

export function ExecutiveShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="surface-executive flex flex-col gap-6 border-b border-sidebar-border px-5 py-5 text-sidebar-foreground lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-base font-semibold tracking-tight text-sidebar-primary-foreground">
            L
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">Lana</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Executive AI
            </p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-3 lg:block">
          <div className="rounded-md border border-sidebar-border p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/50">
              Signed in as
            </p>
            <p className="mt-1 text-sm font-medium">Chief Executive Officer</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border px-5 py-5 lg:px-10 lg:py-7">
          <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </header>
        <div className="flex-1 px-5 py-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
