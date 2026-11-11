"""Synthetic demo data (fictional crew, catalogs, pre-flight + in-flight biomarkers).

Everything here is SIMULATED. Used to seed the backend and as golden fixtures.
Deterministic: same seed -> same output (so `make gen-check` can diff it).
"""

from __future__ import annotations

import random
from datetime import UTC, datetime, timedelta

UNITS = {
    "ctx": "ng/mL",
    "p1np": "ng/mL",
    "urine_calcium": "mmol/24h",
    "vitamin_d_25oh": "nmol/L",
    "pth": "pg/mL",
}

SCENARIOS = [
    {
        "id": "iss-180",
        "name": "ISS expedition (6 months)",
        "duration_days": 180,
        "description": "Low Earth orbit. Frequent resupply and ground contact.",
    },
    {
        "id": "lunar-90",
        "name": "Lunar surface stay (3 months)",
        "duration_days": 90,
        "description": "Partial gravity. Limited exercise hardware.",
    },
    {
        "id": "mars-transit-210",
        "name": "Mars transit (7 months)",
        "duration_days": 210,
        "description": "Deep space. Communication delay makes onboard autonomy essential.",
    },
]

COUNTERMEASURES = [
    {
        "id": "resistive_exercise",
        "name": "Resistive exercise (ARED-class)",
        "category": "exercise",
        "evidence_level": "established",
        "summary": "Heavy resistive training on a vacuum-cylinder device. Reduces, but does not stop, loss.",
        "contraindications": ["Acute musculoskeletal injury"],
        "requires_physician_approval": False,
    },
    {
        "id": "flywheel_device",
        "name": "Compact flywheel device",
        "category": "exercise",
        "evidence_level": "limited",
        "summary": "Lightweight alternative to ARED for small vehicles; effect on bone is less established.",
        "contraindications": ["Acute musculoskeletal injury"],
        "requires_physician_approval": False,
    },
    {
        "id": "vitamin_d_calcium",
        "name": "Vitamin D and calcium management",
        "category": "nutrition",
        "evidence_level": "established",
        "summary": "Maintain vitamin D status and calcium intake; supportive, not sufficient alone.",
        "contraindications": ["Hypercalciuria or kidney-stone history"],
        "requires_physician_approval": True,
    },
    {
        "id": "bisphosphonate",
        "name": "Anti-resorptive drug (bisphosphonate)",
        "category": "pharmacological",
        "evidence_level": "limited",
        "summary": "Studied with exercise on ISS; may affect post-flight recovery. Flight surgeon decides.",
        "contraindications": ["Renal impairment", "Dental surgery planned"],
        "requires_physician_approval": True,
    },
]

_CREW = [
    ("crew-01", "Nova (fictional)", "female", 38, 1.02),
    ("crew-02", "Atlas (fictional)", "male", 45, 1.12),
    ("crew-03", "Lyra (fictional)", "female", 41, 0.98),
    ("crew-04", "Orion (fictional)", "male", 36, 1.18),
]
_SITE_FACTOR = {"lumbar_spine": 1.00, "femoral_neck": 0.84, "total_hip": 0.98, "distal_tibia": 0.95}


def crew() -> list[dict]:
    out = []
    for cid, name, sex, age, lumbar in _CREW:
        out.append(
            {
                "id": cid,
                "display_name": name,
                "sex": sex,
                "age_years": age,
                "baseline_bmd": [
                    {"site": s, "bmd_g_cm2": round(lumbar * f, 3)} for s, f in _SITE_FACTOR.items()
                ],
            }
        )
    return out


def measurements(seed: int = 7) -> list[dict]:
    rng = random.Random(seed)
    base_time = datetime(2026, 1, 1, tzinfo=UTC)
    rows: list[dict] = []
    next_id = 1
    for cid, *_ in _CREW:
        base = {
            "ctx": rng.uniform(0.35, 0.55),
            "p1np": rng.uniform(40, 60),
            "urine_calcium": rng.uniform(3.0, 5.0),
            "vitamin_d_25oh": rng.uniform(60, 90),
            "pth": rng.uniform(25, 45),
        }
        for day in (-30, 30, 60, 90):
            drift = 0.0 if day < 0 else 0.0015 * day
            for marker, v0 in base.items():
                v = v0 * (1 + (drift if marker in ("ctx", "urine_calcium") else -drift / 3))
                v *= 1 + rng.uniform(-0.04, 0.04)
                rows.append(
                    {
                        "id": next_id,
                        "crew_id": cid,
                        "mission_day": day,
                        "marker": marker,
                        "value": round(v, 3),
                        "unit": UNITS[marker],
                        "recorded_at": (base_time + timedelta(days=day + 30)).isoformat(),
                    }
                )
                next_id += 1
    return rows
