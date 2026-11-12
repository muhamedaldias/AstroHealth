"""Async PostgreSQL persistence for simulated telemetry and NASA OSDR references."""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import asyncpg
from dotenv import dotenv_values, load_dotenv
from sqlalchemy import DateTime, String, func, select
from sqlalchemy.dialects.postgresql import JSONB, insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"
LOCAL_ENV = dotenv_values(ENV_FILE)
load_dotenv(ENV_FILE)


def _setting(name: str, default: str = "") -> str:
    return os.getenv(name) or str(LOCAL_ENV.get(name) or default)

PG_HOST = _setting("POSTGRES_HOST", "localhost")
PG_PORT = int(_setting("POSTGRES_PORT", "5432"))
PG_USER = _setting("POSTGRES_USER", "postgres")
PG_PASSWORD = _setting("POSTGRES_PASSWORD")
PG_DATABASE = _setting("POSTGRES_DB", "astrohealth_ai")


class Base(DeclarativeBase):
    pass


class AstronautTelemetry(Base):
    __tablename__ = "astronaut_telemetry"

    astronaut_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    updated_at: Mapped[Any] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OsdrStudyRecord(Base):
    __tablename__ = "osdr_study_records"

    accession: Mapped[str] = mapped_column(String(40), primary_key=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    fetched_at: Mapped[Any] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class BioRescueProtocolRecord(Base):
    __tablename__ = "bio_rescue_protocols"

    astronaut_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    scenario_key: Mapped[str] = mapped_column(String(80), primary_key=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    generated_at: Mapped[Any] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _database_url(database: str = PG_DATABASE) -> str:
    from urllib.parse import quote_plus

    return f"postgresql+asyncpg://{quote_plus(PG_USER)}:{quote_plus(PG_PASSWORD)}@{PG_HOST}:{PG_PORT}/{quote_plus(database)}"


async def ensure_database_exists() -> None:
    if not PG_PASSWORD:
        raise RuntimeError("POSTGRES_PASSWORD must be set in the local .env file")
    if not re.fullmatch(r"[A-Za-z0-9_]+", PG_DATABASE):
        raise RuntimeError("POSTGRES_DB may only contain letters, numbers, and underscores")

    connection = await asyncpg.connect(
        host=PG_HOST,
        port=PG_PORT,
        user=PG_USER,
        password=PG_PASSWORD,
        database="postgres",
        timeout=5,
    )
    try:
        exists = await connection.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", PG_DATABASE)
        if not exists:
            await connection.execute(f'CREATE DATABASE "{PG_DATABASE}"')
    finally:
        await connection.close()


async def initialize_database() -> None:
    global _engine, _session_factory
    await ensure_database_exists()
    _engine = create_async_engine(_database_url(), pool_pre_ping=True)
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def close_database() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


def session_factory() -> async_sessionmaker[AsyncSession]:
    if _session_factory is None:
        raise RuntimeError("PostgreSQL database has not been initialized")
    return _session_factory


async def persist_telemetry(crew: list[dict[str, Any]]) -> None:
    if not crew:
        return
    rows = [{"astronaut_id": item["id"], "payload": item} for item in crew]
    statement = insert(AstronautTelemetry).values(rows)
    statement = statement.on_conflict_do_update(
        index_elements=[AstronautTelemetry.astronaut_id],
        set_={"payload": statement.excluded.payload, "updated_at": func.now()},
    )
    async with session_factory()() as session:
        await session.execute(statement)
        await session.commit()


async def persist_studies(studies: list[dict[str, Any]]) -> None:
    if not studies:
        return
    rows = [{"accession": item["accession"], "payload": item} for item in studies]
    statement = insert(OsdrStudyRecord).values(rows)
    statement = statement.on_conflict_do_update(
        index_elements=[OsdrStudyRecord.accession],
        set_={"payload": statement.excluded.payload, "fetched_at": func.now()},
    )
    async with session_factory()() as session:
        await session.execute(statement)
        await session.commit()


async def persist_protocols(protocols: list[dict[str, Any]]) -> None:
    if not protocols:
        return
    rows = [
        {
            "astronaut_id": item["astronaut_id"],
            "scenario_key": item["scenario_key"],
            "payload": item,
        }
        for item in protocols
    ]
    statement = insert(BioRescueProtocolRecord).values(rows)
    statement = statement.on_conflict_do_update(
        index_elements=[BioRescueProtocolRecord.astronaut_id, BioRescueProtocolRecord.scenario_key],
        set_={"payload": statement.excluded.payload, "generated_at": func.now()},
    )
    async with session_factory()() as session:
        await session.execute(statement)
        await session.commit()


async def counts() -> dict[str, int]:
    async with session_factory()() as session:
        return {
            "telemetry": await session.scalar(select(func.count()).select_from(AstronautTelemetry)) or 0,
            "osdr_studies": await session.scalar(select(func.count()).select_from(OsdrStudyRecord)) or 0,
            "bio_rescue_protocols": await session.scalar(select(func.count()).select_from(BioRescueProtocolRecord)) or 0,
        }
