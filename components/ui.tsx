import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        tone ?? "bg-brand-ink/5 text-brand-ink-soft"
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="hs-card p-6 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-[-0.02em] text-brand-ink">{title}</h3>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-7 text-brand-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="hs-card p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-muted">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-brand-ink">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-brand-muted">{detail}</p> : null}
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return <div className="hs-table">{children}</div>;
}

export function TableLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-brand-green hover:text-brand-green-deep">
      {children}
    </Link>
  );
}
