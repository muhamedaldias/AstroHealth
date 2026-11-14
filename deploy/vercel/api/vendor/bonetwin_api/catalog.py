"""Read-only catalogs (scenarios, countermeasures, crew) loaded from contract fixtures."""

from __future__ import annotations

import json
from pathlib import Path

from bonetwin_contracts import Countermeasure, CrewMember, Measurement, Scenario


def _items(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))["items"]


class Catalog:
    def __init__(self, fixtures_dir: Path) -> None:
        self.scenarios = [Scenario.model_validate(x) for x in _items(fixtures_dir / "scenarios.json")]
        self.countermeasures = [
            Countermeasure.model_validate(x) for x in _items(fixtures_dir / "countermeasures.json")
        ]
        self.crew = [CrewMember.model_validate(x) for x in _items(fixtures_dir / "crew.json")]
        self.seed_measurements = [
            Measurement.model_validate(x) for x in _items(fixtures_dir / "measurements.json")
        ]

    def scenario(self, ident: str) -> Scenario | None:
        return next((s for s in self.scenarios if s.id == ident), None)

    def crew_member(self, ident: str) -> CrewMember | None:
        return next((c for c in self.crew if c.id == ident), None)

    def countermeasure(self, ident: str) -> Countermeasure | None:
        return next((c for c in self.countermeasures if c.id == ident), None)
