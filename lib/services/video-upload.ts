import { GameStatus, ProcessingJobType, ProcessingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { storageDriver } from "@/lib/storage";

async function clearGameUploadState(gameId: string) {
  const existingAssets = await prisma.videoAsset.findMany({
    where: { gameId },
    select: { storageKey: true }
  });

  await Promise.all(existingAssets.map((asset) => storageDriver.remove(asset.storageKey).catch(() => undefined)));

  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { gameId } }),
    prisma.reviewDecision.deleteMany({ where: { reviewItem: { gameId } } }),
    prisma.reviewItem.deleteMany({ where: { gameId } }),
    prisma.draftEvent.deleteMany({ where: { gameId } }),
    prisma.officialStatLine.deleteMany({ where: { gameId } }),
    prisma.processingJob.deleteMany({ where: { gameId } }),
    prisma.videoAsset.deleteMany({ where: { gameId } }),
    prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.DRAFT,
        processingStatus: ProcessingStatus.UPLOADED,
        publishedAt: null
      }
    })
  ]);
}

export async function persistUploadedVideo(
  gameId: string,
  file: File,
  options?: { replaceExisting?: boolean }
) {
  if (options?.replaceExisting) {
    await clearGameUploadState(gameId);
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
    data: {
      status: GameStatus.DRAFT,
      processingStatus: ProcessingStatus.UPLOADED,
      publishedAt: null
    }
  });

  return stored;
}
