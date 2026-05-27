import type { AttentionDrop } from "@/types";
import { formatDuration } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

export function DropTimeline({ drops }: { drops: AttentionDrop[] }) {
  if (!drops.length) {
    return (
      <div className="rounded-xl border p-5 text-center" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <p className="text-sm" style={{ color: "var(--color-success)" }}>No significant attention drops detected</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
          Attention Drops ({drops.length})
        </h3>
        <InfoTooltip text="Moments where predicted viewer attention fell significantly. High = drop of 30%+, Medium = 20–30%, Low = under 20%. These are sorted by time, not severity." />
      </div>
      <div className="flex flex-col gap-3">
        {drops.map((d, i) => {
          const severity = d.drop >= 30 ? "high" : d.drop >= 20 ? "medium" : "low";
          const colors = {
            high:   { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
            medium: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
            low:    { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
          }[severity];

          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: colors.bg, borderColor: colors.border }}>
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: colors.border, color: colors.text }}>
                  -{d.drop.toFixed(0)}%
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  {formatDuration(d.start_sec)} – {formatDuration(d.end_sec)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: colors.text, opacity: 0.8 }}>
                  {d.cause}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
