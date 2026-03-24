import api from './api';
import { 
  QCCheck, 
  QCResult, 
  QCStats, 
  QCDefect,
  APIResponse,
  PaginationMeta,
  DefectAnalysis
} from '../types';

interface QCCheckListResponse {
  checks: QCCheck[];
  meta?: PaginationMeta;
}


export const qcService = {
  // --- QC Check Functions ---

  /**
   * Get all QC checks with filters
   */
  async getAllQCChecks(filters?: { 
    result?: QCResult; 
    startDate?: string; 
    endDate?: string; 
    inspectorId?: string 
  }): Promise<QCCheckListResponse> {
    const params = new URLSearchParams();
    if (filters?.result) params.append('result', filters.result);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.inspectorId) params.append('inspectorId', filters.inspectorId);

    const response = await api.get<void, APIResponse<QCCheckListResponse>>(`/qc?${params.toString()}`);

    if (response.success && response.data) return response.data;
    return { checks: [] };
  },

  /**
   * Get a single QC check by ID
   */
  async getQCCheckById(id: string): Promise<QCCheck> {
    const response = await api.get<void, APIResponse<QCCheck>>(`/qc/${id}`);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'QC Check not found');
  },

  /**
   * Get all QC checks for a specific batch
   */
  async getQCChecksByBatch(batchId: string): Promise<QCCheck[]> {
    const response = await api.get<void, APIResponse<QCCheck[]>>(`/qc/batch/${batchId}`);
    if (response.success && response.data) return response.data;
    return [];
  },

  /**
   * Submit a new QC inspection
   */
  async createQCCheck(data: Partial<QCCheck> & { batch_id: string; result: QCResult; defects?: QCDefect[] }): Promise<QCCheck> {
    const response = await api.post<Partial<QCCheck> & { batch_id: string; result: QCResult; defects?: QCDefect[] }, APIResponse<QCCheck>>('/qc', data);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to submit QC check');
  },

  /**
   * Update an existing QC check
   */
  async updateQCCheck(id: string, data: Partial<QCCheck>): Promise<QCCheck> {
    const response = await api.put<Partial<QCCheck>, APIResponse<QCCheck>>(`/qc/${id}`, data);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to update QC check');
  },

  // --- QC Analysis Functions ---

  /**
   * Get QC statistics
   */
  async getQCStats(dateRange?: [string, string]): Promise<QCStats> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('startDate', dateRange[0]);
      params.append('endDate', dateRange[1]);
    }

    const response = await api.get<void, APIResponse<QCStats>>(`/qc/stats?${params.toString()}`);
    
    if (response.success && response.data) return response.data;
    
    // Return empty stats as fallback to prevent UI crash
    return {
      totalInspections: 0,
      passRate: 0,
      rejectRate: 0,
      quarantineRate: 0,
      averageScore: 0,
      defectTrends: {},
      byResult: {
        approved: 0,
        rejected: 0,
        quarantine: 0,
        pending: 0
      }
    };
  },

  /**
   * Get defect analysis
   */
  async getDefectAnalysis(dateRange?: [string, string]): Promise<DefectAnalysis> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('startDate', dateRange[0]);
      params.append('endDate', dateRange[1]);
    }

    // Define the raw API response type locally since it differs from the frontend model
    interface RawDefectAnalysis {
        defectsByType: Record<string, number>;
        defectsBySeverity: Record<string, number>;
        trends: { date: string; count: number }[];
    }

    const response = await api.get<void, APIResponse<RawDefectAnalysis>>(`/qc/defects/analysis?${params.toString()}`);
    
    if (response.success && response.data) {
        // Transform to match global DefectAnalysis type
        const raw = response.data;
        const defectsByTypeArray = Object.entries(raw.defectsByType).map(([type, count]) => ({ type, count }));
        const totalDefects = Object.values(raw.defectsByType).reduce((a, b) => a + b, 0);
        const criticalDefects = raw.defectsBySeverity.critical || 0;

        return {
            defectsByType: defectsByTypeArray,
            totalDefects,
            criticalDefects
        };
    }
    
    return {
      defectsByType: [],
      totalDefects: 0,
      criticalDefects: 0
    };
  }
};
