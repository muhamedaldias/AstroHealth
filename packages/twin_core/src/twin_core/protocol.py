"""The Engine contract between Backend and AI/Data.

The backend builds an `EngineInput` (generated from contracts/openapi.yaml) and calls
`engine.forecast(...)`. The engine returns a `Forecast`. Nothing else crosses this boundary.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from bonetwin_contracts import EngineInfo, EngineInput, Forecast


class EngineError(Exception):
    """Raise for any expected failure (bad input combination, missing data)."""


@runtime_checkable
class Engine(Protocol):
    @property
    def info(self) -> EngineInfo: ...

    def forecast(self, inp: EngineInput) -> Forecast:
        """Pure function of `inp`: same input -> same output. No network, no global state."""
        ...

    def model_card(self) -> dict:
        """Assumptions, limitations, data sources, disclaimer (shown in the UI)."""
        ...
