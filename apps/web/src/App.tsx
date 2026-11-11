// PLACEHOLDER shell proving the contract wiring end to end (health -> crew -> forecast).
// The Frontend owner replaces this with the real UI; keep the data access in src/api/hooks.ts.
import { useCrew, useForecast, useHealth } from "@/api/hooks";
import { formatPct, humanize } from "@/lib/format";

export default function App() {
  const health = useHealth();
  const crew = useCrew();
  const first = crew.data?.items[0];
  const forecast = useForecast(first?.id ?? "", "iss-180", ["resistive_exercise"]);

  return (
    <main className="mx-auto max-w-3xl p-6 font-sans">
      <h1 className="text-2xl font-semibold">Astro Bone Twin</h1>
      <p className="text-sm text-neutral-600">
        API:{" "}
        {health.isPending ? "connecting..." : health.isError ? "unreachable" : health.data.status}
        {health.data && ` / engine: ${health.data.engine.name} (${health.data.engine.kind})`}
      </p>

      <h2 className="mt-6 text-lg font-medium">Crew</h2>
      <ul className="list-disc pl-5">
        {crew.data?.items.map((c) => (
          <li key={c.id}>
            {c.display_name}, {c.age_years}
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-lg font-medium">Forecast for {first?.display_name ?? "..."}</h2>
      <table className="mt-2 text-sm">
        <tbody>
          {forecast.data?.sites.map((s) => {
            const end = s.points[s.points.length - 1];
            return (
              <tr key={s.site}>
                <td className="pr-4">{humanize(s.site)}</td>
                <td className="pr-4">{end ? formatPct(end.mean_pct_change) : "-"}</td>
                <td>risk: {s.risk.level}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {forecast.data && <p className="mt-4 text-xs text-neutral-500">{forecast.data.disclaimer}</p>}
    </main>
  );
}
