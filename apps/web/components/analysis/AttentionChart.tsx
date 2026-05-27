"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { AttentionPoint } from "@/types";
import { formatDuration } from "@/lib/utils";

interface AttentionChartProps {
  data: AttentionPoint[];
  drops: { start_sec: number; end_sec: number }[];
}

export function AttentionChart({ data, drops }: AttentionChartProps) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-accent)" }}>Attention Curve</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="sec"
            tickFormatter={formatDuration}
            tick={{ fontSize: 11, fill: "var(--color-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--color-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v) => [`${Number(v).toFixed(1)}`, "Attention"]}
            labelFormatter={(l) => `Time: ${formatDuration(l as number)}`}
            contentStyle={{ border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
          />
          {drops.map((d, i) => (
            <ReferenceLine
              key={i}
              x={d.start_sec}
              stroke="var(--color-error)"
              strokeDasharray="4 2"
              opacity={0.5}
            />
          ))}
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
