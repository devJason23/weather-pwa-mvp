export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VideoUploadForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GameUploadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { team: true, opponent: true }
  });

  if (!game) notFound();

  return (
    <AppShell pathname="/games" title="Upload Game Video" description={`${game.team.name} vs ${game.opponent.name}`}>
      <Card title="Attach full game video" subtitle="The MVP stores video metadata and routes processing through a mock worker interface.">
        <VideoUploadForm gameId={game.id} />
      </Card>
    </AppShell>
  );
}
