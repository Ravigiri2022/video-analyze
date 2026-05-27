import apiClient from "@/lib/api/client";

type FilePayload = { filename: string; content_type: string; file_size: number };
type YoutubePayload = { youtube_url: string };

export type CreateJobResponse = {
  job_id: string;
  signed_url?: string;
  upload_path?: string;
};

export const uploadService = {
  async createJob(payload: FilePayload | YoutubePayload): Promise<CreateJobResponse> {
    const { data } = await apiClient.post<CreateJobResponse>("/upload", payload);
    return data;
  },

  async confirmUpload(jobId: string): Promise<void> {
    await apiClient.post("/upload/confirm", { job_id: jobId });
  },
};
