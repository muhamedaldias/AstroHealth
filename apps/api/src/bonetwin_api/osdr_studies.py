"""NASA OSDR study bundles served offline from data/processed/osdr/.

The bundles are reference data committed with the repo (cached OSDR API responses
from the frontend-data branch). Reads never touch the network at request time.
"""

from __future__ import annotations

import json
from pathlib import Path

from bonetwin_contracts import OsdrStudiesPayload, OsdrStudy
from fastapi import HTTPException

from .config import find_repo_root

_BUNDLES_DIR = Path("data") / "processed" / "osdr"
_SOURCE = "https://visualization.osdr.nasa.gov/biodata/api/v2"
_REPOSITORY = "NASA Open Science Data Repository (OSDR)"


def load_osdr_studies() -> OsdrStudiesPayload:
    files = sorted((find_repo_root() / _BUNDLES_DIR).glob("bundle_OSD-*.json"))
    if not files:
        raise HTTPException(status_code=503, detail="OSDR data directory missing or empty")
    studies = [
        OsdrStudy.model_validate({**json.loads(p.read_text(encoding="utf-8"))["data"], "stale": False})
        for p in files
    ]
    return OsdrStudiesPayload(
        source=_SOURCE,
        repository=_REPOSITORY,
        count=len(studies),
        expected_count=len(studies),
        sync_status="ready",
        studies=studies,
    )
