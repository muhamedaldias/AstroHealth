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


def test_measurement_value_rejects_non_finite(client: TestClient) -> None:
    # 1e999 parses to float inf; httpx json= cannot send Infinity so we post raw bytes.
    r = client.post(
        "/api/v1/crew/crew-01/measurements",
        content=b'{"marker":"ctx","mission_day":30,"value": 1e999}',
        headers={"content-type": "application/json"},
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


def test_forecast_null_countermeasure_ids_is_validation_error(client: TestClient) -> None:
    r = client.post(
        "/api/v1/forecast",
        json={"crew_id": "crew-01", "scenario_id": "iss-180", "countermeasure_ids": None},
    )
    assert r.status_code == 422
    assert c.Error.model_validate(r.json()).code == "validation_error"


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


def test_telemetry_crew(client: TestClient) -> None:
    r = client.get("/api/v1/telemetry/crew")
    assert r.status_code == 200
    payload = c.TelemetryCrewPayload.model_validate(r.json())
    assert payload.count == 4
    assert [m.id for m in payload.crew] == ["crew-01", "crew-02", "crew-03", "crew-04"]
    for m in payload.crew:
        assert 0 <= m.bone_loss_risk_percentage <= 100
        assert m.current_bmd_t_score <= m.baseline_bmd_t_score  # loss direction
        assert m.cohort_type == "simulated_mission_telemetry"
        assert m.gene_data_source is None
    # deterministic composition: no timestamps, identical response on repeat call
    again = c.TelemetryCrewPayload.model_validate(client.get("/api/v1/telemetry/crew").json())
    assert again == payload


def test_osdr_studies(client: TestClient) -> None:
    r = client.get("/api/v1/osdr/studies")
    assert r.status_code == 200
    payload = c.OsdrStudiesPayload.model_validate(r.json())
    assert payload.sync_status == "ready"
    assert payload.count == payload.expected_count == 6
    accessions = {s.accession for s in payload.studies}
    assert {"OSD-102", "OSD-48", "OSD-714"} <= accessions
    osd714 = next(s for s in payload.studies if s.accession == "OSD-714")
    assert "RUNX2" in osd714.genes
