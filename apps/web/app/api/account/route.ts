import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Delete user data (RLS cascades most of it, but belt+suspenders)
  await service.from("jobs").delete().eq("user_id", user.id);
  await service.from("profiles").delete().eq("id", user.id);
  await service.auth.admin.deleteUser(user.id);

  return NextResponse.json({ ok: true });
}
