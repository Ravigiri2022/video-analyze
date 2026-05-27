function Sk({ w, h, r }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse bg-slate-100"
      style={{ width: w ?? "100%", height: h, borderRadius: r ?? 12, flexShrink: 0 }}
    />
  );
}

export default function AnalysisLoading() {
  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <Sk w={80} h={12} />
          <Sk w="60%" h={32} />
          <Sk w={140} h={14} />
        </div>
        <Sk w={100} h={108} r={16} />
      </div>
      <div className="flex gap-2">
        {[70, 90, 60, 80].map((w, i) => <Sk key={i} w={w} h={24} r={999} />)}
      </div>
      <div className="rounded-xl border p-5 flex flex-col gap-3" style={{ borderColor: "#F1F5F9" }}>
        <Sk w={80} h={14} />
        <Sk h={14} />
        <Sk w="85%" h={14} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Sk key={i} h={80} />)}
      </div>
      <Sk h={180} />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <Sk key={i} h={56} />)}
      </div>
    </div>
  );
}
