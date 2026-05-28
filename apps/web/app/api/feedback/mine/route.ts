import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ feedback: [] });

  const { data } = await supabase
    .from("feedback")
    .select("*, feedback_replies(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ feedback: data ?? [] });
}
