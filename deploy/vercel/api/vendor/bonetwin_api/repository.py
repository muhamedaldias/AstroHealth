from __future__ import annotations

from datetime import UTC, datetime

from bonetwin_contracts import Measurement, MeasurementCreate
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker
from twin_core import MARKER_UNITS, EngineError

from .db import MeasurementRow


def _to_model(r: MeasurementRow) -> Measurement:
    return Measurement(
        id=r.id,
        crew_id=r.crew_id,
        mission_day=r.mission_day,
        marker=r.marker,
        value=r.value,
        unit=r.unit,
        recorded_at=r.recorded_at.replace(tzinfo=r.recorded_at.tzinfo or UTC),
    )


class MeasurementRepository:
    def __init__(self, sessions: sessionmaker[Session]) -> None:
        self._sessions = sessions

    def seed_if_empty(self, rows: list[Measurement]) -> None:
        # Single-worker demo assumption: startup is the only seeder and the API runs
        # one worker, so the check-then-insert race (two workers seeding twice) is
        # accepted here in exchange for not locking or unique-constraining the seed.
        with self._sessions() as s, s.begin():
            if s.scalars(select(MeasurementRow).limit(1)).first() is not None:
                return
            for m in rows:
                s.add(
                    MeasurementRow(
                        crew_id=m.crew_id,
                        mission_day=m.mission_day,
                        marker=m.marker.value,
                        value=m.value,
                        unit=m.unit,
                        recorded_at=m.recorded_at,
                    )
                )

    def list(self, crew_id: str) -> list[Measurement]:
        with self._sessions() as s:
            q = (
                select(MeasurementRow)
                .where(MeasurementRow.crew_id == crew_id)
                .order_by(MeasurementRow.mission_day, MeasurementRow.id)
            )
            return [_to_model(r) for r in s.scalars(q)]

    def add(self, crew_id: str, body: MeasurementCreate) -> Measurement:
        unit = MARKER_UNITS.get(body.marker)
        if unit is None:
            # Unreachable while the contract and markers.py stay in sync; keeps a future
            # 6th marker from surfacing as a KeyError 500 (it maps to engine_error 422).
            raise EngineError(f"marker '{body.marker.value}' has no unit mapping")
        with self._sessions() as s, s.begin():
            row = MeasurementRow(
                crew_id=crew_id,
                mission_day=body.mission_day,
                marker=body.marker.value,
                value=body.value,
                unit=unit,
                recorded_at=datetime.now(UTC),
            )
            s.add(row)
            s.flush()
            return _to_model(row)
