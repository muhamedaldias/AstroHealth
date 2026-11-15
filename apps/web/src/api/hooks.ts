// TanStack Query hooks. Components call these; they never call `api` directly.
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "./client";

export const useHealth = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: async () => unwrap(await api.GET("/api/v1/health")),
  });

export const useCrew = () =>
  useQuery({
    queryKey: ["crew"],
    queryFn: async () => unwrap(await api.GET("/api/v1/crew")),
  });

export const useScenarios = () =>
  useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => unwrap(await api.GET("/api/v1/scenarios")),
  });

export const useForecast = (crewId: string, scenarioId: string, countermeasureIds: string[]) =>
  useQuery({
    queryKey: ["forecast", crewId, scenarioId, countermeasureIds],
    queryFn: async () =>
      unwrap(
        await api.POST("/api/v1/forecast", {
          body: {
            crew_id: crewId,
            scenario_id: scenarioId,
            countermeasure_ids: countermeasureIds,
          },
        }),
      ),
  });

export const useCountermeasures = () =>
  useQuery({
    queryKey: ["countermeasures"],
    queryFn: async () => unwrap(await api.GET("/api/v1/countermeasures")),
  });

export const useWhatIf = (
  crewId: string,
  scenarioId: string,
  plans: {
    plan_id: string;
    label: string;
    countermeasure_ids: string[];
  }[],
) =>
  useQuery({
    queryKey: ["whatif", crewId, scenarioId, plans],
    queryFn: async () =>
      unwrap(
        await api.POST("/api/v1/whatif", {
          body: {
            crew_id: crewId,
            scenario_id: scenarioId,
            plans,
          },
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

export const useBioRescueAdvice = (
  spaceDays: number,
  radiationMsv: number,
  boneLossRiskPercentage: number,
  dnaDamageIndex: number,
  lang: "ar" | "en",
) =>
  useQuery({
    queryKey: [
      "bio-rescue-advice",
      spaceDays,
      radiationMsv,
      boneLossRiskPercentage,
      dnaDamageIndex,
      lang,
    ],
    queryFn: async () =>
      unwrap(
        await api.POST("/api/v1/bio-rescue/advice", {
          body: {
            space_days: spaceDays,
            radiation_msv: radiationMsv,
            bone_loss_risk_percentage: boneLossRiskPercentage,
            dna_damage_index: dnaDamageIndex,
            lang,
          },
        }),
      ),
  });
