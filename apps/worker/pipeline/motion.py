import cv2
import numpy as np


def compute_motion(video_path: str, sample_every: int = 5) -> tuple[list[float], list[float], float]:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    motion_scores: list[float] = []
    motion_times: list[float] = []
    prev = None
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % sample_every == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            ts = frame_idx / fps
            if prev is not None:
                diff = cv2.absdiff(prev, gray)
                motion_scores.append(float(diff.mean()))
                motion_times.append(ts)
            prev = gray
        frame_idx += 1

    cap.release()
    return motion_scores, motion_times, fps
