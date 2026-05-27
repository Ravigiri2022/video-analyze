"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Check, Loader2 } from "lucide-react";

type Tab = "password" | "magic";
type Mode = "idle" | "loading" | "sent" | "error";
type OAuthProvider = "google" | "github";

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
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

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

  async function handleOAuth(provider: OAuthProvider) {
    setOauthLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: provider === "github" ? "read:user user:email" : undefined,
      },
    });
    if (err) {
      setError(err.message);
      setOauthLoading(null);
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

          {/* OAuth */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-accent)", background: "var(--color-surface)" }}
            >
              {oauthLoading === "google" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-accent)", background: "var(--color-surface)" }}
            >
              {oauthLoading === "github" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              )}
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
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
