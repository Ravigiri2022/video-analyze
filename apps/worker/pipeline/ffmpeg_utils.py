import subprocess


def preprocess_video(input_path: str, output_path: str, audio_path: str) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-vf", "scale=640:360", "-r", "24", output_path],
        check=True, capture_output=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", output_path, "-ar", "16000", "-ac", "1", audio_path],
        check=True, capture_output=True,
    )


def get_duration(video_path: str) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path],
        capture_output=True, text=True, check=True,
    )
    import json
    return float(json.loads(result.stdout)["format"]["duration"])
