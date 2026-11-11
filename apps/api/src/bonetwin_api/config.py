from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def find_repo_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "contracts" / "openapi.yaml").exists():
            return parent
    raise RuntimeError("repo root not found (expected contracts/openapi.yaml above this file)")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BONETWIN_", env_file=".env", extra="ignore")

    engine: str = "stub"
    database_url: str = "sqlite:///./data/runtime/app.db"
    cors_origins: list[str] = ["http://localhost:5173"]
    serve_web: bool = False
