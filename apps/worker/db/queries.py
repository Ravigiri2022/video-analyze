from datetime import datetime, timezone
from db.client import get_client


def fetch_pending_job() -> dict | None:
    db = get_client()
    res = (
        db.table("jobs")
        .select("*")
        .eq("status", "pending")
        .order("created_at", desc=False)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def mark_processing(job_id: str) -> None:
    db = get_client()
    db.table("jobs").update({
        "status": "processing",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "attempts": db.table("jobs").select("attempts").eq("id", job_id).execute().data[0]["attempts"] + 1,
    }).eq("id", job_id).execute()


def mark_done(job_id: str, processing_time_s: float) -> None:
    db = get_client()
    db.table("jobs").update({
        "status": "done",
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "processing_time_s": processing_time_s,
    }).eq("id", job_id).execute()


def mark_failed(job_id: str, error: str, attempts: int, max_retries: int) -> None:
    db = get_client()
    status = "failed" if attempts >= max_retries else "pending"
    db.table("jobs").update({
        "status": status,
        "error_message": error[:500],
        "finished_at": datetime.now(timezone.utc).isoformat() if status == "failed" else None,
    }).eq("id", job_id).execute()


def save_analysis(analysis: dict) -> None:
    db = get_client()
    db.table("analyses").upsert(analysis).execute()


def download_video_signed_url(storage_path: str) -> str:
    db = get_client()
    res = db.storage.from_("videos").create_signed_url(storage_path, expires_in=3600)
    return res["signedURL"]


def update_thumbnail_url(job_id: str, url: str) -> None:
    db = get_client()
    db.table("jobs").update({"thumbnail_url": url}).eq("id", job_id).execute()


def delete_storage_video(storage_path: str) -> None:
    try:
        db = get_client()
        db.storage.from_("videos").remove([storage_path])
    except Exception:
        pass
