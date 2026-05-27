import time
import logging

from config import settings
from db import queries
from worker.processor import process_job

logger = logging.getLogger(__name__)

_BACKOFF_STEPS = [5, 10, 30, 60]


def run_poll_loop() -> None:
    logger.info(f"Worker started. Polling every {settings.poll_interval_s}s...")
    idle_step = 0

    while True:
        try:
            queries.reset_stuck_jobs()
            job = queries.fetch_pending_job()
            if job:
                idle_step = 0
                job_id = job["id"]
                logger.info(f"{'='*60}")
                logger.info(f"[{job_id}] START  type={job['input_type']}")
                queries.mark_processing(job_id)
                started = time.time()
                try:
                    process_job(job)
                    elapsed = time.time() - started
                    queries.mark_done(job_id, elapsed)
                    logger.info(f"[{job_id}] DONE   {elapsed:.1f}s")
                    logger.info(f"{'='*60}")
                except Exception as e:
                    elapsed = time.time() - started
                    attempts = job.get("attempts", 0) + 1
                    logger.error(f"[{job_id}] FAILED attempt={attempts} elapsed={elapsed:.1f}s")
                    logger.error(f"[{job_id}] ERROR: {e}")
                    logger.info(f"{'='*60}")
                    queries.mark_failed(job_id, str(e), attempts, settings.max_retries)
            else:
                delay = _BACKOFF_STEPS[min(idle_step, len(_BACKOFF_STEPS) - 1)]
                idle_step = min(idle_step + 1, len(_BACKOFF_STEPS) - 1)
                logger.debug(f"No jobs. Sleeping {delay}s (idle_step={idle_step})")
                time.sleep(delay)

        except Exception as e:
            logger.error(f"POLLER ERROR: {e}")
            time.sleep(settings.poll_interval_s)
