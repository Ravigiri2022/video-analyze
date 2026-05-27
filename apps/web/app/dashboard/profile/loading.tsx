function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ""}`} style={style} />;
}

export default function ProfileLoading() {
  return (
    <div className="p-8 max-w-xl">
      <Skeleton style={{ width: 100, height: 32, marginBottom: 8 }} />
      <Skeleton style={{ width: 180, height: 16, marginBottom: 32 }} />

      {/* Avatar row */}
      <div className="flex items-center gap-5 mb-6">
        <Skeleton style={{ width: 80, height: 80, borderRadius: 16 }} />
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: 160, height: 12 }} />
        </div>
      </div>

      {/* Name + email card */}
      <div className="rounded-xl border p-5 flex flex-col gap-4 mb-6" style={{ borderColor: "#F1F5F9" }}>
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 90, height: 12 }} />
          <Skeleton style={{ height: 42 }} className="w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 50, height: 12 }} />
          <Skeleton style={{ height: 42 }} className="w-full" />
        </div>
        <Skeleton style={{ width: 110, height: 36, borderRadius: 12 }} />
      </div>

      {/* Plan card */}
      <div className="rounded-xl border p-5" style={{ borderColor: "#F1F5F9" }}>
        <Skeleton style={{ width: 90, height: 12, marginBottom: 8 }} />
        <Skeleton style={{ width: "70%", height: 14 }} />
      </div>
    </div>
  );
}
