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

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const cp1x = (p.x + (c.x - p.x) * 0.4).toFixed(2);
    const cp2x = (c.x - (c.x - p.x) * 0.4).toFixed(2);
    d += ` C ${cp1x} ${p.y.toFixed(2)}, ${cp2x} ${c.y.toFixed(2)}, ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
  }
  return d;
}

function RetentionCurve({ bars }: { bars: AttentionPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 1000;
  const H = 90;
  const PAD = { top: 6, bottom: 6 };

  const pts = bars.map((pt, i) => ({
    x: (i / Math.max(bars.length - 1, 1)) * W,
    y: PAD.top + (1 - pt.score / 100) * (H - PAD.top - PAD.bottom),
  }));

  const linePath = smoothPath(pts);
  const last = pts[pts.length - 1];
  const fillPath = linePath + ` L ${last.x} ${H} L 0 ${H} Z`;

  const hovPt = hover != null ? pts[hover] : null;
  const hovBar = hover != null ? bars[hover] : null;

  return (
    <div className="relative select-none" style={{ height: 90 }}>
      {/* Y labels */}
      <div
        className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none"
        style={{ width: 24 }}
      >
        {["100", "50", "0"].map((v) => (
          <span key={v} className="text-[9px] leading-none" style={{ color: "var(--color-muted)" }}>
            {v}
          </span>
        ))}
      </div>

      {/* SVG */}
      <div className="absolute inset-0" style={{ left: 26 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const rel = (e.clientX - r.left) / r.width;
            setHover(Math.min(bars.length - 1, Math.max(0, Math.round(rel * (bars.length - 1)))));
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 50, 100].map((v) => {
            const y = PAD.top + (1 - v / 100) * (H - PAD.top - PAD.bottom);
            return (
              <line key={v} x1={0} y1={y} x2={W} y2={y}
                stroke="#E2E8F0" strokeWidth={v === 0 ? 0 : 1} />
            );
          })}

          {/* Drop regions */}
          {bars.map((pt, i) => {
            if (pt.score >= 50) return null;
            const x = (i / Math.max(bars.length - 1, 1)) * W;
            const bw = W / bars.length;
            return (
              <rect key={i} x={x - bw / 2} y={0} width={bw} height={H}
                fill="#EF4444" opacity={0.04} />
            );
          })}

          {/* Fill */}
          <path d={fillPath} fill="url(#retGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover */}
          {hovPt && (
            <>
              <line x1={hovPt.x} y1={0} x2={hovPt.x} y2={H}
                stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx={hovPt.x} cy={hovPt.y} r="4.5"
                fill="#2563EB" stroke="white" strokeWidth="2" />
            </>
          )}
        </svg>

        {/* Hover tooltip */}
        {hovPt && hovBar && (
          <div
            className="absolute pointer-events-none px-2 py-1 rounded-lg text-[11px] font-semibold text-white shadow-md"
            style={{
              top: -28,
              left: `${(hovPt.x / W) * 100}%`,
              transform: "translateX(-50%)",
              background: scoreColor(hovBar.score),
              whiteSpace: "nowrap",
            }}
          >
            {formatDuration(hovBar.sec)} · {hovBar.score.toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
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

      {/* Retention line curve */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-0.5 rounded" style={{ background: "#2563EB" }} />
          <span className="text-[10px] font-medium" style={{ color: "var(--color-muted)" }}>
            Viewer retention (simulated)
          </span>
          <InfoTooltip text="Smooth retention curve simulated from attention data — similar to YouTube Studio's audience retention graph. Hover to inspect any moment." />
        </div>
        <RetentionCurve bars={bars} />
      </div>

      {/* Divider */}
      <div className="mb-3 h-px" style={{ background: "var(--color-border)" }} />

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

      {/* Detail panel */}
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

              {selRecs.length > 0 ? (
                <div className="flex-1 min-w-[160px]">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-accent)" }}>
                    Tips for this moment
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {selRecs.slice(0, 2).map((r, i) => (
                      <div key={i} className="text-xs p-2 rounded-lg leading-relaxed" style={{ background: "rgba(255,255,255,0.65)", color: "var(--color-text)" }}>
                        {r.text}
                      </div>
                    ))}
                  </div>
                </div>
              ) : selDrop ? (
                <div className="flex-1 min-w-[160px]">
                  <div className="text-xs p-2.5 rounded-lg leading-relaxed" style={{ background: "rgba(255,255,255,0.65)", color: "var(--color-text)" }}>
                    Add dynamic visuals or pick up the pace here to re-engage viewers.
                  </div>
                </div>
              ) : null}

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
