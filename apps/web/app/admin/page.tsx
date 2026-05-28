import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { FeedbackTable } from "@/components/admin/FeedbackTable";

export const metadata: Metadata = { title: "Admin — Feedback" };

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("feedback")
    .select("*, feedback_replies(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>Feedback</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          {rows?.length ?? 0} message{(rows?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>
      <FeedbackTable rows={(rows ?? []) as Parameters<typeof FeedbackTable>[0]["rows"]} />
    </div>
  );
}
