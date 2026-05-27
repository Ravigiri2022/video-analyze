"use client";

import { useState, useMemo } from "react";
import type { AttentionPoint, AttentionDrop, Recommendation } from "@/types";
import { formatDuration } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

function scoreColor(s: number) {
  if (s >= 70) return "#22C55E";
  if (s >= 50) return "#F59E0B";
  return "#EF4444";
}
function scoreBg(s: number) {
  if (s >= 70) return "#F0FDF4";
  if (s >= 50) return "#FFFBEB";
  return "#FEF2F2";
}
function scoreBorder(s: number) {
  if (s >= 70) return "#BBF7D0";
  if (s >= 50) return "#FDE68A";
  return "#FECACA";
}
function scoreLabel(s: number) {
  return s >= 70 ? "High" : s >= 50 ? "Medium" : "Low";
}

function downsample(data: AttentionPoint[], n: number): AttentionPoint[] {
  if (data.length <= n) return data;
  const out: AttentionPoint[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i / (n - 1)) * (data.length - 1));
    out.push(data[Math.min(idx, data.length - 1)]);
  }
  return out;
}

interface Props {
  data: AttentionPoint[];
  drops: AttentionDrop[];
  recs?: Recommendation[];
}

export function InteractiveAttentionChart({ data, drops, recs = [] }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const bars = useMemo(() => downsample(data, 52), [data]);

  const selBar = sel != null ? bars[sel] : null;
  const selDrop = selBar
    ? drops.find((d) => selBar.sec >= d.start_sec - 1 && selBar.sec <= d.end_sec + 1)
    : null;
  const selRecs = selBar
    ? recs.filter((r) => r.timestamp != null && Math.abs(r.timestamp! - selBar.sec) < 25)
    : [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
            Attention Curve
          </h3>
          <InfoTooltip text="Predicted viewer attention over time, modeled from motion, audio energy, pacing, and transcript data. Tap any bar to see what caused changes at that moment." />
        </div>
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          Tap any bar for details
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[2px] h-28">
        {bars.map((pt, i) => {
          const active = sel === i;
          const dimmed = sel != null && !active;
          return (
            <button
              key={i}
              className="flex-1 rounded-sm focus:outline-none"
              style={{
                height: `${Math.max(pt.score, 3)}%`,
                background: scoreColor(pt.score),
                opacity: dimmed ? 0.3 : 0.9,
                transform: active ? "scaleX(1.5)" : "scaleX(1)",
                outline: active ? `2px solid ${scoreColor(pt.score)}` : "none",
                outlineOffset: "1px",
                transition: "opacity 0.15s ease, transform 0.15s ease",
                cursor: "pointer",
              }}
              onClick={() => setSel(active ? null : i)}
              aria-label={`${formatDuration(pt.sec)}: ${pt.score.toFixed(0)}%`}
            />
          );
        })}
      </div>

      {/* X axis */}
      <div className="flex justify-between mt-1.5">
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const idx = Math.round(p * (bars.length - 1));
          return (
            <span key={p} className="text-[10px]" style={{ color: "var(--color-muted)" }}>
              {bars[idx] ? formatDuration(bars[idx].sec) : ""}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {(
          [
            ["#22C55E", "Good (>70)"],
            ["#F59E0B", "Medium (50–70)"],
            ["#EF4444", "Low (<50)"],
          ] as [string, string][]
        ).map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: c }} />
            <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Detail panel — slides down below the chart */}
      <div
        style={{
          maxHeight: selBar ? 300 : 0,
          opacity: selBar ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.25s ease",
          marginTop: selBar ? 12 : 0,
        }}
      >
        {selBar && (
          <div
            className="rounded-xl border p-4"
            style={{ background: scoreBg(selBar.score), borderColor: scoreBorder(selBar.score) }}
          >
            <div className="flex items-start gap-5 flex-wrap">
              {/* Score */}
              <div className="flex-shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                  {formatDuration(selBar.sec)}
                </p>
                <p className="text-3xl font-bold leading-none mt-0.5" style={{ color: scoreColor(selBar.score) }}>
                  {selBar.score.toFixed(0)}%
                </p>
                <p className="text-xs mt-0.5" style={{ color: scoreColor(selBar.score) }}>
                  {scoreLabel(selBar.score)} attention
                </p>
              </div>

              {/* Drop info */}
              {selDrop && (
                <div
                  className="flex-shrink-0 rounded-lg p-3 self-start"
                  style={{ background: "rgba(239,68,68,0.08)", borderLeft: "2px solid #EF4444", minWidth: 160 }}
                >
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#991B1B" }}>
                    Drop: −{selDrop.drop.toFixed(0)}%
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#7F1D1D" }}>
                    {selDrop.cause}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--color-muted)" }}>
                    {formatDuration(selDrop.start_sec)} – {formatDuration(selDrop.end_sec)}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {selRecs.length > 0 ? (
                <div className="flex-1 min-w-[160px]">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-accent)" }}>
                    Tips for this moment
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {selRecs.slice(0, 2).map((r, i) => (
                      <div
                        key={i}
                        className="text-xs p-2 rounded-lg leading-relaxed"
                        style={{ background: "rgba(255,255,255,0.65)", color: "var(--color-text)" }}
                      >
                        {r.text}
                      </div>
                    ))}
                  </div>
                </div>
              ) : selDrop ? (
                <div className="flex-1 min-w-[160px]">
                  <div
                    className="text-xs p-2.5 rounded-lg leading-relaxed"
                    style={{ background: "rgba(255,255,255,0.65)", color: "var(--color-text)" }}
                  >
                    Add dynamic visuals or pick up the pace here to re-engage viewers.
                  </div>
                </div>
              ) : null}

              {/* Close */}
              <button
                onClick={() => setSel(null)}
                className="ml-auto flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-xs self-start"
                style={{ background: "rgba(255,255,255,0.6)", color: "var(--color-muted)" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
