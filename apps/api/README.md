# apps/api - Backend

**Owner: Backend.** FastAPI app implementing `contracts/openapi.yaml`.

## Inputs / outputs
- IN  (from Frontend): HTTP requests defined in the contract.
- IN  (from AI): `twin_core.get_engine(...)` -> `Engine.forecast(EngineInput) -> Forecast`.
- OUT (to Frontend): JSON exactly as the contract says; every error is the contract `Error`.
- OUT (to AI): `EngineInput` assembled from catalog + stored measurements.

## Layout (`src/bonetwin_api/`)
| File | Purpose |
|---|---|
| `routes/api.py` | Thin HTTP layer; `operation_id` + path + method must match the contract. |
| `service.py` | Use-cases: combine catalog + DB + engine. No HTTP here. |
| `repository.py`, `db.py` | SQLite persistence (measurements). |
| `catalog.py` | Read-only scenarios / countermeasures / crew from `contracts/fixtures`. |
| `errors.py` | Maps exceptions to the contract `Error` shape. |
| `config.py` | Env settings (`BONETWIN_*`). |

## Rules
- Request/response models are ALWAYS the generated ones from `bonetwin_contracts`. Never redefine them.
- Import the AI package only via `from twin_core import ...` (ruff enforces it).
- `tests/test_contract_parity.py` fails if a route drifts from the contract.
- Run: `make dev-api` (port 8000, docs at /docs).
