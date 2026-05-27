import time
import logging
from datetime import datetime, timezone

from config import settings
from db import queries
from worker.processor import process_job

logger = logging.getLogger(__name__)


def run_poll_loop() -> None:
    logger.info(f"Worker started. Polling every {settings.poll_interval_s}s...")

    while True:
        try:
            job = queries.fetch_pending_job()
            if job:
                job_id = job["id"]
                logger.info(f"Picked up job {job_id} ({job['input_type']})")
                queries.mark_processing(job_id)
                started = time.time()
                try:
                    process_job(job)
                    elapsed = time.time() - started
                    queries.mark_done(job_id, elapsed)
                    logger.info(f"Job {job_id} completed in {elapsed:.1f}s")
                except Exception as e:
                    elapsed = time.time() - started
                    attempts = job.get("attempts", 0) + 1
                    logger.error(f"Job {job_id} failed (attempt {attempts}): {e}")
                    queries.mark_failed(job_id, str(e), attempts, settings.max_retries)
            else:
                time.sleep(settings.poll_interval_s)

        except Exception as e:
            logger.error(f"Poller loop error: {e}")
            time.sleep(settings.poll_interval_s)
