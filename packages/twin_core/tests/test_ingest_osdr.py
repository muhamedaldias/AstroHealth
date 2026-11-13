"""Offline test of the OSDR client using a mocked transport (no network)."""

from __future__ import annotations

import httpx
import pytest
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


def test_download_neutralizes_backslash_traversal(tmp_path) -> None:
    """A Windows-separator traversal payload must be defused to a flat name inside dest."""

    def handler(req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"evil")

    client = httpx.Client(transport=httpx.MockTransport(handler))
    out = osdr.download("/x?file=..\\..\\evil.txt", tmp_path, client)
    assert out == tmp_path / "evil.txt" and out.read_bytes() == b"evil"


@pytest.mark.parametrize("file_param", ["..", "./", "a/"])
def test_download_rejects_unsafe_derived_names(tmp_path, file_param: str) -> None:
    """Names that survive normalization as '', '.' or '..' must be rejected, not written."""

    def handler(req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"evil")

    client = httpx.Client(transport=httpx.MockTransport(handler))
    with pytest.raises(ValueError):
        osdr.download(f"/x?file={file_param}", tmp_path, client)
    assert list(tmp_path.iterdir()) == []
