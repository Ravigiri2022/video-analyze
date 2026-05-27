import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, Upload, Star, LogOut, UserCircle, Heart, Info } from "lucide-react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const avatarUrl =
    profile?.avatar_url ??
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    null;

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

        <div className="flex-1" />

        <div className="border-t pt-4 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
          {/* Profile button with avatar */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50"
            style={{ color: "var(--color-accent)" }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" width={28} height={28} className="rounded-full object-cover shrink-0" style={{ width: 28, height: 28 }} />
            ) : (
              <UserCircle size={28} style={{ color: "var(--color-muted)" }} />
            )}
            <span>Profile</span>
          </Link>

          <p className="text-xs font-medium truncate px-2" style={{ color: "var(--color-muted)" }}>{user.email}</p>

          <form action={signOut}>
            <button type="submit" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border w-full" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
              <LogOut size={12} />
              Sign out
            </button>
          </form>

          {/* Footer links row */}
          <div className="flex items-center gap-1 pt-1">
            <Link href="/upcoming" className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-50" style={{ color: "var(--color-muted)" }}>
              <Star size={11} />
              Roadmap
            </Link>
            <Link href="/support" className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-50" style={{ color: "var(--color-muted)" }}>
              <Heart size={11} />
              Support
            </Link>
            <Link href="/about" className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-50" style={{ color: "var(--color-muted)" }}>
              <Info size={11} />
              About
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
