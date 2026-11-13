"""UI-facing telemetry: the contract crew enriched with simulated mission telemetry.

Static profiles (names, roles, missions, radiation/EVA/DNA indices) are the demo
cohort's simulated telemetry. Dynamic bone data (baseline/current T-score,
bone-loss risk) is derived from the contract fixtures and the real engine forecast,
so the UI reflects the actual twin. All numbers are illustrative, never clinical.
"""

from __future__ import annotations

from bonetwin_contracts import TelemetryCrewMember, TelemetryCrewPayload

from .catalog import Catalog
from .service import ForecastService

_DEFAULT_SCENARIO = "iss-180"
_DEFAULT_COUNTERMEASURES = ("resistive_exercise",)

# Illustrative femoral-neck T-score mapping: T = (BMD[g/cm2] - 1.0) / 0.10.
# Monotone and deterministic, not a clinical conversion.
_T_SCORE_REF_BMD = 1.0
_T_SCORE_SD = 0.10

# Simulated telemetry profiles keyed by contract crew id; static values ported
# from the frontend-data branch demo cohort (order-stable, deterministic).
_PROFILES: dict[str, dict[str, object]] = {
    "crew-01": {
        "name": "Dr. Sarah Chen",
        "name_ar": "د. سارة تشن",
        "role": "Mission Specialist / Flight Biologist",
        "role_ar": "أخصائية المهمة / عالمة الأحياء الفضائية",
        "mission": "ISS Expedition 71 (LEO Orbit)",
        "mission_ar": "بعثة المحطة الفضائية 71 (مدار أرضي منخفض)",
        "space_days": 184,
        "radiation_msv": 146.8,
        "eva_hours": 18.5,
        "blood_type": "O+",
        "dna_damage_index": 38.2,
        "cellular_repair_efficiency": 82.5,
    },
    "crew-02": {
        "name": "Cdr. Tariq Mansoor",
        "name_ar": "القائد طارق منصور",
        "role": "Mission Commander / Lunar Habitat Lead",
        "role_ar": "قائد المهمة / المشرف على القاعدة القمرية",
        "mission": "Artemis III Basecamp (Lunar South Pole)",
        "mission_ar": "قاعدة أرتيمس 3 (القطب الجنوبي للقمر)",
        "space_days": 270,
        "radiation_msv": 268.4,
        "eva_hours": 42.0,
        "blood_type": "A+",
        "dna_damage_index": 52.8,
        "cellular_repair_efficiency": 74.0,
    },
    "crew-03": {
        "name": "Dr. Elena Rostova",
        "name_ar": "د. إيلينا روستوفا",
        "role": "Payload Commander / Systems Engineer",
        "role_ar": "قائدة الحمولة / مهندسة النظم",
        "mission": "Deep Space Gateway Orbital Station",
        "mission_ar": "محطة البوابة الفضائية في المدار العميق",
        "space_days": 340,
        "radiation_msv": 312.2,
        "eva_hours": 26.0,
        "blood_type": "B+",
        "dna_damage_index": 64.1,
        "cellular_repair_efficiency": 68.2,
    },
    "crew-04": {
        "name": "Col. Marcus Vance",
        "name_ar": "العقيد ماركوس فانس",
        "role": "Expedition Commander / Deep Space Pilot",
        "role_ar": "قائد البعثة / طيار الفضاء السحيق",
        "mission": "Mars Transit Vehicle (Trans-Mars Injection Phase)",
        "mission_ar": "مركبة العبور إلى المريخ (مرحلة مسار المريخ)",
        "space_days": 520,
        "radiation_msv": 438.7,
        "eva_hours": 64.0,
        "blood_type": "AB+",
        "dna_damage_index": 79.5,
        "cellular_repair_efficiency": 57.3,
    },
}

_FALLBACK_LABELS = {
    "name": "",
    "name_ar": "",
    "role": "Crew Member",
    "role_ar": "فريق الطاقم",
    "mission": "Simulated mission",
    "mission_ar": "مهمة محاكاة",
}


def _baseline_t_score(catalog: Catalog, crew_id: str) -> float:
    crew = catalog.crew_member(crew_id)
    if crew is None:
        return 0.0
    fn = next(b for b in crew.baseline_bmd if b.site == "femoral_neck")
    return round((fn.bmd_g_cm2 - _T_SCORE_REF_BMD) / _T_SCORE_SD, 2)


class TelemetryService:
    """Composes Catalog + Engine forecast into the UI-facing telemetry roster."""

    def __init__(self, catalog: Catalog, service: ForecastService) -> None:
        self.catalog, self.service = catalog, service

    def payload(self) -> TelemetryCrewPayload:
        members: list[TelemetryCrewMember] = []
        for crew in self.catalog.crew:
            profile = dict(_PROFILES.get(crew.id, {})) or dict(_FALLBACK_LABELS)
            profile.setdefault("space_days", 0)
            profile.setdefault("radiation_msv", 0.0)
            profile.setdefault("eva_hours", 0.0)
            profile.setdefault("blood_type", "O+")
            profile.setdefault("dna_damage_index", 0.0)
            profile.setdefault("cellular_repair_efficiency", 100.0)

            forecast = self.service.forecast(crew.id, _DEFAULT_SCENARIO, list(_DEFAULT_COUNTERMEASURES))
            femoral = next(s for s in forecast.sites if s.site == "femoral_neck")
            end_mean = femoral.points[-1].mean_pct_change
            end_risk = max(s.risk.prob_below_threshold_at_end for s in forecast.sites)
            baseline_t = _baseline_t_score(self.catalog, crew.id)

            members.append(
                TelemetryCrewMember(
                    id=crew.id,
                    name=str(profile["name"]),
                    name_ar=str(profile["name_ar"]),
                    role=str(profile["role"]),
                    role_ar=str(profile["role_ar"]),
                    mission=str(profile["mission"]),
                    mission_ar=str(profile["mission_ar"]),
                    space_days=int(profile["space_days"]),  # type: ignore[arg-type]
                    radiation_msv=float(profile["radiation_msv"]),  # type: ignore[arg-type]
                    eva_hours=float(profile["eva_hours"]),  # type: ignore[arg-type]
                    age=crew.age_years,
                    blood_type=str(profile["blood_type"]),
                    baseline_bmd_t_score=baseline_t,
                    current_bmd_t_score=round(baseline_t + end_mean / 10.0, 2),
                    bone_loss_risk_percentage=round(end_risk * 100.0, 1),
                    dna_damage_index=float(profile["dna_damage_index"]),  # type: ignore[arg-type]
                    cellular_repair_efficiency=float(profile["cellular_repair_efficiency"]),  # type: ignore[arg-type]
                    affected_genes=[],
                    cohort_type="simulated_mission_telemetry",
                    gene_data_source=None,
                )
            )
        return TelemetryCrewPayload(count=len(members), crew=members)
