export const dynamic = 'force-dynamic';

import { AppShell } from "@/components/app-shell";
import { PlayerForm, TeamForm } from "@/components/forms";
import { Card, Table } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamsPage() {
  await requireAdmin();

  const teams = await prisma.team.findMany({
    include: {
      players: {
        orderBy: { jerseyNumber: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell pathname="/teams" title="Teams and Players" description="Manage organizations, rosters, and jersey numbers used in game snapshots.">
      <div className="grid gap-6">
        <Card title="Add team" subtitle="Create teams by season and age group.">
          <TeamForm />
        </Card>

        <Card title="Add player" subtitle="Player identities feed the review and official stat workflow.">
          <PlayerForm teams={teams} />
        </Card>

        {teams.map((team) => (
          <Card key={team.id} title={`${team.name} ${team.ageGroup}`} subtitle={`Season ${team.season}`}>
            <Table>
              <table>
                <thead>
                  <tr>
                    <th>Jersey</th>
                    <th>Player</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player) => (
                    <tr key={player.id}>
                      <td>#{player.jerseyNumber}</td>
                      <td>
                        {player.firstName} {player.lastName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Table>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
