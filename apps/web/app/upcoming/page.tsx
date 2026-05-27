import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Pencil, Monitor, Code2, Users, Sparkles, Heart } from "lucide-react";

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

export default function UpcomingPage() {
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

        {/* Support callout */}
        <Link
          href="/support"
          className="flex items-center justify-between p-6 rounded-2xl border transition-all hover:shadow-sm group"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#FEF3C7", color: "#D97706" }}
            >
              <Heart size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--color-accent)" }}>Support Vilyze</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                Send a tip, share feedback, or just say hi. Built by one person.
              </p>
            </div>
          </div>
          <span className="text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: "var(--color-primary)" }}>
            Support →
          </span>
        </Link>
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
