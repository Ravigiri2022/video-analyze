import os
import subprocess
import httpx
from config import settings


def download_from_storage(signed_url: str, dest: str) -> None:
    with httpx.stream("GET", signed_url, follow_redirects=True, timeout=300) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_bytes(chunk_size=8192):
                f.write(chunk)


def download_from_youtube(youtube_url: str, dest: str) -> None:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    cmd = [
        "yt-dlp",
        "--no-playlist",
        "--max-filesize", f"{settings.max_file_size_mb}m",
        "--match-filter", f"duration <= {settings.max_video_duration_s}",
        "-f", "bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "-o", dest,
        "--no-warnings",
    ]
    if settings.ytdlp_cookies_from_browser:
        cmd += ["--cookies-from-browser", settings.ytdlp_cookies_from_browser]
    cmd.append(youtube_url)
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr[:300]}")
