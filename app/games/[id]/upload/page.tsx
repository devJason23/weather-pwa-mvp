export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VideoUploadForm } from "@/components/video-upload-form";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { LOCAL_VIDEO_UPLOAD_MAX_LABEL } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export default async function GameUploadPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { team: true, opponent: true, videoAssets: true }
  });

  if (!game) notFound();

  return (
    <AppShell pathname="/games" title="Upload Game Video" description={`${game.team.name} vs ${game.opponent.name}`}>
      <Card
        title="Attach full game video"
        subtitle={
          game.videoAssets.length > 0
            ? `Upload a replacement video for this game without creating a new game record. Maximum local file size: ${LOCAL_VIDEO_UPLOAD_MAX_LABEL}.`
            : `Uploads are stored in local mock storage during development. Maximum local file size: ${LOCAL_VIDEO_UPLOAD_MAX_LABEL}.`
        }
      >
        <VideoUploadForm
          gameId={game.id}
          error={query?.error}
          hasExistingUpload={game.videoAssets.length > 0}
          existingUploadCount={game.videoAssets.length}
        />
      </Card>
    </AppShell>
  );
}
