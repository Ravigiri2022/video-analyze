import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Job } from "@/types";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { JobList } from "@/components/dashboard/JobList";

export const metadata: Metadata = { title: "Dashboard" };

const PAGE_SIZE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const status = sp.status ?? "all";
  const sort   = sp.sort   ?? "created_at";
  const orderP = sp.order  ?? "desc";
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (status === "archived") {
    query = query.eq("is_archived", true);
  } else {
    query = query.eq("is_archived", false);
    if (status !== "all") query = query.eq("status", status);
  }

  if (q) {
    query = query.or(
      `original_name.ilike.%${q}%,youtube_title.ilike.%${q}%,youtube_url.ilike.%${q}%`,
    );
  }

  const sortCol = sort === "name" ? "original_name" : "created_at";
  query = query
    .order(sortCol, { ascending: orderP === "asc" })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: jobs, count } = await query;
  const total      = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Credit usage this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [{ count: usedThisMonth }, { data: profile }] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("user_id", user.id).gte("created_at", startOfMonth.toISOString()),
    supabase.from("profiles").select("monthly_job_limit").eq("id", user.id).single(),
  ]);
  const limit = profile?.monthly_job_limit ?? 3;
  const used = usedThisMonth ?? 0;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const creditColor = pct >= 100 ? "var(--color-error)" : pct >= 66 ? "#F59E0B" : "var(--color-primary)";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>Your Videos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            {total} video{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New analysis
        </Link>
      </div>

      {/* Credit usage banner */}
      <div
        className="rounded-xl border p-4 mb-6 flex items-center justify-between gap-4"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
              Analyses this month
            </p>
            <p className="text-xs font-bold" style={{ color: creditColor }}>
              {used} / {limit}
            </p>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: creditColor }}
            />
          </div>
          {pct >= 100 && (
            <p className="text-xs mt-1.5" style={{ color: "var(--color-error)" }}>
              Monthly limit reached. Resets on the 1st.
            </p>
          )}
        </div>
      </div>

      <DashboardFilters q={q} status={status} sort={sort} order={orderP} />

      <JobList
        jobs={(jobs ?? []) as Job[]}
        page={page}
        totalPages={totalPages}
        filters={{ q, status, sort, order: orderP }}
        emptyMessage={
          q || status !== "all" ? "No videos match your filters." : "No videos yet."
        }
      />
    </div>
  );
}
