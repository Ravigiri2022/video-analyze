"use client";

import { useState } from "react";
import { youtubeUrlSchema } from "@/lib/validations";
import { PlayCircle } from "lucide-react";

interface YouTubeInputProps {
  onUrl: (url: string) => void;
  disabled?: boolean;
}

export function YouTubeInput({ onUrl, disabled }: YouTubeInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = youtubeUrlSchema.safeParse(value.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid URL");
      return;
    }
    onUrl(result.data);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ borderColor: error ? "var(--color-error)" : "var(--color-border)", background: "var(--color-surface)" }}>
          <PlayCircle size={18} color="var(--color-muted)" strokeWidth={1.5} />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={disabled}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text)" }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--color-primary)" }}
        >
          Analyze
        </button>
      </div>
      {error && (
        <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </form>
  );
}
