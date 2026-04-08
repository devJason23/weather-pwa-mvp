import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, Table } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameStatusTone, processingStatusTone } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function GamesPage() {
  await requireAdmin();

  const games = await prisma.game.findMany({
    include: {
      team: true,
      opponent: true,
      _count: {
        select: {
          reviewItems: true,
          draftEvents: true
        }
      }
    },
    orderBy: { gameDate: "desc" }
  });

  return (
    <AppShell pathname="/games" title="Games" description="Track upload state, draft processing, review load, and official publishing.">
      <Card
        title="Game list"
        subtitle="Each game has a frozen roster snapshot and a strict draft-to-official lifecycle."
        action={
          <Link className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white" href="/games/new">
            New game
          </Link>
        }
      >
        <Table>
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-mist/70 text-left text-slate/70">
              <tr>
                <th className="px-4 py-3">Matchup</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Processing</th>
                <th className="px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="px-4 py-3">
                    <Link className="font-medium text-accent" href={`/games/${game.id}` as Route}>
                      {game.team.name} vs {game.opponent.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatDate(game.gameDate)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={gameStatusTone[game.status]}>{game.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={processingStatusTone[game.processingStatus]}>{game.processingStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">{game._count.reviewItems} items / {game._count.draftEvents} events</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </Card>
    </AppShell>
  );
}
