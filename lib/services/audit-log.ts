import { type CorrectionReason, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  gameId: string;
  draftEventId?: string;
  reviewItemId?: string;
  reviewDecisionId?: string;
  reviewerId?: string;
  originalPrediction: Prisma.InputJsonValue;
  confidenceScore?: number | null;
  reviewerAction: string;
  correctedValue?: Prisma.InputJsonValue;
  correctionReason?: CorrectionReason | null;
  note?: string | null;
};

export async function createAuditLog(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      gameId: input.gameId,
      draftEventId: input.draftEventId,
      reviewItemId: input.reviewItemId,
      reviewDecisionId: input.reviewDecisionId,
      reviewerId: input.reviewerId,
      originalPrediction: input.originalPrediction,
      confidenceScore: input.confidenceScore ?? null,
      reviewerAction: input.reviewerAction,
      correctedValue: input.correctedValue,
      correctionReason: input.correctionReason ?? null,
      note: input.note ?? null
    }
  });
}
