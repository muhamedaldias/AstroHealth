from __future__ import annotations

import bonetwin_contracts as c
from fastapi.testclient import TestClient


def test_health_and_model_info(client: TestClient) -> None:
    h = c.Health.model_validate(client.get("/api/v1/health").json())
    assert h.engine.name == "stub"
    c.ModelInfo.model_validate(client.get("/api/v1/model-info").json())


def test_catalogs(client: TestClient) -> None:
    assert c.ScenarioList.model_validate(client.get("/api/v1/scenarios").json()).items
    assert c.CountermeasureList.model_validate(client.get("/api/v1/countermeasures").json()).items
    crew = c.CrewList.model_validate(client.get("/api/v1/crew").json())
    assert len(crew.items) == 4


def test_unknown_crew_is_contract_error(client: TestClient) -> None:
    r = client.get("/api/v1/crew/nope")
    assert r.status_code == 404
    assert c.Error.model_validate(r.json()).code == "not_found"


def test_measurements_roundtrip(client: TestClient) -> None:
    before = c.MeasurementList.model_validate(client.get("/api/v1/crew/crew-01/measurements").json())
    r = client.post(
        "/api/v1/crew/crew-01/measurements",
        json={"mission_day": 120, "marker": "ctx", "value": 0.61},
    )
    assert r.status_code == 201
    m = c.Measurement.model_validate(r.json())
    assert m.unit == "ng/mL"
    after = c.MeasurementList.model_validate(client.get("/api/v1/crew/crew-01/measurements").json())
    assert len(after.items) == len(before.items) + 1


def test_measurement_validation_error_is_contract_error(client: TestClient) -> None:
    r = client.post(
        "/api/v1/crew/crew-01/measurements",
        json={"mission_day": 1, "marker": "not-a-marker", "value": 1},
    )
    assert r.status_code == 422
    assert c.Error.model_validate(r.json()).code == "validation_error"


def test_forecast(client: TestClient) -> None:
    r = client.post(
        "/api/v1/forecast",
        json={
            "crew_id": "crew-01",
            "scenario_id": "iss-180",
            "countermeasure_ids": ["resistive_exercise"],
        },
    )
    assert r.status_code == 200
    f = c.Forecast.model_validate(r.json())
    assert f.horizon_days == 180 and f.countermeasure_ids == ["resistive_exercise"]


def test_forecast_unknown_countermeasure(client: TestClient) -> None:
    r = client.post(
        "/api/v1/forecast",
        json={
            "crew_id": "crew-01",
            "scenario_id": "iss-180",
            "countermeasure_ids": ["magic"],
        },
    )
    assert r.status_code == 404
    assert c.Error.model_validate(r.json()).details["resource"] == "countermeasure"


def test_whatif_more_protection_means_less_loss(client: TestClient) -> None:
    r = client.post(
        "/api/v1/whatif",
        json={
            "crew_id": "crew-01",
            "scenario_id": "iss-180",
            "plans": [
                {
                    "plan_id": "none",
                    "label": "No countermeasures",
                    "countermeasure_ids": [],
                },
                {
                    "plan_id": "ex",
                    "label": "Exercise",
                    "countermeasure_ids": ["resistive_exercise"],
                },
            ],
        },
    )
    assert r.status_code == 200
    res = c.WhatIfResponse.model_validate(r.json()).results

    def end(f: c.Forecast) -> float:
        return f.sites[0].points[-1].mean_pct_change

    assert end(res[1].forecast) > end(res[0].forecast)  # less negative


def test_whatif_needs_two_plans(client: TestClient) -> None:
    r = client.post(
        "/api/v1/whatif",
        json={
            "crew_id": "crew-01",
            "scenario_id": "iss-180",
            "plans": [{"plan_id": "a", "label": "a", "countermeasure_ids": []}],
        },
    )
    assert r.status_code == 422
