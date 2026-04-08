import { GameStatus, ProcessingJobType, ProcessingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { aiEventGenerator } from "@/lib/mock-ai";
import { routeDraftEventsForReview } from "@/lib/services/review-routing";
import { rebuildOfficialStats } from "@/lib/services/official-stats";

export async function triggerMockProcessing(gameId: string) {
  const game = await prisma.game.findUniqueOrThrow({
    where: { id: gameId },
    include: {
      team: {
        include: {
          players: true
        }
      }
    }
  });

  await prisma.processingJob.create({
    data: {
      gameId,
      jobType: ProcessingJobType.AI_EXTRACTION,
      status: ProcessingStatus.PROCESSING,
      startedAt: new Date()
    }
  });

  await prisma.game.update({
    where: { id: gameId },
    data: {
      processingStatus: ProcessingStatus.PROCESSING,
      status: GameStatus.DRAFT
    }
  });

  const generated = await aiEventGenerator.generateDraftEvents({
    gameId,
    players: game.team.players
  });

  await prisma.reviewItem.deleteMany({ where: { gameId } });
  await prisma.draftEvent.deleteMany({ where: { gameId } });

  await prisma.draftEvent.createMany({
    data: generated.map((event) => ({
      gameId,
      playerId: event.playerId,
      sequenceNumber: event.sequenceNumber,
      timestampSeconds: event.timestampSeconds,
      clipUrl: event.clipUrl,
      eventType: event.eventType,
      teamSide: event.teamSide,
      shotType: event.shotType,
      shotMade: event.shotMade,
      aiConfidence: event.aiConfidence,
      confidenceTeam: event.confidenceTeam,
      confidenceAttempt: event.confidenceAttempt,
      confidenceResult: event.confidenceResult,
      confidencePlayer: event.confidencePlayer,
      confidenceShotType: event.confidenceShotType,
      confidenceFreeThrow: event.confidenceFreeThrow,
      aiPayload: event
    }))
  });

  await prisma.processingJob.updateMany({
    where: { gameId, jobType: ProcessingJobType.AI_EXTRACTION, status: ProcessingStatus.PROCESSING },
    data: {
      status: ProcessingStatus.DRAFT_READY,
      finishedAt: new Date(),
      detail: "Mock extraction completed"
    }
  });

  await prisma.game.update({
    where: { id: gameId },
    data: {
      processingStatus: ProcessingStatus.DRAFT_READY,
      status: GameStatus.DRAFT
    }
  });

  await routeDraftEventsForReview(gameId);
  await rebuildOfficialStats(gameId);
}
