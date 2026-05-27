import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { job_id } = await req.json();

  // Verify ownership
  const { data: job } = await supabase
    .from("jobs")
    .select("id, user_id")
    .eq("id", job_id)
    .eq("user_id", user.id)
    .single();

  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  // Mark ready for worker (status remains "pending" — worker will pick it up)
  await supabase.from("jobs").update({ updated_at: new Date().toISOString() }).eq("id", job_id);

  return Response.json({ ok: true });
}
