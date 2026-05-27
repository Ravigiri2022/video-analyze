"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadService } from "@/lib/services/upload";
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
  const supabase = createClient();

  async function uploadFile(file: File) {
    setState({ phase: "uploading", progress: 0, fileName: file.name });

    try {
      const { job_id, signed_url } = await uploadService.createJob({
        filename: file.name,
        content_type: file.type,
        file_size: file.size,
      });

      if (!signed_url) throw new Error("No upload URL returned");

      // Upload directly to Supabase Storage with XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setState({
              phase: "uploading",
              progress: Math.round((e.loaded / e.total) * 100),
              fileName: file.name,
            });
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

      await uploadService.confirmUpload(job_id);
      setState({ phase: "processing", fileName: file.name, jobId: job_id });
      watchJob(job_id, file.name);
    } catch (err) {
      setState({ phase: "failed", error: (err as Error).message, fileName: file.name });
    }
  }

  async function submitYouTube(url: string) {
    setState({ phase: "uploading", progress: 100, fileName: url });

    try {
      const { job_id } = await uploadService.createJob({ youtube_url: url });
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
        },
      )
      .subscribe();

    // Fallback: poll every 8s in case Realtime is unavailable
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
