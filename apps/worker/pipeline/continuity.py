import math
from collections import Counter

import numpy as np
import pandas as pd


def _tfidf_matrix(texts: list[str]) -> np.ndarray:
    tokenized = [t.lower().split() for t in texts]
    df: Counter = Counter()
    for words in tokenized:
        df.update(set(words))

    vocab = {w: i for i, w in enumerate(df)}
    N = len(texts)
    mat = np.zeros((N, len(vocab)), dtype=np.float32)

    for i, words in enumerate(tokenized):
        tf = Counter(words)
        for word, cnt in tf.items():
            if word in vocab:
                mat[i, vocab[word]] = cnt * math.log(N / (df[word] + 1) + 1)

    # L2-normalise rows
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1
    return mat / norms


def compute_continuity(transcript_df: pd.DataFrame, video_duration: int) -> tuple[list[float], np.ndarray]:
    if transcript_df.empty:
        return [], np.full(video_duration, 0.5)

    texts = transcript_df["text"].tolist()
    if len(texts) < 2:
        return [], np.full(video_duration, 0.5)

    mat = _tfidf_matrix(texts)
    continuity_scores: list[float] = []
    for i in range(1, len(mat)):
        sim = float(np.dot(mat[i - 1], mat[i]))  # already normalised
        continuity_scores.append(max(0.0, min(1.0, sim)))

    continuity_per_sec = np.full(video_duration, 0.5)
    for i, score in enumerate(continuity_scores):
        if i + 1 >= len(transcript_df):
            break
        row = transcript_df.iloc[i + 1]
        for sec in range(int(row["start"]), min(int(row["end"]) + 1, video_duration)):
            continuity_per_sec[sec] = score

    return continuity_scores, continuity_per_sec
