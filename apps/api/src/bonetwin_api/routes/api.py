"""HTTP layer. Paths, methods and operation_ids MUST match contracts/openapi.yaml
(tests/test_contract_parity.py fails otherwise)."""

from __future__ import annotations

from bonetwin_contracts import (
    CountermeasureList,
    CrewList,
    CrewMember,
    Forecast,
    ForecastRequest,
    Health,
    Measurement,
    MeasurementCreate,
    MeasurementList,
    ModelInfo,
    OsdrStudiesPayload,
    ScenarioList,
    TelemetryCrewPayload,
    WhatIfRequest,
    WhatIfResponse,
)
from fastapi import APIRouter, Request

from .. import __version__
from ..errors import NotFound
from ..osdr_studies import load_osdr_studies

router = APIRouter(prefix="/api/v1")


@router.get("/health", operation_id="getHealth", response_model=Health, tags=["meta"])
def get_health(request: Request) -> Health:
    return Health(status="ok", api_version=__version__, engine=request.app.state.engine.info)


@router.get("/model-info", operation_id="getModelInfo", response_model=ModelInfo, tags=["meta"])
def get_model_info(request: Request) -> ModelInfo:
    eng = request.app.state.engine
    return ModelInfo(engine=eng.info, **eng.model_card())


@router.get(
    "/scenarios",
    operation_id="listScenarios",
    response_model=ScenarioList,
    tags=["catalog"],
)
def list_scenarios(request: Request) -> ScenarioList:
    return ScenarioList(items=request.app.state.catalog.scenarios)


@router.get(
    "/countermeasures",
    operation_id="listCountermeasures",
    response_model=CountermeasureList,
    tags=["catalog"],
)
def list_countermeasures(request: Request) -> CountermeasureList:
    return CountermeasureList(items=request.app.state.catalog.countermeasures)


@router.get("/crew", operation_id="listCrew", response_model=CrewList, tags=["crew"])
def list_crew(request: Request) -> CrewList:
    return CrewList(items=request.app.state.catalog.crew)


@router.get(
    "/crew/{crew_id}",
    operation_id="getCrewMember",
    response_model=CrewMember,
    tags=["crew"],
)
def get_crew_member(crew_id: str, request: Request) -> CrewMember:
    crew = request.app.state.catalog.crew_member(crew_id)
    if crew is None:
        raise NotFound("crew_member", crew_id)
    return crew


@router.get(
    "/crew/{crew_id}/measurements",
    operation_id="listMeasurements",
    response_model=MeasurementList,
    tags=["crew"],
)
def list_measurements(crew_id: str, request: Request) -> MeasurementList:
    if request.app.state.catalog.crew_member(crew_id) is None:
        raise NotFound("crew_member", crew_id)
    return MeasurementList(items=request.app.state.repo.list(crew_id))


@router.post(
    "/crew/{crew_id}/measurements",
    operation_id="addMeasurement",
    response_model=Measurement,
    status_code=201,
    tags=["crew"],
)
def add_measurement(crew_id: str, body: MeasurementCreate, request: Request) -> Measurement:
    if request.app.state.catalog.crew_member(crew_id) is None:
        raise NotFound("crew_member", crew_id)
    return request.app.state.repo.add(crew_id, body)


@router.post(
    "/forecast",
    operation_id="createForecast",
    response_model=Forecast,
    tags=["forecast"],
)
def create_forecast(body: ForecastRequest, request: Request) -> Forecast:
    return request.app.state.service.forecast(body.crew_id, body.scenario_id, body.countermeasure_ids)


@router.post(
    "/whatif",
    operation_id="compareWhatIf",
    response_model=WhatIfResponse,
    tags=["forecast"],
)
def compare_what_if(body: WhatIfRequest, request: Request) -> WhatIfResponse:
    return request.app.state.service.whatif(body)


@router.get(
    "/telemetry/crew",
    operation_id="listTelemetryCrew",
    response_model=TelemetryCrewPayload,
    tags=["telemetry"],
)
def list_telemetry_crew(request: Request) -> TelemetryCrewPayload:
    return request.app.state.telemetry.payload()


@router.get(
    "/osdr/studies",
    operation_id="listOsdrStudies",
    response_model=OsdrStudiesPayload,
    tags=["osdr"],
)
def list_osdr_studies() -> OsdrStudiesPayload:
    return load_osdr_studies()
