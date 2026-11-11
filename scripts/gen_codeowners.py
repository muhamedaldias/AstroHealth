"""Generate .github/CODEOWNERS from OWNERSHIP.yaml (single source of truth)."""

from __future__ import annotations

from _ownership import ROOT, load

HEADER = (
    "# GENERATED from OWNERSHIP.yaml by scripts/gen_codeowners.py - do not edit by hand.\n"
    "# GitHub rule: LAST matching line wins, so specific paths come after general ones.\n"
    "# NOTE: GitHub requires approval from ANY listed owner, not all of them. The 'contract PR\n"
    "# needs both other members' rule is a team rule (docs/team/TEAM_CONTRACT.md).\n\n"
)


def main() -> None:
    cfg = load()
    handles = {k: v["handle"] for k, v in cfg["people"].items()}
    entries = sorted(cfg["paths"], key=lambda e: len(e["path"]))  # general -> specific
    lines = []
    for e in entries:
        pat = "/" + e["path"]
        lines.append(f"{pat:<45} {' '.join(handles[o] for o in e['owners'])}")
    out = ROOT / ".github" / "CODEOWNERS"
    out.parent.mkdir(exist_ok=True)
    out.write_text(HEADER + "\n".join(lines) + "\n", encoding="utf-8")
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
