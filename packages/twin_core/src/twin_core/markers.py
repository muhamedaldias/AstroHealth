"""Single source of truth for marker units (contract MarkerId -> display unit).

Consumed by the synthetic data generator and the measurement repository, so a new
contract marker cannot end up with two different units in two places.
"""

from __future__ import annotations

from bonetwin_contracts import MarkerId

MARKER_UNITS: dict[MarkerId, str] = {
    MarkerId.ctx: "ng/mL",
    MarkerId.p1np: "ng/mL",
    MarkerId.urine_calcium: "mmol/24h",
    MarkerId.vitamin_d_25oh: "nmol/L",
    MarkerId.pth: "pg/mL",
}
