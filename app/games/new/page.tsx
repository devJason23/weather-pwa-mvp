export const dynamic = 'force-dynamic';
import { AppShell } from "@/components/app-shell";
import { GameForm, OpponentForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewGamePage() {
  await requireAdmin();

  const [teams, opponents, players] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.opponent.findMany({ orderBy: { name: "asc" } }),
    prisma.player.findMany({ orderBy: [{ teamId: "asc" }, { jerseyNumber: "asc" }] })
  ]);

  return (
    <AppShell pathname="/games" title="Create Game" description="Create the game, lock the roster snapshot, then attach the full video.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="New game" subtitle="Team, opponent, colors, and roster snapshot are all stored on the game.">
          <GameForm teams={teams} opponents={opponents} players={players} />
        </Card>

        <Card title="Quick add opponent" subtitle="Use this if the opponent does not exist yet.">
          <OpponentForm />
        </Card>
      </div>
    </AppShell>
  );
}
