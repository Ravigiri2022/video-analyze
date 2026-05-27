import { z } from "zod";

export const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_DURATION_S = 300; // 5 minutes

export const youtubeUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) =>
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/.test(url),
    "Must be a valid YouTube URL"
  );

export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported format. Use MP4, WebM, MOV, or AVI.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Max 100MB.`;
  }
  return null;
}
