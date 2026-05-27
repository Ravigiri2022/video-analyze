import numpy as np
import librosa


def analyze_audio(audio_path: str) -> tuple[np.ndarray, np.ndarray, float, list[dict]]:
    HOP_LENGTH = 512
    y, sr = librosa.load(audio_path)

    rms = librosa.feature.rms(y=y, hop_length=HOP_LENGTH)[0]
    times = librosa.times_like(rms, sr=sr, hop_length=HOP_LENGTH)

    nonzero = rms[rms > 0]
    silence_threshold = float(np.percentile(nonzero, 20)) if len(nonzero) else 0.02
    silence_regions_mask = rms < silence_threshold

    p25 = float(np.percentile(rms, 25))
    p75 = float(np.percentile(rms, 75))

    def classify_silence(index: int, window: int = 10) -> str:
        before = np.mean(rms[max(0, index - window):index])
        after  = np.mean(rms[index:min(len(rms), index + window)])
        if before > p75 and after > p75:
            return "dramatic_pause"
        elif before < p25 and after < p25:
            return "dead_silence"
        return "neutral_pause"

    silence_analysis: list[dict] = []
    for i, silent in enumerate(silence_regions_mask):
        if silent:
            stype = classify_silence(i)
            if stype != "neutral_pause":
                silence_analysis.append({"time": float(times[i]), "type": stype})

    return rms, times, silence_threshold, silence_analysis
