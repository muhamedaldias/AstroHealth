"""Every golden fixture must validate against the contract-generated models."""

from __future__ import annotations

import json
from pathlib import Path

import bonetwin_contracts as c
import pytest

FIXTURES = Path(__file__).resolve().parents[3] / "contracts" / "fixtures"
MANIFEST = {
    k: v for k, v in json.loads((FIXTURES / "manifest.json").read_text()).items() if not k.startswith("_")
}


@pytest.mark.parametrize("filename,schema", sorted(MANIFEST.items()))
def test_fixture_matches_schema(filename: str, schema: str) -> None:
    model = getattr(c, schema)
    model.model_validate(json.loads((FIXTURES / filename).read_text(encoding="utf-8")))


def test_every_fixture_is_in_manifest() -> None:
    files = {p.name for p in FIXTURES.glob("*.json")} - {"manifest.json"}
    assert files == set(MANIFEST), "add new fixtures to manifest.json"
