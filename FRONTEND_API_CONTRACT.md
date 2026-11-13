# AstroHealth AI — Frontend API Contract

> **Version:** 1.0.0  
> **Generated from:** `src/services/osdrApi.ts` · `src/types/index.ts`  
> **Base URL (dev):** `http://127.0.0.1:8000` (Vite proxies `/api/*` → backend)  
> **Base URL env override:** `VITE_API_BASE` (defaults to `/api`)

---

## Overview

The frontend makes exactly **2 API calls** at runtime, both via `GET`:

| # | Method | Path | Called by |
|---|--------|------|-----------|
| 1 | `GET` | `/api/crew` | On mount — populates astronaut roster |
| 2 | `GET` | `/api/osdr/studies` | On mount + polled every 2.5 s while `sync_status === "syncing"` |

All other endpoints (`/api/health`, `/api/crew/{id}`, `/api/osdr/genes`, `/api/genes/ontology`, `/api/simulation/calculate`) are **backend-only** — the frontend does not call them directly.

---

## Endpoint 1 — `GET /api/crew`

Returns the simulated mission crew roster.

### Response Schema

```jsonc
{
  "count": 4,                               // integer — number of crew members
  "crew": [ /* Astronaut[] — see below */ ],
  "gene_data_source": null,                 // always null (provenance flag)
  "cohort_type": "simulated_mission_telemetry" // literal string — always this value
}
```

### `Astronaut` Object

```jsonc
{
  "id": "ASTRO-042",                        // string  — unique crew ID
  "name": "Dr. Sarah Chen",                // string  — English display name
  "name_ar": "د. سارة تشن",               // string  — Arabic display name
  "role": "Mission Specialist / ...",      // string  — English role title
  "role_ar": "أخصائية المهمة / ...",      // string  — Arabic role title
  "mission": "ISS Expedition 71 (LEO Orbit)", // string — English mission label
  "mission_ar": "بعثة المحطة الفضائية 71 ...", // string — Arabic mission label
  "space_days": 184,                        // integer — days in microgravity
  "radiation_msv": 146.8,                  // float   — cumulative dose in mSv
  "eva_hours": 18.5,                        // float   — EVA hours logged
  "age": 39,                               // integer — crew member age
  "blood_type": "O+",                      // string  — ABO blood group
  "baseline_bmd_t_score": -0.2,            // float   — pre-flight BMD T-score
  "current_bmd_t_score": -1.1,             // float   — current BMD T-score
  "bone_loss_risk_percentage": 14.8,       // float   — simulated bone loss %
  "dna_damage_index": 38.2,               // float   — 0–100 damage index
  "cellular_repair_efficiency": 82.5,     // float   — 0–100 repair index
  "affected_genes": [],                    // AffectedGene[] — always [] in current cohort
  "cohort_type": "simulated_mission_telemetry", // literal string
  "gene_data_source": null                 // always null
}
```

> NOTE: `affected_genes` is always an empty array for the simulated cohort.
> The `AffectedGene` schema is defined below for forward compatibility.

### `AffectedGene` Object (future / type reference)

```jsonc
{
  "symbol": "Tnfsf11",                     // string  — organism gene symbol (OSDR)
  "source_symbol": "Tnfsf11",             // string? — raw symbol from OSDR table
  "source_log2fc": -1.2345,               // float?  — raw log2FC before sign-flip
  "ortholog_symbol": "RANKL",             // string? — human ortholog symbol
  "mouse_symbol": "Tnfsf11",             // string? — mouse symbol alias
  "ensembl": "ENSMUSG00000022015",        // string? — Ensembl ID
  "fold_change": 0.4213,                  // float?  — 2^log2fc
  "log2fc": -1.2456,                      // float   — orientation-corrected log2FC
  "change_percent": -57.87,               // float   — (fold_change - 1) × 100
  "p_value": 0.00123,                     // float|null — raw p-value
  "adj_p_value": 0.0089,                  // float|null — BH-adjusted p-value
  "stat": -4.321,                         // float|null — test statistic
  "gene_name": "Tumor necrosis ...",      // string? — full gene name
  "status": "downregulated",              // "upregulated" | "downregulated"
  "osdr_ref": "OSD-102",                  // string? — source study accession
  "contrast_column": "Log2fc_...",        // string? — raw OSDR column label
  "tissue": "Hindlimb bone",              // string? — tissue / material type
  "contrast": "Space Flight vs ...",      // string? — human-readable contrast
  "measured": true,                       // boolean? — is from a real measurement
  "significant": true                     // boolean|null — adj_p < 0.05
}
```

---

## Endpoint 2 — `GET /api/osdr/studies`

Returns all NASA OSDR study bundles with per-study gene expression records.

### Response Schema

```jsonc
{
  "source": "https://visualization.osdr.nasa.gov/biodata/api/v2", // string — OSDR API base
  "repository": "NASA Open Science Data Repository (OSDR)",       // string — label
  "count": 6,                             // integer — studies currently available
  "expected_count": 6,                    // integer — total expected studies
  "sync_status": "ready",                 // "ready" | "syncing"
  "studies": [ /* OsdrStudy[] — see below */ ]
}
```

> IMPORTANT: When `sync_status === "syncing"`, the frontend polls every **2500 ms** until it
> becomes `"ready"`. Return partial results (what's cached) rather than blocking.

### `OsdrStudy` Object

```jsonc
{
  "accession": "OSD-102",                 // string   — OSDR study ID (primary key)
  "glds": "GLDS-102",                     // string | string[] — legacy GLDS identifier(s)
  "title": "Hindlimb suspension ...",     // string   — study title
  "description": "...",                   // string   — study abstract / description
  "organism": "Mus musculus",             // string   — species
  "material_type": "Hindlimb bone",       // string | string[] — tissue / material
  "project_type": "Spaceflight Study",    // string   — project classification
  "mission": "Space Shuttle STS-131",     // string   — spaceflight mission label
  "assay": "RNA Sequencing",              // string | string[] — assay technology
  "platform": "Illumina HiSeq 2000",     // string | string[] — sequencing platform
  "release_date": 1609459200,             // integer|null — Unix timestamp (ms) or null
  "tissue_label": "Hindlimb bone",        // string   — human-readable tissue label
  "de_file": "GLDS-102_rna_seq_..csv",   // string   — OSDR DE file name
  "contrast": "Space Flight vs ...",      // string   — pretty-printed contrast label
  "genes": {                              // Record<string, AffectedGene> — keyed by human symbol
    "RANKL": { /* AffectedGene — see above */ },
    "TNFRSF11B": { /* AffectedGene */ }
    // ... up to 11 gene symbols total (see table below)
  },
  "source_url": "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-102/",
  "osdr_url": "https://osdr.nasa.gov/bio/repo/data/studies/OSD-102",
  "fetched_at": "2026-11-12T00:00:00Z",  // string — ISO 8601 UTC fetch timestamp
  "stale": false                          // boolean — true if cache needs refresh
}
```

### Gene Symbol Key Set (per study)

Each study only contains the gene symbols measured in that study:

| Study     | Gene Symbols Present                        |
|-----------|---------------------------------------------|
| `OSD-714` | `RUNX2`, `COL1A1`                           |
| `OSD-102` | `RANKL`                                     |
| `OSD-48`  | `TNFRSF11B`                                 |
| `OSD-194` | `SOST`                                      |
| `OSD-137` | `CDKN1A`, `TP53`, `RAD51`, `OGG1`          |
| `OSD-245` | `SOD2`, `GPX1`                              |

---

## Field Name Alignment Summary

| Frontend Field | Backend Source | Notes |
|----------------|----------------|-------|
| `crew[].id` | `astronaut["id"]` | Matches exactly |
| `crew[].space_days` | `astronaut["space_days"]` | Integer |
| `crew[].radiation_msv` | `astronaut["radiation_msv"]` | Float |
| `crew[].bone_loss_risk_percentage` | computed | 0–45 range |
| `crew[].dna_damage_index` | computed | 0–95 range |
| `crew[].cellular_repair_efficiency` | computed | 40–100 range |
| `crew[].cohort_type` | literal | Always `"simulated_mission_telemetry"` |
| `crew[].gene_data_source` | literal | Always `null` |
| `studies[].accession` | `osd_id` | e.g. `"OSD-102"` |
| `studies[].sync_status` | computed | `"ready"` or `"syncing"` |
| `studies[].genes` | `record["genes"]` | Keyed by human ortholog symbol |
| `studies[].stale` | cache state | Frontend uses for status badge only |

---

## CORS & Auth

- Backend must allow `*` origins for local dev (or restrict to `http://localhost:3000`)
- No authentication headers are sent by the frontend
- All requests include `Accept: application/json`

---

## Error Handling

The frontend handles errors gracefully:

| Scenario | Frontend Behavior |
|----------|------------------|
| `/api/crew` fails | Silently falls back to static `ASTRONAUTS` seed data |
| `/api/osdr/studies` fails | Sets `studySyncStatus = 'offline'`; shows cached OSDR badge |
| `sync_status === "syncing"` | Polls every 2500 ms until `"ready"` |

Backend should return **HTTP 503** for OSDR unavailability (not 500), so the frontend can distinguish transient from fatal errors.
