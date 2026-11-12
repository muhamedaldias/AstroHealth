"""Illustrative astronaut telemetry scenarios and non-clinical risk arithmetic."""

from typing import Dict, List, Any

ASTRONAUT_COHORT: List[Dict[str, Any]] = [
    {
        "id": "ASTRO-042",
        "name": "Dr. Sarah Chen",
        "name_ar": "د. سارة تشن",
        "role": "Mission Specialist / Flight Biologist",
        "role_ar": "أخصائية المهمة / عالمة الأحياء الفضائية",
        "mission": "ISS Expedition 71 (LEO Orbit)",
        "mission_ar": "بعثة المحطة الفضائية 71 (مدار أرضي منخفض)",
        "space_days": 184,
        "radiation_msv": 146.8,
        "eva_hours": 18.5,
        "age": 39,
        "blood_type": "O+",
        "baseline_bmd_t_score": -0.2,
        "current_bmd_t_score": -1.1,
        "bone_loss_risk_percentage": 14.8,
        "dna_damage_index": 38.2,
        "cellular_repair_efficiency": 82.5,
        "cohort_type": "simulated_mission_telemetry",
    },
    {
        "id": "ASTRO-089",
        "name": "Cdr. Tariq Mansoor",
        "name_ar": "القائد طارق منصور",
        "role": "Mission Commander / Lunar Habitat Lead",
        "role_ar": "قائد المهمة / المشرف على القاعدة القمرية",
        "mission": "Artemis III Basecamp (Lunar South Pole)",
        "mission_ar": "قاعدة أرتيمس 3 (القطب الجنوبي للقمر)",
        "space_days": 270,
        "radiation_msv": 268.4,
        "eva_hours": 42.0,
        "age": 44,
        "blood_type": "A+",
        "baseline_bmd_t_score": 0.4,
        "current_bmd_t_score": -1.6,
        "bone_loss_risk_percentage": 23.4,
        "dna_damage_index": 52.8,
        "cellular_repair_efficiency": 74.0,
        "cohort_type": "simulated_mission_telemetry",
    },
    {
        "id": "ASTRO-114",
        "name": "Dr. Elena Rostova",
        "name_ar": "د. إيلينا روستوفا",
        "role": "Payload Commander / Systems Engineer",
        "role_ar": "قائدة الحمولة / مهندسة النظم",
        "mission": "Deep Space Gateway Orbital Station",
        "mission_ar": "محطة البوابة الفضائية في المدار العميق",
        "space_days": 340,
        "radiation_msv": 312.2,
        "eva_hours": 26.0,
        "age": 41,
        "blood_type": "B+",
        "baseline_bmd_t_score": -0.1,
        "current_bmd_t_score": -1.9,
        "bone_loss_risk_percentage": 28.6,
        "dna_damage_index": 64.1,
        "cellular_repair_efficiency": 68.2,
        "cohort_type": "simulated_mission_telemetry",
    },
    {
        "id": "ASTRO-205",
        "name": "Col. Marcus Vance",
        "name_ar": "العقيد ماركوس فانس",
        "role": "Expedition Commander / Deep Space Pilot",
        "role_ar": "قائد البعثة / طيار الفضاء السحيق",
        "mission": "Mars Transit Vehicle (Trans-Mars Injection Phase)",
        "mission_ar": "مركبة العبور إلى المريخ (مرحلة مسار المريخ)",
        "space_days": 520,
        "radiation_msv": 438.7,
        "eva_hours": 64.0,
        "age": 48,
        "blood_type": "AB+",
        "baseline_bmd_t_score": 0.2,
        "current_bmd_t_score": -2.3,
        "bone_loss_risk_percentage": 37.9,
        "dna_damage_index": 79.5,
        "cellular_repair_efficiency": 57.3,
        "cohort_type": "simulated_mission_telemetry",
    },
]


def calculate_spaceflight_risks(space_days: int, radiation_msv: float) -> Dict[str, float]:
    """Return illustrative scenario indices, not OSDR-fitted human predictions."""
    base_bone_loss = (space_days / 30.0) * 2.25
    radiation_risk = (radiation_msv / 500.0) * 60.0

    bone_risk = min(45.0, round(base_bone_loss + radiation_msv * 0.02, 1))
    dna_damage = min(95.0, round(radiation_risk + space_days * 0.05, 1))
    repair_efficiency = max(40.0, round(100.0 - dna_damage * 0.55, 1))

    return {
        "bone_loss_risk_percentage": bone_risk,
        "dna_damage_index": dna_damage,
        "cellular_repair_efficiency": repair_efficiency,
    }
