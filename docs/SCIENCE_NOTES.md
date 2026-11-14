# Science Notes — calibrated statistical bone-loss model

> Status: **filled** for the Space Apps submission. Owner: AI/Data.

## Problem
Long-duration microgravity causes measurable bone-mineral loss at weight-bearing
skeleton sites. The platform forecasts each crew member's per-site BMD trajectory
(with uncertainty), compares countermeasure plans, and flags review thresholds —
decision support for a flight surgeon, not a clinical device.

## Data
* **Real NASA OSDR studies** (differential gene expression, bone/muscle tissue),
  served through the contract endpoint `GET /api/v1/osdr/studies` and shown in the
  UI's NASA Data Logs tab: `OSD-102`, `OSD-137`, `OSD-194`, `OSD-245`, `OSD-48`,
  `OSD-714` (genes include RUNX2, COL1A1, RANKL, TNFRSF11B, SOST, CDKN1A, TP53,
  RAD51, OGG1, SOD2, GPX1).
* **Simulated mission telemetry** (crew roster, biomarker measurements) is
  deterministic and explicitly labelled "Simulated Mission Telemetry" everywhere.
* Biomarker pathway: pre-flight vs in-flight CTX resorption ratio personalises
  the per-crew loss rate.

## Model
`packages/twin_core/src/twin_core/engines/bone_engine.py` — a linear
repeated-measures style statistical model (deterministic, dependency-free):

| Anchor | Source | Value used |
|---|---|---|
| Weight-bearing monthly loss | NASA-STD-3001 / Fundamentals of Human Health | ~1–1.5 %/month |
| Proximal femoral loss | ESA "Preventing Bone Loss in Space" | ~1.5 %/month (≈10 %/6 mo) |
| Femoral neck, deep space | Axpe et al. 2020 (npj Microgravity) | ~1.06 %/month linear |
| Antiresorptive therapy | NASA-STD-3001 STRIVES | bisphosphonate ≈ 0 %/6 mo → ~0.48× factor |

Per-site calibrated monthly rates: lumbar −1.15 %, femoral neck −1.25 %,
total hip −1.35 %, distal tibia −0.95 %. Countermeasure multipliers: resistive
exercise 0.62×, flywheel 0.82×, vitamin D/calcium 0.95×, bisphosphonate 0.48×.
CTX resorption ratio scales the rate 0.5–1.6× (personalised catabolic response).
Lunar partial gravity reduces the rate ×0.70; uncertainty grows √(mission day)
with per-site SD (0.30–0.40).

## Validation
* The engine contract suite runs **every registered engine** (stub + calibrated)
  against shape, ordering, band-sanity, determinism and model-card assertions
  (`packages/twin_core/tests/`).
* Contract parity tests keep the API ↔ OpenAPI spec byte-fresh (0.1.3).
* Live E2E on the deployment box verified calibrated trajectories through the UI.

## Limitations
* Population-level calibration (published analog rates), not fitted to any one
  astronaut; the demo cohort is simulated.
* Directionally faithful, not a full probabilistic predictive model; no recovery
  modelling after return to Earth gravity; no ML component yet (contract reserves
  the `ml` engine kind).
* Clinical decision support is out of scope — the UI and every payload carry the
  disclaimer and `requires_physician_review: true`.

## Next
* Fit per-site hierarchical models on the full OSDR bone-expression datasets.
* Replace the illustrative countermeasure multipliers with meta-analytic effect
  sizes; add recovery-phase modelling.
