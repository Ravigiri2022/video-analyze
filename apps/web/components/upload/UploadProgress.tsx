"use client";

import { Video, Check, Loader2 } from "lucide-react";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "done" | "failed";
  error?: string | null;
}

const STATUS_LABELS = {
  uploading:  "Uploading…",
  processing: "Analyzing with AI…",
  done:       "Analysis complete",
  failed:     "Failed",
};

export function UploadProgress({ fileName, progress, status, error }: UploadProgressProps) {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-3" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
            <Video size={18} color="var(--color-primary)" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--color-accent)" }}>{fileName}</p>
            <p className="text-xs mt-0.5" style={{ color: status === "failed" ? "var(--color-error)" : "var(--color-muted)" }}>
              {error ?? STATUS_LABELS[status]}
            </p>
          </div>
        </div>
        {status === "uploading" && (
          <span className="text-sm font-medium flex-shrink-0" style={{ color: "var(--color-primary)" }}>{progress}%</span>
        )}
        {status === "done" && (
          <Check size={20} color="var(--color-success)" strokeWidth={2} />
        )}
        {status === "processing" && (
          <Loader2 size={18} color="var(--color-primary)" strokeWidth={2} className="animate-spin" />
        )}
      </div>

      {status === "uploading" && (
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--color-primary)" }}
          />
        </div>
      )}
    </div>
  );
}
