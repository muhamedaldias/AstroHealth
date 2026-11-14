from __future__ import annotations

import os
from pathlib import Path

from bonetwin_contracts import Error
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.datastructures import Headers
from starlette.types import ASGIApp, Receive, Scope, Send
from twin_core import get_engine

from . import __version__, errors
from .catalog import Catalog
from .config import Settings, find_repo_root
from .db import make_session_factory
from .repository import MeasurementRepository
from .routes.api import router
from .service import ForecastService
from .telemetry import TelemetryService

MAX_BODY_BYTES = 1_000_000


class BodySizeLimitMiddleware:
    """Reject requests whose declared Content-Length exceeds the cap with a contract 413.

    Chunked/streamed requests without a Content-Length header pass through unchecked.
    """

    def __init__(self, app: ASGIApp, max_bytes: int = MAX_BODY_BYTES) -> None:
        self.app, self.max_bytes = app, max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            length = Headers(scope=scope).get("content-length")
            if length is not None and length.isdigit() and int(length) > self.max_bytes:
                err = Error(
                    code="request_too_large",
                    message="Request body too large",
                    details={"limit_bytes": self.max_bytes},
                )
                response = JSONResponse(status_code=413, content=err.model_dump(mode="json"))
                await response(scope, receive, send)
                return
        await self.app(scope, receive, send)


def create_app(settings: Settings | None = None, database_url: str | None = None) -> FastAPI:
    settings = settings or Settings()
    try:
        root = find_repo_root()
    except RuntimeError:
        # Serverless bundle: no repo root; data paths come from env overrides below.
        root = None
    app = FastAPI(title="Astro Bone Twin API", version=__version__)
    errors.install(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(BodySizeLimitMiddleware)

    # Serverless bundles ship fixtures outside the repo; BONETWIN_FIXTURES_DIR points at them.
    fixtures_env = os.environ.get("BONETWIN_FIXTURES_DIR")
    if fixtures_env:
        fixtures_dir = Path(fixtures_env)
    elif root is not None:
        fixtures_dir = root / "contracts" / "fixtures"
    else:
        raise RuntimeError("repo root not found and BONETWIN_FIXTURES_DIR not set")
    catalog = Catalog(fixtures_dir)
    repo = MeasurementRepository(make_session_factory(database_url or settings.database_url))
    repo.seed_if_empty(catalog.seed_measurements)
    engine = get_engine(settings.engine)

    service = ForecastService(catalog, repo, engine)
    app.state.catalog, app.state.repo, app.state.engine = catalog, repo, engine
    app.state.service = service
    app.state.telemetry = TelemetryService(catalog, service)
    app.include_router(router)

    if settings.serve_web:
        if root is None:
            raise RuntimeError("repo root not found; serve_web requires a repo checkout")
        dist = Path(root / "apps" / "web" / "dist")
        if dist.exists():
            app.mount("/", StaticFiles(directory=dist, html=True), name="web")
    return app
