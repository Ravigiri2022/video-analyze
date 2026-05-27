"use client";

import { useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { User, Camera, Check, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { profile, saving, saved, avatarUploading, error, saveName, uploadAvatar } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-40">
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl">
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
      </div>
    </div>
  );
}
