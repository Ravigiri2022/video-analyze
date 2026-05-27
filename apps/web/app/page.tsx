import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilyze — AI Video Analysis",
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`);
  }
  if (params.token_hash) {
    redirect(`/auth/callback?token_hash=${params.token_hash}&type=${params.type ?? "email"}`);
  }
  return (
    <main className="flex flex-col min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <span className="text-xl font-bold tracking-tight" style={{ color: "var(--color-accent)" }}>
          Vilyze
        </span>
        <div className="flex items-center gap-4">
          <Link href="/upcoming" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            Roadmap
          </Link>
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "var(--color-muted)" }}>
            Sign in
          </Link>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-primary)" }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-24 gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: "#BFDBFE", background: "#EFF6FF", color: "var(--color-primary)" }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--color-primary)" }} />
          AI-powered · No GPU cost · Free to start
        </div>

        <h1 className="text-5xl font-bold tracking-tight max-w-3xl leading-tight" style={{ color: "var(--color-accent)" }}>
          Understand <span style={{ color: "var(--color-primary)" }}>why viewers drop off</span> your videos
        </h1>

        <p className="text-lg max-w-xl leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Upload a video or paste a YouTube link. Get instant AI analysis: attention curves, transcripts, engagement metrics, and recommendations.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/login" className="px-6 py-3 rounded-xl font-semibold text-white shadow-sm" style={{ background: "var(--color-primary)" }}>
            Analyze your first video →
          </Link>
          <a href="#how" className="px-6 py-3 rounded-xl font-semibold border" style={{ borderColor: "var(--color-border)", color: "var(--color-accent)" }}>
            See how it works
          </a>
        </div>

        {/* Mock dashboard preview */}
        <div className="mt-8 w-full max-w-3xl rounded-2xl border shadow-lg overflow-hidden" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)", background: "#F1F5F9" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#FC8181" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#F6E05E" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#68D391" }} />
            <span className="ml-2 text-xs" style={{ color: "var(--color-muted)" }}>Analysis — My Video.mp4</span>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            {[
              { label: "Overall Score", value: "78", suffix: "/100", color: "var(--color-primary)" },
              { label: "Grade", value: "B", suffix: "", color: "#7C3AED" },
              { label: "Severe Drops", value: "3", suffix: " found", color: "var(--color-error)" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl p-4 border text-center" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-3xl font-bold" style={{ color: m.color }}>
                  {m.value}
                  <span className="text-sm font-normal" style={{ color: "var(--color-muted)" }}>{m.suffix}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6">
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-xs font-medium mb-3" style={{ color: "var(--color-muted)" }}>ATTENTION CURVE</div>
              <div className="flex items-end gap-0.5 h-16">
                {[80,85,78,72,88,65,45,38,60,70,75,82,60,40,55,70,80,72,68,74].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: h < 50 ? "var(--color-error)" : "var(--color-primary)",
                      opacity: 0.75,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--color-accent)" }}>How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload or paste link", desc: "Drop a video file or paste any YouTube URL. We support MP4, WebM, MOV up to 200 MB or 10 minutes." },
              { step: "2", title: "AI analyzes your content", desc: "Transcription, motion analysis, silence detection, and attention modeling — usually under 2 minutes." },
              { step: "3", title: "Get actionable insights", desc: "See exactly where viewers drop off, what causes it, and how to fix it with prioritized recommendations." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "var(--color-primary)" }}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg" style={{ color: "var(--color-accent)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-xs border-t" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
        © 2025 Vilyze · Built with Next.js + Supabase + FastAPI
      </footer>
    </main>
  );
}

