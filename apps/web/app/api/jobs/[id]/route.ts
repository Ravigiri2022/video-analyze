import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: job } = await supabase
    .from("jobs")
    .select("id, user_id, storage_path, thumbnail_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!job) return Response.json({ error: "Not found" }, { status: 404 });

  // Remove storage files
  if (job.storage_path) {
    await supabase.storage.from("videos").remove([job.storage_path]);
  }
  if (job.thumbnail_url) {
    await supabase.storage.from("thumbnails").remove([`${user.id}/${id}.jpg`]);
  }

  // Delete job row (analyses cascade)
  const { error } = await supabase.from("jobs").delete().eq("id", id).eq("user_id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { is_archived } = body;

  const { error } = await supabase
    .from("jobs")
    .update({ is_archived, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
