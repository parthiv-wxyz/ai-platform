import {
  ArrowUpRight,
  Bot,
  CircleHelp,
  Gauge,
  Menu,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { label: "Workspace", icon: Sparkles, active: true },
  { label: "Usage", icon: Gauge, active: false },
  { label: "Providers", icon: Bot, active: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white">
            <Sparkles className="size-4" />
          </span>
          AI Council
        </div>
        <Button aria-label="Open navigation" size="icon" variant="ghost">
          <Menu />
        </Button>
      </header>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
          <div className="flex items-center gap-2 px-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="size-4" />
            </span>
            AI Council
          </div>
          <p className="px-2 pt-2 text-xs text-slate-500">
            Cost-aware intelligence, together.
          </p>
          <nav aria-label="Primary navigation" className="mt-10 space-y-1">
            {navigation.map(({ label, icon: Icon, active }) => (
              <a
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                href={active ? "#workspace" : `#${label.toLowerCase()}`}
                key={label}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-auto hidden pt-72 lg:block">
            <a
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-950"
              href="#settings"
            >
              <Settings2 className="size-4" />
              Settings
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-950"
              href="#help"
            >
              <CircleHelp className="size-4" />
              Help center
            </a>
          </div>
        </aside>
        <main
          className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12"
          id="workspace"
        >
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-sm font-medium text-indigo-600">
                  Your workspace
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Build a better answer.
                </h1>
                <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                  Ask one model first. Bring in more perspective only when it
                  earns its tokens.
                </p>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                Mock provider · local only
              </div>
            </div>
            <section className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      New conversation
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      What are you working on?
                    </h2>
                  </div>
                  <span className="grid size-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Sparkles className="size-5" />
                  </span>
                </div>
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  The chat composer will connect to the normalized provider
                  gateway in the next milestone.
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    No external provider calls are enabled yet.
                  </p>
                  <div className="flex gap-3">
                    <a
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                      href="/sign-in"
                    >
                      Sign in
                    </a>
                    <a
                      className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors"
                      href="/dashboard"
                    >
                      Open workspace <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-medium text-indigo-300">
                  Milestone 0
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  A calm foundation.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  The project is wired for strict TypeScript, tests, a portable
                  app shell, and deterministic local development.
                </p>
                <div className="mt-8 space-y-3 text-sm">
                  {[
                    "Next.js App Router",
                    "Zod environment validation",
                    "Mock provider contract",
                  ].map((item) => (
                    <div className="flex items-center gap-3" key={item}>
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
