import os
import uuid
import shutil
import logging
import numpy as np

from config import settings
from db import queries
from pipeline import downloader, ffmpeg_utils, transcriber, motion, audio_analysis, continuity, attention, gpt_insights, thumbnail as thumb_mod

logger = logging.getLogger(__name__)


def process_job(job: dict) -> None:
    job_id = job["id"]
    user_id = job["user_id"]
    tmp_dir = os.path.join(settings.tmp_dir, str(uuid.uuid4()))
    os.makedirs(tmp_dir, exist_ok=True)

    try:
        raw_path = os.path.join(tmp_dir, "raw_input.mp4")
        processed_path = os.path.join(tmp_dir, "processed.mp4")
        audio_path = os.path.join(tmp_dir, "audio.wav")

        # ── 1. Download ───────────────────────────────────────────────
        logger.info(f"[{job_id}] Downloading video...")
        if job["input_type"] == "youtube":
            downloader.download_from_youtube(job["youtube_url"], raw_path)
        else:
            signed_url = queries.download_video_signed_url(job["storage_path"])
            downloader.download_from_storage(signed_url, raw_path)

        # ── 1b. Capture thumbnail ─────────────────────────────────────
        thumb_url = thumb_mod.capture_and_upload(raw_path, user_id, job_id)
        if thumb_url:
            queries.update_thumbnail_url(job_id, thumb_url)

        # ── 2. Validate duration ──────────────────────────────────────
        duration = ffmpeg_utils.get_duration(raw_path)
        if duration > settings.max_video_duration_s:
            raise ValueError(f"Video too long: {duration:.0f}s (max {settings.max_video_duration_s}s)")

        # ── 3. Pre-process ────────────────────────────────────────────
        logger.info(f"[{job_id}] Preprocessing with ffmpeg...")
        ffmpeg_utils.preprocess_video(raw_path, processed_path, audio_path)

        # ── 4. Transcribe ─────────────────────────────────────────────
        logger.info(f"[{job_id}] Transcribing with Whisper...")
        transcript_df = transcriber.transcribe(audio_path)

        # ── 5. Motion scores ──────────────────────────────────────────
        logger.info(f"[{job_id}] Computing motion scores...")
        motion_scores, motion_times, video_fps = motion.compute_motion(processed_path)

        # ── 6. Audio analysis ─────────────────────────────────────────
        logger.info(f"[{job_id}] Analyzing audio...")
        rms, rms_times, silence_threshold, silence_analysis = audio_analysis.analyze_audio(audio_path)

        # ── 7. Align onto 1-second grid ───────────────────────────────
        video_duration = int(motion_times[-1]) if motion_times else int(duration)
        motion_arr = np.array(motion_scores)
        motion_t_arr = np.array(motion_times)

        motion_per_second = np.zeros(video_duration)
        rms_per_second = np.zeros(video_duration)
        speech_rate_per_sec = np.zeros(video_duration)

        for sec in range(video_duration):
            m_mask = (motion_t_arr >= sec) & (motion_t_arr < sec + 1)
            if m_mask.any():
                motion_per_second[sec] = motion_arr[m_mask].mean()

            r_mask = (rms_times >= sec) & (rms_times < sec + 1)
            if r_mask.any():
                rms_per_second[sec] = rms[r_mask].mean()

        for _, row in transcript_df.iterrows():
            words = len(row["text"].strip().split())
            dur = max(row["end"] - row["start"], 0.1)
            wps = words / dur
            for sec in range(int(row["start"]), min(int(row["end"]) + 1, video_duration)):
                speech_rate_per_sec[sec] = wps

        # Adaptive thresholds
        motion_low  = float(np.percentile(motion_per_second, 25))
        motion_high = float(np.percentile(motion_per_second, 75))
        rms_positive = rms_per_second[rms_per_second > 0]
        rms_low  = float(np.percentile(rms_positive, 20)) if len(rms_positive) else silence_threshold
        rms_high = float(np.percentile(rms_per_second, 75))
        active_wps = speech_rate_per_sec[speech_rate_per_sec > 0]
        avg_speech_rate = float(active_wps.mean()) if len(active_wps) else 2.5

        # ── 8. Continuity ─────────────────────────────────────────────
        logger.info(f"[{job_id}] Computing narrative continuity...")
        continuity_scores, continuity_per_sec = continuity.compute_continuity(transcript_df, video_duration)

        # ── 9. Attention model ────────────────────────────────────────
        logger.info(f"[{job_id}] Running attention model...")
        raw_curve = attention.compute_attention_curve(
            video_duration, motion_per_second, rms_per_second,
            speech_rate_per_sec, continuity_per_sec,
            motion_low, motion_high, rms_low, rms_high, avg_speech_rate,
        )
        smoothed_curve = attention.smooth_curve(raw_curve)
        drops = attention.detect_drops(raw_curve)
        annotated_drops = attention.annotate_drops(
            drops, motion_per_second, rms_per_second, speech_rate_per_sec,
            continuity_per_sec, motion_low, rms_low, avg_speech_rate,
        )

        # ── 10. Score ─────────────────────────────────────────────────
        curve = np.array(smoothed_curve)
        n = len(curve)
        s_avg = float(curve[:n // 3].mean()) if n >= 3 else float(curve.mean())
        m_avg = float(curve[n // 3: 2 * n // 3].mean()) if n >= 3 else float(curve.mean())
        e_avg = float(curve[2 * n // 3:].mean()) if n >= 3 else float(curve.mean())
        o_avg = float(curve.mean())
        avg_continuity = float(np.mean(continuity_scores)) if continuity_scores else 0.5
        severe_drops = [d for d in drops if d["drop"] > 10]
        drop_penalty = min(25, len(severe_drops) * 5)

        final_score = round(float(np.clip(
            o_avg * 0.50 + avg_continuity * 100 * 0.20 + s_avg * 0.15 - drop_penalty * 0.15,
            0, 100,
        )), 1)
        grade = "A" if final_score >= 80 else "B" if final_score >= 70 else "C" if final_score >= 60 else "D" if final_score >= 50 else "F"

        # ── 11. GPT insights ──────────────────────────────────────────
        logger.info(f"[{job_id}] Generating GPT insights...")
        hook_text = " ".join(transcript_df[transcript_df["start"] < 15]["text"].tolist())
        transcript_excerpt = " ".join(transcript_df["text"].tolist())
        gpt_result = gpt_insights.generate_insights(
            final_score, grade, s_avg, m_avg, e_avg,
            annotated_drops, silence_analysis,
            avg_continuity, avg_speech_rate,
            transcript_excerpt, hook_text,
        )

        # ── 12. Build transcript segments ─────────────────────────────
        segments = transcript_df.to_dict("records")

        # ── 13. Serialize 1-second grids ─────────────────────────────
        def to_sec_list(arr: np.ndarray, key: str) -> list[dict]:
            return [{"sec": i, key: round(float(v), 3)} for i, v in enumerate(arr)]

        attention_curve_data = [{"sec": i, "score": round(float(v), 1)} for i, v in enumerate(smoothed_curve)]

        dead_silence_count = sum(1 for s in silence_analysis if s["type"] == "dead_silence")
        dramatic_pause_count = sum(1 for s in silence_analysis if s["type"] == "dramatic_pause")

        # ── 14. Save to Supabase ──────────────────────────────────────
        analysis = {
            "job_id": job_id,
            "user_id": user_id,
            "overall_score": final_score,
            "grade": grade,
            "start_score": round(s_avg, 1),
            "middle_score": round(m_avg, 1),
            "end_score": round(e_avg, 1),
            "attention_curve": attention_curve_data,
            "motion_per_sec": to_sec_list(motion_per_second, "score"),
            "rms_per_sec": to_sec_list(rms_per_second, "score"),
            "transcript_segments": segments,
            "avg_speech_rate_wps": round(avg_speech_rate, 2),
            "full_transcript": transcript_excerpt,
            "attention_drops": annotated_drops,
            "severe_drop_count": len(severe_drops),
            "silence_regions": silence_analysis,
            "dead_silence_count": dead_silence_count,
            "dramatic_pause_count": dramatic_pause_count,
            "avg_continuity": round(avg_continuity, 3),
            "gpt_summary": gpt_result.get("summary", ""),
            "gpt_hook_analysis": gpt_result.get("hook_analysis", ""),
            "gpt_recommendations": gpt_result.get("recommendations", []),
            "gpt_tags": gpt_result.get("tags", []),
            "video_duration_s": round(duration, 1),
            "video_fps": round(video_fps, 2),
        }

        queries.save_analysis(analysis)
        logger.info(f"[{job_id}] Done. Score={final_score} Grade={grade}")

        # ── 15. Delete uploaded video from storage (keep only thumbnail) ─
        if job.get("storage_path"):
            queries.delete_storage_video(job["storage_path"])

    finally:
        # Always clean up tmp files
        shutil.rmtree(tmp_dir, ignore_errors=True)
