# Team Charter & Contract

> This document is binding on the three of us. The objective is captured in a single sentence: **Nobody breaks another's work, and no surprises appear at assembly time.**

## 1) Core Principle: Contract-First

Everything exchanged between the different components of the project is defined in a single file: `contracts/openapi.yaml`.
From this file, the following are generated automatically:

- Python models (`packages/contracts_py`) → used by the Backend and AI/Data.
- TypeScript types (`apps/web/src/api/schema.d.ts`) → used by the Frontend.

Therefore, **no one writes data shapes by hand**. If a data shape changes, the contract must change first, which immediately causes automated checks (tests, `tsc`) to fail on each member's machine, pinpointing exactly what needs to be fixed.

Only two contracts exist:

| Contract | Between Whom | Location |
|---|---|---|
| HTTP | Frontend ↔ Backend | `/api/v1/*` routes in `openapi.yaml` |
| Engine | Backend ↔ AI/Data | `EngineInput` then `Forecast` in `openapi.yaml`, and the `Engine.forecast()` function in `twin_core` |

## 2) Who Owns What

The authoritative, automated source of truth is `OWNERSHIP.yaml`. From it, `CODEOWNERS` is generated. Any file without an assigned owner will cause `make check` to fail.

| Role | Owns (Writes to Exclusively) | Must Not Touch |
|---|---|---|
| **AI and Data** | `packages/twin_core/`, `data/`, `contracts/fixtures/*.json`, `scripts/make_seed.py`, `docs/SCIENCE_NOTES.md` | `apps/api`, `apps/web` |
| **Backend** | `apps/api/`, `Dockerfile`, `docker-compose.yml`, `packages/contracts_py/` (generated) | `packages/twin_core`, `apps/web` |
| **Frontend** | `apps/web/` (except generated `src/api/schema.d.ts`) | `apps/api`, `packages/twin_core` |
| **All Three Together** | `contracts/openapi.yaml`, `OWNERSHIP.yaml`, `.github/`, `docs/`, `Makefile`, root | — |

The rule: **Need a modification in someone else's file? Do not edit it directly. Open a small PR adding the owner as a reviewer, or ask them to make the change.**

## 3) The Ten Golden Rules

1. **No data shape without a contract.** Adding a new field? Update `openapi.yaml` first.
2. **Never modify a generated file.** (`models.py`, `schema.d.ts`, `CODEOWNERS`). Run `make gen`.
3. **Backend imports AI from `twin_core` only** (its public interface). `ruff` enforces this.
4. **Frontend never invokes `fetch` directly**, but exclusively through `src/api/hooks.ts`.
5. **Every new engine must pass `test_engine_contract.py`** before it is used.
6. **Everything returned by the API—whether success or error—strictly conforms to the contract** (errors always adhere to the `Error` schema).
7. **Before every push, run `make check`.** If it does not pass, do not push.
8. **No secrets and no large raw datasets in Git.** (`.env`, `data/raw`).
9. **Short-lived feature branches for every task**, with rapid merging into `main` (maximum 1 day).
10. **Never break `main`.** `main` must always be operational; whoever breaks it fixes it first.

## 4) Git Workflow

- Branches: `ai/<task>`, `be/<task>`, `fe/<task>`, `contract/<task>`.
- Commit messages: `type(scope): description`, e.g., `feat(api): add whatif endpoint`, `fix(web): chart band`.
- Merging: **Squash merge** only. `main` is protected: requires green CI and one approving review.
- **Contract PR (`contracts/`)**: Must be **approved by BOTH other members**, because GitHub does not enforce this automatically (`CODEOWNERS` only requires a single owner's approval). This is a binding internal agreement.
- Ideally, a contract PR should contain nothing other than the contract itself, generated files, and the changelog.

## 5) Contract Change Procedure

1. The member requiring the change opens a PR named `contract/...`, edits `openapi.yaml`, runs `make gen`, and logs an entry in `contracts/CHANGELOG.md`.
2. The other two members review within hours (prior to freeze: 2 hours maximum).
3. Following the merge, everyone runs `git pull --rebase`, and each member fixes whatever `make check` flags strictly within their own owned directories.

**Contract Freeze:** After the scheduled milestone in the table below, only non-breaking additions are accepted (e.g., a new optional field). Renaming or deleting fields is strictly forbidden.

## 6) Definition of Done (DoD)

For any task: its code is written, its tests exist, `make check` is green, the PR is merged, and the `README` in your directory is updated if anything regarding inputs or outputs changed.

- **AI/Data:** The new engine passes the contract tests, and `model_card()` transparently details assumptions and limitations.
- **Backend:** The route passes `test_contract_parity`, and errors strictly match the `Error` model.
- **Frontend:** `tsc` passes without any `any`, and the UI displays `disclaimer`, `warnings`, and `requires_physician_review`.

## 7) Proposed Delivery Schedule

| Day | Milestone |
|---|---|
| Wednesday, Nov 11 | Initialize repository, configure `OWNERSHIP.yaml`, everyone runs `make setup` and `make check` and reviews the contract. **Contract freeze v1 by end of day.** |
| Thursday, Nov 12 | Everyone works on their track against the stub engine: Frontend builds screens, Backend completes persistence, AI/Data prepares data and model. |
| Friday, Nov 13 | Full integration run (`make docker-up`) and presentation scenario walkthrough. Gap remediation. |
| Saturday & Sunday, Nov 14-15 | Hackathon event: core development and polish. **Code freeze hours before submission deadline**, followed by demo video and presentation. |

> **Important Notice:** Verify Space Apps rules regarding code prepared prior to the event. Scaffolding (architecture, contract, tooling) is generic infrastructure, not the project itself. However, core domain work (the model, data processing, the actual UI) is safest completed and documented during official hackathon days, clearly stating in `README` what was prepared beforehand.

## 8) Communication

- Daily short standup (10 minutes): What did I accomplish? What will I work on? What blockers depend on others?
- Any blocker stemming from contracts or data is resolved **on the same day**; never deferred to assembly.
- Every architectural decision discussion is recorded as a note in the PR or in `contracts/CHANGELOG.md`.
