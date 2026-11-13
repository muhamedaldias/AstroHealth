import React, { useMemo, useState } from 'react';
import { Language, Astronaut, OsdrStudy, AffectedGene } from '../types';
import { translations } from '../i18n/translations';
import {
  HologramAstronaut,
  HOTSPOT_NODES,
  TwinHotspotId,
} from './HologramAstronaut';
import {
  Activity,
  Bone,
  Dna,
  ExternalLink,
  Orbit,
  ShieldCheck,
  Crosshair,
} from 'lucide-react';

interface DigitalTwinPanelProps {
  astronaut: Astronaut;
  studies: OsdrStudy[];
  syncStatus: 'syncing' | 'ready' | 'offline';
  lang: Language;
}

/**
 * Real NASA OSDR gene symbols measured in our verified dataset.
 * These are lookup keys only - every displayed value is read from the live
 * study records served by src/services/osdrApi.ts (backend/.osdr_cache).
 */
const SKELETAL_PANEL = ['RUNX2', 'COL1A1', 'RANKL', 'SOST'];
const DNA_PANEL = ['RAD51', 'TP53', 'SOD2', 'GPX1'];

interface GeneRow {
  study: OsdrStudy;
  geneKey: string;
  gene: AffectedGene;
}

const HOTSPOT_ICON: Record<TwinHotspotId, React.FC<{ className?: string }>> = {
  skeletal: Bone,
  dna: Dna,
  exposure: Crosshair,
};

const formatLog2fc = (value: number) => (value > 0 ? `+${value}` : `${value}`);
const formatP = (value: number | null | undefined, missing: string) =>
  value == null ? missing : value.toExponential(2);
const formatFold = (value: number | undefined, missing: string) =>
  value == null ? missing : value.toFixed(4);

const collectPanelRows = (studies: OsdrStudy[], panel: string[]): GeneRow[] =>
  studies.flatMap((study) =>
    panel.flatMap((geneKey) => {
      const gene = study.genes[geneKey];
      return gene ? [{ study, geneKey, gene }] : [];
    })
  );

/** Strongest measured response (largest |log2FC|) inside a real OSDR study. */
const dominantResponse = (study: OsdrStudy): { geneKey: string; gene: AffectedGene } | null => {
  let best: { geneKey: string; gene: AffectedGene } | null = null;
  for (const [geneKey, gene] of Object.entries(study.genes)) {
    if (!best || Math.abs(gene.log2fc) > Math.abs(best.gene.log2fc)) {
      best = { geneKey, gene };
    }
  }
  return best;
};

export const DigitalTwinPanel: React.FC<DigitalTwinPanelProps> = ({
  astronaut,
  studies,
  syncStatus,
  lang,
}) => {
  const t = translations[lang];
  const [activeHotspot, setActiveHotspot] = useState<TwinHotspotId>('skeletal');
  const missing = lang === 'ar' ? 'غير متاح' : 'Not reported';

  const skeletalRows = useMemo(() => collectPanelRows(studies, SKELETAL_PANEL), [studies]);
  const dnaRows = useMemo(() => collectPanelRows(studies, DNA_PANEL), [studies]);

  const activeRows = activeHotspot === 'skeletal' ? skeletalRows : dnaRows;
  const activeStudies = useMemo(() => {
    const seen = new Set<string>();
    return activeRows
      .filter((row) => {
        if (seen.has(row.study.accession)) return false;
        seen.add(row.study.accession);
        return true;
      })
      .map((row) => row.study);
  }, [activeRows]);

  const hotspotMeta = HOTSPOT_NODES.find((node) => node.id === activeHotspot) ?? HOTSPOT_NODES[0];
  const HotspotIcon = HOTSPOT_ICON[activeHotspot];
  const hotspotTitle = lang === 'ar' ? hotspotMeta.label_ar : hotspotMeta.label;

  const guidance =
    activeHotspot === 'skeletal'
      ? t.twinGuidanceSkeletal
      : activeHotspot === 'dna'
        ? t.twinGuidanceDna
        : t.twinGuidanceExposure;

  const awaitingData = studies.length === 0;

  return (
    <section className="flex flex-col gap-5 animate-fade-in">
      {/* View header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-200/40 border border-brand-300/60 text-brand-700">
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-brand-700">{t.digitalTwinTitle}</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              {t.digitalTwinSubtitle}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-brand-700 bg-white/50 border border-brand-500/15 rounded-full px-3 py-1">
          {studies.length > 0
            ? `${studies.length} ${lang === 'ar' ? 'دراسات OSDR حقيقية' : 'real OSDR studies'}`
            : syncStatus === 'syncing'
              ? t.osdrStudiesSyncing
              : t.osdrStudiesCached}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)] gap-5 items-start">
        {/* CARD 1 - Selected Astronaut Simulated Mission Vitals */}
        <article className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <header className="flex items-center gap-2.5 border-b border-brand-500/10 pb-3">
            <div className="p-2 rounded-lg bg-brand-200/40 border border-brand-300/60 text-brand-700">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-brand-700 leading-tight">{t.twinVitalsTitle}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{t.twinVitalsSubtitle}</p>
            </div>
          </header>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-700 truncate">
                {lang === 'ar' ? astronaut.name_ar : astronaut.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {astronaut.id} • {lang === 'ar' ? astronaut.mission_ar : astronaut.mission}
              </p>
            </div>
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-brand-600 bg-brand-100/70 border border-brand-300/60 rounded-full px-2 py-0.5">
              {t.twinSimulatedTag}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/45 border border-brand-500/15 p-2.5">
              <dt className="text-[10px] text-slate-500">{t.twinSpaceDays}</dt>
              <dd className="text-base font-bold text-brand-700 leading-tight mt-0.5">
                {astronaut.space_days}
              </dd>
            </div>
            <div className="rounded-xl bg-white/45 border border-brand-500/15 p-2.5">
              <dt className="text-[10px] text-slate-500">{t.twinRadiationMsv}</dt>
              <dd className="text-base font-bold text-brand-700 leading-tight mt-0.5">
                {astronaut.radiation_msv}
              </dd>
            </div>
            <div className="rounded-xl bg-white/45 border border-brand-500/15 p-2.5">
              <dt className="text-[10px] text-slate-500">{t.twinBoneLossIndex}</dt>
              <dd className="text-base font-bold text-brand-700 leading-tight mt-0.5">
                {astronaut.bone_loss_risk_percentage}%
              </dd>
            </div>
            <div className="rounded-xl bg-white/45 border border-brand-500/15 p-2.5">
              <dt className="text-[10px] text-slate-500">{t.twinDnaDamageIndex}</dt>
              <dd className="text-base font-bold text-brand-700 leading-tight mt-0.5">
                {astronaut.dna_damage_index}
              </dd>
            </div>
          </dl>

          <p className="text-[10px] leading-relaxed text-slate-500 border-t border-brand-500/10 pt-2">
            {t.twinVitalsNote}
          </p>
        </article>

        {/* CENTER VISUAL - Holographic astronaut with real-data hotspots */}
        <div className="flex flex-col items-center gap-3 order-first lg:order-none">
          {/* Hotspot legend (not a card) */}
          <div className="w-full max-w-[460px] flex flex-wrap items-center justify-center gap-2">
            {HOTSPOT_NODES.map((node) => {
              const Icon = HOTSPOT_ICON[node.id];
              const isActive = activeHotspot === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveHotspot(node.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${
                    isActive
                      ? 'bg-brand-700 text-white border-brand-700 shadow-teal-glow'
                      : 'bg-white/60 text-brand-700 border-brand-500/20 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{lang === 'ar' ? node.label_ar : node.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-full max-w-[460px] rounded-3xl overflow-hidden border border-brand-500/20 shadow-[0_18px_50px_-24px_rgba(13,34,58,0.55)] bg-brand-800">
            <HologramAstronaut
              lang={lang}
              activeHotspot={activeHotspot}
              onSelectHotspot={setActiveHotspot}
            />
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            {t.digitalTwinSelectHotspot}
          </p>
        </div>

        {/* CARD 2 - Active System Hotspot Details (real NASA OSDR data) */}
        <article className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <header className="flex items-start gap-2.5 border-b border-brand-500/10 pb-3">
            <div className="p-2 rounded-lg bg-brand-200/40 border border-brand-300/60 text-brand-700 shrink-0">
              <HotspotIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-brand-700 leading-tight">{t.twinDetailsTitle}</h3>
              <p className="text-[10px] text-brand-600 font-semibold mt-0.5 truncate">{hotspotTitle}</p>
            </div>
          </header>

          {activeHotspot === 'exposure' ? (
            /* Exposure hotspot: simulated telemetry + real OSDR exposure studies */
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-white/45 border border-brand-500/15 p-3">
                <p className="text-[10px] text-slate-500">{t.twinExposureSimulatedLabel}</p>
                <dl className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <dt className="text-[10px] text-slate-500">{t.twinSpaceDays}</dt>
                    <dd className="text-sm font-bold text-brand-700">{astronaut.space_days}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-slate-500">{t.twinRadiationMsv}</dt>
                    <dd className="text-sm font-bold text-brand-700">{astronaut.radiation_msv}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-brand-600 mb-1.5">
                  {t.twinExposureStudies}
                </p>
                {awaitingData ? (
                  <p className="text-[11px] text-slate-500">{t.twinAwaitingSync}</p>
                ) : (
                  <ul className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {studies.map((study) => {
                      const dominant = dominantResponse(study);
                      return (
                        <li
                          key={study.accession}
                          className="rounded-lg bg-white/40 border border-brand-500/12 p-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-brand-700">
                              {study.accession}
                            </span>
                            <a
                              href={study.osdr_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${t.viewOsdrStudy}: ${study.accession}`}
                              className="shrink-0 text-brand-600 hover:text-brand-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">
                            {study.mission} • {study.tissue_label}
                          </p>
                          {dominant && (
                            <p className="text-[9px] text-slate-600 mt-1">
                              <span className="font-semibold text-brand-700">{dominant.geneKey}</span>{' '}
                              {t.twinLog2fc} {formatLog2fc(dominant.gene.log2fc)} •{' '}
                              {t.twinPValue} {formatP(dominant.gene.p_value, missing)}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                  {t.twinStrongestResponse}
                </p>
              </div>
            </div>
          ) : (
            /* Gene-panel hotspots: real study IDs + real log2FC / p-values */
            <div className="flex flex-col gap-2.5">
              {awaitingData ? (
                <p className="text-[11px] text-slate-500 py-4 text-center">
                  {syncStatus === 'syncing' ? t.osdrStudiesSyncing : t.twinAwaitingSync}
                </p>
              ) : (
                <>
                  <p className="text-[10px] font-semibold text-brand-600">
                    {t.twinStudyIds}: {activeStudies.map((study) => study.accession).join(', ')}
                  </p>
                  <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                    {activeStudies.map((study) => {
                      const rows = activeRows.filter((row) => row.study.accession === study.accession);
                      return (
                        <div
                          key={study.accession}
                          className="rounded-lg bg-white/40 border border-brand-500/12 p-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-brand-700">
                              {study.accession}
                            </span>
                            <a
                              href={study.osdr_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${t.viewOsdrStudy}: ${study.accession}`}
                              className="shrink-0 text-brand-600 hover:text-brand-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">
                            {study.mission} • {study.tissue_label}
                          </p>
                          <div className="flex flex-col gap-1 mt-1.5">
                            {rows.map((row) => (
                              <div
                                key={`${row.study.accession}-${row.geneKey}`}
                                className="rounded-md bg-white/55 border border-brand-500/10 px-2 py-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-brand-700">
                                    {row.geneKey}
                                    {row.gene.source_symbol ? (
                                      <span className="text-slate-500 font-normal">
                                        {' '}({row.gene.source_symbol})
                                      </span>
                                    ) : null}
                                  </span>
                                  <span
                                    className={`text-[9px] font-semibold px-1.5 rounded-full border ${
                                      row.gene.status === 'upregulated'
                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                                        : 'text-rose-700 bg-rose-50 border-rose-200/70'
                                    }`}
                                  >
                                    {row.gene.status === 'upregulated'
                                      ? t.twinUpRegulated
                                      : t.twinDownRegulated}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-0.5 text-[9px] text-slate-600 font-mono">
                                  <span>
                                    log2FC {formatLog2fc(row.gene.log2fc)}
                                  </span>
                                  <span>
                                    FC {formatFold(row.gene.fold_change, missing)}
                                  </span>
                                  <span>
                                    p {formatP(row.gene.p_value, missing)}
                                  </span>
                                  <span>
                                    adj p {formatP(row.gene.adj_p_value, missing)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preventive guidance note */}
          <div className="rounded-xl bg-brand-50/70 border border-brand-300/50 p-2.5 flex items-start gap-2 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-brand-700">{guidance}</p>
          </div>
        </article>
      </div>

      {/* Scientific honesty / provenance badge */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-brand-700 px-4 py-3 border border-brand-400/35">
        <ShieldCheck className="w-4 h-4 text-brand-300 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-brand-100">
          <span className="font-bold text-brand-300">{t.twinProvenanceLabel}: </span>
          {t.twinProvenance}
        </p>
      </div>
    </section>
  );
};
