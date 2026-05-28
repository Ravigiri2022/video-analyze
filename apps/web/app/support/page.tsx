"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ArrowRight, Check } from "lucide-react";
import { FeedbackHistory } from "@/components/support/FeedbackHistory";

const WALLETS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    network: "BTC network",
    address: process.env.NEXT_PUBLIC_BTC_WALLET ?? "",
    icon: "₿",
    color: "#F7931A",
    bg: "#FFF7ED",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "ERC20 network",
    address: process.env.NEXT_PUBLIC_ETH_WALLET ?? "",
    icon: "Ξ",
    color: "#627EEA",
    bg: "#EEF2FF",
  },
  {
    symbol: "SOL",
    name: "Solana",
    network: "SOL network",
    address: process.env.NEXT_PUBLIC_SOL_WALLET ?? "",
    icon: "◎",
    color: "#9945FF",
    bg: "#F5F3FF",
  },
];

type FeedbackType = "bug" | "feature" | "general";
type FbStatus = "idle" | "sending" | "sent" | "error";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-[10px] font-medium px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
      style={{
        background: copied ? "#D1FAE5" : "rgba(0,0,0,0.06)",
        color: copied ? "#065F46" : "var(--color-muted)",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

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
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com (optional — so we can reply)"
        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
      />
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

export default function SupportPage() {
  const activeWallets = WALLETS.filter((w) => w.address);

  return (
    <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Vilyze" width={28} height={28} className="rounded-lg" />
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--color-accent)" }}>Vilyze</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/about" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            About
          </Link>
          <Link href="/upcoming" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            Roadmap
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

      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Hero */}
        <div className="text-center mb-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", color: "#D97706" }}
          >
            <Heart size={28} strokeWidth={1.8} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--color-accent)" }}>
            Support Vilyze
          </h1>
          <p className="text-lg max-w-lg mx-auto leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Vilyze is built and maintained by one person. If it saves you time or improves your content,
            consider sending a tip. Server costs and API credits aren&apos;t free.
          </p>
        </div>

        {/* Roadmap callout */}
        <Link
          href="/upcoming"
          className="flex items-center justify-between p-5 rounded-2xl border mb-12 transition-all hover:shadow-sm group"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>See what&apos;s coming next</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
              YouTube analytics, smart editor, batch processing and more on the roadmap.
            </p>
          </div>
          <ArrowRight
            size={18}
            style={{ color: "var(--color-muted)", flexShrink: 0 }}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        {/* Crypto wallets */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>Crypto tips</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            Send any amount — even $1 in BTC covers hours of server time.
          </p>

          {activeWallets.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>Wallet addresses coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeWallets.map((w) => (
                <div
                  key={w.symbol}
                  className="rounded-2xl border p-5 flex items-center gap-4"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{ background: w.bg, color: w.color }}
                  >
                    {w.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>
                      {w.name} <span className="font-normal" style={{ color: "var(--color-muted)" }}>({w.symbol})</span>
                    </p>
                    <p className="text-[10px] font-medium mb-1" style={{ color: w.color }}>{w.network}</p>
                    <div
                      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
                      style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                    >
                      <p className="text-[11px] font-mono truncate" style={{ color: "var(--color-accent)" }}>
                        {w.address}
                      </p>
                      <CopyButton text={w.address} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feedback */}
        <section>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>Share feedback</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            Found a bug? Have a feature idea? One person reads every message.
          </p>
          <div
            className="rounded-2xl border p-8"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <FeedbackForm />
          </div>
        </section>

        <FeedbackHistory />
      </div>

      <footer
        className="text-center py-8 text-xs border-t"
        style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
      >
        © 2025 Vilyze · Built by{" "}
        <a href="https://github.com/Ravigiri2022" target="_blank" rel="noopener noreferrer" className="underline">
          Ravi Giri
        </a>
      </footer>
    </main>
  );
}
