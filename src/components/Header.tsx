import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { AstroLogo } from './AstroLogo';
import {
  LayoutDashboard,
  Dna,
  Printer,
  Database,
  Sliders,
  FileText,
  Globe,
  Orbit,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'dna-telemetry'
  | 'food-printer'
  | 'nasa-logs'
  | 'digital-twin'
  | 'risk-simulator';

interface HeaderProps {
  lang: Language;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onToggleLanguage: () => void;
  onOpenSimulation: () => void;
  onOpenDossier: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  activeTab,
  onTabChange,
  onToggleLanguage,
  onOpenSimulation,
  onOpenDossier,
}) => {
  const t = translations[lang];

  const tabs: { id: ActiveTab; label: string; label_ar: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      label_ar: 'نظرة عامة',
      icon: LayoutDashboard,
    },
    {
      id: 'dna-telemetry',
      label: 'DNA & Telemetry',
      label_ar: 'الدنا والقياسات',
      icon: Dna,
    },
    {
      id: 'food-printer',
      label: 'Bio-Rescue Protocol',
      label_ar: 'بروتوكول الإنقاذ الحيوي',
      icon: Printer,
    },
    {
      id: 'nasa-logs',
      label: 'NASA Data Logs',
      label_ar: 'سجلات ناسا',
      icon: Database,
    },
    {
      id: 'digital-twin',
      label: t.digitalTwinTab,
      label_ar: 'التوأم الرقمي',
      icon: Orbit,
    },
  ];

  return (
    <header className="w-full bg-white/60 backdrop-blur-xl backdrop-saturate-150 border-b border-brand-500/15 sticky top-0 z-40 transition-all shadow-[0_4px_24px_-12px_rgba(13,34,58,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Modern Minimalist Logo matching reference aesthetic */}
        <AstroLogo size="nav" lang={lang} harmonized />

        {/* Segmented Tab Navigation with Teal Accent */}
        <nav className="flex items-center p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-brand-500/15 overflow-x-auto max-w-full shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/90 text-brand-700 font-bold shadow-sm border border-brand-300/60 ring-1 ring-brand-400/15 scale-[1.02]'
                    : 'text-brand-600 hover:text-brand-700 hover:bg-white/60 font-medium'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-brand-400' : 'text-slate-400'
                  }`}
                />
                <span>{lang === 'ar' ? tab.label_ar : tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Utilities: Simulation, Dossier, Language Toggle */}
        <div className="flex items-center gap-2">
          {/* Simulation Mode */}
          <button
            onClick={onOpenSimulation}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/40 hover:bg-white/70 backdrop-blur-sm border border-brand-500/20 hover:border-brand-400/50 text-brand-700 text-xs font-medium flex items-center gap-1.5 transition"
            title={t.simulationMode}
          >
            <Sliders className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden md:inline">{t.simulationMode}</span>
          </button>

          {/* Export Official Report */}
          <button
            onClick={onOpenDossier}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/40 hover:bg-white/70 backdrop-blur-sm border border-brand-500/20 hover:border-brand-400/50 text-brand-700 text-xs font-medium flex items-center gap-1.5 transition"
            title={t.exportFlightReport}
          >
            <FileText className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden md:inline">{t.exportFlightReport}</span>
          </button>

          {/* Bilingual Switcher with Teal Accent */}
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-brand-200/40 hover:bg-brand-200/60 border border-brand-400/30 text-brand-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            <span>{t.switchLanguage}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
