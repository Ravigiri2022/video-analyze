"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

type Reply = { id: string; message: string; created_at: string };
type FeedbackRow = {
  id: string;
  type: string;
  message: string;
  email: string | null;
  created_at: string;
  user_id: string | null;
  feedback_replies: Reply[];
};

export function FeedbackTable({ rows }: { rows: FeedbackRow[] }) {
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replies, setReplies] = useState<Record<string, Reply[]>>(
    Object.fromEntries(rows.map((r) => [r.id, r.feedback_replies ?? []]))
  );

  async function sendReply(feedbackId: string) {
    if (!replyText.trim()) return;
    setSending(true);
    const res = await fetch(`/api/feedback/${feedbackId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: replyText.trim() }),
    });
    if (res.ok) {
      const { reply } = await res.json();
      setReplies((prev) => ({ ...prev, [feedbackId]: [...(prev[feedbackId] ?? []), reply] }));
      setReplyText("");
      setReplyOpen(null);
    }
    setSending(false);
  }

  const typeColor: Record<string, string> = {
    bug: "#EF4444", feature: "#2563EB", general: "#64748B",
  };

  if (rows.length === 0) {
    return (
      <p className="text-sm text-center py-20" style={{ color: "var(--color-muted)" }}>
        No feedback yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl border p-5"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase"
                style={{ background: `${typeColor[row.type]}18`, color: typeColor[row.type] }}
              >
                {row.type}
              </span>
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {row.email ?? (row.user_id ? "Logged-in user" : "Anonymous")}
              </span>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: "var(--color-muted)" }}>
              {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>
            {row.message}
          </p>

          {/* Replies */}
          {(replies[row.id] ?? []).length > 0 && (
            <div className="flex flex-col gap-2 mb-3 pl-4 border-l-2" style={{ borderColor: "var(--color-primary)" }}>
              {(replies[row.id] ?? []).map((r) => (
                <div key={r.id}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-primary)" }}>
                    Admin · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text)" }}>{r.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {replyOpen === row.id ? (
            <div className="flex gap-2 mt-2">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply(row.id)}
                placeholder="Type a reply…"
                className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
              />
              <button
                onClick={() => sendReply(row.id)}
                disabled={sending || !replyText.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
              >
                <Send size={13} />
                {sending ? "Sending…" : "Send"}
              </button>
              <button
                onClick={() => { setReplyOpen(null); setReplyText(""); }}
                className="px-3 py-2 rounded-xl text-sm border"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setReplyOpen(row.id)}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              <MessageSquare size={12} />
              Reply
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
