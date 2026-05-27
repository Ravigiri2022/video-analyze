import type { Analysis } from "@/types";
import { formatDuration } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

export function MetricsGrid({ analysis }: { analysis: Analysis }) {
  const metrics = [
    {
      label: "Hook Score",
      value: `${analysis.start_score?.toFixed(0) ?? "—"}/100`,
      sub: "First 30s",
      tip: "Average viewer attention during the first 30 seconds. This is where most people decide to stay or scroll away — the most important section.",
    },
    {
      label: "Middle Score",
      value: `${analysis.middle_score?.toFixed(0) ?? "—"}/100`,
      sub: "Middle section",
      tip: "Average attention through the main body of the video. Drops here usually indicate pacing issues or a weak narrative structure.",
    },
    {
      label: "Ending Score",
      value: `${analysis.end_score?.toFixed(0) ?? "—"}/100`,
      sub: "Final section",
      tip: "Attention level toward the end. A strong finish correlates with replays, shares, and returning viewers.",
    },
    {
      label: "Duration",
      value: analysis.video_duration_s ? formatDuration(analysis.video_duration_s) : "—",
      sub: "Total length",
      tip: "Total video length. Optimal length varies by platform — but attention drops typically become harder to fix after the 8-minute mark.",
    },
    {
      label: "Severe Drops",
      value: String(analysis.severe_drop_count),
      sub: "Attention drops",
      tip: "Number of moments where predicted attention dropped by 30% or more. These are the highest-priority areas to review and fix.",
    },
    {
      label: "Dead Silences",
      value: String(analysis.dead_silence_count),
      sub: "Silent moments",
      tip: "Gaps with no speech or meaningful audio. These often cause viewers to think the video has ended or is broken, triggering skips.",
    },
    {
      label: "Dramatic Pauses",
      value: String(analysis.dramatic_pause_count),
      sub: "Intentional pauses",
      tip: "Short deliberate silences that add emphasis. Unlike dead silences, these are intentional and typically improve engagement.",
    },
    {
      label: "Speech Rate",
      value: analysis.avg_speech_rate_wps ? `${analysis.avg_speech_rate_wps.toFixed(1)} w/s` : "—",
      sub: "Words per second",
      tip: "Average speaking pace. 2–3 words per second is comfortable for most audiences. Below 1.5 w/s can feel sluggish; above 4 w/s is hard to follow.",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl border p-4"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <p className="text-xl font-bold" style={{ color: "var(--color-accent)" }}>{m.value}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{m.label}</p>
            <InfoTooltip text={m.tip} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
