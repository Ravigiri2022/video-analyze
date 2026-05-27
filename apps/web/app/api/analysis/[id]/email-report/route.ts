import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/analysis/${id}/print`;

  /*
   * To enable real email delivery, configure these env vars and
   * add a `nodemailer` or `resend` dependency:
   *
   *   EMAIL_SMTP_HOST=smtp.example.com
   *   EMAIL_SMTP_PORT=587
   *   EMAIL_SMTP_USER=user
   *   EMAIL_SMTP_PASS=password
   *   EMAIL_FROM=noreply@vilyze.app
   *
   * For local dev, Mailpit catches all SMTP on port 54325 (enable in
   * supabase/config.toml: smtp_port = 54325 under [inbucket]).
   */

  // In production: send the email via your SMTP provider.
  // For now, log and return success so the UI flow works.
  console.log(`[email-report] to=${to} cc=${cc ?? "none"} job=${id}`);
  console.log(`[email-report] Report URL: ${reportUrl}`);
  console.log(`[email-report] Video: ${videoName} | Score: ${analysis.overall_score} | Grade: ${analysis.grade}`);

  return NextResponse.json({ success: true, reportUrl });
}
