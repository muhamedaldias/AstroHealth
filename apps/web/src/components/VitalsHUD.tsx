import { Activity, Bone, Dna, Radiation } from "lucide-react";
import type React from "react";
import { translations } from "../i18n/translations";
import type { Astronaut, Language } from "../types";

interface VitalsHUDProps {
  astronaut: Astronaut;
  lang: Language;
}

export const VitalsHUD: React.FC<VitalsHUDProps> = ({ astronaut, lang }) => {
  const t = translations[lang];

  const cards = [
    {
      title: t.radiationExposure,
      value: `${astronaut.radiation_msv} mSv`,
      sub: t.safeLimitNasa,
      percent: Math.min(100, Math.round((astronaut.radiation_msv / 600) * 100)),
      color:
        astronaut.radiation_msv > 300 ? "rose" : astronaut.radiation_msv > 200 ? "amber" : "sky",
      icon: Radiation,
    },
    {
      title: t.boneMassDegradation,
      value: `-${astronaut.bone_loss_risk_percentage}%`,
      sub: `${t.tScoreVariance}: ${astronaut.current_bmd_t_score}`,
      percent: Math.min(100, Math.round(astronaut.bone_loss_risk_percentage * 2.2)),
      color: astronaut.bone_loss_risk_percentage > 30 ? "rose" : "amber",
      icon: Bone,
    },
    {
      title: t.dnaDamageScore,
      value: `${astronaut.dna_damage_index} / 100`,
      sub: t.dsbRisk,
      percent: astronaut.dna_damage_index,
      color:
        astronaut.dna_damage_index > 65
          ? "rose"
          : astronaut.dna_damage_index > 40
            ? "amber"
            : "teal",
      icon: Dna,
    },
    {
      title: t.cellularRepairCapacity,
      value: `${astronaut.cellular_repair_efficiency}%`,
      sub: t.atpEfficiency,
      percent: astronaut.cellular_repair_efficiency,
      color: astronaut.cellular_repair_efficiency > 75 ? "emerald" : "amber",
      icon: Activity,
    },
  ];

  return (
    <section className="flex flex-col gap-2">
      <span className="w-fit px-2.5 py-1 rounded-full bg-white/50 text-brand-600 border border-brand-500/15 text-[11px] font-medium">
        {t.simulatedMissionTelemetry}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          const theme = {
            teal: {
              iconBg: "bg-brand-200/40 text-brand-400 border-brand-300/60",
              bar: "from-brand-400 to-brand-300",
              text: "text-brand-700",
            },
            sky: {
              iconBg: "bg-brand-50 text-brand-500 border-brand-500/20",
              bar: "from-brand-500 to-brand-400",
              text: "text-brand-700",
            },
            amber: {
              iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
              bar: "from-amber-500 to-yellow-400",
              text: "text-brand-700",
            },
            rose: {
              iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
              bar: "from-rose-500 to-amber-400",
              text: "text-rose-700",
            },
            emerald: {
              iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
              bar: "from-emerald-500 to-brand-300",
              text: "text-brand-700",
            },
          }[card.color as "teal" | "sky" | "amber" | "rose" | "emerald"];

          return (
            <div
              key={card.title}
              className="glass-card rounded-2xl p-4 hover:shadow-lg transition-shadow flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500 font-medium">{card.title}</span>
                  <span className={`font-bold text-2xl ${theme.text} tracking-tight`}>
                    {card.value}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${theme.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <div className="w-full h-1.5 rounded-full bg-brand-500/10 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${card.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{card.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
