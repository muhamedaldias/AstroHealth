import { Cpu, RefreshCw, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { computeRisks } from "../data/nasaGeneLabData";
import { translations } from "../i18n/translations";
import type { Astronaut, Language } from "../types";

interface RiskSimulatorPanelProps {
  astronaut: Astronaut;
  lang: Language;
  onClose?: () => void;
}

export const RiskSimulatorPanel: React.FC<RiskSimulatorPanelProps> = ({
  astronaut,
  lang,
  onClose,
}) => {
  const t = translations[lang];

  const [days, setDays] = useState<number>(astronaut.space_days);
  const [radiation, setRadiation] = useState<number>(astronaut.radiation_msv);

  useEffect(() => {
    setDays(astronaut.space_days);
    setRadiation(astronaut.radiation_msv);
  }, [astronaut.space_days, astronaut.radiation_msv]);

  const simResult = computeRisks(days, radiation);

  const handleReset = () => {
    setDays(astronaut.space_days);
    setRadiation(astronaut.radiation_msv);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 text-brand-700">
      <div className="flex items-center justify-between border-b border-brand-500/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-200/40 text-brand-700 border border-brand-300/60">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-brand-700 flex items-center gap-2">
              {t.simDrawerTitle}
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-200/50 text-brand-700 border border-brand-300/60">
                {t.illustrativeModel}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-normal">{t.simDrawerSubtitle}</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-brand-400 hover:text-brand-700 hover:bg-brand-200/40 transition"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-4 text-xs">
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/45 border border-brand-500/15">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold">{t.simSpaceDaysSlider}</span>
            <span className="text-brand-700 font-bold text-sm">
              {days} {lang === "ar" ? "يوم" : "Days"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="900"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-brand-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>LEO 30d</span>
            <span>ISS 180d</span>
            <span>Lunar 360d</span>
            <span>Mars Transit 900d</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/45 border border-brand-500/15">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold">{t.simRadiationSlider}</span>
            <span className="text-amber-700 font-bold text-sm">{radiation} mSv</span>
          </div>
          <input
            type="range"
            min="10"
            max="800"
            step="5"
            value={radiation}
            onChange={(e) => setRadiation(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>50 mSv</span>
            <span>250 mSv</span>
            <span>PEL 600 mSv</span>
            <span>800 mSv</span>
          </div>
        </div>
      </div>

      {/* Output metrics */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/40 border border-brand-500/15 text-center">
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/60 border border-brand-500/15 shadow-sm">
          <span className="text-[11px] text-slate-500 leading-tight">{t.simProjectedBoneLoss}</span>
          <span className="font-bold text-base text-rose-600">
            -{simResult.bone_loss_risk_percentage}%
          </span>
        </div>

        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/60 border border-brand-500/15 shadow-sm">
          <span className="text-[11px] text-slate-500 leading-tight">
            {t.simProjectedDnaDamage}
          </span>
          <span className="font-bold text-base text-amber-600">
            {simResult.dna_damage_index}/100
          </span>
        </div>

        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/60 border border-brand-500/15 shadow-sm">
          <span className="text-[11px] text-slate-500 leading-tight">{t.simProjectedRepair}</span>
          <span className="font-bold text-base text-emerald-600">
            {simResult.cellular_repair_efficiency}%
          </span>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-brand-500/10 mt-1">
        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-white/50 hover:bg-brand-200/40 border border-brand-500/15 text-brand-700 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-500" />
          <span>{t.resetToCohort}</span>
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">{t.simulatedScenarioNote}</p>
    </div>
  );
};
