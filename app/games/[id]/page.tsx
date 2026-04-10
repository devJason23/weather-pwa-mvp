export const dynamic = 'force-dynamic';

import Link from "next/link";
import { notFound } from "next/navigation";

import { markOfficialAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatClock, formatDate } from "@/lib/utils";
import { gameStatusTone, processingStatusTone, reviewReasonLabel, reviewStatusTone } from "@/lib/types";
import { AppShell } from "@/components/app-shell";
import { TriggerProcessingForm } from "@/components/forms";
import { Badge, Card, StatCard, Table } from "@/components/ui";

export default async function GameDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ upload?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;

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
        include: { proposedPlayer: true },
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
      {query?.upload === "complete" ? (
        <div className="mb-6 rounded-[1.2rem] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          Upload complete. Processing ran automatically and the status below reflects the latest output.
        </div>
      ) : null}

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
          action={
            <Link href={`/games/${game.id}/upload`} className="hs-button">
              {game.videoAssets.length > 0 ? "Re-upload video" : "Upload video"}
            </Link>
          }
        >
          <div className="flex flex-wrap gap-3">
            <Badge tone={gameStatusTone[game.status]}>{game.status}</Badge>
            <Badge tone={processingStatusTone[game.processingStatus]}>{game.processingStatus}</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <TriggerProcessingForm gameId={game.id} />
            <form action={markOfficialAction}>
              <input type="hidden" name="gameId" value={game.id} />
              <button className="hs-button-secondary text-brand-ink-soft">Rebuild official stats</button>
            </form>
            <Link className="hs-button-secondary text-brand-ink-soft" href={`/review?gameId=${game.id}`}>
              Open review queue
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {game.processingJobs.map((job) => (
              <div key={job.id} className="hs-subtle p-4 text-sm">
                <p className="font-semibold text-brand-ink">{job.jobType}</p>
                <p className="mt-1 text-brand-muted">{job.status}</p>
                {job.detail ? <p className="mt-1 text-xs text-brand-muted">{job.detail}</p> : null}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Roster snapshot" subtitle="Frozen per game so review stays historically accurate.">
          <div className="space-y-2 text-sm">
            {game.rosterPlayers.map((rosterPlayer) => (
              <div key={rosterPlayer.id} className="flex items-center justify-between rounded-2xl border border-brand-line px-3 py-3 text-brand-ink">
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
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Player</th>
                  <th>AI</th>
                </tr>
              </thead>
              <tbody>
                {game.draftEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{formatClock(event.timestampSeconds)}</td>
                    <td>{event.eventType}</td>
                    <td>{event.player ? `${event.player.firstName} ${event.player.lastName}` : "Unassigned"}</td>
                    <td>{Math.round(event.aiConfidence * 100)}% {event.autoAccepted ? "auto" : "review"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>

        <Card title="Review items" subtitle="Pending, corrected, and skipped decisions all stay traceable.">
          <Table>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {game.reviewItems.map((item) => (
                  <tr key={item.id}>
                    <td>{formatClock(item.timestampSeconds)}</td>
                    <td>{reviewReasonLabel[item.reviewReason]}</td>
                    <td>
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
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>PTS</th>
                  <th>FGM/FGA</th>
                  <th>3PM/3PA</th>
                  <th>FTM/FTA</th>
                </tr>
              </thead>
              <tbody>
                {game.officialStats.map((line) => (
                  <tr key={line.id}>
                    <td>{line.player ? `${line.player.firstName} ${line.player.lastName}` : `${line.teamSide} total`}</td>
                    <td>{line.points}</td>
                    <td>{line.fgm}/{line.fga}</td>
                    <td>{line.threePm}/{line.threePa}</td>
                    <td>{line.ftm}/{line.fta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Card>

        <Card title="Audit trail" subtitle="Reviewer actions become durable calibration data.">
          <div className="space-y-3">
            {game.auditLogs.length === 0 ? (
              <p className="text-sm text-brand-muted">No audit events yet.</p>
            ) : (
              game.auditLogs.map((log) => (
                <div key={log.id} className="hs-subtle p-4">
                  <p className="text-sm font-semibold text-brand-ink">{log.reviewerAction}</p>
                  <p className="mt-1 text-xs text-brand-muted">
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
