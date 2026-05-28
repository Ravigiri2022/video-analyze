"use client";

import { useState } from "react";
import { Download, Share2, Check, Loader2, Copy, Trash2 } from "lucide-react";

interface Props {
  jobId: string;
}

type ShareStatus = "idle" | "loading" | "copied" | "error";

export function AnalysisActions({ jobId }: Props) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  function handleDownload() {
    window.open(`/analysis/${jobId}/print`, "_blank");
  }

  async function handleShare() {
    setShareStatus("loading");
    try {
      const res = await fetch(`/api/jobs/${jobId}/share`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setShareToken(json.token);
      setShowShareModal(true);
      setShareStatus("idle");
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }

  async function copyLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setShareStatus("copied");
    setTimeout(() => setShareStatus("idle"), 2000);
  }

  async function revokeLink() {
    await fetch(`/api/jobs/${jobId}/share`, { method: "DELETE" });
    setShareToken(null);
    setShowShareModal(false);
  }

  const shareUrl = shareToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}` : "";

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ borderColor: "var(--color-border)", color: "var(--color-accent)", background: "var(--color-surface)" }}
        >
          <Download size={13} />
          Download PDF
        </button>
        <button
          onClick={handleShare}
          disabled={shareStatus === "loading"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50"
          style={{ borderColor: "var(--color-border)", color: "var(--color-accent)", background: "var(--color-surface)" }}
        >
          {shareStatus === "loading" ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
          {shareStatus === "error" ? "Failed" : "Share"}
        </button>
      </div>

      {showShareModal && shareToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setShowShareModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border shadow-xl p-6 flex flex-col gap-4"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "var(--color-accent)" }}>Share Report</h3>
              <button onClick={() => setShowShareModal(false)} style={{ color: "var(--color-muted)" }}>✕</button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Anyone with this link can view the analysis results — no login required.
            </p>

            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono break-all"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
            >
              <span className="flex-1 truncate">{shareUrl}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: shareStatus === "copied" ? "#10B981" : "var(--color-primary)" }}
              >
                {shareStatus === "copied" ? <Check size={14} /> : <Copy size={14} />}
                {shareStatus === "copied" ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={revokeLink}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "#FEF2F2" }}
                title="Revoke link"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
