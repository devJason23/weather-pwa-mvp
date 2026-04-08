"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CorrectionReason,
  EventType,
  Prisma,
  ProcessingJobType,
  ProcessingStatus,
  ReviewStatus,
  ShotType,
  TeamSide
} from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/audit-log";
import { rebuildOfficialStats } from "@/lib/services/official-stats";
import { triggerMockProcessing } from "@/lib/services/video-processing";
import { storageDriver } from "@/lib/storage";
import {
  createGameSchema,
  opponentSchema,
  playerSchema,
  reviewDecisionSchema,
  teamSchema
} from "@/lib/validation";

function parseRosterValues(formData: FormData) {
  return formData
    .getAll("rosterPlayerIds")
    .map((value) => String(value))
    .filter(Boolean);
}

export async function createTeamAction(formData: FormData) {
  await requireAdmin();
  const values = teamSchema.parse({
    name: formData.get("name"),
    ageGroup: formData.get("ageGroup"),
    season: formData.get("season")
  });
  await prisma.team.create({ data: values });
  revalidatePath("/teams");
}

export async function createPlayerAction(formData: FormData) {
  await requireAdmin();
  const values = playerSchema.parse({
    teamId: formData.get("teamId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    jerseyNumber: formData.get("jerseyNumber")
  });
  await prisma.player.create({ data: values });
  revalidatePath("/teams");
}

export async function createOpponentAction(formData: FormData) {
  await requireAdmin();
  const values = opponentSchema.parse({ name: formData.get("name") });
  await prisma.opponent.create({ data: values });
  revalidatePath("/games/new");
}

export async function createGameAction(formData: FormData) {
  await requireAdmin();
  const values = createGameSchema.parse({
    teamId: formData.get("teamId"),
    opponentId: formData.get("opponentId"),
    gameDate: formData.get("gameDate"),
    location: formData.get("location") || undefined,
    teamColor: formData.get("teamColor"),
    opponentColor: formData.get("opponentColor"),
    rosterPlayerIds: parseRosterValues(formData),
    shadowMode: formData.get("shadowMode") === "on"
  });

  const rosterPlayers = await prisma.player.findMany({
    where: { id: { in: values.rosterPlayerIds } },
    select: { id: true, jerseyNumber: true }
  });

  const game = await prisma.game.create({
    data: {
      teamId: values.teamId,
      opponentId: values.opponentId,
      gameDate: new Date(values.gameDate),
      location: values.location,
      teamColor: values.teamColor,
      opponentColor: values.opponentColor,
      shadowMode: values.shadowMode,
      rosterPlayers: {
        create: rosterPlayers.map((player) => ({
          playerId: player.id,
          jerseyNumber: player.jerseyNumber
        }))
      }
    }
  });

  redirect(`/games/${game.id}/upload`);
}

export async function uploadVideoAction(formData: FormData) {
  await requireAdmin();
  const gameId = String(formData.get("gameId"));
  const file = formData.get("video");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select a video file.");
  }

  const stored = await storageDriver.save(file);

  await prisma.videoAsset.create({
    data: {
      gameId,
      storageKey: stored.storageKey,
      originalFileName: stored.originalFileName,
      contentType: stored.contentType,
      sizeBytes: stored.sizeBytes,
      uploadStatus: ProcessingStatus.UPLOADED
    }
  });

  await prisma.processingJob.create({
    data: {
      gameId,
      jobType: ProcessingJobType.VIDEO_INGESTION,
      status: ProcessingStatus.UPLOADED,
      detail: stored.url
    }
  });

  await prisma.game.update({
    where: { id: gameId },
    data: { processingStatus: ProcessingStatus.UPLOADED }
  });

  revalidatePath(`/games/${gameId}`);
  redirect(`/games/${gameId}`);
}

export async function triggerProcessingAction(formData: FormData) {
  await requireAdmin();
  const gameId = String(formData.get("gameId"));
  await triggerMockProcessing(gameId);
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/review");
  revalidatePath("/metrics");
}

export async function submitReviewDecisionAction(formData: FormData) {
  const admin = await requireAdmin();
  const finalPlayerIdRaw = String(formData.get("finalPlayerId") ?? "");
  const correctionReasonRaw = String(formData.get("correctionReason") ?? "");

  const values = reviewDecisionSchema.parse({
    reviewItemId: formData.get("reviewItemId"),
    status: formData.get("status"),
    finalEventType: formData.get("finalEventType"),
    finalPlayerId: finalPlayerIdRaw ? finalPlayerIdRaw : null,
    finalTeamSide: formData.get("finalTeamSide"),
    finalShotMade: formData.get("finalShotMade") === "" ? null : formData.get("finalShotMade") === "true",
    finalShotType: formData.get("finalShotType"),
    note: formData.get("note") || undefined,
    correctionReason: correctionReasonRaw || undefined
  });

  const reviewer = await prisma.adminUser.upsert({
    where: { email: admin.email },
    update: { name: admin.name },
    create: { email: admin.email, name: admin.name }
  });

  const reviewItem = await prisma.reviewItem.findUniqueOrThrow({
    where: { id: values.reviewItemId },
    include: { draftEvent: true }
  });

  const correctionReason =
    correctionReasonRaw && correctionReasonRaw in CorrectionReason
      ? (correctionReasonRaw as CorrectionReason)
      : values.status === ReviewStatus.CORRECTED
        ? CorrectionReason.REVIEWER_JUDGMENT
        : null;

  const decision = await prisma.reviewDecision.create({
    data: {
      reviewItemId: values.reviewItemId,
      reviewerId: reviewer.id,
      status: values.status,
      finalEventType: values.finalEventType,
      finalPlayerId: values.finalPlayerId,
      finalTeamSide: values.finalTeamSide as TeamSide,
      finalShotMade: values.finalShotMade,
      finalShotType: values.finalShotType as ShotType,
      note: values.note,
      correctionReason
    }
  });

  await prisma.reviewItem.update({
    where: { id: values.reviewItemId },
    data: {
      status: values.status,
      note: values.note
    }
  });

  await createAuditLog({
    gameId: reviewItem.gameId,
    draftEventId: reviewItem.draftEventId,
    reviewItemId: reviewItem.id,
    reviewDecisionId: decision.id,
    reviewerId: reviewer.id,
    originalPrediction: (reviewItem.draftEvent.aiPayload ?? {}) as Prisma.InputJsonValue,
    confidenceScore: reviewItem.aiConfidence,
    reviewerAction: values.status,
    correctedValue: {
      finalEventType: values.finalEventType,
      finalPlayerId: values.finalPlayerId,
      finalTeamSide: values.finalTeamSide,
      finalShotMade: values.finalShotMade,
      finalShotType: values.finalShotType
    },
    correctionReason,
    note: values.note
  });

  await rebuildOfficialStats(reviewItem.gameId);
  revalidatePath("/review");
  revalidatePath(`/games/${reviewItem.gameId}`);
  revalidatePath("/metrics");
}

export async function markOfficialAction(formData: FormData) {
  await requireAdmin();
  const gameId = String(formData.get("gameId"));
  await rebuildOfficialStats(gameId);
  revalidatePath(`/games/${gameId}`);
}
