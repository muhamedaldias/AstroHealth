# twin_core - AI and Data engine

**Owner: AI/Data.**

## Inputs / outputs
- IN  (from Backend): `EngineInput` = crew + scenario + measurements + chosen countermeasures.
- OUT (to Backend): `Forecast` = per-site trajectory with 95% bands, risk, drivers, warnings.
- Nothing else crosses the boundary. No network calls at inference time.

## Layout
| Path | Purpose |
|---|---|
| `src/twin_core/__init__.py` | PUBLIC API (`Engine`, `get_engine`, `list_engines`). The backend imports only this. |
| `protocol.py` | The `Engine` protocol and `EngineError`. |
| `registry.py` | Register new engines here. |
| `engines/stub.py` | Day-0 placeholder so Backend/Frontend can integrate. Replace, do not extend. |
| `engines/<yours>.py` | The real engine (e.g. hierarchical Bayesian / state-space bone model). |
| `sim/synthetic.py` | Synthetic demo crew + biomarkers (deterministic). |
| `ingest/osdr.py` | OSDR download helpers; raw files go to `data/raw/` (git-ignored). |
| `tests/test_engine_contract.py` | Runs on EVERY registered engine. Green = safe to integrate. |

## Adding the real engine
1. Create `engines/mymodel.py` with `info`, `forecast(inp)`, `model_card()`.
2. Register it in `registry.py`, run `make test`.
3. Run the API with `BONETWIN_ENGINE=mymodel`. Frontend/Backend need zero changes.

## Rules
- `forecast` is a pure function: same input, same output. Fix random seeds.
- Add numeric deps (numpy, scipy, pandas...) to THIS package's `pyproject.toml`, then commit `uv.lock`.
- Document every assumption and limitation in `docs/SCIENCE_NOTES.md` and in `model_card()`; the UI shows it.
