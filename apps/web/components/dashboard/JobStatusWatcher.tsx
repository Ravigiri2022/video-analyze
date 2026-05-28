"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type ActiveJob = { id: string; original_name: string | null; youtube_title: string | null };

export function JobStatusWatcher({ jobs, userId }: { jobs: ActiveJob[]; userId: string }) {
  const router = useRouter();
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  useEffect(() => {
    if (jobs.length === 0) return;

    const supabase = createClient();
    const jobMap = new Map(jobs.map((j) => [j.id, j.original_name ?? j.youtube_title ?? "Video"]));

    const channel = supabase
      .channel("dashboard-watcher")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `user_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as { id: string; status: string };
          if (!jobMap.has(updated.id)) return;

          const name = jobMap.get(updated.id)!;

          if (updated.status === "done") {
            const jobId = updated.id;
            toast.custom(
              (t) => (
                <div
                  className={`transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#FFFFFF", border: "1px solid #D1FAE5",
                    borderRadius: 12, padding: "12px 16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    maxWidth: 340, width: "100%",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>Analysis complete</p>
                  </div>
                  <a
                    href={`/analysis/${jobId}`}
                    onClick={() => toast.dismiss(t.id)}
                    style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    View →
                  </a>
                </div>
              ),
              { duration: 12000 }
            );
          } else if (updated.status === "failed") {
            toast.error(`"${name}" failed — check the job for details.`, { duration: 6000 });
          }

          router.refresh();
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // Re-subscribe only when the set of watched job IDs changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.map((j) => j.id).join(","), userId]);

  return null;
}
