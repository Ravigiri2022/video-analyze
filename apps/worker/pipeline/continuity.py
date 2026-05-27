import numpy as np
import pandas as pd
from scipy.spatial.distance import cosine
from sentence_transformers import SentenceTransformer

_embedder = None


def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def compute_continuity(transcript_df: pd.DataFrame, video_duration: int) -> tuple[list[float], np.ndarray]:
    if transcript_df.empty:
        return [], np.full(video_duration, 0.5)

    embedder = get_embedder()
    embeddings = embedder.encode(transcript_df["text"].tolist())

    continuity_scores: list[float] = []
    for i in range(1, len(embeddings)):
        sim = 1.0 - cosine(embeddings[i - 1], embeddings[i])
        continuity_scores.append(float(sim))

    continuity_per_sec = np.full(video_duration, 0.5)
    for i in range(len(continuity_scores)):
        if i + 1 >= len(transcript_df):
            break
        row = transcript_df.iloc[i + 1]
        for sec in range(int(row["start"]), min(int(row["end"]) + 1, video_duration)):
            continuity_per_sec[sec] = continuity_scores[i]

    return continuity_scores, continuity_per_sec
