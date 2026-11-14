"""Use-cases. Routes stay thin; this is where Catalog + Repository + Engine are combined."""

from __future__ import annotations

from bonetwin_contracts import (
    EngineInput,
    Forecast,
    WhatIfRequest,
    WhatIfResponse,
    WhatIfResult,
)
from twin_core import Engine

from .catalog import Catalog
from .errors import NotFound
from .repository import MeasurementRepository


class ForecastService:
    def __init__(self, catalog: Catalog, repo: MeasurementRepository, engine: Engine) -> None:
        self.catalog, self.repo, self.engine = catalog, repo, engine

    def forecast(self, crew_id: str, scenario_id: str, countermeasure_ids: list[str]) -> Forecast:
        crew = self.catalog.crew_member(crew_id)
        if crew is None:
            raise NotFound("crew_member", crew_id)
        scenario = self.catalog.scenario(scenario_id)
        if scenario is None:
            raise NotFound("scenario", scenario_id)
        cms = []
        for cid in dict.fromkeys(countermeasure_ids):  # de-duplicate, keep order
            cm = self.catalog.countermeasure(cid)
            if cm is None:
                raise NotFound("countermeasure", cid)
            cms.append(cm)
        inp = EngineInput(
            crew=crew,
            scenario=scenario,
            measurements=self.repo.list(crew_id),
            countermeasures=cms,
        )
        return self.engine.forecast(inp)

    def whatif(self, req: WhatIfRequest) -> WhatIfResponse:
        return WhatIfResponse(
            results=[
                WhatIfResult(
                    plan_id=p.plan_id,
                    label=p.label,
                    forecast=self.forecast(req.crew_id, req.scenario_id, p.countermeasure_ids),
                )
                for p in req.plans
            ]
        )
