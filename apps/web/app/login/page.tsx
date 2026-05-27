"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Check, Loader2 } from "lucide-react";

type Tab = "password" | "magic";
type Mode = "idle" | "loading" | "sent" | "error";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setMode("loading");
    setError(null);

    const supabase = createClient();
    const fn = isSignUp
      ? supabase.auth.signUp({ email: email.trim(), password })
      : supabase.auth.signInWithPassword({ email: email.trim(), password });

    const { error: err } = await fn;
    if (err) {
      setError(err.message);
      setMode("error");
    } else {
      router.replace("/dashboard");
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setMode("loading");
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (err) {
      setError(err.message);
      setMode("error");
    } else {
      setMode("sent");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border shadow-sm p-8 flex flex-col gap-6" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-accent)" }}>Welcome to Vilyze</h1>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Sign in to analyze your videos</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "#F1F5F9" }}>
            {(["password", "magic"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setMode("idle"); setError(null); }}
                className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "var(--color-accent)" : "var(--color-muted)",
                  boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {t === "password" ? "Password" : "Magic link"}
              </button>
            ))}
          </div>

          {tab === "password" ? (
            mode === "idle" || mode === "loading" || mode === "error" ? (
              <form onSubmit={handlePassword} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                </div>

                {(error || callbackError) && (
                  <p className="text-xs" style={{ color: "var(--color-error)" }}>{error ?? callbackError}</p>
                )}

                <button
                  type="submit"
                  disabled={mode === "loading" || !email.trim() || !password.trim()}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {mode === "loading" && <Loader2 size={15} className="animate-spin" />}
                  {mode === "loading" ? "Signing in…" : isSignUp ? "Create account" : "Sign in"}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-xs text-center"
                  style={{ color: "var(--color-muted)" }}
                >
                  {isSignUp ? "Already have an account? Sign in" : "No account? Create one"}
                </button>
              </form>
            ) : null
          ) : (
            mode === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#D1FAE5" }}>
                  <Check size={22} color="var(--color-success)" strokeWidth={2.5} />
                </div>
                <p className="font-semibold" style={{ color: "var(--color-accent)" }}>Check your email</p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  We sent a magic link to <strong>{email}</strong>
                </p>
                {process.env.NODE_ENV === "development" && (
                  <div className="w-full rounded-xl border p-3 mt-2 text-left" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#92400E" }}>Local dev tip</p>
                    <p className="text-xs" style={{ color: "#78350F" }}>
                      Open{" "}
                      <a href="http://127.0.0.1:54324" target="_blank" className="underline font-medium">
                        Mailpit (port 54324)
                      </a>{" "}
                      to find your magic link.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => { setMode("idle"); setEmail(""); }}
                  className="text-sm mt-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                </div>

                {(error || callbackError) && (
                  <p className="text-xs" style={{ color: "var(--color-error)" }}>{error ?? callbackError}</p>
                )}

                <button
                  type="submit"
                  disabled={mode === "loading" || !email.trim()}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {mode === "loading" && <Loader2 size={15} className="animate-spin" />}
                  {mode === "loading" ? "Sending…" : "Send magic link"}
                </button>
              </form>
            )
          )}

        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
