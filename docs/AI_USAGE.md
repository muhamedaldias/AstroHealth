# AI / Super Intelligence (SI) Usage Disclosure

**Scope**: this document acknowledges where AI (Super Intelligence, "SI")
tools were used in building AstroHealth AI, per the NASA Space Apps Challenge
SI disclosure requirements. It is referenced from `docs/submission/project-page.md`.

## Summary

SI tools (LLM coding assistants) were used as **tools under human direction**
to accelerate engineering velocity. They were **not** used to come up with the
project idea or the underlying science. All product decisions, the scientific
model design, the contract (OpenAPI) design, and every merged change were
reviewed and approved by the team.

## Where SI was used

| Area | Use | Safeguards |
|---|---|---|
| Code | Generating and refactoring backend (FastAPI/Python) and frontend (React/TypeScript) code, test scaffolding, CI and deployment configuration | Every change passes the project's own gates: 56 backend tests + 8 frontend tests, ruff + Biome + tsc, generated-code sync checks (`make gen-check`), ownership checks, contract-parity tests, and CI (`make check`) |
| Data | **None.** No SI-generated data anywhere in the product | Engine parameters are recorded in `docs/SCIENCE_NOTES.md` and grounded in NASA OSDR datasets |
| Images / video | **None.** No SI-generated imagery in the product or submission | All screenshots in `docs/submission/screenshots/` are real output of the running application |
| Audio | None | — |
| Documents | Drafting this disclosure, READMEs, and submission text; all reviewed by the team | Team review before commit |

## Model & science provenance

- The bone-loss engine (`packages/twin_core`, engine `calibrated_bone`) is a
  calibrated statistical model whose parameters derive from published
  space-biology findings (monthly bone-loss rates, countermeasure effects,
  gravity factors) — documented in `docs/SCIENCE_NOTES.md` — and is
  deterministic and fully tested (`test_bone_engine.py`,
  `test_engine_contract.py`).
- NASA data usage is limited to public OSDR studies (OSD-48, -102, -137,
  -194, -245, -714) via their open API, plus GeneLab terminology. No NASA
  branding is used or modified.

## Honesty commitments

- The UI labels engine outputs as *predicted* values and flags
  physician-review requirements where the catalog declares them.
- The product is a research/hackathon prototype — decision support only,
  never a medical device, as stated in the app footer.
