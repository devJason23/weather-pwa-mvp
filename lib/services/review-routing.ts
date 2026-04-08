import { GameStatus, ProcessingStatus, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { evaluateDraftEvent } from "@/lib/services/confidence-policy";

export async function routeDraftEventsForReview(gameId: string) {
  const [policies, draftEvents] = await Promise.all([
    prisma.confidencePolicy.findMany(),
    prisma.draftEvent.findMany({
      where: { gameId },
      orderBy: { sequenceNumber: "asc" }
    })
  ]);

  for (const draftEvent of draftEvents) {
    const evaluation = evaluateDraftEvent(draftEvent, policies);
    await prisma.draftEvent.update({
      where: { id: draftEvent.id },
      data: {
        autoAccepted: evaluation.autoAccepted,
        reviewRequired: !evaluation.autoAccepted,
        reviewReason: evaluation.reviewReason
      }
    });

    if (!evaluation.autoAccepted && evaluation.reviewReason) {
      await prisma.reviewItem.upsert({
        where: { draftEventId: draftEvent.id },
        update: {
          aiConfidence: draftEvent.aiConfidence,
          status: ReviewStatus.PENDING,
          reviewReason: evaluation.reviewReason
        },
        create: {
          gameId,
          draftEventId: draftEvent.id,
          proposedPlayerId: draftEvent.playerId,
          timestampSeconds: draftEvent.timestampSeconds,
          clipUrl: draftEvent.clipUrl,
          aiEventType: draftEvent.eventType,
          aiConfidence: draftEvent.aiConfidence,
          proposedTeamSide: draftEvent.teamSide,
          proposedShotMade: draftEvent.shotMade,
          proposedShotType: draftEvent.shotType,
          reviewReason: evaluation.reviewReason
        }
      });
    }
  }

  await prisma.game.update({
    where: { id: gameId },
    data: {
      processingStatus: ProcessingStatus.REVIEW_NEEDED,
      status: GameStatus.IN_REVIEW
    }
  });
}
