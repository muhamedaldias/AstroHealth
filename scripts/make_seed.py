"""Write golden fixtures to contracts/fixtures/ from twin_core.sim.synthetic.

    uv run python scripts/make_seed.py

Owner: AI/Data. Output is deterministic and validated by contract tests.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

from bonetwin_contracts import Countermeasure, CrewMember, EngineInput, Measurement, Scenario
from twin_core.engines.stub import StubEngine
from twin_core.sim import synthetic as syn

OUT = Path(__file__).resolve().parents[1] / "contracts" / "fixtures"
FIXED_TIME = datetime(2026, 1, 1, tzinfo=UTC)


def write(name: str, data: object) -> None:
    (OUT / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote", name)


def main() -> None:
    write("scenarios.json", {"items": syn.SCENARIOS})
    write("countermeasures.json", {"items": syn.COUNTERMEASURES})
    write("crew.json", {"items": syn.crew()})
    write("measurements.json", {"items": syn.measurements()})

    crew = CrewMember.model_validate(syn.crew()[0])
    scenario = Scenario.model_validate(syn.SCENARIOS[0])
    cms = [Countermeasure.model_validate(c) for c in syn.COUNTERMEASURES[:1]]
    ms = [Measurement.model_validate(m) for m in syn.measurements() if m["crew_id"] == crew.id]
    inp = EngineInput(crew=crew, scenario=scenario, measurements=ms, countermeasures=cms)
    write("engine_input_example.json", json.loads(inp.model_dump_json()))
    fc = StubEngine().forecast(inp).model_copy(update={"generated_at": FIXED_TIME})
    write("forecast_example.json", json.loads(fc.model_dump_json()))

    write(
        "manifest.json",
        {
            "_about": "fixture file -> schema name in contracts/openapi.yaml. Tests validate every entry.",
            "scenarios.json": "ScenarioList",
            "countermeasures.json": "CountermeasureList",
            "crew.json": "CrewList",
            "measurements.json": "MeasurementList",
            "engine_input_example.json": "EngineInput",
            "forecast_example.json": "Forecast",
        },
    )


if __name__ == "__main__":
    main()
