export type QCResult = 'approved' | 'rejected' | 'quarantine';
export type QCSeverity = 'minor' | 'major' | 'critical';

export interface QCDefect {
  id: string;
  qc_check_id: string;
  defect_type: string;
  severity: QCSeverity;
  quantity: number;
  description?: string;
}

export interface QCCheck {
  id: string;
  batch_id: string;
  inspector_id: string;
  inspection_date: Date;
  appearance_score?: number;
  texture_score?: number;
  taste_score?: number;
  temperature?: number;
  humidity?: number;
  defect_count: number;
  defect_types?: string[];
  result: QCResult;
  notes?: string;
  created_at: Date;
  
  // Relations
  inspector_name?: string;
  batch_number?: string;
  defects?: QCDefect[];
}

export interface QCFilters {
  result?: QCResult;
  batchId?: string;
  inspectorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface QCStats {
  totalInspections: number;
  passRate: number;
  averageScores: {
    appearance: number;
    texture: number;
    taste: number;
  };
  topDefects: { type: string; count: number }[];
}
