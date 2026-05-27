"use client";

import { useState } from "react";
import { Info } from "lucide-react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex" style={{ isolation: "isolate" }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center select-none"
        style={{
          background: "#E2E8F0",
          color: "#64748B",
          border: "1px solid #CBD5E1",
          cursor: "default",
        }}
        aria-label="More info"
      >
        <Info size={9} strokeWidth={2.5} />
      </button>

      {open && (
        <div
          className="absolute z-50 rounded-xl shadow-xl leading-relaxed"
          style={{
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 220,
            padding: "8px 11px",
            background: "#0F172A",
            color: "#CBD5E1",
            fontSize: 11,
            pointerEvents: "none",
            whiteSpace: "normal",
          }}
        >
          {text}
          {/* arrow */}
          <span
            className="absolute"
            style={{
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #0F172A",
            }}
          />
        </div>
      )}
    </div>
  );
}
