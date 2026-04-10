import Link from "next/link";
import type { Route } from "next";
import { GameStatus, ReviewStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, StatCard, Table, TableLink } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameStatusTone, processingStatusTone } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
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
      pathname="/admin"
      title="Operations Dashboard"
      description="Monitor upload progress, review load, publishing readiness, and audit activity across the HoopSmith workflow."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tracked games" value={games.length} />
        <StatCard label="Official games" value={officialGames} />
        <StatCard label="Pending review items" value={reviewItems.length} />
        <StatCard label="Audit records" value={auditLogs} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Recent games" subtitle="Each game moves through a controlled draft-to-official workflow.">
          <Table>
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Processing</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>
                      <TableLink href={`/games/${game.id}` as Route}>{game.team.name} vs {game.opponent.name}</TableLink>
                    </td>
                    <td>{formatDate(game.gameDate)}</td>
                    <td>
                      <Badge tone={gameStatusTone[game.status]}>{game.status}</Badge>
                    </td>
                    <td>
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
          subtitle="Low-confidence events are routed into a fast review workflow before anything becomes official."
          action={
            <Link className="hs-button" href="/review">
              Open queue
            </Link>
          }
        >
          <div className="space-y-3">
            {reviewItems.length === 0 ? (
              <p className="text-sm text-brand-muted">No pending review items.</p>
            ) : (
              reviewItems.map((item) => (
                <div key={item.id} className="hs-subtle p-4">
                  <p className="text-sm font-semibold text-brand-ink">
                    {item.game.team.name} vs {item.game.opponent.name}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
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
