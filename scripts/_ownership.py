"""Shared helpers for OWNERSHIP.yaml (used by gen_codeowners.py and check_ownership.py)."""

from __future__ import annotations

import subprocess
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]


def load() -> dict:
    return yaml.safe_load((ROOT / "OWNERSHIP.yaml").read_text(encoding="utf-8"))


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return [line for line in out.splitlines() if line and (ROOT / line).exists()]


def match(path: str, entries: list[dict]) -> dict | None:
    """Longest-prefix match. A trailing '/' means directory prefix, otherwise exact file."""
    best: dict | None = None
    for e in entries:
        p = e["path"]
        hit = path.startswith(p) if p.endswith("/") else path == p
        if hit and (best is None or len(p) > len(best["path"])):
            best = e
    return best
