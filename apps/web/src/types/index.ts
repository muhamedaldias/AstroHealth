// UI type aliases. Hand-written UI types are FORBIDDEN: every API-shaped type is a
// re-export from the generated contract schema (apps/web/src/api/schema.d.ts).
import type { components } from "../api/schema";

export type Language = "en" | "ar";
export type AffectedGene = components["schemas"]["AffectedGene"];
export type Astronaut = components["schemas"]["TelemetryCrewMember"];
export type OsdrStudy = components["schemas"]["OsdrStudy"];
export type OsdrStudiesPayload = components["schemas"]["OsdrStudiesPayload"];
