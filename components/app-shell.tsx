import Link from "next/link";
import type { Route } from "next";
import { signOut } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,107,58,0.08),_transparent_28%),linear-gradient(180deg,_#f7faf9,_#eef4f2)]">
      <div className="mx-auto flex min-h-screen max-w-[1520px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,_#11161b,_#0f1317)] px-6 py-7 text-white shadow-[0_30px_60px_rgba(13,13,13,0.32)] lg:block">
          <div className="mb-8">
            <BrandMark href="/" tone="light" compact />
            <p className="mt-4 text-sm leading-7 text-white/72">
              Internal game review, publishing, and player-development operations in one place.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-[1.1rem] px-4 py-3 text-sm font-semibold text-white/72 hover:bg-white/8 hover:text-white",
                  pathname === item.href && "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-silver">Workflow standard</p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Structured review before publishing so official data stays trustworthy.
            </p>
          </div>

          <form action={signOut} className="mt-8">
            <button className="w-full rounded-full border border-white/16 px-4 py-3 text-sm font-semibold text-white hover:bg-white/8">
              Sign out
            </button>
          </form>
        </aside>

        <main className="flex-1">
          <div className="hs-panel p-6 sm:p-7 lg:p-8">
            <div className="mb-7 flex flex-col gap-2 border-b border-brand-green/10 pb-5">
              <p className="hs-kicker text-brand-green">HoopSmith Admin</p>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-brand-ink">{title}</h2>
              {description ? <p className="max-w-3xl text-sm leading-7 text-brand-muted">{description}</p> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
