# Astro Bone Twin

API-first demo for astronaut health monitoring: a contract-first FastAPI backend
(bone-loss forecast, what-if countermeasure comparison, crew telemetry, NASA OSDR
study logs) and a React mission-control UI on top of it.
Built for the NASA Space Apps Challenge 2026.

> Research prototype, not a medical device. Demo crew and biomarkers are **simulated**.

## Quick start
```bash
make setup        # once: Python workspace (uv) + web deps (npm)
make dev-api      # terminal 1 -> http://localhost:8000/docs
make dev-web      # terminal 2 -> http://localhost:5173
make check        # everything CI runs
make docker-up    # all-in-one at http://localhost:8000
```
Requirements: [uv](https://docs.astral.sh/uv/), Node 22+, GNU make (Windows: Git Bash or WSL).

## What's in the UI
Five tabs (`apps/web/src/components/Header.tsx`), fed by the live API:
- **Dashboard** — crew selector and vitals HUD for the selected astronaut.
- **DNA & Telemetry** — DNA helix scanner, bone-density scanner, radiation telemetry chart.
- **Bio-Rescue Protocol** — the astronaut's countermeasure / food-printer rescue plan.
- **NASA Data Logs** — gene-expression table backed by real NASA OSDR studies.
- **Bone Forecast** — worst-site predicted bone-density change and per-site CI bands from
  the live engine via `POST /api/v1/forecast` (crew, scenario and countermeasure selection).

`POST /api/v1/whatif` remains a live contract endpoint without a dedicated UI panel today.

## Contract-first workflow
`contracts/openapi.yaml` is the single source of truth for every data shape:
1. Edit the spec (contract PR approved by the owners).
2. `make gen` regenerates the pydantic models, the TypeScript types and CODEOWNERS.
3. Never hand-edit generated code (`packages/contracts_py/`, `apps/web/src/api/schema.d.ts`,
   `.github/CODEOWNERS`).

## Engines
The forecast engine is pluggable via a registry (`packages/twin_core/src/twin_core/registry.py`):
select with `BONETWIN_ENGINE=stub|calibrated` (default `stub`; this deployment runs `calibrated`).
New engines register there and are automatically contract-checked by
`tests/test_engine_contract.py`.

## Layout
```
contracts/            single source of truth (openapi.yaml + golden fixtures)
packages/twin_core/   AI/Data engine (Python)          owner: AI/Data
packages/contracts_py GENERATED pydantic models
apps/api/             FastAPI backend                    owner: Backend
apps/web/             React frontend                     owner: Frontend
data/                 raw (ignored) / processed / runtime
docs/                 architecture, science notes, team docs
OWNERSHIP.yaml        who owns which path (generates CODEOWNERS)
```
See `docs/ARCHITECTURE.md` for the decisions and `docs/team/` for the team rules.

## Data
NASA Open Science Data Repository (OSDR): https://osdr.nasa.gov/bio/repo
