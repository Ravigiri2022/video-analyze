"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, Archive, ArchiveRestore, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { jobsService } from "@/lib/services/jobs";
import type { Job } from "@/types";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: "#FEF3C7", text: "#92400E", label: "Queued" },
  processing: { bg: "#DBEAFE", text: "#1E40AF", label: "Processing" },
  done:       { bg: "#D1FAE5", text: "#065F46", label: "Done" },
  failed:     { bg: "#FEE2E2", text: "#991B1B", label: "Failed" },
  cancelled:  { bg: "#F1F5F9", text: "#475569", label: "Cancelled" },
};

interface Filters { q: string; status: string; sort: string; order: string; }
interface Props {
  jobs: Job[];
  page: number;
  totalPages: number;
  filters: Filters;
  emptyMessage: string;
}

export function JobList({ jobs, page, totalPages, filters, emptyMessage }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (filters.q)                    params.set("q", filters.q);
    if (filters.status !== "all")     params.set("status", filters.status);
    if (filters.sort !== "created_at") params.set("sort", filters.sort);
    if (filters.order !== "desc")     params.set("order", filters.order);
    params.set("page", String(p));
    return `/dashboard?${params.toString()}`;
  }

  async function archiveToggle(job: Job) {
    setBusy(job.id);
    await jobsService.archive(job.id, !job.is_archived);
    setBusy(null);
    startRefresh(() => router.refresh());
  }

  async function deleteJob(id: string) {
    setBusy(id);
    setConfirmDelete(null);
    await jobsService.remove(id);
    setBusy(null);
    startRefresh(() => router.refresh());
  }

  if (jobs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border border-dashed"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
          <Video size={28} color="var(--color-primary)" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: "var(--color-accent)" }}>{emptyMessage}</p>
          {filters.status === "all" && !filters.q && (
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Upload a video or paste a YouTube link to get started
            </p>
          )}
        </div>
        {filters.status === "all" && !filters.q && (
          <Link
            href="/dashboard/upload"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--color-primary)" }}
          >
            Upload your first video
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Delete confirm modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="rounded-2xl border p-6 max-w-sm w-full shadow-xl"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2" style={{ color: "var(--color-accent)" }}>Delete this video?</h3>
            <p className="text-sm mb-5" style={{ color: "var(--color-muted)" }}>
              The job and all analysis data will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteJob(confirmDelete)}
                disabled={busy === confirmDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-70"
                style={{ background: "var(--color-error)" }}
              >
                {busy === confirmDelete && <Loader2 size={13} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isRefreshing && (
        <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "var(--color-muted)" }}>
          <Loader2 size={12} className="animate-spin" />
          Updating…
        </div>
      )}

      <div className="flex flex-col gap-3" style={{ opacity: isRefreshing ? 0.6 : 1, transition: "opacity 0.2s" }}>
        {jobs.map((job) => {
          const s = STATUS_STYLES[job.status] ?? STATUS_STYLES.pending;
          const title = job.original_name ?? job.youtube_title ?? job.youtube_url ?? "Video";
          const isBusy = busy === job.id;

          return (
            <div
              key={job.id}
              className="flex items-center gap-4 p-4 rounded-xl border transition-opacity"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                opacity: isBusy ? 0.5 : 1,
              }}
            >
              {/* Thumbnail */}
              <div
                className="w-16 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: "#F1F5F9" }}
              >
                {job.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Video size={16} color="var(--color-muted)" strokeWidth={1.5} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "var(--color-accent)" }} title={title}>
                  {title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  {job.input_type === "youtube" ? "YouTube" : "Upload"} ·{" "}
                  {new Date(job.created_at).toLocaleDateString()}
                  {job.is_archived ? " · Archived" : ""}
                </p>
              </div>

              {/* Status */}
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: s.bg, color: s.text }}
              >
                {s.label}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {job.status === "done" && (
                  <Link
                    href={`/analysis/${job.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "#EFF6FF", color: "var(--color-primary)" }}
                  >
                    View →
                  </Link>
                )}
                <button
                  onClick={() => archiveToggle(job)}
                  disabled={isBusy}
                  title={job.is_archived ? "Unarchive" : "Archive"}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                  style={{ color: "var(--color-muted)" }}
                >
                  {isBusy
                    ? <Loader2 size={14} className="animate-spin" />
                    : job.is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />
                  }
                </button>
                <button
                  onClick={() => setConfirmDelete(job.id)}
                  disabled={isBusy}
                  title="Delete"
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                  style={{ color: isBusy ? "var(--color-muted)" : "var(--color-error)" }}
                >
                  {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {page > 1 ? (
            <Link
              href={buildPageUrl(page - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-muted)" }}
            >
              <ChevronLeft size={15} />
            </Link>
          ) : (
            <span className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ borderColor: "var(--color-border)", color: "var(--color-border)" }}>
              <ChevronLeft size={15} />
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageUrl(p)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium border transition-all"
              style={{
                background: p === page ? "var(--color-primary)" : "var(--color-surface)",
                color: p === page ? "white" : "var(--color-muted)",
                borderColor: p === page ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              {p}
            </Link>
          ))}

          {page < totalPages ? (
            <Link
              href={buildPageUrl(page + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-muted)" }}
            >
              <ChevronRight size={15} />
            </Link>
          ) : (
            <span className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ borderColor: "var(--color-border)", color: "var(--color-border)" }}>
              <ChevronRight size={15} />
            </span>
          )}
        </div>
      )}
    </>
  );
}
