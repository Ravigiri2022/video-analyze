import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "reports@vilyze.app";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vilyze.app";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, cc } = await request.json() as { to: string; cc?: string };
  if (!to) return NextResponse.json({ error: "Missing recipient" }, { status: 400 });

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("user_id", user.id).single();
  const { data: analysis } = await supabase.from("analyses").select("*").eq("job_id", id).single();

  if (!job || !analysis) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const videoName = job.original_name ?? job.youtube_title ?? "Video Analysis";
  const reportUrl = `${SITE_URL}/analysis/${id}`;
  const printUrl = `${SITE_URL}/analysis/${id}/print`;

  const gradeColor: Record<string, string> = {
    A: "#10B981", B: "#2563EB", C: "#F59E0B", D: "#F97316", F: "#EF4444",
  };
  const color = gradeColor[analysis.grade] ?? "#475569";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #F1F5F9;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#0F172A;">Vilyze</p>
            <p style="margin:6px 0 0;font-size:13px;color:#64748B;">AI Video Analysis Report</p>
          </td>
        </tr>

        <!-- Score hero -->
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(135deg,#EFF6FF 0%,#F5F3FF 100%);">
            <p style="margin:0 0 8px;font-size:13px;color:#64748B;font-weight:500;">${videoName}</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:20px;">
                  <p style="margin:0;font-size:56px;font-weight:800;color:#0F172A;line-height:1;">${analysis.overall_score}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#64748B;">/ 100 overall</p>
                </td>
                <td>
                  <div style="width:52px;height:52px;border-radius:12px;background:${color};display:flex;align-items:center;justify-content:center;">
                    <p style="margin:0;font-size:26px;font-weight:800;color:white;text-align:center;line-height:52px;width:52px;">${analysis.grade}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Segment scores -->
        <tr>
          <td style="padding:28px 40px 0;">
            <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#0F172A;">Segment breakdown</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${[
                  { label: "Hook (first third)", value: analysis.start_score },
                  { label: "Middle", value: analysis.middle_score },
                  { label: "Ending", value: analysis.end_score },
                ].map(s => `
                <td width="33%" style="padding-right:12px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#64748B;">${s.label}</p>
                  <p style="margin:0;font-size:20px;font-weight:700;color:#0F172A;">${Math.round(s.value ?? 0)}</p>
                  <div style="height:4px;background:#E2E8F0;border-radius:2px;margin-top:6px;">
                    <div style="height:4px;background:${color};border-radius:2px;width:${Math.round(s.value ?? 0)}%;"></div>
                  </div>
                </td>`).join("")}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:28px 40px 0;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#0F172A;">AI Summary</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">${analysis.gpt_summary}</p>
          </td>
        </tr>

        <!-- Stats row -->
        <tr>
          <td style="padding:28px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;">
              <tr>
                ${[
                  { label: "Severe drops", value: analysis.severe_drop_count },
                  { label: "Dead silences", value: analysis.dead_silence_count },
                  { label: "Duration", value: analysis.video_duration_s ? `${Math.round(analysis.video_duration_s)}s` : "—" },
                ].map(s => `
                <td width="33%" style="padding:16px;text-align:center;border-right:1px solid #E2E8F0;">
                  <p style="margin:0;font-size:20px;font-weight:700;color:#0F172A;">${s.value}</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#64748B;">${s.label}</p>
                </td>`).join("").replace(/border-right:1px solid #E2E8F0;(?=<\/td>\s*<\/tr>)/, "")}
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:32px 40px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${reportUrl}" style="display:inline-block;padding:12px 24px;background:#2563EB;color:white;font-size:13px;font-weight:600;text-decoration:none;border-radius:10px;">
                    View full report →
                  </a>
                </td>
                <td>
                  <a href="${printUrl}" style="display:inline-block;padding:12px 24px;background:#F1F5F9;color:#475569;font-size:13px;font-weight:600;text-decoration:none;border-radius:10px;border:1px solid #E2E8F0;">
                    Download PDF
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #F1F5F9;">
            <p style="margin:0;font-size:11px;color:#94A3B8;">
              Sent from <a href="${SITE_URL}" style="color:#94A3B8;">Vilyze</a> · AI video analysis
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    ...(cc ? { cc } : {}),
    subject: `Vilyze Report: ${videoName} — ${analysis.overall_score}/100 (${analysis.grade})`,
    html,
  });

  if (error) {
    console.error("[email-report]", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, reportUrl });
}
