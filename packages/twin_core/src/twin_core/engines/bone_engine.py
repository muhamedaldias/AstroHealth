"""Calibrated statistical bone-loss engine.

Deterministic, dependency-free replacement for the day-0 stub: a linear,
repeated-measures style model calibrated to published ISS analog rates.

Rules enforced by the surrounding suite:
  * PURE: same EngineInput -> byte-for-byte identical Forecast (excluding the
    server-side ``generated_at`` timestamp).
  * NO network, NO mutable globals at inference time.
  * Output always validates against the contract-generated ``Forecast`` model.

Calibration anchors (public, open-source space-medicine sources):
  * NASA fundamentals of human health / NASA-STD-3001: ~1-1.5% mineral loss per
    month at weight-bearing sites (Skylab onward).
  * ESA: proximal femoral loss ~1.5%/month (~10% over a 6-month ISS stay).
  * Axpe et al. 2020 (Mars transit modeling): femoral neck ~1.06%/month linear.
  * NASA-STD-3001 STRIVES: antiresorptive (bisphosphonate) therapy reduces
    loss to roughly 0% over a 6-month mission.

The countermeasure factors below are therefore literature-grounded, but they
remain illustrative so the science owner can replace the constants later.
"""

from __future__ import annotations

import random
from datetime import UTC, datetime
from math import sqrt
from statistics import NormalDist

from bonetwin_contracts import (
    BoneSite,
    Driver,
    DriverDirection,
    EngineInfo,
    EngineInput,
    EngineKind,
    Forecast,
    ForecastPoint,
    MarkerId,
    RiskLevel,
    RiskSummary,
    SiteForecast,
)

DISCLAIMER = (
    "Research prototype built for a hackathon. Not a medical device. Outputs are "
    "decision support for a qualified flight surgeon and must never replace "
    "clinical judgement."
)

# --------------------------------------------------------------------------- #
#  Calibration constants
# --------------------------------------------------------------------------- #
# Percentage change per 30 days, weight-bearing sites (ISS analog, 1-1.5%/mo).
_SITE_MONTHLY_RATE_PCT: dict[BoneSite, float] = {
    BoneSite.lumbar_spine: -1.15,
    BoneSite.femoral_neck: -1.25,
    BoneSite.total_hip: -1.35,
    BoneSite.distal_tibia: -0.95,
}

# Uncertainty (standard deviation at end of mission, express in % change) per site.
_SITE_SD: dict[BoneSite, float] = {
    BoneSite.lumbar_spine: 0.30,
    BoneSite.femoral_neck: 0.35,
    BoneSite.total_hip: 0.40,
    BoneSite.distal_tibia: 0.35,
}

# Countermeasure multiplier on the fractional loss rate (literature-grounded).
# E.g. resistive exercise ~30-40% mitigation, bisphosphonate ~50% mitigation.
_CM_MULT: dict[str, float] = {
    "resistive_exercise": 0.62,
    "flywheel_device": 0.82,
    "vitamin_d_calcium": 0.95,
    "bisphosphonate": 0.48,
}

# Probability threshold at the end of the horizon used for risk classification.
_THRESHOLD_PCT = -10.0

# Output cadence (days).
_STEP_DAYS = 15

# Deterministic per-crew random effect (drawn at import time, fixed per crew id),
# so the same engine + crew + plan always yields the same model.
_RNG = random.Random(12345)
_CREW_EFFECTS = {cid: _RNG.uniform(-0.02, 0.02) for cid in ("crew-01", "crew-02", "crew-03", "crew-04")}

# Scenario modifier on the fractional loss rate. Lunar partial gravity reduces
# the rate; LEO and deep-space transit are treated as (near) weightlessness.
_SCENARIO_G: dict[str, float] = {
    "iss-180": 1.0,
    "lunar-90": 0.7,
    "mars-transit-210": 1.0,
}

_SITE_G: dict[BoneSite, float] = {
    BoneSite.lumbar_spine: 1.00,
    BoneSite.femoral_neck: 0.84,
    BoneSite.total_hip: 0.98,
    BoneSite.distal_tibia: 0.95,
}


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


class CalibratedBoneEngine:
    @property
    def info(self) -> EngineInfo:
        return EngineInfo(name="calibrated_bone", version="0.1.0", kind=EngineKind.statistical)

    def model_card(self) -> dict:
        return {
            "assumptions": [
                "Bone loss is a linear fractional loss per month at weight-bearing "
                "sites, calibrated to published ISS analog rates (~1.0-1.5%/month).",
                "Countermeasure effect multiplies the fractional loss rate: "
                "resistive exercise ~0.6x, bisphosphonate ~0.5x, vitamin D/calcium "
                "~0.95x, flywheel ~0.8x (literature-grounded, subject to revision).",
                "An elevated resorption signal (CTX at the latest post-flight "
                "measurement relative to pre-flight) scales the rate between "
                "0.5x and 1.6x (catabolic/personalised response).",
                "Lunar partial gravity reduces the loss rate by ~30% (_SCENARIO_G['lunar-90'] = 0.7).",
                "Uncertainty grows with the square root of mission day and is scaled per site.",
                "Each crew member carries a small fixed random effect, drawn "
                "deterministically at import time.",
            ],
            "limitations": [
                "Normalised to published ISS analog rates; not fitted to any one "
                "astronaut, and the cohort is small.",
                "Deterministic and directionally faithful, not a full probabilistic predictive model.",
                "Personalisation is limited to the CTX resorption ratio and a cohort random effect.",
                "No recovery modelling across the return to Earth gravity.",
                "Real clinical decision support is outside this prototype's scope.",
            ],
            "data_sources": [
                {
                    "name": "NASA Fundamentals of Human Health / NASA-STD-3001",
                    "url": "https://www.nasa.gov/reference/fundamentals-of-human-health/",
                    "usage": "Anchor for baseline monthly weight-bearing loss rates (1-1.5%/mo).",
                },
                {
                    "name": "ESA - Preventing Bone Loss in Space",
                    "url": "https://www.esa.int/articles/preventing-bone-loss-in-space",
                    "usage": "Proximal femoral loss ~1.5%/month over a 6-month ISS stay.",
                },
                {
                    "name": "Axpe et al. 2020 - A human mission to Mars: Predicting bone mineral density",
                    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6975633/",
                    "usage": "Femoral neck ~1.06%/month linear loss (deep-space anchor).",
                },
                {
                    "name": "NASA-STD-3001 STRIVES antiresorptive trial",
                    "url": "https://www.nasa.gov/wp-content/uploads/2020/10/2022-01-05_nasa-std-3001_vol.1_rev._b_final_draft_with_signature_010522.pdf",
                    "usage": "Bisphosphonate reduces loss to ~0% over 6 months "
                    "(supports the ~0.5x countermeasure factor).",
                },
                {
                    "name": "Internal calibrated model",
                    "url": None,
                    "usage": "Multiplicative countermeasure factors and per-site uncertainty scaling.",
                },
            ],
            "disclaimer": DISCLAIMER,
        }

    def forecast(self, inp: EngineInput) -> Forecast:
        crew_id = inp.crew.id
        scenario_id = inp.scenario.id
        horizon = inp.scenario.duration_days

        # De-duplicate countermeasure ids, preserving order.
        cms = list(dict.fromkeys(c.id for c in inp.countermeasures))
        cm_factor = 1.0
        for cid in cms:
            cm_factor *= _CM_MULT.get(cid, 1.0)

        # Catabolic/personalised correction from the latest post-flight CTX.
        ctx_ratio = self._resorption_ratio(inp)
        adj = _clamp(1.0 + 0.4 * (ctx_ratio - 1.0), 0.5, 1.6) if ctx_ratio is not None else 1.0
        personal = _clamp(1.0 + 0.05 * _CREW_EFFECTS.get(crew_id, 0.0) / 0.02, 0.8, 1.2)

        scenario_g = _SCENARIO_G.get(scenario_id, 1.0)

        sites: list[SiteForecast] = []
        for site in _SITE_MONTHLY_RATE_PCT:
            monthly = _SITE_MONTHLY_RATE_PCT[site] * cm_factor * adj * personal * scenario_g
            sd = _SITE_SD[site]
            points: list[ForecastPoint] = []
            for day in self._days(horizon):
                mean = monthly * (day / 30.0)
                sd_day = sd * sqrt(day / 30.0)
                points.append(
                    ForecastPoint(
                        day=day,
                        mean_pct_change=round(mean, 3),
                        lower_95=round(mean - 1.96 * sd_day, 3),
                        upper_95=round(mean + 1.96 * sd_day, 3),
                    )
                )
            end = points[-1]
            sd_end = max((end.upper_95 - end.mean_pct_change) / 1.96, 1e-6)
            p = NormalDist(end.mean_pct_change, sd_end).cdf(_THRESHOLD_PCT)
            level = RiskLevel.high if p >= 0.5 else RiskLevel.moderate if p >= 0.15 else RiskLevel.low
            sites.append(
                SiteForecast(
                    site=site,
                    points=points,
                    risk=RiskSummary(
                        threshold_pct_change=_THRESHOLD_PCT,
                        prob_below_threshold_at_end=round(p, 4),
                        level=level,
                    ),
                )
            )

        drivers: list[Driver] = []
        for cid in cms:
            f = _CM_MULT.get(cid, 1.0)
            drivers.append(
                Driver(
                    signal=cid,
                    direction=DriverDirection.protective if f < 1.0 else DriverDirection.neutral,
                    weight=round(min(1.0, abs(1.0 - f)), 2),
                    explanation=f"Illustrative loss-rate multiplier x{f}.",
                )
            )

        if ctx_ratio is not None:
            drivers.append(
                Driver(
                    signal="ctx_vs_baseline",
                    direction=DriverDirection.harmful if adj > 1.0 else DriverDirection.protective,
                    weight=round(min(1.0, abs(adj - 1.0) * 2.0), 2),
                    explanation=f"Latest CTX is {ctx_ratio:.2f}x the pre-flight value.",
                )
            )

        if scenario_g < 1.0:
            drivers.append(
                Driver(
                    signal="lunar_environment",
                    direction=DriverDirection.protective,
                    weight=round(min(1.0, (1.0 - scenario_g) * 3.0), 2),
                    explanation="Partial gravity lessens bone loading.",
                )
            )

        return Forecast(
            crew_id=crew_id,
            scenario_id=scenario_id,
            countermeasure_ids=cms,
            horizon_days=horizon,
            generated_at=datetime.now(UTC),
            engine=self.info,
            sites=sites,
            drivers=drivers,
            warnings=[
                "Calibrated statistical model: directionally faithful, probabilistic, "
                "for decision support only.",
                "Clinical disclaimer applies; any trajectory near or past the review "
                "threshold must be validated by a flight surgeon.",
            ],
            requires_physician_review=True,
            disclaimer=DISCLAIMER,
        )

    @staticmethod
    def _days(horizon: int) -> list[int]:
        days = list(range(0, horizon, _STEP_DAYS))
        return [*days, horizon]

    @staticmethod
    def _resorption_ratio(inp: EngineInput) -> float | None:
        ctx = sorted((m for m in inp.measurements if m.marker == MarkerId.ctx), key=lambda m: m.mission_day)
        pre = [m for m in ctx if m.mission_day < 0]
        post = [m for m in ctx if m.mission_day >= 0]
        if not pre or not post or pre[-1].value == 0:
            return None
        return post[-1].value / pre[-1].value
