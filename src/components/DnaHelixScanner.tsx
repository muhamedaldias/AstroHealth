import React, { useState } from 'react';
import { Language, OsdrStudy } from '../types';
import { translations } from '../i18n/translations';
import { Dna, ExternalLink } from 'lucide-react';

interface DnaHelixScannerProps {
  studies: OsdrStudy[];
  lang: Language;
}

interface StudyGene {
  key: string;
  study: OsdrStudy;
  symbol: string;
  orthologSymbol?: string;
  geneName?: string;
  log2fc: number;
  pValue: number | null;
  adjustedPValue?: number | null;
  significant?: boolean | null;
}

const formatP = (value: number | null | undefined, missing: string) =>
  value == null ? missing : value.toExponential(2);

export const DnaHelixScanner: React.FC<DnaHelixScannerProps> = ({ studies, lang }) => {
  const t = translations[lang];
  const records: StudyGene[] = studies.flatMap((study) =>
    Object.entries(study.genes).map(([key, gene]) => ({
      key: `${study.accession}:${key}`,
      study,
      symbol: gene.symbol,
      orthologSymbol: gene.ortholog_symbol,
      geneName: gene.gene_name,
      log2fc: gene.log2fc,
      pValue: gene.p_value,
      adjustedPValue: gene.adj_p_value,
      significant: gene.significant,
    }))
  );
  const [selectedKey, setSelectedKey] = useState('');
  const selected = records.find((record) => record.key === selectedKey) ?? records[0];
  const missing = lang === 'ar' ? 'غير متاح' : 'Not reported';
  const maximumEffect = Math.max(1, ...records.map((record) => Math.abs(record.log2fc)));
  const effectWidth = selected ? Math.abs(selected.log2fc) / maximumEffect * 50 : 0;

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <header className="flex items-start gap-3 border-b border-brand-500/10 pb-4">
        <div className="p-2.5 rounded-xl bg-brand-200/40 border border-brand-300/60 text-brand-700">
          <Dna className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-base text-brand-700">{t.dnaScannerTitle}</h2>
          <p className="text-xs text-slate-500 mt-1">{t.dnaScannerSubtitle}</p>
        </div>
      </header>

      {records.length ? (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.geneSymbol}>
            {records.map((record) => (
              <button
                key={record.key}
                type="button"
                onClick={() => setSelectedKey(record.key)}
                aria-pressed={selected?.key === record.key}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${selected?.key === record.key ? 'bg-brand-200/50 border-brand-400 text-brand-700' : 'bg-white border-brand-500/15 text-slate-700 hover:border-brand-300'}`}
              >
                {record.symbol} <span className="text-slate-500">· {record.study.accession}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] gap-4">
              <article className="min-w-0 bg-white/45 border border-brand-500/15 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-brand-700">
                      {selected.symbol}{selected.orthologSymbol ? <span className="text-slate-500 font-normal"> ({selected.orthologSymbol})</span> : null}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selected.geneName || missing}</p>
                  </div>
                  <a
                    href={selected.study.osdr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-200/45 border border-brand-300/60 text-brand-700 text-[11px] font-semibold"
                  >
                    {selected.study.accession}<ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div><dt className="text-slate-400">{t.organism}</dt><dd className="text-slate-700 mt-0.5">{selected.study.organism || missing}</dd></div>
                  <div><dt className="text-slate-400">{t.tissue}</dt><dd className="text-slate-700 mt-0.5">{selected.study.tissue_label || missing}</dd></div>
                  <div><dt className="text-slate-400">{t.assay}</dt><dd className="text-slate-700 mt-0.5">{selected.study.assay || missing}</dd></div>
                  <div><dt className="text-slate-400">{t.studyMission}</dt><dd className="text-slate-700 mt-0.5">{selected.study.mission || missing}</dd></div>
                </dl>
                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-brand-500/15 pt-2">{selected.study.contrast || missing}</p>
              </article>

              <article className="border border-brand-500/15 rounded-xl p-4 flex flex-col justify-center gap-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-700">log2FC</span>
                  <span className={`font-mono font-bold text-sm ${selected.log2fc < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{selected.log2fc > 0 ? '+' : ''}{selected.log2fc}</span>
                </div>
                <div className="relative h-3 rounded-full bg-brand-500/10 overflow-hidden" aria-label={`log2FC ${selected.log2fc}`}>
                  <span className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-500 z-10" />
                  {selected.log2fc < 0 ? (
                    <span className="absolute right-1/2 top-0 bottom-0 bg-rose-500 rounded-l-full" style={{ width: `${effectWidth}%` }} />
                  ) : (
                    <span className="absolute left-1/2 top-0 bottom-0 bg-emerald-500 rounded-r-full" style={{ width: `${effectWidth}%` }} />
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div><dt className="text-slate-400">p-value</dt><dd className="font-mono text-slate-700 mt-0.5">{formatP(selected.pValue, missing)}</dd></div>
                  <div><dt className="text-slate-400">{t.adjustedPValue}</dt><dd className="font-mono text-slate-700 mt-0.5">{formatP(selected.adjustedPValue, missing)}</dd></div>
                </dl>
                <p className="text-[11px] font-medium text-slate-600">
                  {selected.significant == null ? missing : selected.significant ? t.significant : t.notSignificant}
                </p>
              </article>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-slate-500">{t.osdrSpeciesNote}</p>
        </>
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">{t.osdrStudiesSyncing}</p>
      )}
    </section>
  );
};
