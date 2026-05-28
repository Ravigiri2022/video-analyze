"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, Star, LogOut, UserCircle, Heart, Info, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
  avatarUrl: string | null;
}

export function SidebarNav({ email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navLinks = [
    { href: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { href: "/dashboard/upload", icon: <Upload size={16} />, label: "Upload Video" },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 gap-2">
      <Link
        href="/dashboard"
        className="text-lg font-bold mb-4 px-2"
        style={{ color: "var(--color-accent)" }}
        onClick={() => setOpen(false)}
      >
        Vilyze
      </Link>

      {navLinks.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: "var(--color-accent)",
            background: isActive(href) ? "var(--color-bg)" : "transparent",
          }}
        >
          {icon}
          {label}
        </Link>
      ))}

      <div className="flex-1" />

      <div className="border-t pt-4 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
        <Link
          href="/dashboard/profile"
          onClick={() => setOpen(false)}
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

        <p className="text-xs font-medium truncate px-2" style={{ color: "var(--color-muted)" }}>{email}</p>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border w-full"
          style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
        >
          <LogOut size={12} />
          Sign out
        </button>

        <div className="flex items-center gap-0.5 pt-1">
          <Link href="/upcoming" title="Roadmap" onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100" style={{ color: "var(--color-muted)" }}>
            <Star size={14} />
          </Link>
          <Link href="/support" title="Support" onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100" style={{ color: "var(--color-muted)" }}>
            <Heart size={14} />
          </Link>
          <Link href="/about" title="About" onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100" style={{ color: "var(--color-muted)" }}>
            <Info size={14} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-60 border-r flex-col flex-shrink-0"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Link href="/dashboard" className="text-base font-bold" style={{ color: "var(--color-accent)" }}>
          Vilyze
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ color: "var(--color-accent)" }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.4)" }} />
          <aside
            className="relative w-72 h-full border-r"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: "var(--color-muted)" }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
