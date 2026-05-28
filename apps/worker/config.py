from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    openrouter_api_key: str
    openrouter_model: str = "openrouter/owl-alpha"
    poll_interval_s: int = 5
    max_retries: int = 3
    max_video_duration_s: int = 300
    max_file_size_mb: int = 100
    rate_limit_jobs_per_hour: int = 5
    whisper_model: str = "tiny"
    log_level: str = "INFO"
    tmp_dir: str = "/tmp/vilyze"
    ytdlp_cookies_from_browser: str = "chrome"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()  # type: ignore[call-arg]
