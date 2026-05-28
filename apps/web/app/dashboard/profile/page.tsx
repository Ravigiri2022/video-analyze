"use client";

import { useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { User, Camera, Check, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile, saving, saved, avatarUploading, error, saveName, uploadAvatar } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await fetch("/api/account", { method: "DELETE" });
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setDeleting(false);
    }
  }

  if (!profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-40">
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-accent)" }}>Profile</h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>Manage your account settings</p>

      <div className="flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ background: "#EFF6FF" }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={28} color="var(--color-primary)" strokeWidth={1.5} />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm transition-opacity disabled:opacity-50"
              style={{ background: "var(--color-primary)", borderColor: "var(--color-surface)" }}
            >
              {avatarUploading
                ? <Loader2 size={12} color="white" strokeWidth={2} className="animate-spin" />
                : <Camera size={12} color="white" strokeWidth={2} />
              }
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
            />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>Profile photo</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
              {avatarUploading ? "Compressing & uploading…" : "JPG, PNG or WebP · Auto-compressed to 256px"}
            </p>
          </div>
        </div>

        {/* Name + email */}
        <div
          className="rounded-xl border p-5 flex flex-col gap-4"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
              Display name
            </label>
            <input
              type="text"
              defaultValue={profile.display_name ?? ""}
              id="display-name"
              onKeyDown={(e) => { if (e.key === "Enter") saveName((e.target as HTMLInputElement).value); }}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "var(--color-border)", background: "#F8FAFC", color: "var(--color-muted)" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>Email cannot be changed.</p>
          </div>

          {error && <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>}

          <button
            onClick={() => {
              const input = document.getElementById("display-name") as HTMLInputElement;
              if (input) saveName(input.value);
            }}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white self-start disabled:opacity-50 transition-colors"
            style={{ background: saved ? "#10B981" : "var(--color-primary)" }}
          >
            {saving && <Loader2 size={14} strokeWidth={2} className="animate-spin" />}
            {saved && <Check size={14} strokeWidth={2.5} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
          </button>
        </div>

        {/* Plan tier */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-accent)" }}>Current plan</p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                You are on the{" "}
                <span className="font-semibold capitalize" style={{ color: "var(--color-primary)" }}>
                  {profile.plan}
                </span>{" "}
                plan.
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                Phase 1 — all features included at no cost. Paid plans coming later.
              </p>
            </div>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: "#EFF6FF", color: "var(--color-primary)" }}
            >
              FREE
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border p-5" style={{ borderColor: "#FECACA", background: "#FFF5F5" }}>
          <p className="text-xs font-semibold mb-0.5" style={{ color: "#DC2626" }}>Danger zone</p>
          <p className="text-xs mb-4" style={{ color: "#7F1D1D" }}>
            Permanently deletes your account and all video analyses. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border"
            style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "white" }}
          >
            <Trash2 size={12} />
            Delete my account
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border shadow-xl p-6 flex flex-col gap-4"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h3 className="font-semibold" style={{ color: "var(--color-accent)" }}>Delete account?</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              All your videos, analyses, and account data will be permanently deleted. There is no way to recover this.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "#DC2626" }}
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
