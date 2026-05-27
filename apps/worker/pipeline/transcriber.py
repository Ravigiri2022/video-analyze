import pandas as pd
from faster_whisper import WhisperModel
from config import settings

_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(settings.whisper_model, device="cpu", compute_type="int8")
    return _model


def transcribe(audio_path: str) -> pd.DataFrame:
    model = get_model()
    segments, _ = model.transcribe(audio_path, beam_size=5)
    rows = [{"start": s.start, "end": s.end, "text": s.text.strip()} for s in segments]
    return pd.DataFrame(rows) if rows else pd.DataFrame(columns=["start", "end", "text"])
