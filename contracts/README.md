# contracts/ - the single source of truth

| File | What it is | Who changes it |
|---|---|---|
| `openapi.yaml` | Every HTTP path and every data shape (including the Backend<->AI `EngineInput`/`Forecast` pair) | Contract PR, approved by all three |
| `fixtures/manifest.json` | Maps each golden fixture to its schema name | Contract PR |
| `fixtures/*.json` | Golden example data (seed + examples), validated by tests | AI/Data (via `make seed`) |
| `CHANGELOG.md` | Human-readable log of every contract change | Whoever changes the contract |

## How a contract change works (the only way)
1. Open a PR that edits `openapi.yaml` ONLY (+ regenerated files + changelog). Nothing else.
2. Run `make gen`. It rewrites `packages/contracts_py/.../models.py` and `apps/web/src/api/schema.d.ts`.
3. Both other members approve. Merge quickly: everyone then rebases.
4. Each owner fixes what the compiler/tests now point at. Breakage is loud and immediate by design.

## Rules
- Additive changes (new optional field, new endpoint) are cheap. Renames/removals are expensive: avoid after the freeze.
- JSON is snake_case, timestamps are ISO-8601 UTC, units are fixed and documented on the schema.
- Never hand-edit generated files. CI (`make gen-check`) rejects drift.
