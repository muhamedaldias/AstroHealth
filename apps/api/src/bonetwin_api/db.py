from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import resolve_database_url


class Base(DeclarativeBase):
    pass


class MeasurementRow(Base):
    __tablename__ = "measurements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    crew_id: Mapped[str] = mapped_column(String, index=True)
    mission_day: Mapped[int]
    marker: Mapped[str] = mapped_column(String)
    value: Mapped[float]
    unit: Mapped[str] = mapped_column(String)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


def make_session_factory(url: str) -> sessionmaker[Session]:
    url = resolve_database_url(url)
    kwargs: dict = {}
    if url.endswith(":memory:") or url == "sqlite://":
        kwargs = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
    elif url.startswith("sqlite:///"):
        from pathlib import Path

        Path(url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(url, **kwargs)
    Base.metadata.create_all(engine)
    return sessionmaker(engine, expire_on_commit=False)
