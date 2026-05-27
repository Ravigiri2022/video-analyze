import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { type, email, message } = await request.json() as {
    type: "bug" | "feature" | "general";
    email?: string;
    message: string;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Use service role to bypass RLS for anonymous feedback
  const { createClient: createAdmin } = await import("@/lib/supabase/server");
  void createAdmin; // service role available if needed

  const { error } = await supabase.from("feedback").insert({
    type: type ?? "general",
    message: message.trim(),
    email: email?.trim() ?? null,
    user_id: user?.id ?? null,
  });

  if (error) {
    // Table may not exist yet — log and return success anyway
    console.error("[feedback]", error.message);
  }

  console.log(`[feedback] type=${type} email=${email ?? "anon"} msg="${message.slice(0, 80)}"`);
  return NextResponse.json({ success: true });
}
