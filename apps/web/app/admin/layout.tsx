import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <nav
        className="flex items-center justify-between px-4 sm:px-8 py-4 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--color-accent)" }}>
          Vilyze Admin
        </p>
        <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-lg border"
          style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
          ← Dashboard
        </Link>
      </nav>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  );
}
