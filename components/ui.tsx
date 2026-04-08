import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tone ?? "bg-slate/10 text-slate")}>
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
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate/70">{subtitle}</p> : null}
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
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <p className="text-sm text-slate/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate/60">{detail}</p> : null}
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-line">{children}</div>;
}

export function TableLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-accent hover:text-slate">
      {children}
    </Link>
  );
}
