/** Format a percent change from baseline, e.g. -6.234 -> "-6.2%" . */
export function formatPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

/** Turn a snake_case id from the contract into a label, e.g. "femoral_neck" -> "Femoral neck". */
export function humanize(id: string): string {
  const s = id.replaceAll("_", " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
