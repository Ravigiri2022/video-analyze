"use client";

import { useState } from "react";
import { Download, Mail, Check, Loader2 } from "lucide-react";

interface Props {
  jobId: string;
}

type EmailStatus = "idle" | "sending" | "sent" | "error";

export function AnalysisActions({ jobId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [status, setStatus] = useState<EmailStatus>("idle");

  function handleDownload() {
    window.open(`/analysis/${jobId}/print`, "_blank");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch(`/api/analysis/${jobId}/email-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: emailTo, cc: emailCc || undefined }),
    });
    if (res.ok) {
      setStatus("sent");
      setTimeout(() => {
        setShowModal(false);
        setStatus("idle");
        setEmailTo("");
        setEmailCc("");
      }, 2500);
    } else {
      setStatus("error");
    }
  }

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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ borderColor: "var(--color-border)", color: "var(--color-accent)", background: "var(--color-surface)" }}
        >
          <Mail size={13} />
          Email Report
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border shadow-xl p-6 flex flex-col gap-4"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "var(--color-accent)" }}>Email Report</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--color-muted)" }}>✕</button>
            </div>

            {status === "sent" ? (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "#D1FAE5" }}
                >
                  <Check size={20} color="var(--color-success)" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>Report sent!</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                    Check Mailpit at port 54324 locally
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-accent)" }}>To</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-accent)" }}>
                    CC{" "}
                    <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={emailCc}
                    onChange={(e) => setEmailCc(e.target.value)}
                    placeholder="cc@example.com"
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
                  />
                </div>
                {status === "error" && (
                  <p className="text-xs" style={{ color: "var(--color-error)" }}>Failed to send. Try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {status === "sending" && <Loader2 size={14} className="animate-spin" />}
                  {status === "sending" ? "Sending…" : "Send Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
