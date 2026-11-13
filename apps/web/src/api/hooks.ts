// TanStack Query hooks. Components call these; they never call `api` directly.
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "./client";

export const useHealth = () =>
  useQuery({ queryKey: ["health"], queryFn: async () => unwrap(await api.GET("/api/v1/health")) });

export const useCrew = () =>
  useQuery({ queryKey: ["crew"], queryFn: async () => unwrap(await api.GET("/api/v1/crew")) });

export const useForecast = (crewId: string, scenarioId: string, countermeasureIds: string[]) =>
  useQuery({
    queryKey: ["forecast", crewId, scenarioId, countermeasureIds],
    queryFn: async () =>
      unwrap(
        await api.POST("/api/v1/forecast", {
          body: { crew_id: crewId, scenario_id: scenarioId, countermeasure_ids: countermeasureIds },
        }),
      ),
  });

export const useTelemetryCrew = () =>
  useQuery({
    queryKey: ["telemetry-crew"],
    queryFn: async () => {
      const payload = unwrap(await api.GET("/api/v1/telemetry/crew"));
      return payload.crew;
    },
  });

export const useOsdrStudies = () =>
  useQuery({
    queryKey: ["osdr-studies"],
    queryFn: async () => unwrap(await api.GET("/api/v1/osdr/studies")),
    refetchInterval: (query) => (query.state.data?.sync_status === "syncing" ? 2500 : false),
  });
