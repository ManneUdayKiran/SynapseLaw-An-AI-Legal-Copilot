from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator, model_validator
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    secret_key: str = Field(default="development-only-change-me", min_length=16)
    database_url: str = "sqlite:///./lexiguide.db"
    storage_dir: str | None = None
    cors_origins: str = "http://localhost:5173"
    access_token_expire_minutes: int = 60
    max_upload_bytes: int = 5 * 1024 * 1024

    llm_provider: str = "local"
    llm_model: str = "local-extractive"
    llm_api_key: str | None = None
    llm_base_url: str | None = "https://api.openai.com/v1"
    embedding_provider: str = "local"
    embedding_model: str = "hashing-v1"

    model_config = SettingsConfigDict(
        env_file=[str(Path(__file__).resolve().parent.parent.parent / ".env"), ".env"],
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.app_env.lower() != "development":
            if self.secret_key == "development-only-change-me" or len(self.secret_key) < 16:
                raise ValueError("secret_key must be configured with a strong non-default secret in non-development environments.")
        return self

    @field_validator("cors_origins")
    @classmethod
    def require_cors(cls, value: str) -> str:
        return value or "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def storage_path(self) -> Path:
        if self.storage_dir:
            return Path(self.storage_dir).expanduser().resolve()
        return (Path.home() / ".lexiguide" / "storage").resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()
