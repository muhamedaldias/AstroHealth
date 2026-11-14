# apps/web - Frontend

**Owner: Frontend.** React + TypeScript + Vite + Tailwind.

## Inputs / outputs
- IN  (from Backend): JSON from `/api/v1/*`, typed by generated `src/api/schema.d.ts`.
- OUT: the UI. Nothing else leaves this folder.

## Layout (`src/`)
| Path | Purpose |
|---|---|
| `api/schema.d.ts` | GENERATED. Never edit. |
| `api/client.ts` | The only place the HTTP client is created. |
| `api/hooks.ts` | All data fetching (TanStack Query). Components use hooks, never `fetch`. |
| `features/<name>/` | Doc stubs only (one README each). Screens live in `components/`, composed by `App.tsx`. |
| `components/` | Shared presentational components (no API calls). |
| `lib/` | Pure helpers (+ unit tests). |

## Rules
- Never hand-write an API type. Import from `@/api/client` (`Forecast`, `CrewMember`, ...).
- Develop against the real API in stub mode: `make dev-api` + `make dev-web`; no mock layer to drift.
- Show `disclaimer`, `warnings`, `requires_physician_review` and the model card: this is product honesty, not decoration.
- Run: `make dev-web` (port 5173, `/api` is proxied to :8000).

## Tests & tooling
- Unit tests: vitest (`npm --prefix apps/web run test`).
- Lint/format: Biome (`npm --prefix apps/web run lint` / `run fmt`).
- Typecheck: `npm --prefix apps/web run typecheck` (`tsc -b --noEmit`).
