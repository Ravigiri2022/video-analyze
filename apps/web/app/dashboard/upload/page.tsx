"use client";

import { UploadZone } from "@/components/upload/UploadZone";
import { YouTubeInput } from "@/components/upload/YouTubeInput";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";
import { useUpload } from "@/hooks/useUpload";

export default function UploadPage() {
  const { state, uploadFile, submitYouTube, reset } = useUpload();

  const isActive = state.phase !== "idle";
  const isBusy = state.phase === "uploading" || state.phase === "processing";

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <ProcessingOverlay visible={state.phase === "processing"} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>Analyze a video</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Upload a file or paste a YouTube link to get AI-powered insights.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Upload zone */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Upload video file</label>
          <UploadZone onFile={uploadFile} disabled={isBusy} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        </div>

        {/* YouTube input */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Paste YouTube link</label>
          <YouTubeInput onUrl={submitYouTube} disabled={isBusy} />
        </div>

        {/* Progress / status */}
        {isActive && state.phase !== "done" && (
          <UploadProgress
            fileName={"fileName" in state ? state.fileName : ""}
            progress={"progress" in state ? state.progress : 100}
            status={
              state.phase === "uploading" ? "uploading"
              : state.phase === "processing" ? "processing"
              : state.phase === "failed" ? "failed"
              : "done"
            }
            error={"error" in state ? state.error : null}
          />
        )}

        {state.phase === "failed" && (
          <>
            {state.error?.toLowerCase().includes("limit") ? (
              <div
                className="rounded-xl border p-5 flex flex-col gap-3"
                style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#991B1B" }}>Monthly limit reached</p>
                <p className="text-sm" style={{ color: "#B91C1C" }}>{state.error}</p>
                <p className="text-xs" style={{ color: "#DC2626" }}>
                  Your limit resets on the 1st of next month. Need more? Contact us.
                </p>
              </div>
            ) : (
              <button
                onClick={reset}
                className="text-sm font-medium px-4 py-2 rounded-lg border self-start"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                Try again
              </button>
            )}
          </>
        )}

        {/* Limits info */}
        {!isActive && (
          <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ borderColor: "var(--color-border)", background: "#F8FAFC" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>Limits on free plan</p>
            <ul className="text-xs flex flex-col gap-1" style={{ color: "var(--color-muted)" }}>
              <li>· Max 3 analyses per month</li>
              <li>· Max 100 MB per video</li>
              <li>· Max 5 minutes duration</li>
              <li>· Supported formats: MP4, WebM, MOV, AVI</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
