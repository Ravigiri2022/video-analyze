"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

const STATUSES = [
  { value: "all",        label: "All" },
  { value: "done",       label: "Done" },
  { value: "processing", label: "Processing" },
  { value: "pending",    label: "Queued" },
  { value: "failed",     label: "Failed" },
  { value: "archived",   label: "Archived" },
];

const SORTS = [
  { value: "created_at|desc", label: "Newest first" },
  { value: "created_at|asc",  label: "Oldest first" },
  { value: "name|asc",        label: "Name A→Z" },
  { value: "name|desc",       label: "Name Z→A" },
];

interface Props { q: string; status: string; sort: string; order: string; }

export function DashboardFilters({ q, status, sort, order }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const push = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [router, pathname, searchParams]);

  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <Search size={15} color="var(--color-muted)" strokeWidth={2} />
        <input
          type="search"
          defaultValue={q}
          placeholder="Search by name or URL…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--color-text)" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") push({ q: (e.target as HTMLInputElement).value });
          }}
          onBlur={(e) => push({ q: e.target.value })}
        />
        {q && (
          <button
            onClick={() => push({ q: null })}
            className="text-xs px-2 py-0.5 rounded"
            style={{ color: "var(--color-muted)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Status tabs + sort */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => push({ status: s.value })}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: status === s.value ? "var(--color-primary)" : "var(--color-bg)",
                color: status === s.value ? "white" : "var(--color-muted)",
                border: `1px solid ${status === s.value ? "var(--color-primary)" : "var(--color-border)"}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isPending
            ? <Loader2 size={14} color="var(--color-primary)" className="animate-spin" />
            : <SlidersHorizontal size={14} color="var(--color-muted)" />
          }
          <select
            value={`${sort}|${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split("|");
              push({ sort: s, order: o });
            }}
            className="text-xs rounded-lg px-2 py-1.5 outline-none border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
