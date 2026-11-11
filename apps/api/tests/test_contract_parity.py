"""The running API must expose EXACTLY the operations declared in contracts/openapi.yaml."""

from __future__ import annotations

from pathlib import Path

import yaml

from bonetwin_api.config import Settings
from bonetwin_api.main import create_app

SPEC = Path(__file__).resolve().parents[3] / "contracts" / "openapi.yaml"
METHODS = {"get", "post", "put", "patch", "delete"}


def _ops(paths: dict) -> set[tuple[str, str, str]]:
    return {
        (m.upper(), p, op["operationId"])
        for p, item in paths.items()
        for m, op in item.items()
        if m in METHODS
    }


def test_api_matches_contract_operations() -> None:
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    app = create_app(Settings(engine="stub"), database_url="sqlite://")
    declared, implemented = _ops(spec["paths"]), _ops(app.openapi()["paths"])
    assert implemented == declared, (
        f"\nmissing in API: {sorted(declared - implemented)}"
        f"\nnot in contract: {sorted(implemented - declared)}"
    )


def test_declared_success_status_codes_match() -> None:
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    app = create_app(Settings(engine="stub"), database_url="sqlite://")
    live = app.openapi()["paths"]
    for path, item in spec["paths"].items():
        for method, op in item.items():
            ok = {c for c in op["responses"] if c.startswith("2")}
            got = {c for c in live[path][method]["responses"] if c.startswith("2")}
            assert ok == got, f"{method.upper()} {path}: contract {ok} vs api {got}"
