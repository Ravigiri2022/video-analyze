import apiClient from "@/lib/api/client";

export const jobsService = {
  async archive(jobId: string, isArchived: boolean): Promise<void> {
    await apiClient.patch(`/jobs/${jobId}`, { is_archived: isArchived });
  },

  async remove(jobId: string): Promise<void> {
    await apiClient.delete(`/jobs/${jobId}`);
  },
};
