# NASA Space Apps 2026 — Project Submission Pack

> Paste each section into the corresponding field of the Project Submission page
> (My Team → Project tab → Edit). All fields must be in **English**.
> Items in `[BRACKETS]` are placeholders — fill them in before submitting.

---

## 1. Project Name

```
AstroHealth AI — a Bone & DNA Health Digital Twin for Astronauts
```

## 2. High-Level Project Summary

```
AstroHealth AI is a web platform that predicts how much bone density an
astronaut is likely to lose on a planned space mission, and turns NASA's own
space-biology data into a personalized, countermeasure-aware prevention plan.

Astronauts on long missions can lose 1–2% of bone density per month, and
current health-monitoring workflows detect problems only after they appear.
Our answer to the challenge "Create Health Monitoring Software for Astronauts
on Space Missions" is a working, end-to-end decision-support tool: judges can
pick a crew member and a mission scenario, run a calibrated bone-loss
forecast, and instantly see the mitigated vs. unmitigated difference across
resistive exercise, nutrition, and cabin-environment countermeasures.

The engine is a deterministic statistical model hand-calibrated to published
space-medicine findings (NASA-STD-3001, ESA guidance, Axpe et al. 2020 npj
Microgravity — every parameter cited in docs/SCIENCE_NOTES.md), and the
platform's data backbone is real NASA data: six spaceflight bioscience
studies from NASA's Open Science Data Repository (OSDR: OSD-48, OSD-102,
OSD-137, OSD-194, OSD-245, OSD-714) with their gene markers, served live in
the app. Every response is contract-tested against a versioned OpenAPI
specification, so the forecasts the UI shows are the forecasts the engine
computes — nothing is invented in the browser.

Why it matters: as missions go to the Moon and Mars, crew health monitoring
must shift from reaction to prediction. AstroHealth AI demonstrates that a
small team can build a truthful, testable, openly engineered health-twin
prototype on NASA's open data in a single hackathon weekend.
```

## 3. Link to Project Demo

```
[TO BE ADDED — 7-slide deck (PDF/PPTX) or ≤30s video, hosted publicly.
 Deferred by team decision; slides skeleton ready to fill.]
```

## 4. Link to Final Project

```
Live app (public, no login):  https://astrohealth-ai.vercel.app
Source code (public repo):    https://github.com/muhamedaldias/AstroHealth
```

> NOTE TO TEAM: the Vercel URL above is set after deployment — verify it opens
> in a private/incognito browser before submitting. If it differs, replace it.

## 5. Detailed Project Description

```
WHAT IT DOES
- Crew health twin: four fictional crew profiles with pre-flight baselines
  (T-scores, age, sex, mission role) and serial biomarker measurements
  (CTX, OC, BMD and other bone markers).
- Bone-loss forecasting: a calibrated statistical engine predicts, per
  skeletal site (lumbar spine, femoral neck, total hip, distal tibia), the
  mean percent BMD change over the mission with a 95% confidence band —
  and how countermeasures change that trajectory.
- Countermeasure what-if planning: compare resistive exercise (ARED-class),
  compact flywheel, vitamin D + calcium management, and anti-resorptive
  (bisphosphonate) plans — including which plans require physician approval.
- Mission telemetry & DNA view: simulated mission telemetry for the crew
  with predicted worst-site bone-density change (labeled as predicted loss,
  not a probability), plus real NASA OSDR study references surfaced in the
  "DNA & Telemetry" tab.
- NASA data browser: the NASA Data Logs tab lists the OSDR studies the
  platform is grounded in, with accessions and study metadata.

HOW IT WORKS
- Contract-first engineering: a single OpenAPI spec (contracts/openapi.yaml)
  is the single source of truth. `make gen` regenerates the Pydantic models
  (Python) and TypeScript types (web) from it, and parity tests assert the
  live API matches the contract on every push.
- Engine (twin_core): calibrated_bone computes monthly bone-loss rates per
  site, adjusted by countermeasure multipliers (e.g. resistive exercise),
  mission context (microgravity context adjustment), per-crew effects, and
  gravity (0.70 lunar factor documented in docs/SCIENCE_NOTES.md). CTX
  biomarker personalization modulates resorption. Uncertainty is expressed
  as 95% CI bands; outputs are percent change from the crew member's own
  pre-flight baseline (negative = loss), with units fixed in the contract.
- API: FastAPI, SQLAlchemy 2 over SQLite (repo-root-anchored path), strict
  request validation (unknown fields rejected), a single Error shape for
  every non-2xx response, and a 1 MB body cap.
- Web: React 19 + Vite + TypeScript + Tailwind CSS 4 + TanStack Query,
  typed directly against the generated OpenAPI schema. Bilingual UI
  (English/Arabic). Five tabs: Dashboard, DNA & Telemetry, Bio-Rescue
  Protocol (food printer), NASA Data Logs, and Bone Forecast.
- Deployment: static frontend + serverless FastAPI on Vercel (same-origin
  API), with the calibrated engine enabled.
- Quality gates: 56 backend tests + 8 frontend tests, ruff + biome + tsc,
  generated-code sync checks, ownership checks, and CI on GitHub Actions
  running the full `make check` gate on every push.

BENEFITS
- For mission planners and flight surgeons: a truthful, auditable what-if
  tool — every number traces back to the engine, the contract, and the
  tests, not to hard-coded UI values.
- For researchers/educators: a clean, open reference implementation of how
  NASA OSDR data can power a health digital twin.
- For the crew (concept): one screen that answers "how bad is this mission
  for my skeleton — and what do I do about it?"

WHAT WE HOPE TO ACHIEVE
- Extend the twin from bone to DNA-damage modeling using additional OSDR
  datasets (radiation + transcriptomic studies) with the same
  contract-first discipline.
- Add calibration reports per OSDR study so the engine's assumptions are
  auditable per dataset.
- Grow this into an open tool that student teams and researchers can run
  locally and extend.

TOOLS / LANGUAGES / HARDWARE
- Languages: Python 3.12, TypeScript.
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2, SQLite, uv, pytest, ruff.
- Frontend: React 19, Vite, Tailwind CSS 4, TanStack Query, lucide-react,
  Vitest, Biome, TypeScript.
- Infra/quality: GitHub Actions CI, Vercel (static + serverless Python),
  OpenAPI 3.0 contract tooling (datamodel-code-generator,
  openapi-spec-validator, openapi-typescript).
- Hardware: none — pure software; runs in any modern browser.
```

## 6. Use of Super Intelligence (SI)

```
Yes — SI tools (LLM coding assistants) were used, always as a tool under
human direction, never to come up with the idea or the science.

How SI was used:
- Code: generating and refactoring application code (FastAPI backend,
  React frontend), test scaffolding, and CI/deployment configuration —
  every change reviewed by the team and gated by the project's own test
  suite (56 backend + 8 frontend tests), linters, type checks, and a
  contract-parity suite that verifies the shipped API against the OpenAPI
  spec on every push.
- Data: no SI-generated data. The engine's parameters come from published
  space-biology findings and NASA OSDR datasets, recorded in
  docs/SCIENCE_NOTES.md.
- Images/videos: no SI-generated imagery is included anywhere in the
  project or this submission. All screenshots are real output of the
  running application (docs/submission/screenshots/).
- Documentation & this submission text: drafted with SI assistance and
  reviewed by the team.

The full acknowledgment lives in the repository at docs/AI_USAGE.md (and is
referenced from the README), covering code, data, and documents.

NASA branding: the project does not use, contain, or modify any NASA logos,
flags, or design elements; NASA and GeneLab/OSDR are referenced only as data
sources in plain text.
```

## 7. NASA Data

```
Eligibility basis: the project uses NASA data (required for Global Award
consideration).

1) NASA Open Science Data Repository (OSDR) — primary data source
   - Six spaceflight bioscience studies, consumed as offline JSON bundles
     fetched from the public OSDR visualization API
     (https://visualization.osdr.nasa.gov/biodata/api/v2/):
     OSD-48, OSD-102, OSD-137, OSD-194, OSD-245, OSD-714.
   - Used for: the DNA & Telemetry panel (real study references and
     metadata shown in-app), grounding the engine's biomarker assumptions
     (CTX as a bone-resorption marker), and the NASA Data Logs tab.
2) NASA GeneLab — biomarker context and terminology for bone markers
   (CTX, OC, BMD) and baseline/T-score semantics used by the telemetry
   and forecast features.

All NASA data is used through its public, open access channels; no NASA
logo, flag, or design element is reproduced anywhere in the product.
```

## 8. Space Agency Partner Data and Other References

```
Space agency data:
- NASA Open Science Data Repository (OSDR) + GeneLab (detailed in the NASA
  Data section). No other space agency datasets were used.

Open-source software (all under permissive licenses):
- Backend: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, Uvicorn,
  uv, pytest, ruff, httpx.
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query,
  lucide-react, Vitest, Biome.
- Contract tooling: datamodel-code-generator, openapi-spec-validator,
  openapi-typescript.
- Infra: GitHub Actions, Vercel (static hosting + serverless Python),
  Playwright (development-time GUI testing only).

Copyrighted material: none. All product text, layout and screenshots were
created by the team; no NASA branding is reproduced (see SI section).
```

---

## Submission checklist (team actions before the deadline)

1. [ ] Fill placeholders: team name, member names.
2. [ ] Create the demo (7-slide deck EN or ≤30s video) and host it publicly;
       paste the link into section 3. Limits are HARD: >7 slides or >30s =
       ineligible for Global Judging.
3. [ ] Verify the Vercel URL opens in a private browser window.
4. [ ] Verify the GitHub repo link opens (public, no login).
5. [ ] Optional but recommended: paste 2–3 of the screenshots from
       `docs/submission/screenshots/` directly into the Project page (JPG/PNG
       up to 10 MB each are allowed on the page itself).
6. [ ] Optional: submit the FortiGuard Web Filter Classification form for the
       Vercel URL (category: web-based application; Company: N/A).
7. [ ] Paste each section above into the matching Project page field.
8. [ ] Tick both agreement boxes and click **Submit for Judging** before
       Sunday, November 15, 11:59 p.m. (your Local Event time).
```
