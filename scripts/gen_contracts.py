"""Regenerate every artefact derived from contracts/openapi.yaml.

    uv run python scripts/gen_contracts.py

Outputs (all committed, none hand-edited):
  - packages/contracts_py/src/bonetwin_contracts/models.py   (pydantic v2)
  - apps/web/src/api/schema.d.ts                             (TypeScript types)
  - .github/CODEOWNERS                                       (from OWNERSHIP.yaml)
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "contracts" / "openapi.yaml"
PY_OUT = ROOT / "packages" / "contracts_py" / "src" / "bonetwin_contracts" / "models.py"
WEB = ROOT / "apps" / "web"


def run(cmd: list[str], cwd: Path = ROOT) -> None:
    print("$", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def gen_web_types() -> None:
    """Regenerate apps/web/src/api/schema.d.ts. Requires the web deps to be installed.

    Missing node_modules must fail loudly: silently skipping would leave stale TS
    types in place and gen-check would report a false green.
    """
    npm = shutil.which("npm")
    if npm and (WEB / "package.json").exists() and (WEB / "node_modules").exists():
        run([npm, "run", "--silent", "gen:api"], cwd=WEB)
    else:
        print("! TypeScript types NOT regenerated — run: npm --prefix apps/web install", file=sys.stderr)
        raise SystemExit(1)


def main() -> int:
    run(
        [
            sys.executable,
            "-m",
            "datamodel_code_generator",
            "--input",
            str(SPEC),
            "--input-file-type",
            "openapi",
            "--output",
            str(PY_OUT),
            "--output-model-type",
            "pydantic_v2.BaseModel",
            "--target-python-version",
            "3.11",
            "--use-standard-collections",
            "--use-union-operator",
            "--use-annotated",
            "--field-constraints",
            "--strict-nullable",
            "--disable-timestamp",
            "--enum-field-as-literal",
            "one",
        ]
    )
    gen_web_types()
    run([sys.executable, str(ROOT / "scripts" / "gen_codeowners.py")])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
