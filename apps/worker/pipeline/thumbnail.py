import os
import subprocess
import logging
from db.client import get_client
from config import settings

logger = logging.getLogger(__name__)


def capture_and_upload(video_path: str, user_id: str, job_id: str) -> str | None:
    """Extract a frame at 5% of the video, resize to 320x180, upload to thumbnails bucket."""
    thumb_path = f"{video_path}_thumb.jpg"
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", video_path],
            capture_output=True, text=True, timeout=30,
        )
        duration = float(probe.stdout.strip() or "10")
        seek = max(1.0, duration * 0.05)

        result = subprocess.run([
            "ffmpeg", "-y",
            "-ss", str(seek),
            "-i", video_path,
            "-vframes", "1",
            "-vf", "scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2:color=black",
            "-q:v", "5",
            thumb_path,
        ], capture_output=True, text=True, timeout=30)

        if result.returncode != 0 or not os.path.exists(thumb_path):
            return None

        db = get_client()
        storage_key = f"{user_id}/{job_id}.jpg"
        with open(thumb_path, "rb") as f:
            db.storage.from_("thumbnails").upload(
                path=storage_key,
                file=f,
                file_options={"content-type": "image/jpeg", "upsert": "true"},
            )

        base = settings.supabase_url.rstrip("/")
        return f"{base}/storage/v1/object/public/thumbnails/{storage_key}"

    except Exception as e:
        logger.warning(f"[thumbnail] failed: {e}")
        return None
    finally:
        if os.path.exists(thumb_path):
            os.remove(thumb_path)
