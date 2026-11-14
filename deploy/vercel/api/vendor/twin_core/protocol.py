"""The Engine contract between Backend and AI/Data.

The backend builds an `EngineInput` (generated from contracts/openapi.yaml) and calls
`engine.forecast(...)`. The engine returns a `Forecast`. Nothing else crosses this boundary.
"""

from __future__ import annotations

from typing import Protocol

from bonetwin_contracts import EngineInfo, EngineInput, Forecast


class EngineError(Exception):
    """Raise for any expected failure (bad input combination, missing data)."""


class Engine(Protocol):
    @property
    def info(self) -> EngineInfo: ...

    def forecast(self, inp: EngineInput) -> Forecast:
        """Deterministic in its scientific content: same `inp` -> same predictions.

        The sole permitted non-determinism is the `generated_at` metadata field
        (the contract requires it on `Forecast`; it is stamped envelope metadata,
        not scientific output). No network, no global state.
        """
        ...

    def model_card(self) -> dict:
        """Assumptions, limitations, data sources, disclaimer (shown in the UI)."""
        ...
