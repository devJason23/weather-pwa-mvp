import Link from "next/link";
import type { Route } from "next";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/teams", label: "Teams" },
  { href: "/games", label: "Games" },
  { href: "/review", label: "Review Queue" },
  { href: "/metrics", label: "Metrics" }
] satisfies Array<{ href: Route; label: string }>;

export function AppShell({
  title,
  description,
  pathname,
  children
}: {
  title: string;
  description?: string;
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.1),_transparent_32%),linear-gradient(180deg,_#f8fafc,_#eef2f7)]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-white/60 bg-slate px-5 py-6 text-white shadow-panel lg:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">CourtReview AI</p>
            <h1 className="mt-2 text-2xl font-semibold">Admin Ops</h1>
            <p className="mt-3 text-sm text-white/70">Trust-first workflow for post-game stat review.</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white",
                  pathname === item.href && "bg-white/10 text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOut} className="mt-8">
            <button className="w-full rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
              Sign out
            </button>
          </form>
        </aside>

        <main className="flex-1">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-panel">
            <div className="mb-6 flex flex-col gap-2 border-b border-line pb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Operations</p>
              <h2 className="text-3xl font-semibold text-ink">{title}</h2>
              {description ? <p className="max-w-3xl text-sm text-slate/70">{description}</p> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
