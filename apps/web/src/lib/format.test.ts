import { describe, expect, it } from "vitest";
import { formatPct, humanize } from "./format";

describe("format", () => {
  it("formats percent change", () => {
    expect(formatPct(-6.234)).toBe("-6.2%");
    expect(formatPct(1.25, 2)).toBe("+1.25%");
  });
  it("humanizes ids", () => {
    expect(humanize("femoral_neck")).toBe("Femoral neck");
  });
});
