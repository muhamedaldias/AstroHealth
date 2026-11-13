"""Unit tests for scripts/gen_contracts.py regeneration guards."""

from __future__ import annotations

import gen_contracts
import pytest


def test_missing_node_modules_fails_loudly(monkeypatch, tmp_path, capsys) -> None:
    """With web deps not installed the TS step must exit 1, not silently skip.

    A silent skip made gen-check report a false green: stale TS types diff clean
    only because nothing regenerated them.
    """
    (tmp_path / "package.json").touch()  # web project present, deps NOT installed
    monkeypatch.setattr(gen_contracts, "WEB", tmp_path)
    monkeypatch.setattr(gen_contracts.shutil, "which", lambda _: "npm-fake")
    with pytest.raises(SystemExit) as exc:
        gen_contracts.gen_web_types()
    assert exc.value.code == 1
    assert "run: npm --prefix apps/web install" in capsys.readouterr().err
