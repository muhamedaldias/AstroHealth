import React, { useState } from 'react';
import { Astronaut, Language } from '../types';
import { translations } from '../i18n/translations';
import { Bone, TrendingDown } from 'lucide-react';

interface BoneDensityScannerProps {
  astronaut: Astronaut;
  lang: Language;
}

export const BoneDensityScanner: React.FC<BoneDensityScannerProps> = ({ astronaut, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'crossSection' | 'cellular'>('crossSection');

  const earthBvTv = 26.5;
  const currentBvTv = Math.max(12.0, Number((earthBvTv * (1 - astronaut.bone_loss_risk_percentage / 100)).toFixed(1)));
  const osteoblastActivity = Math.max(25, Math.round(100 - astronaut.bone_loss_risk_percentage * 1.8));
  const osteoclastActivity = Math.min(190, Math.round(100 + astronaut.bone_loss_risk_percentage * 2.2));

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-200/40 border border-brand-300/60 text-brand-700">
            <Bone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-brand-700 flex items-center gap-2">
              {t.boneScannerTitle}
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-200/50 text-brand-700 border border-brand-300/60">
                {t.illustrativeModel}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-normal">{t.boneScannerSubtitle}</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm p-1 rounded-xl border border-brand-500/15 text-xs font-medium">
          <button
            onClick={() => setActiveTab('crossSection')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'crossSection'
                ? 'bg-white text-brand-700 font-semibold shadow-sm border border-brand-300/60'
                : 'text-slate-500 hover:text-brand-700'
            }`}
          >
            {lang === 'ar' ? 'المقطع العرضي المجهري' : 'Trabecular Cross-Section'}
          </button>
          <button
            onClick={() => setActiveTab('cellular')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'cellular'
                ? 'bg-white text-brand-700 font-semibold shadow-sm border border-brand-300/60'
                : 'text-slate-500 hover:text-brand-700'
            }`}
          >
            {lang === 'ar' ? 'توازن الخلايا البانية/الهادمة' : 'Osteoblast/Clast Ratio'}
          </button>
        </div>
      </div>

      {activeTab === 'crossSection' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earth 1G Baseline Visual */}
          <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-2xl p-4 flex flex-col gap-3 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {t.earthBaseline1G}
              </span>
              <span className="text-emerald-700 font-bold">
                {lang === 'ar' ? 'مؤشر T محاكى:' : 'Simulated T-score:'} {astronaut.baseline_bmd_t_score > 0 ? `+${astronaut.baseline_bmd_t_score}` : astronaut.baseline_bmd_t_score}
              </span>
            </div>

            <div className="h-36 rounded-xl bg-white border border-emerald-200 p-2 relative flex items-center justify-center overflow-hidden shadow-inner">
              <svg className="w-full h-full opacity-85" viewBox="0 0 200 100" fill="none">
                <defs>
                  <pattern id="denseMeshLight" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M 0 7 L 7 0 L 14 7 L 7 14 Z" fill="none" stroke="#10B981" strokeWidth="1.8" />
                    <circle cx="7" cy="7" r="2" fill="#059669" />
                  </pattern>
                </defs>
                <rect width="200" height="100" fill="url(#denseMeshLight)" rx="6" />
                <rect x="5" y="5" width="190" height="90" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 2" opacity="0.4" />
              </svg>
              <div className="absolute bottom-2 left-3 text-[10px] font-medium text-emerald-800 bg-white/95 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                {lang === 'ar' ? 'شبكة كثيفة توضيحية' : 'Illustrative Dense Matrix'}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-emerald-200/60">
              <span>{t.trabecularVolumeFraction}:</span>
              <span className="text-emerald-700 font-bold">{earthBvTv}%</span>
            </div>
          </div>

          {/* Microgravity Current In-Flight Degradation Visual */}
          <div className="bg-rose-50/40 border border-rose-200/70 rounded-2xl p-4 flex flex-col gap-3 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-900 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                {t.microgravityDegradation}
              </span>
              <span className="text-rose-700 font-bold">
                {lang === 'ar' ? 'مؤشر T محاكى:' : 'Simulated T-score:'} {astronaut.current_bmd_t_score}
              </span>
            </div>

            <div className="h-36 rounded-xl bg-white border border-rose-200 p-2 relative flex items-center justify-center overflow-hidden shadow-inner">
              <svg className="w-full h-full opacity-80" viewBox="0 0 200 100" fill="none">
                <defs>
                  <pattern id="porousMeshLight" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 0 14 L 14 0 L 28 14 L 14 28 Z" fill="none" stroke="#F43F5E" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="14" cy="14" r="1.5" fill="#E11D48" />
                  </pattern>
                </defs>
                <rect width="200" height="100" fill="url(#porousMeshLight)" rx="6" />
                <circle cx="60" cy="45" r="14" fill="#FFF1F2" opacity="0.9" />
                <circle cx="140" cy="60" r="16" fill="#FFF1F2" opacity="0.9" />
                <circle cx="100" cy="30" r="10" fill="#FFF1F2" opacity="0.9" />
              </svg>
              <div className="absolute bottom-2 left-3 text-[10px] font-semibold text-rose-800 bg-white/95 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 shadow-sm">
                <TrendingDown className="w-3 h-3 text-rose-600" />
                <span>
                  {lang === 'ar' ? `مؤشر محاكاة: -${astronaut.bone_loss_risk_percentage}%` : `Scenario index: -${astronaut.bone_loss_risk_percentage}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-rose-200/60">
              <span>{t.trabecularVolumeFraction}:</span>
              <span className="text-rose-700 font-bold">{currentBvTv}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* Cellular Bone Remodeling Balance View */
        <div className="bg-white/40 border border-brand-500/15 rounded-2xl p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/50 border border-brand-500/15 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{t.osteoblastActivity}</span>
                <span className="text-amber-700 font-bold">{osteoblastActivity}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-500/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-400 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${osteoblastActivity}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 leading-snug">{t.simulatedScenarioNote}</span>
            </div>

            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/50 border border-brand-500/15 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{t.osteoclastActivity}</span>
                <span className="text-rose-700 font-bold">{osteoclastActivity}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-500/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, osteoclastActivity / 2)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 leading-snug">{t.simulatedScenarioNote}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-brand-200/30 border border-brand-500/15 text-xs text-brand-600">
            {t.exerciseGuidance}
          </div>
        </div>
      )}

      {/* Footer telemetry */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-brand-500/10">
        <div className="flex items-center gap-2">
          <span>{t.resorptionRate}</span>
          <span className="text-slate-300">|</span>
          <span className="text-brand-700 font-medium">{t.illustrativeModel}</span>
        </div>
        <div className="text-rose-700 font-semibold">
          {t.boneMassDegradation}: {astronaut.bone_loss_risk_percentage}%
        </div>
      </div>
    </div>
  );
};
