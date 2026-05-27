import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Github, ExternalLink, Heart, Zap, Code2 } from "lucide-react";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
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
          <Link href="/upcoming" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            Roadmap
          </Link>
          <Link href="/support" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            Support
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
        <div className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-6"
            style={{ borderColor: "#BFDBFE", background: "#EFF6FF", color: "var(--color-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--color-primary)" }} />
            The person behind Vilyze
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--color-accent)" }}>
            Built by one person, for creators
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--color-muted)" }}>
            Vilyze started as a simple idea — what if you could see exactly where your audience loses interest?
            It grew into a full AI analysis platform.
          </p>
        </div>

        {/* Developer card */}
        <div
          className="rounded-3xl border p-10 mb-12 relative overflow-hidden"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
          />

          <div className="relative flex flex-col sm:flex-row items-start gap-8">
            {/* Avatar placeholder */}
            <div
              className="w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #7C3AED 100%)",
                color: "white",
                boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
              }}
            >
              R
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-accent)" }}>Ravi Giri</h2>
              <p className="text-sm font-medium mb-4" style={{ color: "var(--color-primary)" }}>
                Founder &amp; Solo Developer
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
                Built Vilyze from the ground up — the AI pipeline, the frontend, the backend, the infrastructure.
                Every feature you use was designed and coded solo. The goal: give creators the same data
                big studios pay thousands for, completely free.
              </p>

              <a
                href="https://github.com/Ravigiri2022"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: "#0F172A",
                  color: "white",
                  boxShadow: "0 2px 12px rgba(15,23,42,0.2)",
                }}
              >
                <Github size={16} />
                github.com/Ravigiri2022
                <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Story cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            {
              icon: <Zap size={20} strokeWidth={1.8} />,
              title: "Why it exists",
              body: "Most video analytics tools tell you views and watch time. None tell you the exact second someone got bored. Vilyze fixes that.",
              color: "#F59E0B",
              bg: "#FFFBEB",
            },
            {
              icon: <Code2 size={20} strokeWidth={1.8} />,
              title: "How it's built",
              body: "Next.js frontend, Python FastAPI worker, Whisper for transcripts, OpenCV for motion, and an LLM for recommendations.",
              color: "var(--color-primary)",
              bg: "#EFF6FF",
            },
            {
              icon: <Heart size={20} strokeWidth={1.8} />,
              title: "The mission",
              body: "Keep it free for small creators. Build in public. Listen to feedback. Ship fast. Don't add fluff.",
              color: "#EF4444",
              bg: "#FEF2F2",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border p-6 flex flex-col gap-3"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{card.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            border: "1px solid #334155",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, #2563EB 0%, transparent 60%), radial-gradient(circle at 70% 30%, #7C3AED 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "white" }}>Want to support the project?</h2>
            <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
              Star the repo, share it with a creator friend, or send a tip. All of it helps.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="https://github.com/Ravigiri2022"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Github size={15} />
                Star on GitHub
              </a>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                <Heart size={15} />
                Support Vilyze
              </Link>
            </div>
          </div>
        </div>
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
