"use client";

export function ProcessingOverlay({ visible, label }: { visible: boolean; label?: string }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
      style={{ background: "rgba(15,23,42,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div className="vilyze-morph" />
      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
        {label ?? "Analyzing your video…"}
      </p>
    </div>
  );
}
