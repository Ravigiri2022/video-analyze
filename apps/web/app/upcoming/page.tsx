"use client";

import Link from "next/link";
import { useState } from "react";
import { PlayCircle, Pencil, Monitor, Code2, Users, Sparkles, Check } from "lucide-react";

const FEATURES = [
  {
    icon: <PlayCircle size={22} strokeWidth={1.8} />,
    title: "YouTube Channel Analytics",
    desc: "Analyze your entire channel in one go. Track engagement trends across all uploads, spot your highest-retention videos, and benchmark content over time.",
    status: "In Development",
    statusColor: "#2563EB",
    statusBg: "#EFF6FF",
  },
  {
    icon: <Pencil size={22} strokeWidth={1.8} />,
    title: "Smart Recut Editor",
    desc: "Automatically detect dead segments and export a tighter version. AI-suggested cuts, pacing fixes, and B-roll timestamps — all ready to apply in one click.",
    status: "Coming Soon",
    statusColor: "#7C3AED",
    statusBg: "#F5F3FF",
  },
  {
    icon: <Monitor size={22} strokeWidth={1.8} />,
    title: "Batch Processing",
    desc: "Upload a whole season, a campaign, or a client's entire library. Get unified analysis reports across dozens of videos at once.",
    status: "Planned",
    statusColor: "#475569",
    statusBg: "#F1F5F9",
  },
  {
    icon: <Code2 size={22} strokeWidth={1.8} />,
    title: "API Access",
    desc: "Integrate Vilyze directly into your pipeline. Programmatic access to every analysis feature — transcripts, attention curves, recommendations.",
    status: "Planned",
    statusColor: "#475569",
    statusBg: "#F1F5F9",
  },
  {
    icon: <Users size={22} strokeWidth={1.8} />,
    title: "Team Workspace",
    desc: "Share analyses with teammates. Leave timestamped comments, track revisions, and collaborate on making better content together.",
    status: "Planned",
    statusColor: "#475569",
    statusBg: "#F1F5F9",
  },
];

const MYSTERY_FEATURE = {
  codename: "Project Catalyst",
  hint: "Something that learns. Something that adapts. The more you use Vilyze, the better it understands what makes your specific audience tick.",
  teaser: "Your style. Your audience. An intelligence built around you.",
};

const WALLETS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    icon: "₿",
    color: "#F7931A",
    bg: "#FFF7ED",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    icon: "Ξ",
    color: "#627EEA",
    bg: "#EEF2FF",
  },
  {
    symbol: "SOL",
    name: "Solana",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    icon: "◎",
    color: "#9945FF",
    bg: "#F5F3FF",
  },
];

type FeedbackType = "bug" | "feature" | "general";
type FbStatus = "idle" | "sending" | "sent" | "error";

function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>("general");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FbStatus>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, email: email || undefined, message }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#D1FAE5" }}>
          <Check size={22} color="#10B981" strokeWidth={2.5} />
        </div>
        <p className="font-semibold" style={{ color: "var(--color-accent)" }}>Thanks for the feedback!</p>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>It helps a lot. Really.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {(["bug", "feature", "general"] as FeedbackType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: type === t ? "var(--color-primary)" : "var(--color-bg)",
              color: type === t ? "white" : "var(--color-muted)",
              border: `1px solid ${type === t ? "var(--color-primary)" : "var(--color-border)"}`,
            }}
          >
            {t === "bug" ? "Bug" : t === "feature" ? "Feature idea" : "General"}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
          Message <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder={
            type === "bug" ? "Describe the bug — what happened, what you expected…"
            : type === "feature" ? "What feature would help you most?"
            : "What's on your mind?"
          }
          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-accent)" }}>
          Email <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional — so we can reply)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
        />
      </div>

      {status === "error" && (
        <p className="text-xs" style={{ color: "var(--color-error)" }}>Something went wrong. Try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !message.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--color-primary)" }}
      >
        {status === "sending" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-[10px] font-medium px-2 py-0.5 rounded"
      style={{
        background: copied ? "#D1FAE5" : "rgba(0,0,0,0.06)",
        color: copied ? "#065F46" : "var(--color-muted)",
        transition: "all 0.2s",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function UpcomingPage() {
  return (
    <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ color: "var(--color-accent)" }}>
          Vilyze
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            Dashboard
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ background: "var(--color-primary)" }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-6"
            style={{ borderColor: "#BFDBFE", background: "#EFF6FF", color: "var(--color-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--color-primary)" }} />
            Roadmap · What&apos;s coming next
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--color-accent)" }}>
            Building the future of video analytics
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>
            Vilyze is just getting started. Here&apos;s a look at what we&apos;re working on.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border p-6 flex flex-col gap-3"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: f.statusBg, color: f.statusColor }}
                >
                  {f.icon}
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: f.statusBg, color: f.statusColor }}
                >
                  {f.status}
                </span>
              </div>
              <h3 className="font-semibold text-base" style={{ color: "var(--color-accent)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Mystery card */}
        <div
          className="rounded-2xl p-8 mb-16 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
            border: "1px solid #334155",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #7C3AED 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2563EB 0%, transparent 50%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
              >
                <Sparkles size={20} color="#A78BFA" strokeWidth={1.8} />
              </div>
              <div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full tracking-wide"
                  style={{ background: "rgba(124,58,237,0.25)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                  ??? · CLASSIFIED
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "white" }}>{MYSTERY_FEATURE.codename}</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#94A3B8" }}>{MYSTERY_FEATURE.hint}</p>
            <p className="text-sm font-medium" style={{ color: "#A78BFA" }}>{MYSTERY_FEATURE.teaser}</p>
          </div>
        </div>

        {/* Donation meter */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>Community funding</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
              Server costs, API credits, and dev time — all funded by people who find Vilyze useful.
            </p>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-3xl font-bold" style={{ color: "var(--color-accent)" }}>$247</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>raised of $1,000 goal</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>24.7%</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>42 contributors</p>
              </div>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: "24.7%",
                  background: "linear-gradient(to right, var(--color-primary), #7C3AED)",
                }}
              />
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--color-muted)" }}>
              Funds server costs, AI API credits, and future infrastructure. Numbers updated manually.
            </p>
          </div>
        </section>

        {/* Crypto donation */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>
              Support Vilyze
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
              Vilyze is built by one person. If it saves you time or helps your content improve, consider dropping a tip.
              Every bit helps keep the servers on and new features coming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WALLETS.map((w) => (
              <div
                key={w.symbol}
                className="rounded-2xl border p-5 flex flex-col gap-3"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: w.bg, color: w.color }}
                  >
                    {w.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>{w.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>{w.symbol}</p>
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 flex items-center justify-between gap-2"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                >
                  <p
                    className="text-[10px] font-mono break-all leading-tight"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {w.address}
                  </p>
                  <CopyButton text={w.address} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "var(--color-muted)" }}>
            Placeholder addresses — real wallets will be added at v1.0 launch.
          </p>
        </section>

        {/* Feedback */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>Share feedback</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
              Found a bug? Have a feature idea? Just want to say hi? All good.
            </p>
          </div>
          <div
            className="max-w-lg mx-auto rounded-2xl border p-8"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <FeedbackForm />
          </div>
        </section>
      </div>

      <footer
        className="text-center py-8 text-xs border-t"
        style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
      >
        © 2025 Vilyze · Built with Next.js + Supabase + FastAPI
      </footer>
    </main>
  );
}
