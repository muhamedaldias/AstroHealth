import { Bone, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Forecast } from "../api/client";
import { useCountermeasures, useCrew, useForecast, useScenarios } from "../api/hooks";
import { formatPct, humanize } from "../lib/format";
import type { Language } from "../types";

type SiteForecast = Forecast["sites"][number];

interface RunParams {
  crewId: string;
  scenarioId: string;
  ids: string[];
}

interface ForecastPanelProps {
  lang: Language;
}

const RISK_DOT: Record<string, string> = {
  low: "bg-emerald-500",
  moderate: "bg-amber-500",
  high: "bg-red-500",
};

/** Last forecast point of a site = mission end (points are day-ascending). */
const endOf = (site: SiteForecast) =>
  site.points[site.points.length - 1] ?? { day: 0, mean_pct_change: 0, lower_95: 0, upper_95: 0 };

const worstSiteOf = (sites: SiteForecast[]): SiteForecast | null =>
  sites.reduce<SiteForecast | null>(
    (worst, site) =>
      worst === null || endOf(site).mean_pct_change < endOf(worst).mean_pct_change ? site : worst,
    null,
  );

const lossTone = (pct: number) =>
  pct >= -5 ? "text-emerald-700" : pct >= -10 ? "text-amber-700" : "text-red-700";

export const ForecastPanel: React.FC<ForecastPanelProps> = ({ lang }) => {
  const crewQuery = useCrew();
  const scenariosQuery = useScenarios();
  const countermeasuresQuery = useCountermeasures();
  const crew = crewQuery.data?.items ?? [];
  const scenarios = scenariosQuery.data?.items ?? [];
  const countermeasures = countermeasuresQuery.data?.items ?? [];

  const [crewId, setCrewId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [selectedCms, setSelectedCms] = useState<string[]>([]);
  const [run, setRun] = useState<RunParams | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const canRun = crewId !== "" && scenarioId !== "";
  const runKey = run ? `${run.crewId}|${run.scenarioId}|${run.ids.join(",")}` : "idle";

  const toggleCm = (id: string) => {
    setSelectedCms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleRun = () => {
    if (!canRun) return;
    setRun({ crewId, scenarioId, ids: selectedCms });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 text-brand-700">
      <div className="flex items-center gap-3 border-b border-brand-500/10 pb-3">
        <div className="p-2.5 rounded-2xl bg-brand-200/40 text-brand-700 border border-brand-300/60">
          <Bone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-brand-700">
            {lang === "ar" ? "التنبؤ العظمي" : "Bone Forecast"}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === "ar"
              ? "تنبؤ محرك كثافة العظام لموقعية الإسعاف عبر POST /api/v1/forecast."
              : "Bone density engine prediction for the selected crew and mission via POST /api/v1/forecast."}
          </p>
        </div>
      </div>

      {/* Selection form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="forecast-crew" className="text-xs font-semibold text-brand-600">
            {lang === "ar" ? "عضو الطاقم" : "Crew member"}
          </label>
          <select
            id="forecast-crew"
            value={crewId}
            onChange={(e) => setCrewId(e.target.value)}
            disabled={crewQuery.isPending}
            className="rounded-xl border border-brand-300/60 bg-white/70 px-3 py-2 text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50"
          >
            <option value="" disabled>
              {lang === "ar" ? "اختر..." : "Select..."}
            </option>
            {crew.map((member) => (
              <option key={member.id} value={member.id}>
                {member.display_name} ({member.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="forecast-scenario" className="text-xs font-semibold text-brand-600">
            {lang === "ar" ? "سيناريو المهمة" : "Mission scenario"}
          </label>
          <select
            id="forecast-scenario"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            disabled={scenariosQuery.isPending}
            className="rounded-xl border border-brand-300/60 bg-white/70 px-3 py-2 text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50"
          >
            <option value="" disabled>
              {lang === "ar" ? "اختر..." : "Select..."}
            </option>
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name} ({scenario.duration_days}d)
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-brand-600 mb-1">
          {lang === "ar" ? "الإجراءات الوقائية" : "Countermeasures"}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {countermeasures.map((cm) => (
            <label
              key={cm.id}
              className="flex items-start gap-2 rounded-xl border border-brand-300/40 bg-white/40 px-3 py-2 text-xs text-brand-700 cursor-pointer hover:border-brand-400/60 transition"
            >
              <input
                type="checkbox"
                checked={selectedCms.includes(cm.id)}
                onChange={() => toggleCm(cm.id)}
                className="mt-0.5 accent-emerald-600"
              />
              <span>
                <span className="font-semibold block">{cm.name}</span>
                <span className="text-slate-500">{cm.summary}</span>
                {cm.requires_physician_approval && (
                  <span className="block mt-0.5 text-[11px] font-medium text-amber-700">
                    {lang === "ar" ? "يتطلب موافقة الطبيب" : "Requires physician approval"}
                  </span>
                )}
              </span>
            </label>
          ))}
          {countermeasuresQuery.isPending && (
            <p className="text-xs text-slate-500">
              {lang === "ar" ? "جارٍ التحميل..." : "Loading..."}
            </p>
          )}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={handleRun}
        disabled={!canRun || isRunning}
        className="self-start rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 shadow-sm transition flex items-center gap-2"
      >
        {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
        {isRunning
          ? lang === "ar"
            ? "جارٍ الحساب..."
            : "Running..."
          : lang === "ar"
            ? "شغّل التنبؤ"
            : "Run forecast"}
      </button>

      {run && (
        <ForecastResult
          key={runKey}
          run={run}
          countermeasureNames={new Map(countermeasures.map((cm) => [cm.id, cm.name]))}
          lang={lang}
          onPendingChange={setIsRunning}
        />
      )}
    </div>
  );
};

interface ForecastResultProps {
  run: RunParams;
  countermeasureNames: Map<string, string>;
  lang: Language;
  onPendingChange: (pending: boolean) => void;
}

const ForecastResult: React.FC<ForecastResultProps> = ({
  run,
  countermeasureNames,
  lang,
  onPendingChange,
}) => {
  const forecastQuery = useForecast(run.crewId, run.scenarioId, run.ids);
  const isPending = forecastQuery.isPending;

  useEffect(() => {
    onPendingChange(isPending);
    return () => onPendingChange(false);
  }, [isPending, onPendingChange]);

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-600" role="status">
        <Loader2 className="w-4 h-4 animate-spin" />
        {lang === "ar" ? "جارٍ تشغيل المحرك..." : "Running the engine..."}
      </div>
    );
  }

  if (forecastQuery.isError) {
    return (
      <p className="text-sm text-red-700" role="alert">
        {lang === "ar" ? "فشل التنبؤ: " : "Forecast failed: "}
        {forecastQuery.error.message}
      </p>
    );
  }

  const forecast = forecastQuery.data;
  const worst = worstSiteOf(forecast.sites);
  const applied = forecast.countermeasure_ids
    .map((id) => countermeasureNames.get(id) ?? id)
    .join(", ");

  return (
    <div className="flex flex-col gap-4">
      {worst && (
        <div className="rounded-2xl border border-brand-300/60 bg-white/40 p-4 flex flex-wrap items-center gap-4">
          <span className={`text-3xl font-bold ${lossTone(endOf(worst).mean_pct_change)}`}>
            {formatPct(endOf(worst).mean_pct_change)}
          </span>
          <div className="text-xs">
            <p className="font-semibold text-brand-700">
              {lang === "ar" ? "أشد المواقع تأثراً: " : "Worst site: "}
              {humanize(worst.site)}
            </p>
            <p className="text-slate-500">
              Predicted worst-site bone density change — negative = loss
            </p>
            <p className="text-slate-500">
              95% CI at day {forecast.horizon_days}: {formatPct(endOf(worst).lower_95)} to{" "}
              {formatPct(endOf(worst).upper_95)}
            </p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-200/50 text-brand-700 border border-brand-300/60">
            {forecast.engine.name} {forecast.engine.version} ({forecast.engine.kind})
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-brand-300/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/60 text-left text-xs text-brand-600">
              <th scope="col" className="px-4 py-2 font-semibold">
                Site
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                Mean % change at day {forecast.horizon_days}
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                95% CI
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                Risk
              </th>
            </tr>
          </thead>
          <tbody>
            {forecast.sites.map((site) => (
              <tr key={site.site} className="border-t border-brand-500/10 text-brand-700">
                <td className="px-4 py-2 font-medium">{humanize(site.site)}</td>
                <td className={`px-4 py-2 font-semibold ${lossTone(endOf(site).mean_pct_change)}`}>
                  {formatPct(endOf(site).mean_pct_change)}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {formatPct(endOf(site).lower_95)} / {formatPct(endOf(site).upper_95)}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <span
                      className={`w-2 h-2 rounded-full ${RISK_DOT[site.risk.level] ?? "bg-slate-400"}`}
                    />
                    {site.risk.level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        {lang === "ar" ? "الإجراءات المطبقة: " : "Applied countermeasures: "}
        <span className="font-semibold text-brand-700">
          {applied || (lang === "ar" ? "لا شيء" : "none")}
        </span>
      </p>

      {forecast.requires_physician_review && (
        <p className="text-xs font-medium text-amber-700">
          {lang === "ar"
            ? "التنبؤ يتطلب مراجعة الطبيب قبل تطبيق الإجراءات."
            : "This forecast requires physician review before countermeasure application."}
        </p>
      )}

      {forecast.warnings.length > 0 && (
        <ul className="text-xs text-amber-700 list-disc pl-4">
          {forecast.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-brand-600/80">{forecast.disclaimer}</p>
    </div>
  );
};
