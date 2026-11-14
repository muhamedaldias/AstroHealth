import { describe, expect, it } from "vitest";
import { computeRisks } from "./nasaGeneLabData";

describe("computeRisks", () => {
  it("computes known inputs", () => {
    expect(computeRisks(180, 250)).toEqual({
      bone_loss_risk_percentage: 18.5,
      dna_damage_index: 39,
      cellular_repair_efficiency: 78.5,
    });
    expect(computeRisks(90, 80)).toEqual({
      bone_loss_risk_percentage: 8.3,
      dna_damage_index: 14.1,
      cellular_repair_efficiency: 92.2,
    });
  });

  it("rounds every output to one decimal", () => {
    for (const { dna_damage_index, cellular_repair_efficiency } of [
      computeRisks(123, 47),
      computeRisks(321, 173),
    ]) {
      expect(Number(dna_damage_index.toFixed(1))).toBe(dna_damage_index);
      expect(Number(cellular_repair_efficiency.toFixed(1))).toBe(cellular_repair_efficiency);
    }
  });

  it("returns zeroed indices and full repair for zero input", () => {
    expect(computeRisks(0, 0)).toEqual({
      bone_loss_risk_percentage: 0,
      dna_damage_index: 0,
      cellular_repair_efficiency: 100,
    });
  });

  it("clamps bone loss at 45 and DNA damage at 95", () => {
    expect(computeRisks(100000, 100000)).toEqual({
      bone_loss_risk_percentage: 45,
      dna_damage_index: 95,
      cellular_repair_efficiency: 47.7,
    });
    expect(computeRisks(730, 500).bone_loss_risk_percentage).toBe(45);
  });

  it("caps repair efficiency clamp at the 40 floor only from below (no upper clamp)", () => {
    // The Math.max(40, ...) floor never binds for positive inputs (DNA damage is clamped at 95,
    // which keeps repair at >= 47.7); negative inputs push repair above 100 instead.
    expect(computeRisks(-50, -100).cellular_repair_efficiency).toBe(108);
    expect(computeRisks(-5000, -5000).cellular_repair_efficiency).toBe(567.5);
  });

  it("never escapes the clamp range for extreme inputs", () => {
    const extremes: [number, number][] = [
      [0, 0],
      [30, 10],
      [520, 438.7],
      [730, 500],
      [1e6, 1e6],
      [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
      [-1e6, -1e6],
    ];
    for (const [spaceDays, radiationMsv] of extremes) {
      const result = computeRisks(spaceDays, radiationMsv);
      expect(result.bone_loss_risk_percentage).toBeLessThanOrEqual(45);
      expect(result.dna_damage_index).toBeLessThanOrEqual(95);
      expect(result.cellular_repair_efficiency).toBeGreaterThanOrEqual(40);
    }
  });
});
