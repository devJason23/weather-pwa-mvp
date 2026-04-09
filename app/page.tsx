export const dynamic = 'force-dynamic';

import Link from "next/link";
import type { Route } from "next";
import { GameStatus, ReviewStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, StatCard, Table, TableLink } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameStatusTone, processingStatusTone } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  await requireAdmin();

  const [games, reviewItems, auditLogs] = await Promise.all([
    prisma.game.findMany({
      include: { team: true, opponent: true },
      orderBy: { gameDate: "desc" },
      take: 5
    }),
    prisma.reviewItem.findMany({
      where: { status: ReviewStatus.PENDING },
      include: { game: { include: { team: true, opponent: true } } },
      take: 5,
      orderBy: { updatedAt: "asc" }
    }),
    prisma.auditLog.count()
  ]);

  const officialGames = games.filter((game) => game.status === GameStatus.OFFICIAL).length;

  return (
    <AppShell
      pathname="/"
      title="Dashboard"
      description="Operational overview across uploads, review workload, and official publishing readiness."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tracked games" value={games.length} />
        <StatCard label="Official games" value={officialGames} />
        <StatCard label="Pending review items" value={reviewItems.length} />
        <StatCard label="Audit records" value={auditLogs} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Recent games" subtitle="Statuses stay explicit from draft through official publishing.">
          <Table>
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-mist/70 text-left text-slate/70">
                <tr>
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Processing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {games.map((game) => (
                  <tr key={game.id}>
                    <td className="px-4 py-3">
                      <TableLink href={`/games/${game.id}` as Route}>{game.team.name} vs {game.opponent.name}</TableLink>
                    </td>
                    <td className="px-4 py-3">{formatDate(game.gameDate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={gameStatusTone[game.status]}>{game.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={processingStatusTone[game.processingStatus]}>{game.processingStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>

        <Card
          title="Review queue"
          subtitle="Route low-confidence events and score conflicts before anything becomes official."
          action={
            <Link className="text-sm font-semibold text-accent" href="/review">
              Open queue
            </Link>
          }
        >
          <div className="space-y-3">
            {reviewItems.length === 0 ? (
              <p className="text-sm text-slate/70">No pending review items.</p>
            ) : (
              reviewItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line bg-mist/60 p-4">
                  <p className="text-sm font-semibold text-ink">
                    {item.game.team.name} vs {item.game.opponent.name}
                  </p>
                  <p className="mt-1 text-xs text-slate/70">
                    {item.reviewReason} at {item.timestampSeconds}s
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
