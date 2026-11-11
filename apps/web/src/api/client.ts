// The ONLY place the HTTP client is created. Types come from the generated schema.d.ts
// (never hand-write API types; change contracts/openapi.yaml and run `make gen`).
import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

export const api = createClient<paths>({ baseUrl: "" }); // relative: dev proxy / same-origin in prod

export type Schemas = components["schemas"];
export type Forecast = Schemas["Forecast"];
export type CrewMember = Schemas["CrewMember"];
export type Countermeasure = Schemas["Countermeasure"];
export type Scenario = Schemas["Scenario"];
export type ApiError = Schemas["Error"];

/** Unwrap an openapi-fetch result or throw a readable error built from the contract's Error shape. */
export function unwrap<T>(res: { data?: T; error?: unknown }): T {
  if (res.data !== undefined) return res.data;
  const e = res.error as Partial<ApiError> | undefined;
  throw new Error(e?.message ?? "Request failed");
}
