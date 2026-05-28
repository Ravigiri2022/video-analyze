"use client";

import { useEffect, useState } from "react";

type Reply = { id: string; message: string; created_at: string };
type FeedbackItem = {
  id: string;
  type: string;
  message: string;
  created_at: string;
  feedback_replies: Reply[];
};

const typeLabel: Record<string, string> = {
  bug: "Bug", feature: "Feature idea", general: "General",
};
const typeColor: Record<string, string> = {
  bug: "#EF4444", feature: "#2563EB", general: "#64748B",
};

export function FeedbackHistory() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/feedback/mine")
      .then((r) => r.json())
      .then((d) => { setItems(d.feedback ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>Your feedback</h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
        Messages you&apos;ve sent, and any replies from the team.
      </p>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border p-5"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase"
                style={{ background: `${typeColor[item.type]}18`, color: typeColor[item.type] }}
              >
                {typeLabel[item.type] ?? item.type}
              </span>
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text)" }}>
              {item.message}
            </p>

            {item.feedback_replies?.length > 0 ? (
              <div className="flex flex-col gap-2 pl-4 border-l-2" style={{ borderColor: "var(--color-primary)" }}>
                {item.feedback_replies.map((r) => (
                  <div key={r.id}>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-primary)" }}>
                      Vilyze · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-text)" }}>{r.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: "var(--color-muted)" }}>No reply yet.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
