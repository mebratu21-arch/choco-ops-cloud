import apiClient from '../lib/api/axios';
import { ApiResponse } from '../types';

// Mechanics types (simplified - extend as needed)
export interface MachineFix {
  id: string;
  machine_id: string;
  issue_description: string;
  fixed_by: string;
  fix_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const mechanicService = {
  /**
   * Get all machine fixes
   * GET /api/mechanics
   */
  async getAllFixes(): Promise<MachineFix[]> {
    const { data } = await apiClient.get<ApiResponse<MachineFix[]>>('/mechanics');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch machine fixes');
  },

  /**
   * Get fix by ID
   * GET /api/mechanics/:id
   */
  async getFixById(id: string): Promise<MachineFix> {
    const { data } = await apiClient.get<ApiResponse<MachineFix>>(`/mechanics/${id}`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Machine fix not found');
  },

  /**
   * Log machine fix
   * POST /api/mechanics
   */
  async logFix(fixData: Partial<MachineFix>): Promise<MachineFix> {
    const { data } = await apiClient.post<ApiResponse<MachineFix>>('/mechanics', fixData);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to log machine fix');
  },
};
