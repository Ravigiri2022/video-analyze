import numpy as np


def compute_attention_curve(
    video_duration: int,
    motion_per_second: np.ndarray,
    rms_per_second: np.ndarray,
    speech_rate_per_sec: np.ndarray,
    continuity_per_sec: np.ndarray,
    motion_low: float,
    motion_high: float,
    rms_low: float,
    rms_high: float,
    avg_speech_rate: float,
) -> list[float]:
    BASELINE = 65.0
    attention = 70.0
    attention_curve: list[float] = []

    for sec in range(video_duration):
        signal = 0.0

        m = motion_per_second[sec]
        if   m < motion_low:   signal -= 2.0
        elif m > motion_high:  signal += 2.0

        r = rms_per_second[sec]
        if   r < rms_low:      signal -= 3.0
        elif r >= rms_high:    signal += 2.0
        elif r > rms_low:      signal += 0.5

        wps = speech_rate_per_sec[sec]
        if   wps == 0:                        signal -= 1.0
        elif wps < avg_speech_rate * 0.6:     signal -= 0.5
        elif wps > avg_speech_rate * 1.4:     signal += 2.0
        else:                                 signal += 0.5

        c = continuity_per_sec[sec]
        if   c < 0.30:  signal -= 2.0
        elif c > 0.65:  signal += 1.0

        target    = BASELINE + signal * 5.0
        attention = attention * 0.80 + target * 0.20
        attention = float(np.clip(attention, 20.0, 100.0))
        attention_curve.append(attention)

    return attention_curve


def smooth_curve(data: list[float], window_size: int = 10) -> list[float]:
    arr = np.array(data, dtype=float)
    kernel = np.ones(window_size * 2 + 1)
    padded = np.pad(arr, window_size, mode="edge")
    smoothed = np.convolve(padded, kernel / kernel.sum(), mode="valid")
    return smoothed.tolist()


def detect_drops(attention_curve: list[float]) -> list[dict]:
    drops: list[dict] = []
    i = 1
    while i < len(attention_curve):
        if attention_curve[i] < attention_curve[i - 1]:
            drop_start = i - 1
            drop_end = i
            while drop_end < len(attention_curve) - 1 and attention_curve[drop_end] >= attention_curve[drop_end + 1]:
                drop_end += 1
            total_drop = attention_curve[drop_start] - attention_curve[drop_end]
            duration = drop_end - drop_start
            if total_drop > 5 and duration >= 3:
                drops.append({
                    "start_sec": drop_start,
                    "end_sec": drop_end,
                    "start_score": round(attention_curve[drop_start], 1),
                    "end_score": round(attention_curve[drop_end], 1),
                    "drop": round(total_drop, 1),
                    "duration_sec": duration,
                })
            i = drop_end + 1
        else:
            i += 1
    return drops


def annotate_drops(
    drops: list[dict],
    motion_per_second: np.ndarray,
    rms_per_second: np.ndarray,
    speech_rate_per_sec: np.ndarray,
    continuity_per_sec: np.ndarray,
    motion_low: float,
    rms_low: float,
    avg_speech_rate: float,
) -> list[dict]:
    annotated = []
    for d in drops:
        s, e = d["start_sec"], d["end_sec"]
        reasons: list[str] = []

        if rms_per_second[s:e].mean() < rms_low:
            reasons.append("sustained silence — no audio payoff")
        if motion_per_second[s:e].mean() < motion_low:
            reasons.append("static visuals — nothing to watch")
        if speech_rate_per_sec[s:e].mean() < avg_speech_rate * 0.5:
            reasons.append("speech is too slow or absent")
        if continuity_per_sec[s:e].mean() < 0.35:
            reasons.append("abrupt topic shift loses viewer context")
        if not reasons:
            reasons.append("gradual energy loss — add a beat or visual cut")

        annotated.append({**d, "cause": " | ".join(reasons)})
    return annotated
