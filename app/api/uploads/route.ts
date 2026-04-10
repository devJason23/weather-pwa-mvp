import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { LOCAL_VIDEO_UPLOAD_MAX_BYTES } from "@/lib/config";
import { constantCompare, COOKIE_NAME, sessionToken } from "@/lib/session";
import { persistUploadedVideo } from "@/lib/services/video-upload";
import { triggerMockProcessing } from "@/lib/services/video-processing";

export const runtime = "nodejs";

function redirectWithError(request: Request, gameId: string, error: string) {
  const url = new URL(`/games/${gameId}/upload?error=${encodeURIComponent(error)}`, request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !constantCompare(token, sessionToken(env.ADMIN_EMAIL, env.SESSION_SECRET))) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const gameId = String(formData.get("gameId") ?? "");
  const file = formData.get("video");
  const replaceExisting = formData.get("replaceExisting") === "on";

  if (!gameId) {
    return NextResponse.json({ error: "Missing game id." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return redirectWithError(request, gameId, "missing");
  }

  if (file.size > LOCAL_VIDEO_UPLOAD_MAX_BYTES) {
    return redirectWithError(request, gameId, "size");
  }

  try {
    await persistUploadedVideo(gameId, file, { replaceExisting });
    await triggerMockProcessing(gameId);
    revalidatePath(`/games/${gameId}`);
    revalidatePath(`/games/${gameId}/upload`);
    return NextResponse.redirect(new URL(`/games/${gameId}?upload=complete`, request.url), { status: 303 });
  } catch (error) {
    console.error("Upload failed", error);
    return redirectWithError(request, gameId, "server");
  }
}
