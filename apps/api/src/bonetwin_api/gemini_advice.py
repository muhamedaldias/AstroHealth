from __future__ import annotations

import json
import os

from bonetwin_contracts.models import BioRescueAdviceRequest, BioRescueAdviceResponse

MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

DISCLAIMER = {
    "ar": "أرقام توضيحية لنموذج بحثي، وليست نصيحة طبية.",
    "en": "Illustrative numbers from a research model, not medical advice.",
}

FALLBACK = {
    "ar": {
        "recommendations": [
            "تمارين مقاومة منتظمة للحفاظ على كثافة العظم",
            "متابعة علامات هدم العظم مع طبيب الرحلة",
            "تحسين النوم والإضاءة وجودة الهواء في المقصورة",
        ],
        "genetic_explanation": (
            "التعرض للإشعاع والجاذبية الصغرى قد يؤثر على التعبير الجيني "
            "المرتبط بإصلاح الحمض النووي وتجدد العظم."
        ),
    },
    "en": {
        "recommendations": [
            "Regular resistance exercise to preserve bone density",
            "Track bone-resorption markers with the flight surgeon",
            "Improve sleep, lighting and cabin air quality",
        ],
        "genetic_explanation": (
            "Radiation and microgravity can affect gene expression tied to DNA repair and bone turnover."
        ),
    },
}


def _fallback(lang: str) -> BioRescueAdviceResponse:
    f = FALLBACK[lang]
    return BioRescueAdviceResponse(
        recommendations=f["recommendations"],
        genetic_explanation=f["genetic_explanation"],
        disclaimer=DISCLAIMER[lang],
        source="fallback",
    )


def _prompt(body: BioRescueAdviceRequest) -> str:
    language = "Arabic" if body.lang == "ar" else "English"
    return f"""You are a research assistant for an astronaut bone-health simulator
(a research model, NOT a medical device). Write in {language}.

Simulated indicators:
- days in space: {body.space_days}
- radiation dose (mSv): {body.radiation_msv}
- projected bone-loss risk (%): {body.bone_loss_risk_percentage}
- DNA damage index: {body.dna_damage_index}

Return ONLY JSON: {{"recommendations": [3 to 5 short preventive recommendations
tailored to these indicators, no drug doses], "genetic_explanation": "2-3 sentences
linking radiation and microgravity to gene expression for these indicators"}}"""


def generate_advice(body: BioRescueAdviceRequest) -> BioRescueAdviceResponse:
    lang = body.lang.value
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return _fallback(lang)
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=key, http_options=types.HttpOptions(timeout=15000))
        r = client.models.generate_content(
            model=MODEL,
            contents=_prompt(body),
            config={"response_mime_type": "application/json"},
        )
        data = json.loads(r.text)
        recs = [str(x) for x in data["recommendations"]][:6]
        explanation = str(data["genetic_explanation"])
        if not recs or not explanation:
            return _fallback(lang)
        return BioRescueAdviceResponse(
            recommendations=recs,
            genetic_explanation=explanation,
            disclaimer=DISCLAIMER[lang],
            source="gemini",
        )
    except Exception:
        return _fallback(lang)
