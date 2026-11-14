"""Contract tests for the calibrated bone-loss engine.

Run in the same suite as test_engine_contract.py: every registered engine must
validate a Forecast, return the right crew/scenario/horizon, emit sites whose
confidence bands bracket the mean, and hold the risk probability inside [0, 1].

Domain tests below pin the calibrated model's behaviour: a real protective
plan loses less bone than none, and an elevated resorption marker (CTX) is
personalised as catabolic (faster loss).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from bonetwin_contracts import EngineInput, Forecast, MarkerId
from twin_core import get_engine, list_engines
from twin_core.protocol import Engine

FIXTURES = Path(__file__).resolve().parents[3] / "contracts" / "fixtures"


def _base_input() -> EngineInput:
    data = json.loads((FIXTURES / "engine_input_example.json").read_text(encoding="utf-8"))
    return EngineInput.model_validate(data)


# --------------------------------------------------------------------------- #
# Shared engine-contract checks (apply to every registered engine)
# --------------------------------------------------------------------------- #
@pytest.mark.parametrize("engine_name", list_engines())
def test_engine_honours_contract(engine_name: str) -> None:
    engine = get_engine(engine_name)
    inp = _base_input()
    out = engine.forecast(inp)
    Forecast.model_validate(out.model_dump())

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
    engine, inp = get_engine(engine_name), _base_input()
    a = engine.forecast(inp).model_dump(exclude={"generated_at"})
    b = engine.forecast(inp).model_dump(exclude={"generated_at"})
    assert a == b


@pytest.mark.parametrize("engine_name", list_engines())
def test_model_card_has_required_keys(engine_name: str) -> None:
    card = get_engine(engine_name).model_card()
    assert {"assumptions", "limitations", "data_sources", "disclaimer"} <= set(card)


# --------------------------------------------------------------------------- #
# Domain behaviour pinned to the calibrated model
# --------------------------------------------------------------------------- #
def _calibrated() -> Engine:
    return get_engine("calibrated")


def test_calibrated_engine_is_registered() -> None:
    assert "calibrated" in list_engines()


def test_calibrated_engine_loses_less_bone_with_protective_plan() -> None:
    inp = _base_input()
    none_forecast = _calibrated().forecast(inp.model_copy(update={"countermeasures": []}))
    protected = _calibrated().forecast(inp)

    none_loss = none_forecast.sites[0].points[-1].mean_pct_change
    protected_loss = protected.sites[0].points[-1].mean_pct_change

    assert none_loss < -1.0  # ~1%/mo over 180d: real, clinically meaningful loss
    assert protected_loss > none_loss  # less negative => protective plan helps


def test_calibrated_engine_personalises_by_resorption_marker() -> None:
    """A catabolic (CTX ~40% above baseline) measurement profile must accelerate loss."""
    base = _base_input()

    # Calm profile: the fixture's own CTX readings (post/pre ratio ~1.19).
    calm_forecast = _calibrated().forecast(base)

    # Catabolic profile: same readings, but day-90 CTX raised ~40% above the
    # pre-flight baseline. A pre-flight (negative-day) CTX is kept so the ratio
    # is still computable.
    replaced: list[object] = []
    day90_seen = False
    for m in base.measurements:
        if m.marker == MarkerId.ctx and m.mission_day == 90 and not day90_seen:
            replaced.append(m.model_copy(update={"value": round(0.41 * 1.40, 3)}))
            day90_seen = True
        else:
            replaced.append(m)
    catabolic = base.model_copy(update={"measurements": replaced})
    catabolic_forecast = _calibrated().forecast(catabolic)

    calm_loss = calm_forecast.sites[0].points[-1].mean_pct_change
    catabolic_loss = catabolic_forecast.sites[0].points[-1].mean_pct_change

    assert catabolic_loss < calm_loss  # more negative = faster loss with high CTX
