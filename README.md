# Astro Bone Twin

Web platform that forecasts each astronaut's bone-density trajectory (with uncertainty) during a
long mission, compares countermeasure plans ("what if"), and keeps a flight surgeon in the loop.
Built for the NASA Space Apps Challenge 2026 (astronaut health monitoring).

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
