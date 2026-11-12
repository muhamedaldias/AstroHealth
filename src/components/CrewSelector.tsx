import React from 'react';
import { Astronaut, Language } from '../types';
import { translations } from '../i18n/translations';
import { Users, Clock, Radiation, ChevronRight } from 'lucide-react';

interface CrewSelectorProps {
  astronauts: Astronaut[];
  selectedAstronautId: string;
  onSelectAstronaut: (id: string) => void;
  lang: Language;
}

export const CrewSelector: React.FC<CrewSelectorProps> = ({
  astronauts,
  selectedAstronautId,
  onSelectAstronaut,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-brand-700 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          <span>{t.crewRoster}</span>
          <span className="text-xs font-normal text-slate-400">({astronauts.length} Astronauts)</span>
        </h2>
        <span className="text-xs font-medium text-brand-600 bg-white/50 px-2.5 py-0.5 rounded-full border border-brand-500/15">
          {t.simulatedMissionTelemetry}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {astronauts.map((astro) => {
          const isSelected = astro.id === selectedAstronautId;
          const isCritical = astro.bone_loss_risk_percentage > 30 || astro.dna_damage_index > 65;
          const isElevated = astro.bone_loss_risk_percentage > 20 || astro.dna_damage_index > 45;

          const badgeStyles = isCritical
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : isElevated
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

          return (
            <div
              key={astro.id}
              onClick={() => onSelectAstronaut(astro.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 relative ${
                isSelected
                  ? 'glass-card border-brand-400/70 shadow-lg ring-2 ring-brand-400/20'
                  : 'glass-card hover:border-brand-500/30 hover:shadow-lg'
              }`}
            >
              {/* Top row: Avatar & Identity */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    {astro.id.replace('ASTRO-', '')}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-brand-700 leading-snug">
                      {lang === 'ar' ? astro.name_ar : astro.name}
                    </span>
                    <span className="text-xs text-slate-500 font-normal leading-tight line-clamp-1">
                      {lang === 'ar' ? astro.role_ar : astro.role}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}
                >
                  {isCritical ? t.statusBadge.critical : isElevated ? t.statusBadge.elevated : t.statusBadge.nominal}
                </span>
              </div>

              {/* Mission context & metrics */}
              <div className="flex flex-col gap-1.5 pt-2.5 border-t border-brand-500/10 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {astro.space_days} {lang === 'ar' ? 'يوم' : 'days'}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Radiation className="w-3.5 h-3.5 text-amber-500" />
                    {astro.radiation_msv} mSv
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[130px]">
                    {lang === 'ar' ? astro.mission_ar : astro.mission}
                  </span>
                  <span
                    className={`font-semibold ${
                      astro.bone_loss_risk_percentage > 25 ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  >
                    -{astro.bone_loss_risk_percentage}% BMD Loss
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
