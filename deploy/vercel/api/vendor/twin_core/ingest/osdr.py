"""Minimal NASA OSDR client (offline preparation step, never used at inference time).

Endpoints (documented by NASA OSDR):
  files:    https://osdr.nasa.gov/osdr/data/osd/files/{OSD ids}/
Download URL of a file = "https://osdr.nasa.gov" + study_files[i]["remote_url"].
Raw downloads go to data/raw/ (git-ignored). Credit: "Data are courtesy of the NASA Open
Science Data Repository (https://osdr.nasa.gov/bio/repo)".
"""

from __future__ import annotations

from pathlib import Path

import httpx

FILES_URL = "https://osdr.nasa.gov/osdr/data/osd/files/{ids}/"
HOST = "https://osdr.nasa.gov"


def study_files(osd_ids: str, client: httpx.Client | None = None) -> dict:
    """List files of one or more studies, e.g. study_files("87") or study_files("137.1,86-87")."""
    c = client or httpx.Client(timeout=60)
    r = c.get(FILES_URL.format(ids=osd_ids), params={"page": 0, "size": 25, "all_files": "true"})
    r.raise_for_status()
    return r.json()


def download(remote_url: str, dest_dir: Path, client: httpx.Client | None = None) -> Path:
    """Download one file (using a `remote_url` from `study_files`) into dest_dir."""
    c = client or httpx.Client(timeout=300, follow_redirects=True)
    dest_dir.mkdir(parents=True, exist_ok=True)
    # Normalize Windows separators so `..\..\x` cannot traverse out of dest_dir.
    name = remote_url.split("file=")[-1].replace("\\", "/").split("/")[-1]
    if name in ("", ".", ".."):
        raise ValueError(f"unsafe file name derived from remote_url: {remote_url!r}")
    out = dest_dir / name
    with c.stream("GET", HOST + remote_url) as r:
        r.raise_for_status()
        with out.open("wb") as f:
            for chunk in r.iter_bytes():
                f.write(chunk)
    return out
