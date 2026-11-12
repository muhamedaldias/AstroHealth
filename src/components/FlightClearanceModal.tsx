import React from 'react';
import { Astronaut, Language } from '../types';
import { translations } from '../i18n/translations';
import { FileText, Printer, X } from 'lucide-react';
import { AstroLogo } from './AstroLogo';

interface FlightClearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  astronaut: Astronaut;
  lang: Language;
}

export const FlightClearanceModal: React.FC<FlightClearanceModalProps> = ({
  isOpen,
  onClose,
  astronaut,
  lang,
}) => {
  const t = translations[lang];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D223A]/40 backdrop-blur-md overflow-y-auto">
      <section className="print-dossier glass-panel rounded-2xl max-w-2xl w-full p-5 sm:p-7 flex flex-col gap-5 text-brand-700">
        <header className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-brand-500/10 pb-4">
          <AstroLogo size="sm" lang={lang} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-lg bg-brand-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-brand-700"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printDossier}</span>
            </button>
            <button type="button" onClick={onClose} aria-label={t.close} className="p-2 rounded-lg text-brand-500 hover:bg-brand-200/40 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/50 text-brand-600 border border-brand-500/15 text-[11px] font-semibold">{t.simulatedMissionTelemetry}</span>
          <span className="px-2.5 py-1 rounded-full bg-brand-200/45 border border-brand-300/60 text-brand-700 text-[11px] font-semibold">{t.illustrativeModel}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 text-brand-700 text-xs font-semibold">
            <FileText className="w-4 h-4" />
            <span>{t.flightDossierTitle}</span>
          </div>
          <h1 className="text-xl font-bold text-brand-700 mt-2">{lang === 'ar' ? astronaut.name_ar : astronaut.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{lang === 'ar' ? astronaut.mission_ar : astronaut.mission}</p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            [t.daysInSpace, `${astronaut.space_days} ${lang === 'ar' ? 'يوم' : 'days'}`],
            [t.radiationExposure, `${astronaut.radiation_msv} mSv`],
            [t.boneMassDegradation, `${astronaut.bone_loss_risk_percentage}%`],
            [t.dnaDamageScore, `${astronaut.dna_damage_index} / 100`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/40 border border-brand-500/15 p-3">
              <dt className="text-[11px] text-slate-500">{label}</dt>
              <dd className="font-semibold text-sm text-brand-700 mt-1">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-xs leading-relaxed text-slate-600 border-t border-brand-500/10 pt-4">{t.simulatedScenarioNote}</p>
        <p className="text-[11px] text-slate-500">{t.notMedicalAdvice}</p>
      </section>
    </div>
  );
};
