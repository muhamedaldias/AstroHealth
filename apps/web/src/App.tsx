import { ArrowRight, Database, Dna, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useOsdrStudies, useTelemetryCrew } from "@/api/hooks";
import { BioRescueProtocol } from "./components/BioRescueProtocol";
import { BoneDensityScanner } from "./components/BoneDensityScanner";
import { CrewSelector } from "./components/CrewSelector";
import { DnaHelixScanner } from "./components/DnaHelixScanner";
import { FlightClearanceModal } from "./components/FlightClearanceModal";
import { GeneExpressionTable } from "./components/GeneExpressionTable";
import { type ActiveTab, Header } from "./components/Header";
import { RadiationTelemetryChart } from "./components/RadiationTelemetryChart";
import { RiskSimulatorModal } from "./components/RiskSimulatorModal";
import { RiskSimulatorPanel } from "./components/RiskSimulatorPanel";
import { VitalsHUD } from "./components/VitalsHUD";
import { ASTRONAUTS } from "./data/nasaGeneLabData";
import { translations } from "./i18n/translations";
import type { Astronaut, Language } from "./types";

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>("ASTRO-042");
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);

  // Contract data via TanStack Query; static GeneLab seed stays as the offline fallback.
  const crewQuery = useTelemetryCrew();
  const astronauts = crewQuery.data ?? ASTRONAUTS;
  const studiesQuery = useOsdrStudies();
  const studies = studiesQuery.data?.studies ?? [];
  const studySyncStatus: "syncing" | "ready" | "offline" = studiesQuery.isError
    ? "offline"
    : studiesQuery.data
      ? studiesQuery.data.sync_status
      : "syncing";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const selectedAstronaut: Astronaut =
    astronauts.find((a) => a.id === selectedAstronautId) || astronauts[0] || ASTRONAUTS[0];

  const t = translations[lang];

  const totalMeasuredGeneRecords = studies.reduce(
    (sum, study) => sum + Object.keys(study.genes).length,
    0,
  );

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen bg-transparent text-brand-700 flex flex-col selection:bg-brand-400 selection:text-white ${
        lang === "ar" ? "font-arabic" : "font-sans"
      }`}
    >
      {/* Modern Sticky Clean Header with Segmented Tabs */}
      <Header
        lang={lang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleLanguage={handleToggleLanguage}
        onOpenSimulation={() => setIsSimModalOpen(true)}
        onOpenDossier={() => setIsDossierModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Active Astronaut Spotlight Hero Card */}
        <div className="glass-panel rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-200/50 border border-brand-300/60 flex items-center justify-center font-bold text-brand-700 text-sm shadow-sm">
              {selectedAstronaut.id.replace("ASTRO-", "")}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-brand-700 leading-snug">
                  {lang === "ar" ? selectedAstronaut.name_ar : selectedAstronaut.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-200/50 text-brand-700 border border-brand-300/60">
                  {selectedAstronaut.blood_type}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/50 text-brand-600 border border-brand-500/15">
                  {selectedAstronaut.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === "ar" ? selectedAstronaut.role_ar : selectedAstronaut.role} •{" "}
                {lang === "ar" ? selectedAstronaut.mission_ar : selectedAstronaut.mission} (
                {selectedAstronaut.space_days} {lang === "ar" ? "يوماً في الفضاء" : "Days in Space"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">
                {t.simulatedMissionTelemetry}
              </span>
              <span
                className={`font-semibold flex items-center gap-1.5 justify-end ${studySyncStatus === "offline" ? "text-amber-700" : "text-emerald-700"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${studySyncStatus === "offline" ? "bg-amber-500" : "bg-emerald-500"} ${studySyncStatus === "syncing" ? "animate-ping" : ""}`}
                />
                {studySyncStatus === "syncing"
                  ? t.osdrStudiesSyncing
                  : studySyncStatus === "offline"
                    ? t.osdrStudiesCached
                    : t.osdrStudiesReady}
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Crew Selector */}
            <CrewSelector
              astronauts={astronauts}
              selectedAstronautId={selectedAstronautId}
              onSelectAstronaut={setSelectedAstronautId}
              lang={lang}
            />

            {/* Vitals HUD Summary */}
            <VitalsHUD astronaut={selectedAstronaut} lang={lang} />

            {/* Quick Navigation Cards & Action Spotlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: DNA & Genomic State */}
              <button
                type="button"
                onClick={() => setActiveTab("dna-telemetry")}
                className="glass-card hover:border-brand-400/40 hover:shadow-lg rounded-3xl p-5 cursor-pointer transition-all flex flex-col justify-between gap-3 group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-brand-200/40 text-brand-700 border border-brand-300/60">
                    <Dna className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-brand-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    {lang === "ar" ? "فحص الدنا" : "Inspect"} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-700">{t.dnaScannerTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t.dnaScannerSubtitle}
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-500/10 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {totalMeasuredGeneRecords}{" "}
                    {lang === "ar" ? "سجلات تعبير جيني من الدراسات" : "study-level gene records"}
                  </span>
                  <span className="font-semibold text-brand-700">
                    {studies
                      .slice(0, 4)
                      .map((study) => study.accession)
                      .join(" / ") || t.osdrStudiesSyncing}
                  </span>
                </div>
              </button>

              {/* Card 2: Bio-Rescue Protocol */}
              <button
                type="button"
                onClick={() => setActiveTab("food-printer")}
                className="glass-card hover:border-brand-400/40 hover:shadow-lg rounded-3xl p-5 cursor-pointer transition-all flex flex-col justify-between gap-3 group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    {lang === "ar" ? "البروتوكول" : "Protocol"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-700">{t.protocolTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t.protocolSubtitle}
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-500/10 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{t.simulatedMissionTelemetry}</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedAstronaut.bone_loss_risk_percentage}%
                  </span>
                </div>
              </button>

              {/* Card 3: NASA OSDR Logs */}
              <button
                type="button"
                onClick={() => setActiveTab("nasa-logs")}
                className="glass-card hover:border-brand-400/40 hover:shadow-lg rounded-3xl p-5 cursor-pointer transition-all flex flex-col justify-between gap-3 group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-brand-200/40 text-brand-700 border border-brand-300/60">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-brand-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    {lang === "ar" ? "عرض السجلات" : "View Logs"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-700">{t.geneTableTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t.geneTableSubtitle}
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-500/10 grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-brand-700">{astronauts.length}</span>
                    <span className="text-[10px] text-slate-500">
                      {lang === "ar" ? "رواد" : "Crew"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-brand-700">{totalMeasuredGeneRecords}</span>
                    <span className="text-[10px] text-slate-500">
                      {lang === "ar" ? "سجلات جينية" : "Gene records"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-brand-700">{studies.length}</span>
                    <span className="text-[10px] text-slate-500">
                      {lang === "ar" ? "دراسات OSDR" : "OSDR Studies"}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DNA & CELLULAR TELEMETRY */}
        {activeTab === "dna-telemetry" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DnaHelixScanner studies={studies} lang={lang} />
              <BoneDensityScanner astronaut={selectedAstronaut} lang={lang} />
            </div>
            <RadiationTelemetryChart astronaut={selectedAstronaut} lang={lang} />
          </div>
        )}

        {/* TAB 3: BIO-RESCUE PROTOCOL */}
        {activeTab === "food-printer" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <BioRescueProtocol astronaut={selectedAstronaut} studies={studies} lang={lang} />
          </div>
        )}

        {/* TAB 4: NASA GENELAB (OSDR) DATA LOGS */}
        {activeTab === "nasa-logs" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <GeneExpressionTable studies={studies} syncStatus={studySyncStatus} lang={lang} />
          </div>
        )}

        {/* TAB 5: SPACEFLIGHT RISK SIMULATOR */}
        {activeTab === "risk-simulator" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <RiskSimulatorPanel astronaut={selectedAstronaut} lang={lang} />
          </div>
        )}
      </main>

      {/* Clean Light Footer */}
      <footer className="w-full border-t border-brand-500/15 bg-white/50 backdrop-blur-md py-4 text-center text-xs text-brand-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>
            AstroHealth AI • NASA Space Apps Initiative • NASA GeneLab OSDR Verified Models
          </span>
          <span className="text-brand-700 font-medium">
            {lang === "ar"
              ? "دراسات الأحياء الفضائية وقياسات المهمة المحاكاة"
              : "Space Biology Studies & Simulated Mission Telemetry"}
          </span>
        </div>
        <p className="max-w-5xl mx-auto mt-2 text-[11px] leading-relaxed text-brand-600/80">
          {t.disclaimer}
        </p>
      </footer>

      {/* Modals */}
      <RiskSimulatorModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        astronaut={selectedAstronaut}
        lang={lang}
      />

      <FlightClearanceModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        astronaut={selectedAstronaut}
        lang={lang}
      />
    </div>
  );
}
