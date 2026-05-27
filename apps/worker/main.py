import logging
import threading
import os

from fastapi import FastAPI
from contextlib import asynccontextmanager

from config import settings
from worker.poller import run_poll_loop

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

os.makedirs(settings.tmp_dir, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the poller in a background thread
    thread = threading.Thread(target=run_poll_loop, daemon=True, name="poller")
    thread.start()
    yield


app = FastAPI(title="Vilyze Worker", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"service": "vilyze-worker", "status": "running"}
