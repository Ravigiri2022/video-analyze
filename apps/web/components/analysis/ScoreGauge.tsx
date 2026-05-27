"use client";

import { gradeColor } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  label: string;
  size?: "sm" | "lg";
}

export function ScoreGauge({ score, grade, label, size = "lg" }: ScoreGaugeProps) {
  const radius = size === "lg" ? 52 : 36;
  const stroke = size === "lg" ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dim = (radius + stroke) * 2 + 4;

  const strokeColor =
    score >= 85 ? "var(--color-success)"
    : score >= 60 ? "var(--color-primary)"
    : score >= 40 ? "#F59E0B"
    : "var(--color-error)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke="#F1F5F9" strokeWidth={stroke}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke={strokeColor} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="text-center -mt-2">
        <div style={{ marginTop: `-${dim * 0.6}px` }}>
          <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-xl"} ${gradeColor(grade)}`} style={{ display: "block", transform: "rotate(0deg)" }}>
            {grade}
          </span>
          <span className={`font-semibold ${size === "lg" ? "text-lg" : "text-sm"}`} style={{ color: "var(--color-muted)", display: "block" }}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>
      <p className={`text-xs font-medium ${size === "sm" ? "mt-1" : ""}`} style={{ color: "var(--color-muted)", marginTop: size === "lg" ? `${dim * 0.4}px` : "4px" }}>
        {label}
      </p>
    </div>
  );
}
