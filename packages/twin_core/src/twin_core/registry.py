"""Engine registry. To add an engine: write it in engines/, register it here, run `make test`.

`tests/test_engine_contract.py` automatically runs the full contract checks on every
registered engine, so a new engine cannot break the backend or the frontend.
"""

from __future__ import annotations

from collections.abc import Callable

from .engines.bone_engine import CalibratedBoneEngine
from .engines.stub import StubEngine
from .protocol import Engine, EngineError

_FACTORIES: dict[str, Callable[[], Engine]] = {
    "stub": StubEngine,
    "calibrated": CalibratedBoneEngine,
    # "bayes": BayesBoneEngine,   # <- AI/Data owner registers the ML engine here
}


def list_engines() -> list[str]:
    return sorted(_FACTORIES)


def get_engine(name: str) -> Engine:
    try:
        return _FACTORIES[name]()
    except KeyError:
        raise EngineError(f"unknown engine '{name}'. available: {', '.join(list_engines())}") from None
