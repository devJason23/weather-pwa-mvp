export const dynamic = 'force-dynamic';

import { ReviewStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Card, StatCard } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewReasonLabel } from "@/lib/types";
import { percent } from "@/lib/utils";

export default async function MetricsPage() {
  await requireAdmin();

  const [games, reviewItems, decisions, draftEvents] = await Promise.all([
    prisma.game.findMany({
      include: {
        reviewItems: true
      }
    }),
    prisma.reviewItem.findMany(),
    prisma.reviewDecision.findMany(),
    prisma.draftEvent.findMany()
  ]);

  const gamesAwaitingReview = games.filter((game) => game.reviewItems.some((item) => item.status === ReviewStatus.PENDING)).length;
  const pendingReviewItems = reviewItems.filter((item) => item.status === ReviewStatus.PENDING).length;
  const overrideRate = decisions.length === 0 ? 0 : decisions.filter((decision) => decision.status === ReviewStatus.CORRECTED).length / decisions.length;
  const reviewItemsPerGame = games.length === 0 ? 0 : reviewItems.length / games.length;
  const autoAccepted = draftEvents.filter((event) => event.autoAccepted).length;
  const topReasons = Object.entries(
    reviewItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.reviewReason] = (acc[item.reviewReason] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <AppShell pathname="/metrics" title="Metrics" description="Derived operational metrics from stored review work, audit records, and official publishing.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Games processed" value={games.length} />
        <StatCard label="Games awaiting review" value={gamesAwaitingReview} />
        <StatCard label="Review items pending" value={pendingReviewItems} />
        <StatCard label="Override rate" value={percent(overrideRate)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <StatCard label="Review items per game" value={reviewItemsPerGame.toFixed(1)} />
        <StatCard label="Auto-accepted events" value={autoAccepted} />
        <StatCard label="Reviewed events" value={draftEvents.length - autoAccepted} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="Top review reasons" subtitle="Useful for model calibration and worker prioritization.">
          <div className="space-y-3">
            {topReasons.map(([reason, count]) => (
              <div key={reason} className="hs-subtle p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-brand-ink">{reviewReasonLabel[reason as keyof typeof reviewReasonLabel]}</span>
                  <span className="text-sm text-brand-muted">{count}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div className="h-2 rounded-full bg-brand-green" style={{ width: `${(count / Math.max(topReasons[0]?.[1] ?? 1, 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Operational notes" subtitle="How to read these metrics during MVP calibration.">
          <div className="space-y-3 text-sm text-brand-muted">
            <p>Override rate measures how often reviewers had to correct AI output instead of confirming it.</p>
            <p>Items per game highlights review burden and helps compare confidence policy tuning between runs.</p>
            <p>Top review reasons are persisted so later model evaluation can target the biggest trust gaps first.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
