"""
AstroHealth AI - FastAPI Scientific Space-Health Backend
Exposes cached NASA OSDR study records and simulated mission telemetry scenarios.
"""

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from backend.nasa_osdr_data import ASTRONAUT_COHORT, calculate_spaceflight_risks
    from backend import database, osdr_client
except ImportError:
    from nasa_osdr_data import ASTRONAUT_COHORT, calculate_spaceflight_risks
    import database
    import osdr_client

def build_bio_rescue_protocols(crew):
    protocols = []
    for astronaut in crew:
        risks = calculate_spaceflight_risks(astronaut["space_days"], astronaut["radiation_msv"])
        protocols.append({
            "astronaut_id": astronaut["id"],
            "scenario_key": f"{astronaut['space_days']}d-{astronaut['radiation_msv']}mSv-v1",
            "scenario_inputs": {
                "space_days": astronaut["space_days"],
                "radiation_msv": astronaut["radiation_msv"],
            },
            "risk_indices": risks,
            "protocol": {
                "supplements": {
                    "status": "clinician_review_required",
                    "dose": None,
                    "basis": "No dose inferred from animal study expression data.",
                },
                "exercise": {
                    "status": "validated_plan_review_required",
                    "basis": "Scenario priority only; no load or duration is prescribed.",
                },
                "cabin_environment": {
                    "status": "mission_standard_review_required",
                    "parameters": ["oxygen", "circadian_lighting", "sleep_schedule"],
                    "setpoints": None,
                },
            },
            "provenance": "Simulated mission telemetry; not an individualized medical prescription.",
        })
    return protocols


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.initialize_database()
    app.state.postgresql_ready = True
    crew = osdr_client.enrich_cohort(ASTRONAUT_COHORT)
    studies = osdr_client.get_all_studies()
    await database.persist_telemetry(crew)
    await database.persist_studies(studies)
    await database.persist_protocols(build_bio_rescue_protocols(crew))
    try:
        yield
    finally:
        app.state.postgresql_ready = False
        await database.close_database()


app = FastAPI(
    title="AstroHealth AI Backend Engine",
    description="AI-driven space-health monitoring platform using NASA GeneLab (OSDR) data models.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local development and UI communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    space_days: int = Field(..., ge=1, le=1000, description="Mission duration in microgravity days")
    radiation_msv: float = Field(..., ge=0.0, le=2000.0, description="Cumulative ionizing radiation in mSv")

@app.get("/api/health")
async def health_check():
    studies = osdr_client.get_all_studies()
    all_studies_ready = len(studies) == len(osdr_client.STUDY_ORDER) and all(
        study.get("mission") for study in studies
    )
    return {
        "status": "online",
        "system": "AstroHealth AI simulated mission telemetry and OSDR study reference service",
        "nasa_osdr_sync": "READY" if all_studies_ready else "SYNCING",
        "osdr_cached_study_count": len(studies),
        "postgresql": "online",
        "postgresql_records": await database.counts(),
        "osdr_api_base": osdr_client.API_BASE,
        "osdr_studies": osdr_client.STUDY_ORDER,
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.get("/api/crew")
async def get_crew_roster():
    crew = osdr_client.enrich_cohort(ASTRONAUT_COHORT)
    await database.persist_telemetry(crew)
    return {
        "count": len(crew),
        "crew": crew,
        "gene_data_source": None,
        "cohort_type": "simulated_mission_telemetry"
    }

@app.get("/api/crew/{astronaut_id}")
async def get_astronaut(astronaut_id: str):
    astro = next((a for a in ASTRONAUT_COHORT if a["id"].upper() == astronaut_id.upper()), None)
    if not astro:
        raise HTTPException(status_code=404, detail=f"Astronaut with ID {astronaut_id} not found in active cohort.")
    crew = osdr_client.enrich_cohort([astro])
    await database.persist_telemetry(crew)
    return crew[0]

@app.get("/api/osdr/studies")
async def get_osdr_studies():
    try:
        studies = osdr_client.get_all_studies()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"NASA OSDR API unavailable: {exc}",
        )
    await database.persist_studies(studies)
    return {
        "source": osdr_client.API_BASE,
        "repository": "NASA Open Science Data Repository (OSDR)",
        "count": len(studies),
        "expected_count": len(osdr_client.STUDY_ORDER),
        "sync_status": "ready" if len(studies) == len(osdr_client.STUDY_ORDER) and all(study.get("mission") for study in studies) else "syncing",
        "studies": studies,
    }

@app.get("/api/osdr/genes")
async def get_osdr_genes():
    try:
        panel, studies = osdr_client.get_gene_panel()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"NASA OSDR API unavailable: {exc}",
        )
    await database.persist_studies(list(studies.values()))
    return {
        "source": osdr_client.API_BASE,
        "datasets": list(studies.keys()),
        "sync_status": "ready" if len(studies) == len(osdr_client.STUDY_ORDER) and all(study.get("mission") for study in studies.values()) else "syncing",
        "genes": panel,
    }

@app.get("/api/genes/ontology")
def get_gene_ontology():
    try:
        panel, studies = osdr_client.get_gene_panel()
        return {
            "repository": "NASA Open Science Data Repository (OSDR)",
            "datasets": list(studies.keys()),
            "genes": panel,
            "source": osdr_client.API_BASE,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NASA OSDR gene records are not available in the local cache.",
        )

@app.post("/api/simulation/calculate")
def simulate_risks(payload: SimulationRequest):
    risks = calculate_spaceflight_risks(payload.space_days, payload.radiation_msv)
    return {
        "input": payload.model_dump(),
        "calculated_risks": risks,
        "basis": "Illustrative mission-exposure scenario model; NASA OSDR study expression values do not predict individual human outcomes.",
        "status": "SIMULATED_SCENARIO_NOT_CLINICALLY_VALIDATED"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
