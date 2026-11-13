import { Activity, ExternalLink, FlaskConical, Gauge, Wind } from "lucide-react";
import type React from "react";
import { computeRisks } from "../data/nasaGeneLabData";
import { translations } from "../i18n/translations";
import type { Astronaut, Language, OsdrStudy } from "../types";

interface BioRescueProtocolProps {
  astronaut: Astronaut;
  studies: OsdrStudy[];
  lang: Language;
}

export const BioRescueProtocol: React.FC<BioRescueProtocolProps> = ({
  astronaut,
  studies,
  lang,
}) => {
  const t = translations[lang];
  const scenario = computeRisks(astronaut.space_days, astronaut.radiation_msv);
  const highPriority = scenario.bone_loss_risk_percentage >= 30 || scenario.dna_damage_index >= 65;
  const moderatePriority =
    scenario.bone_loss_risk_percentage >= 18 || scenario.dna_damage_index >= 40;
  const priority = highPriority
    ? t.statusBadge.critical
    : moderatePriority
      ? t.statusBadge.elevated
      : t.statusBadge.nominal;
  const priorityClass = highPriority
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : moderatePriority
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  const pillars = [
    {
      title: t.supplementPillar,
      icon: FlaskConical,
      summary: t.doseNotInferred,
      detail: t.supplementCaution,
    },
    {
      title: t.exercisePillar,
      icon: Activity,
      summary: `${scenario.bone_loss_risk_percentage}% ${t.simProjectedBoneLoss}`,
      detail: t.exerciseGuidance,
    },
    {
      title: t.environmentPillar,
      icon: Wind,
      summary: lang === "ar" ? "الأكسجين · الإضاءة · النوم" : "Oxygen · Lighting · Sleep",
      detail: t.environmentGuidance,
    },
  ];

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-500/10 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-200/40 border border-brand-300/60 text-brand-700">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-brand-700">{t.protocolTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.protocolSubtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-white/50 text-brand-600 border border-brand-500/15">
            {t.simulatedMissionTelemetry}
          </span>
          <span className={`px-2.5 py-1 rounded-full border font-semibold ${priorityClass}`}>
            {t.protocolPriority}: {priority}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {pillars.map(({ title, icon: Icon, summary, detail }) => (
          <article
            key={title}
            className="border border-brand-500/15 rounded-xl p-4 flex flex-col gap-3 bg-white/40"
          >
            <div className="flex items-center gap-2 text-brand-700">
              <Icon className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-semibold text-brand-700">{title}</h3>
            </div>
            <p className="text-xs font-semibold text-brand-700">{summary}</p>
            <p className="text-xs leading-relaxed text-slate-600">{detail}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-brand-500/10 py-3 text-xs">
        <span className="text-slate-600">
          {t.simProjectedBoneLoss}:{" "}
          <strong className="text-rose-700">{scenario.bone_loss_risk_percentage}%</strong>
        </span>
        <span className="text-slate-600">
          {t.simProjectedDnaDamage}:{" "}
          <strong className="text-amber-700">{scenario.dna_damage_index}/100</strong>
        </span>
        <span className="text-slate-500">{t.studyEvidenceOnly}</span>
      </div>

      {studies.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-700">{t.referenceStudies}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {studies.map((study) => {
              const preferredGenes: Record<string, string[]> = {
                "OSD-102": ["RANKL", "RUNX2"],
                "OSD-48": ["TNFRSF11B", "RUNX2"],
                "OSD-714": ["COL1A1", "CDKN1A"],
              };
              const allGenes = Object.values(study.genes);
              const preferred = (preferredGenes[study.accession] ?? [])
                .map((symbol) => allGenes.find((gene) => gene.ortholog_symbol === symbol))
                .filter((gene) => gene !== undefined);
              const examples = [
                ...preferred,
                ...allGenes.filter((gene) => !preferred.includes(gene)),
              ].slice(0, 2);
              return (
                <article
                  key={study.accession}
                  className="min-w-0 border border-brand-500/15 rounded-xl p-3 bg-white/40"
                >
                  <a
                    href={study.osdr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                  >
                    <span>
                      {study.accession}: {study.title}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                  </a>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {study.organism} · {study.tissue_label} · {study.mission}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-600">
                    {examples.map((gene) => (
                      <span key={gene.symbol} className="font-mono">
                        {gene.symbol}
                        {gene.ortholog_symbol ? ` (${gene.ortholog_symbol})` : ""} log2FC{" "}
                        {gene.log2fc > 0 ? "+" : ""}
                        {gene.log2fc}; p=
                        {gene.p_value == null ? "NR" : gene.p_value.toExponential(2)}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed">{t.notMedicalAdvice}</p>
    </section>
  );
};
