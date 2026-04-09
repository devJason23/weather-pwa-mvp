export const dynamic = 'force-dynamic';

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TriggerProcessingForm } from "@/components/forms";
import { Badge, Card, StatCard, Table } from "@/components/ui";
import { markOfficialAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameStatusTone, processingStatusTone, reviewReasonLabel, reviewStatusTone } from "@/lib/types";
import { formatClock, formatDate } from "@/lib/utils";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      team: true,
      opponent: true,
      rosterPlayers: {
        include: { player: true },
        orderBy: { jerseyNumber: "asc" }
      },
      videoAssets: true,
      processingJobs: {
        orderBy: { queuedAt: "desc" }
      },
      draftEvents: {
        include: { player: true },
        orderBy: { sequenceNumber: "asc" }
      },
      reviewItems: {
        include: {
          proposedPlayer: true
        },
        orderBy: { timestampSeconds: "asc" }
      },
      officialStats: {
        include: { player: true },
        orderBy: [{ teamSide: "asc" }, { points: "desc" }]
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!game) notFound();

  const homeScore = game.officialStats.find((line) => line.teamSide === "HOME")?.finalScore ?? 0;
  const awayScore = game.officialStats.find((line) => line.teamSide === "AWAY")?.finalScore ?? 0;

  return (
    <AppShell
      pathname="/games"
      title={`${game.team.name} vs ${game.opponent.name}`}
      description={`${formatDate(game.gameDate)}${game.location ? ` • ${game.location}` : ""}`}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Game status" value={game.status} detail={game.shadowMode ? "Shadow mode enabled" : "Publishing allowed"} />
        <StatCard label="Processing" value={game.processingStatus} detail={`${game.videoAssets.length} uploaded video(s)`} />
        <StatCard label="Home score" value={homeScore} />
        <StatCard label="Away score" value={awayScore} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card
          title="Processing overview"
          subtitle="Upload, process, route review, and publish official stats from one place."
          action={<Link href={`/games/${game.id}/upload`} className="text-sm font-semibold text-accent">Upload video</Link>}
        >
          <div className="flex flex-wrap gap-3">
            <Badge tone={gameStatusTone[game.status]}>{game.status}</Badge>
            <Badge tone={processingStatusTone[game.processingStatus]}>{game.processingStatus}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <TriggerProcessingForm gameId={game.id} />
            <form action={markOfficialAction}>
              <input type="hidden" name="gameId" value={game.id} />
              <button className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate">
                Rebuild official stats
              </button>
            </form>
            <Link className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate" href={`/review?gameId=${game.id}`}>
              Open review queue
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {game.processingJobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-line bg-mist/60 p-4 text-sm">
                <p className="font-semibold text-ink">{job.jobType}</p>
                <p className="mt-1 text-slate/70">{job.status}</p>
                {job.detail ? <p className="mt-1 text-xs text-slate/60">{job.detail}</p> : null}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Roster snapshot" subtitle="Frozen per game so review stays historically accurate.">
          <div className="space-y-2 text-sm">
            {game.rosterPlayers.map((rosterPlayer) => (
              <div key={rosterPlayer.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
                <span>
                  #{rosterPlayer.jerseyNumber} {rosterPlayer.player.firstName} {rosterPlayer.player.lastName}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Draft events" subtitle="Auto-accepted events can contribute to official output.">
          <Table>
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-mist/70 text-left text-slate/70">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {game.draftEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3">{formatClock(event.timestampSeconds)}</td>
                    <td className="px-4 py-3">{event.eventType}</td>
                    <td className="px-4 py-3">
                      {event.player ? `${event.player.firstName} ${event.player.lastName}` : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      {Math.round(event.aiConfidence * 100)}% {event.autoAccepted ? "auto" : "review"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>

        <Card title="Review items" subtitle="Pending, corrected, and skipped decisions all stay traceable.">
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
                {game.reviewItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{formatClock(item.timestampSeconds)}</td>
                    <td className="px-4 py-3">{reviewReasonLabel[item.reviewReason]}</td>
                    <td className="px-4 py-3">
                      <Badge tone={reviewStatusTone[item.status]}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Official box score" subtitle="Only auto-accepted or reviewed events contribute.">
          <Table>
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-mist/70 text-left text-slate/70">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">PTS</th>
                  <th className="px-4 py-3">FGM/FGA</th>
                  <th className="px-4 py-3">3PM/3PA</th>
                  <th className="px-4 py-3">FTM/FTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {game.officialStats.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3">
                      {line.player ? `${line.player.firstName} ${line.player.lastName}` : `${line.teamSide} total`}
                    </td>
                    <td className="px-4 py-3">{line.points}</td>
                    <td className="px-4 py-3">{line.fgm}/{line.fga}</td>
                    <td className="px-4 py-3">{line.threePm}/{line.threePa}</td>
                    <td className="px-4 py-3">{line.ftm}/{line.fta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>

        <Card title="Audit trail" subtitle="Reviewer actions become durable calibration data.">
          <div className="space-y-3">
            {game.auditLogs.length === 0 ? (
              <p className="text-sm text-slate/70">No audit events yet.</p>
            ) : (
              game.auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-line bg-mist/60 p-4">
                  <p className="text-sm font-semibold text-ink">{log.reviewerAction}</p>
                  <p className="mt-1 text-xs text-slate/70">
                    {log.correctionReason ?? "No correction reason"} • confidence {Math.round((log.confidenceScore ?? 0) * 100)}%
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
