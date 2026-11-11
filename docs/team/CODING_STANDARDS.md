# Coding Standards

Objective: For any team member to read another's code effortlessly, with automated tooling enforcing rules rather than human memory.

## General Rules

- **Code, comments, variable names, and messages: in English.** Internal documentation in `docs/team` in English.
- One tool per language, with zero style debates: Python = `ruff`, TypeScript = `biome`. `make fmt` fixes formatting automatically.
- Short, focused files are preferred over long ones. Each function should perform one single task.
- No dead code, no debugging `print` statements, and no `TODO` without its owner's handle (`TODO(ai): ...`).
- Never duplicate a data shape already defined in the contract.

## API Conventions (Part of the Contract)

- JSON fields in `snake_case`. Identifiers are static string constants/enums (`lumbar_spine`).
- Dates in ISO-8601 UTC format.
- **Units are fixed and documented** in the field description (BMD in g/cm², changes as percent change relative to personal baseline).
- All errors adhere to the `Error` schema (fixed `code` + `message` + `details`).
- Additions are safe (new optional field). Modifications and deletions require a contract PR.
- Every route has a unique `operationId` in `verbNoun` format (`createForecast`).

## Python (AI/Data and Backend)

- Python 3.11+, full type hints on all public functions.
- `from __future__ import annotations` at the top of every file.
- Models: Generated Pydantic strictly for boundary data interchange. Internally, use `dataclass` or standard functions.
- **The engine is a pure function:** `forecast(inp)` produces identical output for identical input. Fix `seed` for any stochasticity. No network calls and no global mutable state at inference time.
- Expected errors must raise `EngineError` (in the engine) or `NotFound` (in the API). Never use silent `except Exception`.
- Backend architecture: Routes stay thin; business logic lives in `service.py`; persistence in `repository.py`.
- Imports: Backend imports AI exclusively from `twin_core` public interface (`ruff` enforces this). Relative imports within a single package are acceptable.
- Testing with `pytest`: one test file per unit, with names describing behavior (`test_whatif_needs_two_plans`).

## TypeScript (Frontend)

- `strict` mode enabled and `noUncheckedIndexedAccess`. **`any` is strictly forbidden**, as is `as` type-casting to bypass type checking.
- API types are imported from `@/api/client` (or schema). Never define an API response type by hand.
- Data fetching is confined to `src/api/hooks.ts` only. Components must never invoke `fetch` directly.
- Directory structure: `features/<feature>/` for feature-specific components, `components/` for shared components, and `lib/` for testable pure utility functions.
- React component = single function per file, file name = component name (`ForecastChart.tsx`).
- User-facing text must not be embedded within calculation logic. Formatting utilities (`formatPct`) reside in `lib/`.
- Accessibility (a11y): Sufficient color contrast, full keyboard navigation, and descriptive chart labeling.

## Product Integrity (Mandatory for All Three)

- Never claim precision that has not been measured. Document model limitations in `model_card()`, displayed directly in the UI.
- All medical and physiological outputs must carry `disclaimer` and `requires_physician_review`, and the UI must always display them.
- Simulated data must be explicitly labeled as simulated (crew member names are fictional and marked as such).

## Git

- Commit messages: `feat|fix|docs|refactor|test|chore(scope): ...`
- Small, focused PRs describing *why* a change was made, not merely *what*.
- Never commit: `.env`, `node_modules`, `dist`, `data/raw`, database files.
