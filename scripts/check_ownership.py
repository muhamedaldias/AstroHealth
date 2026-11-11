"""Fail if any file in the repo has no owner in OWNERSHIP.yaml (no orphan files)."""

from __future__ import annotations

import sys

from _ownership import load, match, tracked_files


def main() -> int:
    cfg = load()
    known = set(cfg["people"])
    bad: list[str] = []
    for e in cfg["paths"]:
        unknown = set(e["owners"]) - known
        if unknown:
            bad.append(f"OWNERSHIP.yaml: {e['path']} lists unknown owner(s) {sorted(unknown)}")
    orphans = [f for f in tracked_files() if match(f, cfg["paths"]) is None]
    for f in orphans:
        bad.append(f"no owner for: {f}  -> add a path entry to OWNERSHIP.yaml")
    if bad:
        print("\n".join(bad))
        return 1
    print(f"ownership OK ({len(tracked_files())} files, all owned)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
