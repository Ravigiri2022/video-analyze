"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: number; fileName: string }
  | { phase: "processing"; fileName: string; jobId: string }
  | { phase: "done"; jobId: string }
  | { phase: "failed"; error: string; fileName: string };

export function useUpload() {
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const router = useRouter();
  const supabase = createClient();  // safe: hooks only run in browser

  async function uploadFile(file: File) {
    setState({ phase: "uploading", progress: 0, fileName: file.name });

    try {
      // 1. Get signed upload URL + create job
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
          file_size: file.size,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to get upload URL");
      }

      const { signed_url, upload_path, job_id } = await res.json();

      // 2. Upload directly to Supabase Storage with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setState({ phase: "uploading", progress: Math.round((e.loaded / e.total) * 100), fileName: file.name });
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload network error")));
        xhr.open("PUT", signed_url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Confirm upload — mark job as pending
      await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id, upload_path }),
      });

      setState({ phase: "processing", fileName: file.name, jobId: job_id });

      // 4. Subscribe to Realtime updates
      watchJob(job_id, file.name);
    } catch (err) {
      setState({ phase: "failed", error: (err as Error).message, fileName: file.name });
    }
  }

  async function submitYouTube(url: string) {
    setState({ phase: "uploading", progress: 100, fileName: url });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to submit YouTube URL");
      }

      const { job_id } = await res.json();
      setState({ phase: "processing", fileName: url, jobId: job_id });
      watchJob(job_id, url);
    } catch (err) {
      setState({ phase: "failed", error: (err as Error).message, fileName: url });
    }
  }

  function watchJob(jobId: string, fileName: string) {
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${jobId}` },
        (payload) => {
          const job = payload.new as { status: string };
          if (job.status === "done") {
            channel.unsubscribe();
            setState({ phase: "done", jobId });
            router.push(`/analysis/${jobId}`);
          } else if (job.status === "failed") {
            channel.unsubscribe();
            setState({ phase: "failed", error: "Analysis failed. Please try again.", fileName });
          }
        }
      )
      .subscribe();

    // Fallback: poll every 8s in case Realtime isn't available
    const interval = setInterval(async () => {
      const { data } = await supabase.from("jobs").select("status").eq("id", jobId).single();
      if (data?.status === "done") {
        clearInterval(interval);
        setState({ phase: "done", jobId });
        router.push(`/analysis/${jobId}`);
      } else if (data?.status === "failed") {
        clearInterval(interval);
        setState({ phase: "failed", error: "Analysis failed. Please try again.", fileName });
      }
    }, 8000);
  }

  function reset() {
    setState({ phase: "idle" });
  }

  return { state, uploadFile, submitYouTube, reset };
}
