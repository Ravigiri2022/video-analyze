import time
import logging
from functools import wraps
from typing import Callable

logger = logging.getLogger(__name__)


def with_retry(max_attempts: int = 3, base_delay: float = 2.0):
    def decorator(fn: Callable):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    delay = base_delay ** attempt
                    logger.warning(f"Attempt {attempt} failed: {e}. Retrying in {delay:.0f}s...")
                    time.sleep(delay)
        return wrapper
    return decorator
