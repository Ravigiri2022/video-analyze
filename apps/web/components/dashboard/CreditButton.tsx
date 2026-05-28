"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, X } from "lucide-react";

export function CreditButton({ used, limit }: { used: number; limit: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 100 ? "#EF4444" : pct >= 66 ? "#F59E0B" : "#2563EB";
  const remaining = Math.max(0, limit - used);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all"
        style={{ borderColor: color, color, background: `${color}10` }}
      >
        <Zap size={13} strokeWidth={2.5} />
        {used} / {limit}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-76 rounded-2xl border shadow-xl z-20 p-5"
          style={{ background: "#FFFFFF", borderColor: "#E2E8F0", width: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>Monthly analyses</p>
            <button onClick={() => setOpen(false)} style={{ color: "#94A3B8" }}>
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "#64748B" }}>Used this month</span>
            <span className="text-xs font-bold" style={{ color }}>{used} / {limit}</span>
          </div>
          <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ background: "#F1F5F9" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: "#64748B" }}>
            Due to limited compute resources and API costs, free accounts are capped at{" "}
            <strong style={{ color: "#0F172A" }}>{limit} analyses per month</strong>. Failed
            analyses don&apos;t count against your limit. Your quota resets on the{" "}
            <strong style={{ color: "#0F172A" }}>1st of each month</strong>.
          </p>

          {pct >= 100 ? (
            <p className="text-xs font-semibold rounded-lg px-3 py-2 text-center"
              style={{ background: "#FEE2E2", color: "#DC2626" }}>
              Limit reached — resets on the 1st
            </p>
          ) : (
            <p className="text-xs font-medium rounded-lg px-3 py-2 text-center"
              style={{ background: "#F0FDF4", color: "#16A34A" }}>
              {remaining} {remaining === 1 ? "analysis" : "analyses"} remaining
            </p>
          )}
        </div>
      )}
    </div>
  );
}
