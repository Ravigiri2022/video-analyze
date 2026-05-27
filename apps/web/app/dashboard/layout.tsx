import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, Upload, Star, LogOut, UserCircle } from "lucide-react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  async function signOut() {
    "use server";
    const supabase2 = await createClient();
    await supabase2.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside className="w-60 border-r flex flex-col py-6 px-4 gap-2" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <Link href="/dashboard" className="text-lg font-bold mb-4 px-2" style={{ color: "var(--color-accent)" }}>
          Vilyze
        </Link>

        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50" style={{ color: "var(--color-accent)" }}>
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link href="/dashboard/upload" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50" style={{ color: "var(--color-accent)" }}>
          <Upload size={16} />
          Upload Video
        </Link>

        <Link href="/upcoming" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50" style={{ color: "var(--color-accent)" }}>
          <Star size={16} />
          Roadmap
        </Link>

        <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50" style={{ color: "var(--color-accent)" }}>
          <UserCircle size={16} />
          Profile
        </Link>

        <div className="flex-1" />

        <div className="border-t pt-4 px-2" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-xs font-medium truncate mb-2" style={{ color: "var(--color-muted)" }}>{user.email}</p>
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border w-full" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
              <LogOut size={12} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
