import React from 'react';
import { Astronaut, Language } from '../types';
import { translations } from '../i18n/translations';
import { Radio } from 'lucide-react';

interface RadiationTelemetryChartProps {
  astronaut: Astronaut;
  lang: Language;
}

export const RadiationTelemetryChart: React.FC<RadiationTelemetryChartProps> = ({ astronaut, lang }) => {
  const t = translations[lang];

  const maxDays = Math.max(600, astronaut.space_days + 80);
  const maxMsv = 650;
  const pointsCount = 7;

  const svgWidth = 560;
  const svgHeight = 180;
  const paddingX = 45;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = [];
  for (let i = 0; i <= pointsCount; i++) {
    const day = (maxDays / pointsCount) * i;
    const msv = (day / astronaut.space_days) * astronaut.radiation_msv;
    const x = paddingX + (day / maxDays) * chartW;
    const y = svgHeight - paddingY - (Math.min(maxMsv, msv) / maxMsv) * chartH;
    points.push({ day: Math.round(day), msv: Math.round(msv), x, y });
  }

  const currentX = paddingX + (astronaut.space_days / maxDays) * chartW;
  const currentY = svgHeight - paddingY - (astronaut.radiation_msv / maxMsv) * chartH;
  const pelY = svgHeight - paddingY - (600 / maxMsv) * chartH;

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-brand-700 flex items-center gap-2">
              {t.radiationTelemetryTitle}
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-200/45 text-brand-700 border border-brand-300/60">
                {t.illustrativeModel}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-normal">{t.radiationTelemetrySubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">{t.doseRateMsvPerDay}: {(astronaut.radiation_msv / Math.max(astronaut.space_days, 1)).toFixed(2)} mSv/day</span>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            {astronaut.radiation_msv} mSv
          </span>
        </div>
      </div>

      {/* Clean Light SVG Chart */}
      <div className="relative w-full rounded-2xl bg-white/40 border border-brand-500/15 p-2 overflow-hidden shadow-inner">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44">
          <defs>
            <linearGradient id="radAreaGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="radLineGradLight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2D7D82" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#CBD5E1" strokeWidth="1" />
          <line x1={paddingX} y1={pelY} x2={svgWidth - paddingX} y2={pelY} stroke="#F43F5E" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
          <text x={svgWidth - paddingX} y={pelY - 5} fill="#BE123C" fontSize="10" fontFamily="sans-serif" fontWeight="600" textAnchor="end">
            NASA PEL: 600 mSv
          </text>

          {/* Area & Curve */}
          <path d={areaD} fill="url(#radAreaGradLight)" />
          <path d={pathD} fill="none" stroke="url(#radLineGradLight)" strokeWidth="2.5" />

          {/* Current Astronaut Location Beacon */}
          <line x1={currentX} y1={paddingY} x2={currentX} y2={svgHeight - paddingY} stroke="#2D7D82" strokeWidth="1.2" strokeDasharray="3 2" />
          <circle cx={currentX} cy={currentY} r="7" fill="#2D7D82" opacity="0.2" className="animate-ping" />
          <circle cx={currentX} cy={currentY} r="4" fill="#2D7D82" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Current point label */}
          <text x={currentX} y={Math.max(paddingY + 12, currentY - 10)} fill="#0F172A" fontSize="11" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
            Day {astronaut.space_days}: {astronaut.radiation_msv} mSv
          </text>

          {/* Axis markers */}
          {points.map((pt, idx) => (
            <text key={idx} x={pt.x} y={svgHeight - 8} fill="#64748B" fontSize="10" fontFamily="sans-serif" textAnchor="middle">
              {pt.day}d
            </text>
          ))}
        </svg>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-3 py-1.5 border-t border-brand-500/15">
          <span className="px-2 py-1 rounded-full bg-white/50 text-brand-600 border border-brand-500/15">{t.simulatedMissionTelemetry}</span>
          <span className="basis-full sm:basis-auto">{t.simulatedScenarioNote}</span>
        </div>
      </div>
    </div>
  );
};
