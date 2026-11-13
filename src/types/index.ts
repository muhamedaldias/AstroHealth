export type Language = 'en' | 'ar';

export interface AffectedGene {
  symbol: string;
  source_symbol?: string;
  source_log2fc?: number;
  ortholog_symbol?: string;
  mouse_symbol?: string;
  ensembl?: string;
  fold_change?: number;
  log2fc: number;
  change_percent: number;
  p_value: number | null;
  adj_p_value?: number | null;
  stat?: number | null;
  gene_name?: string;
  status: 'upregulated' | 'downregulated';
  osdr_ref?: string;
  contrast_column?: string;
  tissue?: string;
  contrast?: string;
  measured?: boolean;
  significant?: boolean | null;
}

export interface Astronaut {
  id: string;
  name: string;
  name_ar: string;
  role: string;
  role_ar: string;
  mission: string;
  mission_ar: string;
  space_days: number;
  radiation_msv: number;
  eva_hours: number;
  age: number;
  blood_type: string;
  baseline_bmd_t_score: number;
  current_bmd_t_score: number;
  bone_loss_risk_percentage: number;
  dna_damage_index: number;
  cellular_repair_efficiency: number;
  affected_genes: AffectedGene[];
  cohort_type: 'simulated_mission_telemetry';
  gene_data_source: null;
}

export interface CrewPayload {
  count: number;
  crew: Astronaut[];
  gene_data_source: null;
  cohort_type: 'simulated_mission_telemetry';
}

export interface OsdrStudy {
  accession: string;
  glds: string | string[];
  title: string;
  description: string;
  organism: string;
  material_type: string | string[];
  project_type: string;
  mission: string;
  assay: string | string[];
  platform: string | string[];
  release_date: number | null;
  tissue_label: string;
  de_file: string;
  contrast: string;
  genes: Record<string, AffectedGene>;
  source_url: string;
  osdr_url: string;
  fetched_at: string;
  stale: boolean;
}

export interface OsdrStudiesPayload {
  source: string;
  repository: string;
  count: number;
  expected_count: number;
  sync_status: 'ready' | 'syncing';
  studies: OsdrStudy[];
}

