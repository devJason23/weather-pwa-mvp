import {
  EventType,
  GameStatus,
  ProcessingStatus,
  ReviewStatus,
  ShotType,
  TeamSide,
  type DraftEvent,
  type ReviewDecision
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ResolvedEvent = {
  timestampSeconds: number;
  teamSide: TeamSide;
  playerId: string | null;
  eventType: EventType;
  shotMade: boolean | null;
  shotType: ShotType;
};

function scoreValue(event: ResolvedEvent) {
  if (!event.shotMade) return 0;
  if (event.shotType === ShotType.THREE) return 3;
  return 2;
}

function resolveEvent(draftEvent: DraftEvent, decision?: ReviewDecision | null): ResolvedEvent | null {
  if (!decision && !draftEvent.autoAccepted) return null;

  const eventType = decision?.finalEventType ?? draftEvent.eventType;
  if (eventType === EventType.NO_EVENT) return null;

  return {
    timestampSeconds: draftEvent.timestampSeconds,
    teamSide: decision?.finalTeamSide ?? draftEvent.teamSide,
    playerId: decision?.finalPlayerId ?? draftEvent.playerId,
    eventType,
    shotMade: decision?.finalShotMade ?? draftEvent.shotMade,
    shotType: decision?.finalShotType ?? draftEvent.shotType
  };
}

export async function rebuildOfficialStats(gameId: string) {
  const game = await prisma.game.findUniqueOrThrow({
    where: { id: gameId },
    include: {
      draftEvents: { orderBy: { sequenceNumber: "asc" } },
      reviewItems: {
        include: {
          decisions: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  const pendingReview = game.reviewItems.some((item) => item.status === ReviewStatus.PENDING);
  const decisions = new Map(game.reviewItems.map((item) => [item.draftEventId, item.decisions[0] ?? null]));

  const statMap = new Map<
    string,
    {
      teamSide: TeamSide;
      playerId: string | null;
      points: number;
      fgm: number;
      fga: number;
      threePm: number;
      threePa: number;
      ftm: number;
      fta: number;
      timeline: string[];
    }
  >();

  const scoreMap = new Map<TeamSide, number>([
    [TeamSide.HOME, 0],
    [TeamSide.AWAY, 0]
  ]);

  for (const draftEvent of game.draftEvents) {
    const resolved = resolveEvent(draftEvent, decisions.get(draftEvent.id));
    if (!resolved) continue;

    const key = `${resolved.teamSide}:${resolved.playerId ?? "team"}`;
    const current =
      statMap.get(key) ??
      {
        teamSide: resolved.teamSide,
        playerId: resolved.playerId,
        points: 0,
        fgm: 0,
        fga: 0,
        threePm: 0,
        threePa: 0,
        ftm: 0,
        fta: 0,
        timeline: []
      };

    if (
      resolved.eventType === EventType.SHOT_MADE ||
      resolved.eventType === EventType.SHOT_MISSED ||
      resolved.eventType === EventType.FREE_THROW
    ) {
      if (resolved.shotType === ShotType.FREE_THROW) {
        current.fta += 1;
        if (resolved.shotMade) current.ftm += 1;
      } else {
        current.fga += 1;
        if (resolved.shotType === ShotType.THREE) current.threePa += 1;
        if (resolved.shotMade) {
          current.fgm += 1;
          if (resolved.shotType === ShotType.THREE) current.threePm += 1;
        }
      }
    }

    const points = scoreValue(resolved);
    current.points += points;
    scoreMap.set(resolved.teamSide, (scoreMap.get(resolved.teamSide) ?? 0) + points);
    current.timeline.push(`${resolved.timestampSeconds}:${resolved.eventType}:${points}`);
    statMap.set(key, current);
  }

  await prisma.$transaction(async (tx) => {
    await tx.officialStatLine.deleteMany({ where: { gameId } });

    if (statMap.size > 0) {
      await tx.officialStatLine.createMany({
        data: Array.from(statMap.values()).map((entry) => ({
          gameId,
          playerId: entry.playerId,
          teamSide: entry.teamSide,
          points: entry.points,
          fgm: entry.fgm,
          fga: entry.fga,
          threePm: entry.threePm,
          threePa: entry.threePa,
          ftm: entry.ftm,
          fta: entry.fta,
          finalScore: scoreMap.get(entry.teamSide) ?? 0,
          timeline: entry.timeline
        }))
      });
    }

    await tx.game.update({
      where: { id: gameId },
      data: {
        status: pendingReview ? GameStatus.IN_REVIEW : GameStatus.OFFICIAL,
        processingStatus: pendingReview ? ProcessingStatus.REVIEW_NEEDED : ProcessingStatus.OFFICIAL,
        publishedAt: pendingReview ? null : new Date()
      }
    });
  });
}
