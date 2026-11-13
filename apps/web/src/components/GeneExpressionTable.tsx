import { Database, Download, ExternalLink, Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { translations } from "../i18n/translations";
import type { Language, OsdrStudy } from "../types";

interface GeneExpressionTableProps {
  studies: OsdrStudy[];
  syncStatus: "syncing" | "ready" | "offline";
  lang: Language;
}

interface GeneRecord {
  study: OsdrStudy;
  key: string;
  symbol: string;
  orthologSymbol?: string | null;
  geneName?: string | null;
  log2fc: number;
  sourceSymbol?: string | null;
  sourceLog2fc?: number | null;
  pValue: number | null;
  adjustedPValue?: number | null;
  significant?: boolean | null;
}

const display = (value: string | string[] | undefined, fallback: string) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return fallback;
  return Array.isArray(value) ? value.join(", ") : value;
};

const formatP = (value: number | null | undefined, missing: string) =>
  value == null ? missing : value.toExponential(2);

const CSV_HEADERS = [
  "Study_ID",
  "GLDS_ID",
  "Study_Title",
  "Organism",
  "Mission",
  "Tissue",
  "Gene_Symbol",
  "log2FC",
  "p_value",
  "Regulation_Status",
];

export function buildOsdrCsvRows(records: GeneRecord[]): Array<Array<string | number>> {
  const seen = new Set<string>();
  const rows: Array<Array<string | number>> = [];

  for (const record of records) {
    if (!record.sourceSymbol || record.sourceLog2fc == null) continue;

    const row: Array<string | number> = [
      record.study.accession,
      display(record.study.glds, ""),
      record.study.title,
      record.study.organism,
      record.study.mission,
      display(record.study.tissue_label, ""),
      record.sourceSymbol,
      record.sourceLog2fc,
      record.pValue ?? "",
      record.sourceLog2fc > 0 ? "Up-regulated" : "Down-regulated",
    ];
    const rowKey = JSON.stringify(row);
    if (!seen.has(rowKey)) {
      seen.add(rowKey);
      rows.push(row);
    }
  }

  return rows;
}

export const GeneExpressionTable: React.FC<GeneExpressionTableProps> = ({
  studies,
  syncStatus,
  lang,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState("");
  const missing = lang === "ar" ? "غير متاح" : "Not reported";
  const geneRecords: GeneRecord[] = studies.flatMap((study) =>
    Object.entries(study.genes).map(([key, gene]) => ({
      study,
      key,
      symbol: gene.symbol,
      orthologSymbol: gene.ortholog_symbol,
      geneName: gene.gene_name,
      log2fc: gene.log2fc,
      sourceSymbol: gene.source_symbol,
      sourceLog2fc: gene.source_log2fc,
      pValue: gene.p_value,
      adjustedPValue: gene.adj_p_value,
      significant: gene.significant,
    })),
  );
  const term = searchTerm.trim().toLowerCase();
  const filteredGenes = geneRecords.filter((record) =>
    [
      record.symbol,
      record.orthologSymbol,
      record.geneName,
      record.study.accession,
      record.study.title,
    ].some((value) => value?.toLowerCase().includes(term)),
  );

  const exportCsv = () => {
    const rows = buildOsdrCsvRows(geneRecords);
    if (rows.length === 0) return;
    const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [CSV_HEADERS, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "NASA_OSDR_differential_expression.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-500/10 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-200/40 border border-brand-300/60 text-brand-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-brand-700">{t.geneTableTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.geneTableSubtitle}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {syncStatus === "syncing"
                ? t.osdrStudiesSyncing
                : syncStatus === "offline"
                  ? t.osdrStudiesCached
                  : t.osdrStudiesReady}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              aria-label={t.searchPlaceholder}
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-white/50 border border-brand-500/15 rounded-lg pl-9 pr-3 py-2 text-xs text-brand-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:bg-white/80"
            />
          </label>
          <button
            type="button"
            onClick={exportCsv}
            disabled={
              !geneRecords.some(
                (record) => record.sourceSymbol && record.sourceLog2fc !== undefined,
              )
            }
            className="px-3 py-2 rounded-lg bg-white/50 hover:bg-brand-200/40 text-brand-700 border border-brand-500/15 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-600" />
            <span>{lang === "ar" ? "تصدير CSV" : "Export CSV"}</span>
          </button>
        </div>
      </header>

      {studies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {studies.map((study) => (
            <article
              key={study.accession}
              className="min-w-0 border border-brand-500/15 rounded-xl p-4 bg-white/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-brand-700">
                    {study.accession} · {display(study.glds, missing)}
                  </span>
                  <h3 className="text-sm font-semibold text-brand-700 leading-snug mt-1">
                    {study.title || missing}
                  </h3>
                </div>
                <a
                  href={study.osdr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.viewOsdrStudy}: ${study.accession}`}
                  title={t.viewOsdrStudy}
                  className="shrink-0 p-1.5 rounded-md text-brand-700 hover:bg-brand-200/50"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-[11px]">
                <div className="min-w-0">
                  <dt className="text-slate-400">{t.organism}</dt>
                  <dd className="text-slate-700 break-words">{display(study.organism, missing)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-slate-400">{t.studyMission}</dt>
                  <dd className="text-slate-700 break-words">{display(study.mission, missing)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-slate-400">{t.tissue}</dt>
                  <dd className="text-slate-700 break-words">
                    {display(study.tissue_label, missing)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-slate-400">{t.assay}</dt>
                  <dd className="text-slate-700 break-words">{display(study.assay, missing)}</dd>
                </div>
              </dl>
              <p className="mt-3 pt-2 border-t border-brand-500/15 text-[10px] text-slate-500 break-words">
                {t.studyContrast}: {display(study.contrast, missing)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          {syncStatus === "syncing" ? t.osdrStudiesSyncing : t.noOsdrStudies}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-brand-500/15">
        <table className="w-full min-w-[760px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-brand-50/60 text-[11px] font-semibold text-brand-600 border-b border-brand-500/15">
              <th className="p-3">{t.studyId}</th>
              <th className="p-3">{t.geneSymbol}</th>
              <th className="p-3">{t.geneName}</th>
              <th className="p-3 text-right">log2FC</th>
              <th className="p-3 text-right">p-value</th>
              <th className="p-3 text-right">{t.adjustedPValue}</th>
              <th className="p-3">{t.significance}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-500/10">
            {filteredGenes.map((record) => (
              <tr key={`${record.study.accession}-${record.key}`} className="hover:bg-brand-50/50">
                <td className="p-3 font-semibold text-brand-700">{record.study.accession}</td>
                <td className="p-3 font-semibold text-brand-700">
                  {record.symbol}
                  {record.orthologSymbol ? (
                    <span className="text-slate-500 font-normal"> ({record.orthologSymbol})</span>
                  ) : null}
                </td>
                <td className="p-3 text-slate-600">{record.geneName || missing}</td>
                <td
                  className={`p-3 text-right font-mono ${record.log2fc < 0 ? "text-rose-700" : "text-emerald-700"}`}
                >
                  {record.log2fc > 0 ? "+" : ""}
                  {record.log2fc}
                </td>
                <td className="p-3 text-right font-mono text-slate-700">
                  {formatP(record.pValue, missing)}
                </td>
                <td className="p-3 text-right font-mono text-slate-700">
                  {formatP(record.adjustedPValue, missing)}
                </td>
                <td className="p-3 text-slate-600">
                  {record.significant == null
                    ? missing
                    : record.significant
                      ? t.significant
                      : t.notSignificant}
                </td>
              </tr>
            ))}
            {filteredGenes.length === 0 && (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={7}>
                  {studies.length ? t.noGeneRecords : t.noOsdrStudies}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">{t.osdrSpeciesNote}</p>
    </section>
  );
};
