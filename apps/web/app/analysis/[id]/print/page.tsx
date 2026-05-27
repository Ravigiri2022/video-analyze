import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Analysis } from "@/types";
import { formatDuration } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analysis Report" };

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!job) notFound();

  const { data: analysis } = await supabase.from("analyses").select("*").eq("job_id", id).single();
  if (!analysis) notFound();

  const a = analysis as Analysis;
  const videoName = job.original_name ?? job.youtube_title ?? "Video Analysis";
  const gradeColor =
    a.grade === "A" || a.grade === "A+" ? "#22C55E"
    : a.grade === "B" || a.grade === "B+" ? "#2563EB"
    : a.grade === "C" || a.grade === "C+" ? "#F59E0B"
    : "#EF4444";

  return (
    <>
      {/* Auto-print + print styles injected via <style> */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px", color: "#0F172A" }}>
        {/* Print button */}
        <div className="no-print" style={{ marginBottom: 24, display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "8px 18px", background: "#2563EB", color: "white", border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Save as PDF / Print
          </button>
          <a
            href={`/analysis/${id}`}
            style={{
              padding: "8px 18px", border: "1px solid #E2E8F0", color: "#0F172A",
              borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none",
            }}
          >
            ← Back
          </a>
        </div>

        {/* Report header */}
        <div style={{ borderBottom: "2px solid #2563EB", paddingBottom: 20, marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Vilyze · AI Video Analysis Report
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{videoName}</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Analyzed {new Date(a.created_at).toLocaleString()}
          </p>
        </div>

        {/* Score row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Overall Score", value: `${a.overall_score.toFixed(0)}/100`, color: "#2563EB" },
            { label: "Grade", value: a.grade, color: gradeColor },
            { label: "Severe Drops", value: `${a.severe_drop_count}`, color: "#EF4444" },
            { label: "Duration", value: a.video_duration_s ? formatDuration(a.video_duration_s) : "—", color: "#0F172A" },
          ].map((m) => (
            <div key={m.label} style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0F172A" }}>AI Summary</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#334155", background: "#F8FAFC", borderRadius: 10, padding: 14, border: "1px solid #E2E8F0" }}>
            {a.gpt_summary}
          </p>
        </section>

        {/* Hook analysis */}
        {a.gpt_hook_analysis && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0F172A" }}>Hook Analysis</h2>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#78350F", background: "#FFFBEB", borderRadius: 10, padding: 14, border: "1px solid #FDE68A" }}>
              {a.gpt_hook_analysis}
            </p>
          </section>
        )}

        {/* Attention drops */}
        {a.attention_drops.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0F172A" }}>
              Attention Drops ({a.attention_drops.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {a.attention_drops.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", background: "#FECACA", padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap", alignSelf: "flex-start" }}>
                    −{d.drop.toFixed(0)}%
                  </span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#991B1B", margin: 0 }}>
                      {formatDuration(d.start_sec)} – {formatDuration(d.end_sec)}
                    </p>
                    <p style={{ fontSize: 12, color: "#7F1D1D", margin: "2px 0 0" }}>{d.cause}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {a.gpt_recommendations.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0F172A" }}>
              Recommendations ({a.gpt_recommendations.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...a.gpt_recommendations]
                .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 3) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 3))
                .map((r, i) => {
                  const colors = {
                    high: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
                    medium: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
                    low: { bg: "#F0FDF4", border: "#BBF7D0", text: "#065F46" },
                  }[r.priority] ?? { bg: "#F0FDF4", border: "#BBF7D0", text: "#065F46" };
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderRadius: 10, background: colors.bg, border: `1px solid ${colors.border}` }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: colors.text, background: colors.border, padding: "2px 7px", borderRadius: 5, alignSelf: "flex-start", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                        {r.priority}
                      </span>
                      <div>
                        <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>{r.text}</p>
                        {r.timestamp != null && (
                          <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0" }}>At {formatDuration(r.timestamp)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Tags */}
        {a.gpt_tags && a.gpt_tags.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0F172A" }}>Tags</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {a.gpt_tags.map((t) => (
                <span key={t} style={{ fontSize: 11, padding: "3px 10px", background: "#EFF6FF", color: "#2563EB", borderRadius: 999 }}>
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontSize: 11, color: "#94A3B8" }}>Generated by Vilyze · vilyze.app</p>
          <p style={{ fontSize: 11, color: "#94A3B8" }}>{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.location.search.includes('autoprint')) {
              window.addEventListener('load', () => setTimeout(() => window.print(), 500));
            }
          `,
        }}
      />
    </>
  );
}
