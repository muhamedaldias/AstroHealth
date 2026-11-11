from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from twin_core import get_engine

from . import __version__, errors
from .catalog import Catalog
from .config import Settings, find_repo_root
from .db import make_session_factory
from .repository import MeasurementRepository
from .routes.api import router
from .service import ForecastService


def create_app(settings: Settings | None = None, database_url: str | None = None) -> FastAPI:
    settings = settings or Settings()
    root = find_repo_root()
    app = FastAPI(title="Astro Bone Twin API", version=__version__)
    errors.install(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    catalog = Catalog(root / "contracts" / "fixtures")
    repo = MeasurementRepository(make_session_factory(database_url or settings.database_url))
    repo.seed_if_empty(catalog.seed_measurements)
    engine = get_engine(settings.engine)

    app.state.catalog, app.state.repo, app.state.engine = catalog, repo, engine
    app.state.service = ForecastService(catalog, repo, engine)
    app.include_router(router)

    dist = Path(root / "apps" / "web" / "dist")
    if settings.serve_web and dist.exists():
        app.mount("/", StaticFiles(directory=dist, html=True), name="web")
    return app
