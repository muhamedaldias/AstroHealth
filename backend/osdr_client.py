"""
NASA OSDR Biological Data API client.

Fetches genuine spaceflight differential-expression tables from the public
NASA Open Science Data Repository (OSDR) and extracts measured log2 fold
changes for the gene panel used by AstroHealth AI.

API documentation: https://visualization.osdr.nasa.gov/biodata/api/
No third-party dependencies are required.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

API_BASE = "https://visualization.osdr.nasa.gov/biodata/api/v2"
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".osdr_cache")
CACHE_TTL_SECONDS = 24 * 60 * 60
HTTP_TIMEOUT = 60
HTTP_TIMEOUT_LARGE = 180

# Human symbol used by the UI -> mouse ortholog symbol used in OSDR tables.
GENE_SYMBOL_MAP: Dict[str, str] = {
    "RUNX2": "Runx2",
    "COL1A1": "Col1a1",
    "SOST": "Sost",
    "CDKN1A": "Cdkn1a",
    "TP53": "Trp53",
    "RAD51": "Rad51",
    "OGG1": "Ogg1",
    "SOD2": "Sod2",
    "GPX1": "Gpx1",
    "RANKL": "Tnfsf11",
    "TNFRSF11B": "Tnfrsf11b",
}

# Each UI gene is sourced from a real study where the ortholog is measured.
GENE_STUDY_MAP: Dict[str, str] = {
    "RUNX2": "OSD-714",
    "COL1A1": "OSD-714",
    "SOST": "OSD-194",
    "CDKN1A": "OSD-137",
    "TP53": "OSD-137",
    "RAD51": "OSD-137",
    "OGG1": "OSD-137",
    "SOD2": "OSD-245",
    "GPX1": "OSD-245",
    "RANKL": "OSD-102",
    "TNFRSF11B": "OSD-48",
}

STUDY_ORDER: List[str] = ["OSD-714", "OSD-102", "OSD-48", "OSD-194", "OSD-137", "OSD-245"]

USER_AGENT = "AstroHealth-AI/1.0 (NASA Space Apps; OSDR integration)"
_refresh_guard = threading.Lock()
_refreshing: set[str] = set()
_refresh_retry_after: Dict[str, float] = {}


def _ensure_cache_dir() -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)


def _cache_path(key: str) -> str:
    return os.path.join(CACHE_DIR, f"{key}.json")


def _cache_read(key: str) -> Tuple[Optional[Any], bool]:
    path = _cache_path(key)
    if not os.path.exists(path):
        return None, False
    try:
        with open(path, "r", encoding="utf-8") as handle:
            envelope = json.load(handle)
        data = envelope.get("data")
        cached_at = float(envelope.get("cached_at", 0))
        return data, (time.time() - cached_at) > CACHE_TTL_SECONDS
    except (OSError, ValueError):
        return None, False


def _cache_write(key: str, data: Any) -> None:
    _ensure_cache_dir()
    path = _cache_path(key)
    tmp_path = f"{path}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as handle:
        json.dump({"cached_at": time.time(), "data": data}, handle)
    os.replace(tmp_path, path)


def _cached_fetch(key: str, loader, force: bool = False) -> Tuple[Any, bool]:
    cached, stale = _cache_read(key)
    if cached is not None and not stale and not force:
        return cached, False
    if cached is not None and stale and not force:
        _schedule_refresh(key, loader)
        return cached, True
    try:
        fresh = loader()
        _cache_write(key, fresh)
        return fresh, False
    except Exception:
        if cached is not None:
            return cached, True
        raise


def _schedule_refresh(key: str, loader) -> None:
    with _refresh_guard:
        if key in _refreshing or _refresh_retry_after.get(key, 0) > time.time():
            return
        _refreshing.add(key)

    def refresh() -> None:
        try:
            _cache_write(key, loader())
        except Exception:
            with _refresh_guard:
                _refresh_retry_after[key] = time.time() + 60
        else:
            with _refresh_guard:
                _refresh_retry_after.pop(key, None)
        finally:
            with _refresh_guard:
                _refreshing.discard(key)

    threading.Thread(target=refresh, name=f"osdr-refresh-{key}", daemon=True).start()


def _http_json(url: str, timeout: int = HTTP_TIMEOUT) -> Any:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _query_url(params: Dict[str, str]) -> str:
    query = urllib.parse.urlencode(params, quote_via=urllib.parse.quote)
    return f"{API_BASE}/query/metadata/?{query}"


def _data_url(params: Dict[str, str]) -> str:
    query = urllib.parse.urlencode(params, quote_via=urllib.parse.quote)
    return f"{API_BASE}/query/data/?{query}"


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text or text.lower() in {"na", "nan", "null", "none", "-"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _utc_now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _find_de_file(osd_id: str) -> str:
    rows = _http_json(
        _query_url(
            {
                "id.accession": osd_id,
                "file.data type": "differential expression",
                "format": "json.records",
            }
        )
    )
    if isinstance(rows, dict):
        rows = [rows]
    names = sorted(
        {
            row.get("file.file name")
            for row in rows or []
            if isinstance(row, dict) and row.get("file.file name")
        }
    )
    if not names:
        raise ValueError(f"No differential-expression file found for {osd_id}")
    preferred = [name for name in names if "rrnarm" not in name.lower()]
    return (preferred or names)[0]


def _select_contrast(columns: List[str]) -> Tuple[str, Optional[str], Optional[str], Optional[str]]:
    log2_columns = [column for column in columns if "log2fc" in column.lower()]
    if not log2_columns:
        raise ValueError("No Log2fc column found in OSDR table")

    def score(column: str) -> int:
        lowered = column.lower()
        value = 0
        has_spaceflight = "space flight" in lowered
        has_ground = "ground control" in lowered
        if has_spaceflight and has_ground:
            value += 100
        if has_spaceflight:
            value += 10
        if has_ground:
            value += 10
        if "microgravity" in lowered or re.search(r"(^|[^a-z])ug([^a-z]|$)", lowered):
            value += 12
        if "centrifugation" in lowered:
            value -= 20
        if "iss" in lowered:
            value += 6
        if "60 day" in lowered:
            value += 4
        if "30 day" in lowered:
            value += 3
        if "basal control" in lowered:
            value -= 20
        if "rrnarm" in lowered:
            value -= 10
        sides = re.split(r"\)v\(", lowered)
        if len(sides) == 2:
            for token in ("~30 day", "~60 day", "carcass", "upon euthanasia"):
                if token in sides[0] and token in sides[1]:
                    value += 5
        return value

    log2_column = max(log2_columns, key=score)
    match = re.search(r"Log2fc(_.*)$", log2_column, re.IGNORECASE)
    suffix = match.group(1) if match else ""

    def find_column(fragment: str) -> Optional[str]:
        for column in columns:
            lowered = column.lower()
            if not column.endswith(suffix):
                continue
            if fragment not in lowered:
                continue
            if fragment == "/p.value" and "adj" in lowered:
                continue
            return column
        return None

    return (
        log2_column,
        find_column("/stat"),
        find_column("/p.value"),
        find_column("/adj.p.value"),
    )


def _pretty_contrast(column: str) -> str:
    match = re.search(r"Log2fc(_.*)$", column, re.IGNORECASE)
    text = match.group(1)[1:] if match else column
    return text.replace("_", ".").strip()


def _extract_genes(payload: Dict[str, Any]) -> Tuple[Dict[str, Dict[str, Any]], str]:
    columns: List[str] = payload.get("columns", [])
    rows: List[List[Any]] = payload.get("data", [])
    if not columns or not rows:
        raise ValueError("OSDR table returned no rows")

    def find_suffix(suffix: str) -> Optional[int]:
        for index, column in enumerate(columns):
            if column.upper().endswith(suffix):
                return index
        return None

    symbol_index = find_suffix("/SYMBOL")
    if symbol_index is None:
        raise ValueError("SYMBOL column not found in OSDR table")
    name_index = find_suffix("/GENENAME")
    ensembl_index = find_suffix("/ENSEMBL")

    log2_column, stat_column, p_column, adj_column = _select_contrast(columns)
    log2_index = columns.index(log2_column)
    stat_index = columns.index(stat_column) if stat_column else None
    p_index = columns.index(p_column) if p_column else None
    adj_index = columns.index(adj_column) if adj_column else None

    row_map: Dict[str, List[Any]] = {}
    for row in rows:
        if symbol_index < len(row):
            row_map[str(row[symbol_index])] = row

    contrast_lower = log2_column.lower()
    ground_pos = contrast_lower.find("ground control")
    space_pos = contrast_lower.find("space flight")
    negate = ground_pos != -1 and space_pos != -1 and ground_pos < space_pos

    genes: Dict[str, Dict[str, Any]] = {}
    for human_symbol, mouse_symbol in GENE_SYMBOL_MAP.items():
        row = row_map.get(mouse_symbol)
        if not row:
            continue
        log2fc = _to_float(row[log2_index])
        if log2fc is None:
            continue
        source_log2fc = log2fc
        if negate:
            log2fc = -log2fc
        stat_value = _to_float(row[stat_index]) if stat_index is not None else None
        p_value = _to_float(row[p_index]) if p_index is not None else None
        adj_p_value = _to_float(row[adj_index]) if adj_index is not None else None
        fold_change = 2 ** log2fc
        genes[human_symbol] = {
            "symbol": mouse_symbol,
            "source_symbol": str(row[symbol_index]),
            "source_log2fc": source_log2fc,
            "ortholog_symbol": human_symbol,
            "mouse_symbol": mouse_symbol,
            "gene_name": row[name_index] if name_index is not None and name_index < len(row) else "",
            "ensembl": row[ensembl_index] if ensembl_index is not None and ensembl_index < len(row) else "",
            "log2fc": round(log2fc, 4),
            "fold_change": round(fold_change, 4),
            "change_percent": round((fold_change - 1) * 100, 1),
            "stat": round(stat_value, 4) if stat_value is not None else None,
            "p_value": p_value,
            "adj_p_value": adj_p_value,
            "significant": (adj_p_value if adj_p_value is not None else p_value) is not None
            and (adj_p_value if adj_p_value is not None else p_value) < 0.05,
            "status": "upregulated" if log2fc > 0 else "downregulated",
            "contrast_column": log2_column,
        }

    return genes, _pretty_contrast(log2_column)


def _study_metadata(osd_id: str) -> Dict[str, Any]:
    raw = _http_json(f"{API_BASE}/dataset/{osd_id}/?format=json")
    return raw.get(osd_id, {}).get("metadata", {})


def _metadata_text(value: Any) -> str:
    if isinstance(value, dict):
        value = list(value.values())
    if isinstance(value, list):
        items = value
    else:
        items = [value]
    return "; ".join(
        str(item)
        for item in items
        if item and str(item).strip().lower() not in {"not applicable", "none", "n/a"}
    )


def _load_study_bundle(osd_id: str) -> Dict[str, Any]:
    metadata = _study_metadata(osd_id)
    file_name = _find_de_file(osd_id)
    payload = _http_json(
        _data_url(
            {
                "id.accession": osd_id,
                "file.file name": file_name,
                "format": "json.split",
            }
        ),
        timeout=HTTP_TIMEOUT_LARGE,
    )
    genes, contrast = _extract_genes(payload)
    mission = metadata.get("mission")
    return {
        "accession": osd_id,
        "glds": metadata.get("identifiers") or "",
        "title": metadata.get("study title") or "",
        "description": metadata.get("study description") or "",
        "organism": _metadata_text(metadata.get("organism")),
        "material_type": metadata.get("material type") or "",
        "project_type": metadata.get("project type") or "",
        "assay": _metadata_text(metadata.get("study assay technology type")),
        "platform": _metadata_text(metadata.get("study assay technology platform")),
        "release_date": metadata.get("study public release date"),
        "tissue_label": _metadata_text(metadata.get("material type")),
        "mission": _metadata_text(mission.get("name") if isinstance(mission, dict) else mission),
        "de_file": file_name,
        "contrast": contrast,
        "genes": genes,
        "source_url": f"{API_BASE}/dataset/{osd_id}/",
        "osdr_url": f"https://osdr.nasa.gov/bio/repo/data/studies/{osd_id}",
        "fetched_at": _utc_now(),
    }


def get_study_bundle(osd_id: str, force: bool = False) -> Tuple[Dict[str, Any], bool]:
    return _cached_fetch(f"bundle_{osd_id}", lambda: _load_study_bundle(osd_id), force=force)


def get_all_studies(force: bool = False) -> List[Dict[str, Any]]:
    studies = []
    for osd_id in STUDY_ORDER:
        key = f"bundle_{osd_id}"
        bundle, stale = _cache_read(key)
        if bundle is None or force:
            if force:
                bundle, stale = get_study_bundle(osd_id, force=True)
            else:
                _schedule_refresh(key, lambda study_id=osd_id: _load_study_bundle(study_id))
                continue
        elif stale:
            _schedule_refresh(key, lambda study_id=osd_id: _load_study_bundle(study_id))
        record = dict(bundle)
        genes = record.get("genes", {})
        for gene_key, gene in genes.items():
            if "source_log2fc" not in gene:
                # A normalized or rounded value cannot be reversed reliably.
                # Do not expose it as source-exact; refresh the bundle instead.
                gene.pop("source_symbol", None)
            if gene.get("mouse_symbol") and not gene.get("ortholog_symbol"):
                gene["symbol"] = gene["mouse_symbol"]
                gene["ortholog_symbol"] = gene_key
            adjusted_p = gene.get("adj_p_value")
            p_value = gene.get("p_value")
            significance_p = adjusted_p if adjusted_p is not None else p_value
            gene["significant"] = significance_p is not None and significance_p < 0.05
        record["organism"] = _metadata_text(record.get("organism"))
        record["tissue_label"] = _metadata_text(record.get("tissue_label") or record.get("material_type"))
        record["assay"] = _metadata_text(record.get("assay"))
        record["mission"] = _metadata_text(record.get("mission"))
        metadata_incomplete = not record.get("mission")
        gene_panel_incomplete = (
            any("source_log2fc" not in gene for gene in genes.values())
            or
            (osd_id == "OSD-102" and "RANKL" not in genes)
            or (osd_id == "OSD-48" and "TNFRSF11B" not in genes)
        )
        if (metadata_incomplete or gene_panel_incomplete) and not force:
            _schedule_refresh(key, lambda study_id=osd_id: _load_study_bundle(study_id))
        stale = stale or metadata_incomplete or gene_panel_incomplete
        record["stale"] = stale
        studies.append(record)
    return studies


def get_gene_panel() -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    studies = {study["accession"]: study for study in get_all_studies()}
    panel: Dict[str, Dict[str, Any]] = {}
    for human_symbol, osd_id in GENE_STUDY_MAP.items():
        study = studies.get(osd_id)
        if not study:
            continue
        gene = study["genes"].get(human_symbol)
        if not gene:
            continue
        panel[human_symbol] = {
            **gene,
            "osdr_id": osd_id,
            "tissue": study["tissue_label"],
            "study_title": study["title"],
            "organism": study["organism"],
            "project_type": study["project_type"],
            "contrast": study["contrast"],
            "source_url": study["source_url"],
            "osdr_url": study["osdr_url"],
        }
    return panel, studies


def enrich_cohort(cohort: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    enriched: List[Dict[str, Any]] = []
    for astronaut in cohort:
        record = dict(astronaut)
        record["affected_genes"] = []
        record.pop("generated_nutritional_recipe", None)
        record["cohort_type"] = "simulated_mission_telemetry"
        record["gene_data_source"] = None
        enriched.append(record)
    return enriched


def get_effect_indexes() -> Dict[str, Optional[float]]:
    panel, _ = get_gene_panel()
    dna_symbols = ["CDKN1A", "TP53", "RAD51", "OGG1"]
    bone_symbols = ["RUNX2", "COL1A1", "SOST"]
    dna_effects = [abs(panel[symbol]["log2fc"]) for symbol in dna_symbols if symbol in panel]
    bone_effects = [abs(panel[symbol]["log2fc"]) for symbol in bone_symbols if symbol in panel]
    return {
        "dna_repair_effect_index": round(sum(dna_effects) / len(dna_effects), 3) if dna_effects else None,
        "bone_remodeling_effect_index": round(sum(bone_effects) / len(bone_effects), 3) if bone_effects else None,
    }
