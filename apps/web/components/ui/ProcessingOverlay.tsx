"use client";

import { HashLoader } from "react-spinners";

export function ProcessingOverlay({ visible, label }: { visible: boolean; label?: string }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: "rgba(15,23,42,0.90)", backdropFilter: "blur(6px)" }}
    >
      <HashLoader color="#2563EB" size={56} speedMultiplier={0.9} />
      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>
        {label ?? "Analyzing your video…"}
      </p>
    </div>
  );
}
