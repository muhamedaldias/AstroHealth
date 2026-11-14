"""Edge cases: forecast 404s, duplicate countermeasure dedupe, SQLite URL anchoring."""

from __future__ import annotations

from pathlib import Path

import bonetwin_contracts as c
from fastapi.testclient import TestClient

from bonetwin_api.config import resolve_database_url


def test_forecast_unknown_crew_is_not_found(client: TestClient) -> None:
    r = client.post(
        "/api/v1/forecast",
        json={
            "crew_id": "crew-nope",
            "scenario_id": "iss-180",
            "countermeasure_ids": ["resistive_exercise"],
        },
    )
    assert r.status_code == 404
    assert c.Error.model_validate(r.json()).code == "not_found"


def test_forecast_unknown_scenario_is_not_found(client: TestClient) -> None:
    r = client.post(
        "/api/v1/forecast",
        json={
            "crew_id": "crew-01",
            "scenario_id": "mars-9999",
            "countermeasure_ids": ["resistive_exercise"],
        },
    )
    assert r.status_code == 404
    assert c.Error.model_validate(r.json()).code == "not_found"


def test_forecast_duplicate_countermeasure_ids_are_applied_once(client: TestClient) -> None:
    r = client.post(
        "/api/v1/forecast",
        json={
            "crew_id": "crew-01",
            "scenario_id": "iss-180",
            "countermeasure_ids": ["resistive_exercise", "resistive_exercise"],
        },
    )
    assert r.status_code == 200
    f = c.Forecast.model_validate(r.json())
    assert f.countermeasure_ids == ["resistive_exercise"]


def test_relative_sqlite_url_resolves_to_repo_root() -> None:
    resolved = resolve_database_url("sqlite:///./data/runtime/app.db")
    path = Path(resolved.removeprefix("sqlite:///"))
    assert path.is_absolute()
    assert str(path).endswith("data/runtime/app.db")
    assert any((parent / "pyproject.toml").exists() for parent in path.parents)
    # absolute (incl. Docker's 4-slash form) and in-memory URLs pass through unchanged
    assert resolve_database_url("sqlite:///:memory:") == "sqlite:///:memory:"
    absolute = "sqlite:////opt/AstroHealth/data/runtime/app.db"
    assert resolve_database_url(absolute) == absolute
