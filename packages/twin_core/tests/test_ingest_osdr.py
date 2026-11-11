"""Offline test of the OSDR client using a mocked transport (no network)."""

from __future__ import annotations

import httpx
from twin_core.ingest import osdr


def test_study_files_and_download(tmp_path) -> None:
    def handler(req: httpx.Request) -> httpx.Response:
        if req.url.path.startswith("/osdr/data/osd/files/"):
            return httpx.Response(200, json={"87": {"study_files": [{"remote_url": "/x?file=a.csv"}]}})
        return httpx.Response(200, content=b"abc")

    client = httpx.Client(transport=httpx.MockTransport(handler))
    data = osdr.study_files("87", client)
    url = data["87"]["study_files"][0]["remote_url"]
    out = osdr.download(url, tmp_path, client)
    assert out.name == "a.csv" and out.read_bytes() == b"abc"
