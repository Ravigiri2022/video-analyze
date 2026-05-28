import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check job belongs to user
  const { data: job } = await supabase.from("jobs").select("id, share_token").eq("id", id).eq("user_id", user.id).single();
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (job.share_token) return NextResponse.json({ token: job.share_token });

  const token = randomBytes(16).toString("hex");

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await service.from("jobs").update({ share_token: token }).eq("id", id);

  return NextResponse.json({ token });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: job } = await supabase.from("jobs").select("id").eq("id", id).eq("user_id", user.id).single();
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await service.from("jobs").update({ share_token: null }).eq("id", id);

  return NextResponse.json({ ok: true });
}
