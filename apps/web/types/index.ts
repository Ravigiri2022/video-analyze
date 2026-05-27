export type JobStatus = "pending" | "processing" | "done" | "failed" | "cancelled";
export type InputType = "upload" | "youtube";

export interface Job {
  id: string;
  user_id: string;
  status: JobStatus;
  input_type: InputType;
  storage_path: string | null;
  original_name: string | null;
  file_size_bytes: number | null;
  youtube_url: string | null;
  youtube_title: string | null;
  youtube_duration_s: number | null;
  attempts: number;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  processing_time_s: number | null;
  thumbnail_url: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  plan: string;
  avatar_url: string | null;
  jobs_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface AttentionPoint {
  sec: number;
  score: number;
}

export interface AttentionDrop {
  start_sec: number;
  end_sec: number;
  drop: number;
  cause: string;
}

export interface SilenceRegion {
  time: number;
  type: "dead_silence" | "dramatic_pause";
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  text: string;
  timestamp?: number;
}

export interface Analysis {
  id: string;
  job_id: string;
  user_id: string;
  overall_score: number;
  grade: string;
  start_score: number;
  middle_score: number;
  end_score: number;
  attention_curve: AttentionPoint[];
  motion_per_sec: AttentionPoint[];
  rms_per_sec: AttentionPoint[];
  transcript_segments: TranscriptSegment[];
  avg_speech_rate_wps: number | null;
  full_transcript: string | null;
  attention_drops: AttentionDrop[];
  severe_drop_count: number;
  silence_regions: SilenceRegion[];
  dead_silence_count: number;
  dramatic_pause_count: number;
  avg_continuity: number | null;
  gpt_summary: string;
  gpt_hook_analysis: string;
  gpt_recommendations: Recommendation[];
  gpt_tags: string[] | null;
  video_duration_s: number | null;
  video_fps: number | null;
  created_at: string;
}
