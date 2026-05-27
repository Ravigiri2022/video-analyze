import apiClient from "@/lib/api/client";
import type { Analysis } from "@/types";

export const analysisService = {
  async get(jobId: string): Promise<Analysis> {
    const { data } = await apiClient.get<Analysis>(`/analysis/${jobId}`);
    return data;
  },

  async emailReport(
    jobId: string,
    to: string,
    cc?: string,
  ): Promise<{ success: boolean; reportUrl: string }> {
    const { data } = await apiClient.post(`/analysis/${jobId}/email-report`, {
      to,
      cc: cc || undefined,
    });
    return data;
  },
};
