"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { validateVideoFile, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/validations";
import { formatBytes } from "@/lib/utils";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
    setError(null);
    if (rejected.length > 0) {
      const msg = rejected[0]?.errors[0]?.message ?? "Invalid file";
      setError(msg);
      return;
    }
    if (accepted.length > 0) {
      const err = validateVideoFile(accepted[0]);
      if (err) { setError(err); return; }
      onFile(accepted[0]);
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(ALLOWED_TYPES.map((t) => [t, []])),
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors"
        style={{
          borderColor: isDragActive ? "var(--color-primary)" : "var(--color-border)",
          background: isDragActive ? "#EFF6FF" : "var(--color-surface)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
          <Upload size={28} color="var(--color-primary)" strokeWidth={1.5} />
        </div>

        <div className="text-center">
          <p className="font-semibold" style={{ color: "var(--color-accent)" }}>
            {isDragActive ? "Drop it here" : "Drag & drop your video"}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            or click to browse · MP4, WebM, MOV, AVI · Max {formatBytes(MAX_FILE_SIZE)}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
