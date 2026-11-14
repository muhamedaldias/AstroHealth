"""STUB engine: deterministic, illustrative numbers so Backend and Frontend can integrate
on day 0. It is NOT the science. The AI/Data owner replaces it with a real engine.

Rates are placeholders in the order of magnitude reported for ISS crews (about 1%/month
at weight-bearing sites); multipliers are illustrative, not clinical.
"""

from __future__ import annotations

from datetime import UTC, datetime
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
    "Research prototype built for a hackathon. Not a medical device. Outputs are decision "
    "support for a qualified flight surgeon and must never replace clinical judgement."
)

# percent change per 30 days (illustrative)
_MONTHLY_RATE = {
    BoneSite.lumbar_spine: -1.0,
    BoneSite.femoral_neck: -1.1,
    BoneSite.total_hip: -1.2,
    BoneSite.distal_tibia: -0.8,
}
# multiplier on the loss rate (illustrative)
_CM_FACTOR = {
    "resistive_exercise": 0.65,
    "flywheel_device": 0.80,
    "vitamin_d_calcium": 0.95,
    "bisphosphonate": 0.50,
}
_THRESHOLD = -10.0
_STEP_DAYS = 15


class StubEngine:
    @property
    def info(self) -> EngineInfo:
        return EngineInfo(name="stub", version="0.1.0", kind=EngineKind.stub)

    def model_card(self) -> dict:
        return {
            "assumptions": ["Linear loss per site with illustrative countermeasure multipliers."],
            "limitations": [
                "Stub engine: numbers are placeholders, not fitted to any dataset.",
                "No personalisation beyond a simple resorption-marker ratio.",
            ],
            "data_sources": [
                {
                    "name": "None (stub)",
                    "url": None,
                    "usage": "Placeholder until the real engine is fitted.",
                }
            ],
            "disclaimer": DISCLAIMER,
        }

    def forecast(self, inp: EngineInput) -> Forecast:
        horizon = inp.scenario.duration_days
        ids = [c.id for c in inp.countermeasures]
        factor = 1.0
        drivers: list[Driver] = []
        for cid in ids:
            f = _CM_FACTOR.get(cid, 1.0)
            factor *= f
            drivers.append(
                Driver(
                    signal=cid,
                    direction=DriverDirection.protective if f < 1 else DriverDirection.neutral,
                    weight=round(min(1.0, abs(1 - f)), 2),
                    explanation=f"Illustrative loss-rate multiplier x{f}.",
                )
            )
        ratio = self._resorption_ratio(inp)
        if ratio is not None:
            adj = min(1.4, max(0.8, 1 + 0.3 * (ratio - 1)))
            factor *= adj
            drivers.append(
                Driver(
                    signal="ctx_vs_baseline",
                    direction=DriverDirection.harmful if adj > 1 else DriverDirection.protective,
                    weight=round(min(1.0, abs(adj - 1) * 2), 2),
                    explanation=f"Latest CTX is {ratio:.2f}x the pre-flight value.",
                )
            )
        sites: list[SiteForecast] = []
        for site, monthly in _MONTHLY_RATE.items():
            points = []
            for day in self._days(horizon):
                mean = monthly * factor * day / 30
                sd = 0.35 * (day / 30) ** 0.5
                points.append(
                    ForecastPoint(
                        day=day,
                        mean_pct_change=round(mean, 3),
                        lower_95=round(mean - 1.96 * sd, 3),
                        upper_95=round(mean + 1.96 * sd, 3),
                    )
                )
            end = points[-1]
            sd_end = max((end.upper_95 - end.mean_pct_change) / 1.96, 1e-6)
            p = NormalDist(end.mean_pct_change, sd_end).cdf(_THRESHOLD)
            level = RiskLevel.high if p >= 0.5 else RiskLevel.moderate if p >= 0.15 else RiskLevel.low
            sites.append(
                SiteForecast(
                    site=site,
                    points=points,
                    risk=RiskSummary(
                        threshold_pct_change=_THRESHOLD,
                        prob_below_threshold_at_end=round(p, 4),
                        level=level,
                    ),
                )
            )
        return Forecast(
            crew_id=inp.crew.id,
            scenario_id=inp.scenario.id,
            countermeasure_ids=ids,
            horizon_days=horizon,
            generated_at=datetime.now(UTC),
            engine=self.info,
            sites=sites,
            drivers=drivers,
            warnings=["Stub engine: illustrative numbers only."],
            requires_physician_review=True,  # stub: always flag for a human
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
