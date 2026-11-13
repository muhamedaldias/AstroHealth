"""The running API must expose EXACTLY the operations declared in contracts/openapi.yaml."""

from __future__ import annotations

from pathlib import Path

import yaml

from bonetwin_api.config import Settings
from bonetwin_api.main import create_app

SPEC = Path(__file__).resolve().parents[3] / "contracts" / "openapi.yaml"
METHODS = {"get", "post", "put", "patch", "delete"}


def _ops(paths: dict) -> set[tuple[str, str, str]]:
    return {
        (m.upper(), p, op["operationId"])
        for p, item in paths.items()
        for m, op in item.items()
        if m in METHODS
    }


def test_api_matches_contract_operations() -> None:
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    app = create_app(Settings(engine="stub"), database_url="sqlite://")
    declared, implemented = _ops(spec["paths"]), _ops(app.openapi()["paths"])
    assert implemented == declared, (
        f"\nmissing in API: {sorted(declared - implemented)}"
        f"\nnot in contract: {sorted(implemented - declared)}"
    )


def test_declared_success_status_codes_match() -> None:
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    app = create_app(Settings(engine="stub"), database_url="sqlite://")
    live = app.openapi()["paths"]
    for path, item in spec["paths"].items():
        for method, op in item.items():
            ok = {c for c in op["responses"] if c.startswith("2")}
            got = {c for c in live[path][method]["responses"] if c.startswith("2")}
            assert ok == got, f"{method.upper()} {path}: contract {ok} vs api {got}"


# --------------------------------------------------------------------------- M2 net

# Component schemas the handwritten contract declares but the live app legitimately does
# not emit: `EngineInput` is the backend<->AI boundary type and no HTTP route references
# it; `Error` is produced by the exception handlers as a raw JSONResponse, and FastAPI
# only emits component schemas reachable from route response models.
_BOUNDARY_ONLY_SCHEMAS = {"EngineInput", "Error"}
# FastAPI auto-adds its internal 422 payload schemas to every live OpenAPI document; the
# handwritten contract expresses the same payload with the `Error` schema instead.
_FRAMEWORK_SCHEMAS = {"ValidationError", "HTTPValidationError"}


def _prop_signature(prop: dict) -> tuple:
    """Canonical (type, item/inner types, nullable) signature of one property schema.

    Normalizes both nullability spellings: OAS 3.0 `nullable: true` (handwritten spec)
    and OAS 3.1 `anyOf: [T, {"type": "null"}]` (what pydantic v2 / FastAPI emit).
    Constraints (minimum/maximum/const/enum/default) are intentionally NOT part of the
    signature; the name-set and status-code tests cover presence, this covers shape.
    A live `anyOf` with two real branches normalizes to ("union", ...) and a property with
    no type/anyOf/$ref normalizes to (None, None, False); this spec contains neither shape.
    """
    nullable = bool(prop.get("nullable"))
    if "$ref" in prop:
        return ("ref", prop["$ref"].rsplit("/", 1)[-1], nullable)
    if "anyOf" in prop:
        branches = prop["anyOf"]
        real = [b for b in branches if b.get("type") != "null"]
        nullable = nullable or len(real) < len(branches)
        if len(real) == 1:
            t, items, _ = _prop_signature(real[0])
            return (t, items, nullable)
        return ("union", tuple(_prop_signature(b) for b in real), nullable)
    if prop.get("type") == "array":
        items = _prop_signature(prop["items"]) if "items" in prop else None
        return ("array", items, nullable)
    return (prop.get("type"), None, nullable)


def _schema_signatures(schemas: dict) -> dict[str, dict[str, tuple]]:
    """Per component schema: map of property name -> canonical type signature."""
    return {
        name: {p: _prop_signature(ps) for p, ps in schema.get("properties", {}).items()}
        for name, schema in schemas.items()
    }


def _component_schemas() -> tuple[dict, dict]:
    spec = yaml.safe_load(SPEC.read_text(encoding="utf-8"))
    app = create_app(Settings(engine="stub"), database_url="sqlite://")
    return spec["components"]["schemas"], app.openapi()["components"]["schemas"]


def _schema_required(schemas: dict) -> dict[str, set[str]]:
    """Per component schema: the set of required property names."""
    return {name: set(schema.get("required", [])) for name, schema in schemas.items()}


def _required_problems(
    spec_req: dict[str, set[str]], live_req: dict[str, set[str]], shared: set[str]
) -> list[str]:
    """Compare required-property sets; a contract-required field must never become optional."""
    problems = []
    for name in sorted(shared):
        missing_in_api = spec_req.get(name, set()) - live_req.get(name, set())
        not_in_contract = live_req.get(name, set()) - spec_req.get(name, set())
        if missing_in_api:
            problems.append(f"{name}: required in contract, optional in API: {sorted(missing_in_api)}")
        if not_in_contract:
            problems.append(f"{name}: required in API, not in contract: {sorted(not_in_contract)}")
    return problems


def test_signature_helper_matches_equivalent_null_spellings() -> None:
    """`nullable: true` (spec) and `anyOf: [T, null]` (app) must normalize to one signature."""
    assert _prop_signature({"type": "string", "nullable": True}) == _prop_signature(
        {"anyOf": [{"type": "string"}, {"type": "null"}]}
    )


def test_component_schema_name_sets_match() -> None:
    spec_schemas, live_schemas = _component_schemas()
    spec_names = set(spec_schemas) - _BOUNDARY_ONLY_SCHEMAS
    live_names = set(live_schemas) - _FRAMEWORK_SCHEMAS
    assert spec_names == live_names, (
        f"\nmissing in API: {sorted(spec_names - live_names)}"
        f"\nnot in contract: {sorted(live_names - spec_names)}"
    )


def test_property_type_signatures_match() -> None:
    spec_schemas, live_schemas = _component_schemas()
    spec_sigs = _schema_signatures(spec_schemas)
    live_sigs = _schema_signatures(live_schemas)
    shared = (set(spec_sigs) - _BOUNDARY_ONLY_SCHEMAS) & (set(live_sigs) - _FRAMEWORK_SCHEMAS)
    problems = []
    for name in sorted(shared):
        sp, lp = spec_sigs[name], live_sigs[name]
        for prop in sorted(set(sp) | set(lp)):
            if prop not in sp:
                problems.append(f"{name}.{prop}: property missing in contract spec")
            elif prop not in lp:
                problems.append(f"{name}.{prop}: property missing in live API")
            elif sp[prop] != lp[prop]:
                problems.append(f"{name}.{prop}: contract {sp[prop]} vs live {lp[prop]}")
    assert not problems, "\n" + "\n".join(problems)


def test_required_lists_match() -> None:
    """Requiredness is a contract dimension the type signature does not cover."""
    spec_schemas, live_schemas = _component_schemas()
    shared = (set(spec_schemas) - _BOUNDARY_ONLY_SCHEMAS) & (set(live_schemas) - _FRAMEWORK_SCHEMAS)
    problems = _required_problems(_schema_required(spec_schemas), _schema_required(live_schemas), shared)
    assert not problems, "\n" + "\n".join(problems)


def test_required_helper_detects_requiredness_drift() -> None:
    """Test-the-tester: the comparator must catch a contract-required field turning optional."""
    problems = _required_problems(
        {"ForecastRequest": {"crew_id", "scenario_id"}},
        {"ForecastRequest": {"crew_id"}},
        {"ForecastRequest"},
    )
    assert problems == ["ForecastRequest: required in contract, optional in API: ['scenario_id']"]


def test_signature_helper_detects_null_drift() -> None:
    """Test-the-tester: the normalizer must catch the M1 drift class.

    Contract says `type: array + items string`; a drifted app emits `anyOf: [array, null]`.
    """
    spec_prop = {"type": "array", "items": {"type": "string"}}
    drifted_prop = {"anyOf": [{"type": "array", "items": {"type": "string"}}, {"type": "null"}]}
    assert _prop_signature(spec_prop) != _prop_signature(drifted_prop)
