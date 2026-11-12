"""Validate cached NASA OSDR study bundles and simulated-cohort separation."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import nasa_osdr_data
import osdr_client


def run_audit() -> None:
    print("AstroHealth AI - OSDR cache and provenance audit")
    studies = osdr_client.get_all_studies()
    if not studies:
        raise AssertionError("No cached OSDR studies are available")

    expected = set(osdr_client.STUDY_ORDER)
    observed = {study["accession"] for study in studies}
    assert observed <= expected, f"Unexpected OSDR studies: {observed - expected}"

    for study in studies:
        for field in ("title", "organism", "tissue_label", "assay", "contrast", "osdr_url"):
            assert study.get(field), f"{study['accession']} missing {field}"
        assert study["osdr_url"].startswith("https://osdr.nasa.gov/")
        assert study["genes"], f"{study['accession']} has no cached gene records"
        for record in study["genes"].values():
            assert record.get("symbol"), f"{study['accession']} has a gene without organism symbol"
            assert isinstance(record.get("log2fc"), (int, float))
            p_value = record.get("p_value")
            assert p_value is None or 0 <= p_value <= 1
            adjusted_p = record.get("adj_p_value")
            assert adjusted_p is None or 0 <= adjusted_p <= 1
        print(f"{study['accession']} / {study['glds']}: {study['title']} ({study['organism']}, {study['tissue_label']})")

    osd_102 = next((study for study in studies if study["accession"] == "OSD-102"), None)
    if osd_102 and "RANKL" in osd_102["genes"]:
        rankl = osd_102["genes"]["RANKL"]
        assert rankl["symbol"] == "Tnfsf11"
        assert rankl["ortholog_symbol"] == "RANKL"
        assert rankl["p_value"] is not None
        print(f"OSD-102 Tnfsf11 / RANKL: log2FC={rankl['log2fc']}, p={rankl['p_value']}")
    osd_48 = next((study for study in studies if study["accession"] == "OSD-48"), None)
    if osd_48 and "TNFRSF11B" in osd_48["genes"]:
        opg = osd_48["genes"]["TNFRSF11B"]
        assert opg["symbol"] == "Tnfrsf11b"
        assert opg["ortholog_symbol"] == "TNFRSF11B"
        print(f"OSD-48 Tnfrsf11b / TNFRSF11B: log2FC={opg['log2fc']}, p={opg['p_value']}")

    cohort = osdr_client.enrich_cohort(nasa_osdr_data.ASTRONAUT_COHORT)
    for astronaut in cohort:
        assert astronaut["cohort_type"] == "simulated_mission_telemetry"
        assert astronaut["affected_genes"] == []
        assert "generated_nutritional_recipe" not in astronaut

    print(f"Cached OSDR studies available: {len(studies)}/{len(expected)}")
    print("Simulated profiles contain no attributed study-level gene measurements or prescriptions.")


if __name__ == "__main__":
    run_audit()
