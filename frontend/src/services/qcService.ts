import apiClient from '../lib/api/axios';
import { QualityControl, QualityUpdateInput, ApiResponse } from '../types';

export const qcService = {
  /**
   * Get all quality control records
   * GET /api/qc or /api/quality
   */
  async getAllQualityChecks(): Promise<QualityControl[]> {
    const { data } = await apiClient.get<ApiResponse<QualityControl[]>>('/quality');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch quality checks');
  },

  /**
   * Get quality control record by ID
   * GET /api/qc/:id or /api/quality/:id
   */
  async getQualityCheckById(id: string): Promise<QualityControl> {
    const { data } = await apiClient.get<ApiResponse<QualityControl>>(`/quality/${id}`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Quality check not found');
  },

  /**
   * Create quality control record
   * POST /api/qc or /api/quality
   */
  async createQualityCheck(qcData: Partial<QualityControl>): Promise<QualityControl> {
    const { data } = await apiClient.post<ApiResponse<QualityControl>>('/quality', qcData);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create quality check');
  },

  /**
   * Update quality control status
   * PATCH /api/qc/:id or /api/quality/:id
   */
  async updateQualityStatus(id: string, update: QualityUpdateInput): Promise<QualityControl> {
    const { data } = await apiClient.patch<ApiResponse<QualityControl>>(`/quality/${id}`, update);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to update quality check');
  },
};
