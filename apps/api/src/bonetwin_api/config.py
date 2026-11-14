from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def find_repo_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "contracts" / "openapi.yaml").exists():
            return parent
    raise RuntimeError("repo root not found (expected contracts/openapi.yaml above this file)")


def _find_project_root() -> Path | None:
    # Repo root is identifiable by pyproject.toml; bounded walk (max 6 levels up).
    for parent in Path(__file__).resolve().parents[:6]:
        if (parent / "pyproject.toml").exists():
            return parent
    return None


def resolve_database_url(url: str) -> str:
    """Anchor CWD-relative SQLite paths to the repo root before create_engine.

    The default `sqlite:///./data/runtime/app.db` is CWD-relative: starting uvicorn
    from another directory silently creates a fresh empty DB (db.py mkdirs it into
    "working"). Absolute paths (incl. Docker's `sqlite:////...`) and `:memory:` pass through.
    """
    if not url.startswith("sqlite:///"):
        return url
    raw = url.removeprefix("sqlite:///")
    if raw.startswith("/") or raw == ":memory:":
        return url
    root = _find_project_root()
    if root is None:  # not inside a checkout: keep legacy CWD-relative behavior
        return url
    return f"sqlite:///{(root / raw).resolve()}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BONETWIN_", env_file=".env", extra="ignore")

    engine: str = "stub"
    database_url: str = "sqlite:///./data/runtime/app.db"
    cors_origins: list[str] = ["http://localhost:5173"]
    serve_web: bool = False
