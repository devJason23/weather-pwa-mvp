"use client";

import { useState } from "react";
import { LOCAL_VIDEO_UPLOAD_MAX_BYTES, LOCAL_VIDEO_UPLOAD_MAX_LABEL } from "@/lib/config";

export function VideoUploadForm({
  gameId,
  error,
  hasExistingUpload,
  existingUploadCount
}: {
  gameId: string;
  error?: string;
  hasExistingUpload?: boolean;
  existingUploadCount?: number;
}) {
  const [message, setMessage] = useState<string | null>(
    error === "size"
      ? `File exceeds the local upload limit of ${LOCAL_VIDEO_UPLOAD_MAX_LABEL}.`
      : error === "missing"
        ? "Please select a video file."
        : error === "server"
          ? "Upload failed on the server. Please retry the upload."
        : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  return (
    <form
      action="/api/uploads"
      method="post"
      encType="multipart/form-data"
      className="grid gap-4"
      onSubmit={(event) => {
        const input = event.currentTarget.elements.namedItem("video");
        if (!(input instanceof HTMLInputElement)) {
          return;
        }
        const file = input.files?.[0];
        if (!file) {
          setMessage("Please select a video file.");
          event.preventDefault();
          return;
        }
        if (file.size > LOCAL_VIDEO_UPLOAD_MAX_BYTES) {
          setMessage(`File exceeds the local upload limit of ${LOCAL_VIDEO_UPLOAD_MAX_LABEL}.`);
          event.preventDefault();
          return;
        }
        setMessage(null);
        setIsSubmitting(true);
        setStatusText(
          hasExistingUpload
            ? "Replacing the video and running mock processing. This can take a moment."
            : "Uploading the video and running mock processing. This can take a moment."
        );
      }}
    >
      <input type="hidden" name="gameId" value={gameId} />
      <div className="grid gap-2">
        <input
          type="file"
          name="video"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          required
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setSelectedFileName(file?.name ?? "");
            setMessage(null);
          }}
        />
        <p className="text-xs text-brand-muted">
          {selectedFileName ? `Selected file: ${selectedFileName}` : "Choose a local MP4 clip before uploading."}
        </p>
      </div>
      {hasExistingUpload ? (
        <label className="flex items-center gap-2 text-sm text-brand-muted">
          <input className="h-4 w-4" type="checkbox" name="replaceExisting" defaultChecked />
          Replace the existing upload for this game and reset prior draft, review, and official outputs
        </label>
      ) : null}
      {hasExistingUpload ? (
        <p className="text-xs text-brand-muted">
          This game currently has {existingUploadCount} uploaded video{existingUploadCount === 1 ? "" : "s"}.
        </p>
      ) : null}
      <p className="text-xs text-brand-muted">Local development uploads support files up to {LOCAL_VIDEO_UPLOAD_MAX_LABEL}.</p>
      {message ? <p className="text-sm text-danger">{message}</p> : null}
      {statusText ? (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-green/20 bg-brand-green/5 px-4 py-3 text-sm text-brand-ink-soft">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-green/30 border-t-brand-green" />
          <span>{statusText}</span>
        </div>
      ) : null}
      <button
        className="hs-button w-fit disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || !selectedFileName}
      >
        {isSubmitting
          ? "Uploading and processing..."
          : hasExistingUpload
            ? "Upload replacement video"
            : "Upload video and process"}
      </button>
    </form>
  );
}
