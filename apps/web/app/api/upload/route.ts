import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/validations";

const RATE_LIMIT = 5; // jobs per hour

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_type", "job_submitted")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= RATE_LIMIT) {
    return Response.json({ error: "Rate limit exceeded. Max 5 analyses per hour on free plan." }, { status: 429 });
  }

  const body = await req.json();

  // ─── YouTube URL path ──────────────────────────────────────────────
  if (body.youtube_url) {
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        status: "pending",
        input_type: "youtube",
        youtube_url: body.youtube_url,
      })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    await supabase.from("usage_events").insert({ user_id: user.id, event_type: "job_submitted", job_id: job.id });

    return Response.json({ job_id: job.id });
  }

  // ─── File upload path ──────────────────────────────────────────────
  const { filename, content_type, file_size } = body;

  if (!ALLOWED_TYPES.includes(content_type)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file_size > MAX_FILE_SIZE) {
    return Response.json({ error: "File too large (max 200MB)" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "mp4";
  const jobId = crypto.randomUUID();
  const uploadPath = `${user.id}/${jobId}.${ext}`;

  // Create job first (before upload URL)
  const { error: jobError } = await supabase
    .from("jobs")
    .insert({
      id: jobId,
      user_id: user.id,
      status: "pending",
      input_type: "upload",
      storage_path: uploadPath,
      original_name: filename,
      file_size_bytes: file_size,
    });

  if (jobError) return Response.json({ error: jobError.message }, { status: 500 });

  // Create signed upload URL (5 minute expiry)
  const { data: signedData, error: signedError } = await supabase.storage
    .from("videos")
    .createSignedUploadUrl(uploadPath);

  if (signedError || !signedData) {
    await supabase.from("jobs").delete().eq("id", jobId);
    return Response.json({ error: "Failed to create upload URL" }, { status: 500 });
  }

  await supabase.from("usage_events").insert({ user_id: user.id, event_type: "job_submitted", job_id: jobId });

  return Response.json({
    signed_url: signedData.signedUrl,
    upload_path: uploadPath,
    job_id: jobId,
  });
}
