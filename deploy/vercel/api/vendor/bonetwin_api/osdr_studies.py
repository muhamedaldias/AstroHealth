"""NASA OSDR study bundles served offline from data/processed/osdr/.

The bundles are reference data committed with the repo (cached OSDR API responses
from the frontend-data branch). Reads never touch the network at request time.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path

from bonetwin_contracts import OsdrStudiesPayload, OsdrStudy
from fastapi import HTTPException
from pydantic import ValidationError

from .config import find_repo_root

logger = logging.getLogger(__name__)

_BUNDLES_DIR = Path("data") / "processed" / "osdr"
_SOURCE = "https://visualization.osdr.nasa.gov/biodata/api/v2"
_REPOSITORY = "NASA Open Science Data Repository (OSDR)"


def load_osdr_studies() -> OsdrStudiesPayload:
    # Serverless bundles ship OSDR data outside the repo; BONETWIN_OSDR_DIR points at it.
    env_dir = os.environ.get("BONETWIN_OSDR_DIR")
    bundles_dir = Path(env_dir) if env_dir else find_repo_root() / _BUNDLES_DIR
    files = sorted(bundles_dir.glob("bundle_OSD-*.json"))
    if not files:
        raise HTTPException(status_code=503, detail="OSDR data directory missing or empty")
    studies: list[OsdrStudy] = []
    for p in files:
        # A corrupt bundle is skipped with a warning instead of failing the whole endpoint.
        try:
            data = json.loads(p.read_text(encoding="utf-8"))["data"]
            studies.append(OsdrStudy.model_validate({**data, "stale": False}))
        except (json.JSONDecodeError, KeyError, OSError, TypeError, ValidationError):
            logger.warning("skipping corrupt OSDR bundle: %s", p.name)
    if not studies:
        raise HTTPException(status_code=503, detail="all OSDR bundles are corrupt or unreadable")
    return OsdrStudiesPayload(
        source=_SOURCE,
        repository=_REPOSITORY,
        count=len(studies),
        expected_count=len(studies),
        sync_status="ready",
        studies=studies,
    )
