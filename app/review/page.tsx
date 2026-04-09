export const dynamic = 'force-dynamic';

import { EventType, ReviewStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ReviewDecisionForm } from "@/components/forms";
import { Badge, Card, Table } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewReasonLabel, reviewStatusTone } from "@/lib/types";
import { formatClock } from "@/lib/utils";

type Search = Promise<{
  gameId?: string;
  status?: string;
  eventType?: string;
  confidence?: string;
  item?: string;
}>;

export default async function ReviewPage({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const filters = await searchParams;

  const where = {
    gameId: filters.gameId || undefined,
    status: (filters.status as ReviewStatus | undefined) || undefined,
    aiEventType: (filters.eventType as EventType | undefined) || undefined,
    ...(filters.confidence === "low" ? { aiConfidence: { lt: 0.9 } } : {}),
    ...(filters.confidence === "high" ? { aiConfidence: { gte: 0.9 } } : {})
  };

  const [items, games] = await Promise.all([
    prisma.reviewItem.findMany({
      where,
      include: {
        game: {
          include: {
            team: true,
            opponent: true
          }
        },
        proposedPlayer: true
      },
      orderBy: [{ status: "asc" }, { aiConfidence: "asc" }, { timestampSeconds: "asc" }]
    }),
    prisma.game.findMany({
      include: { team: true, opponent: true },
      orderBy: { gameDate: "desc" }
    })
  ]);

  const selected = items.find((item) => item.id === filters.item) ?? items[0] ?? null;
  const selectedGamePlayers = selected
    ? await prisma.gameRosterPlayer.findMany({
        where: { gameId: selected.gameId },
        include: { player: true },
        orderBy: { jerseyNumber: "asc" }
      })
    : [];
  const currentIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;

  return (
    <AppShell pathname="/review" title="Review Queue" description="Confirm or correct uncertain events before stats become official.">
      <Card title="Filters" subtitle="Narrow by game, confidence band, status, or event type.">
        <form className="grid gap-3 md:grid-cols-4">
          <select name="gameId" defaultValue={filters.gameId ?? ""}>
            <option value="">All games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.team.name} vs {game.opponent.name}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status ?? ""}>
            <option value="">All statuses</option>
            {Object.values(ReviewStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="eventType" defaultValue={filters.eventType ?? ""}>
            <option value="">All event types</option>
            {Object.values(EventType).map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </select>
          <select name="confidence" defaultValue={filters.confidence ?? ""}>
            <option value="">All confidence</option>
            <option value="low">Below 90%</option>
            <option value="high">90% and above</option>
          </select>
          <button className="w-fit rounded-lg bg-slate px-4 py-2 text-sm font-semibold text-white">Apply filters</button>
        </form>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="Queue" subtitle={`${items.length} review items in current filter set.`}>
          <Table>
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-mist/70 text-left text-slate/70">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={item.id} className={selected?.id === item.id ? "bg-accent/5" : ""}>
                    <td className="px-4 py-3">
                      <a className="font-medium text-accent" href={`/review?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), item: item.id }).toString()}`}>
                        {formatClock(item.timestampSeconds)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div>{reviewReasonLabel[item.reviewReason]}</div>
                      <div className="text-xs text-slate/60">{Math.round(item.aiConfidence * 100)}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={reviewStatusTone[item.status]}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>

        <Card title="Reviewer workspace" subtitle="Confirm, correct, skip, or mark no-event with a full audit trail.">
          {selected ? (
            <ReviewDecisionForm
              item={selected}
              players={selectedGamePlayers.map((entry) => entry.player)}
              previousItemId={currentIndex > 0 ? items[currentIndex - 1]?.id : undefined}
              nextItemId={currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1]?.id : undefined}
            />
          ) : (
            <p className="text-sm text-slate/70">No review items match the current filters.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
