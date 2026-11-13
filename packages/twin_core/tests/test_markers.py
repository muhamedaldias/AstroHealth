"""Guard: the single-source unit map must cover every marker in the contract.

If a marker is added to the contract without a unit, this fails loudly instead of
letting synthetic data and the repository disagree about units.
"""

from __future__ import annotations

from bonetwin_contracts import MarkerId
from twin_core import MARKER_UNITS


def test_marker_units_cover_every_contract_marker() -> None:
    assert set(MARKER_UNITS) == set(MarkerId)


def test_marker_units_have_no_empty_values() -> None:
    assert all(u.strip() for u in MARKER_UNITS.values())
