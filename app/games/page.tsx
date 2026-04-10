export const dynamic = 'force-dynamic';

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
          <Link className="hs-button" href="/games/new">
            New game
          </Link>
        }
      >
        <Table>
          <table>
            <thead>
              <tr>
                <th>Matchup</th>
                <th>Date</th>
                <th>Status</th>
                <th>Processing</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <Link className="font-semibold text-brand-green hover:text-brand-green-deep" href={`/games/${game.id}` as Route}>
                      {game.team.name} vs {game.opponent.name}
                    </Link>
                  </td>
                  <td>{formatDate(game.gameDate)}</td>
                  <td>
                    <Badge tone={gameStatusTone[game.status]}>{game.status}</Badge>
                  </td>
                  <td>
                    <Badge tone={processingStatusTone[game.processingStatus]}>{game.processingStatus}</Badge>
                  </td>
                  <td>{game._count.reviewItems} items / {game._count.draftEvents} events</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </Card>
    </AppShell>
  );
}
