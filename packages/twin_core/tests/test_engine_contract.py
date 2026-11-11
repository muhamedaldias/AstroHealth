"""Contract tests run against EVERY registered engine.

If you add an engine to the registry and these pass, the backend and frontend will work
with it. If they fail, fix the engine, not the contract.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from bonetwin_contracts import Countermeasure, EngineInput, Forecast
from twin_core import get_engine, list_engines
from twin_core.sim import synthetic as syn

FIXTURES = Path(__file__).resolve().parents[3] / "contracts" / "fixtures"


def _inputs() -> list[EngineInput]:
    base = EngineInput.model_validate(json.loads((FIXTURES / "engine_input_example.json").read_text()))
    all_cms = [Countermeasure.model_validate(c) for c in syn.COUNTERMEASURES]
    return [
        base,
        base.model_copy(update={"countermeasures": []}),
        base.model_copy(update={"countermeasures": all_cms}),
        base.model_copy(update={"measurements": []}),  # no biomarkers yet must still work
    ]


@pytest.mark.parametrize("engine_name", list_engines())
@pytest.mark.parametrize("inp", _inputs(), ids=["example", "no-cm", "all-cm", "no-measurements"])
def test_engine_honours_contract(engine_name: str, inp: EngineInput) -> None:
    out = get_engine(engine_name).forecast(inp)
    Forecast.model_validate(out.model_dump())  # shape is valid

    assert out.crew_id == inp.crew.id
    assert out.scenario_id == inp.scenario.id
    assert out.horizon_days == inp.scenario.duration_days
    assert out.countermeasure_ids == [c.id for c in inp.countermeasures]
    assert out.disclaimer.strip()
    assert out.sites, "at least one bone site"
    for site in out.sites:
        days = [p.day for p in site.points]
        assert days == sorted(days) and days[0] == 0 and days[-1] == out.horizon_days
        for p in site.points:
            assert p.lower_95 <= p.mean_pct_change <= p.upper_95
        assert 0.0 <= site.risk.prob_below_threshold_at_end <= 1.0


@pytest.mark.parametrize("engine_name", list_engines())
def test_engine_is_deterministic(engine_name: str) -> None:
    eng, inp = get_engine(engine_name), _inputs()[0]
    a = eng.forecast(inp).model_dump(exclude={"generated_at"})
    b = eng.forecast(inp).model_dump(exclude={"generated_at"})
    assert a == b


@pytest.mark.parametrize("engine_name", list_engines())
def test_model_card_has_required_keys(engine_name: str) -> None:
    card = get_engine(engine_name).model_card()
    assert {"assumptions", "limitations", "data_sources", "disclaimer"} <= set(card)
