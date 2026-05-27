function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ""}`}
      style={style}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 140, height: 32 }} />
          <Skeleton style={{ width: 80, height: 16 }} />
        </div>
        <Skeleton style={{ width: 130, height: 38 }} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <Skeleton style={{ height: 42, borderRadius: 12 }} className="w-full" />
        <div className="flex gap-2">
          {[100, 60, 90, 65, 55, 75].map((w, i) => (
            <Skeleton key={i} style={{ width: w, height: 28 }} />
          ))}
        </div>
      </div>

      {/* Job rows */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ borderColor: "#F1F5F9" }}
          >
            <Skeleton style={{ width: 64, height: 40, flexShrink: 0, borderRadius: 8 }} />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton style={{ width: "55%", height: 14 }} />
              <Skeleton style={{ width: "35%", height: 12 }} />
            </div>
            <Skeleton style={{ width: 60, height: 24, borderRadius: 9999 }} />
            <Skeleton style={{ width: 56, height: 28, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
