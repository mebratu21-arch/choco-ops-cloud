import apiClient from '../lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    const { data} = await apiClient.post<ApiResponse<QualityControl>>('/quality', qcData);
    
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
  /**
   * Get pending batches for QC
   * GET /api/quality/pending
   */
  async getPendingBatches(): Promise<any[]> {
    try {
      // Use the correct filtering endpoint
      const { data } = await apiClient.get<ApiResponse<any[]>>('/quality/status/PENDING');
      if (data.success && data.data) return data.data;
      return [];
    } catch (error) {
      // Fallback: This might be because the endpoint doesn't exist yet
      // For demo purposes, returning empty array or mock data
      // console.warn('Failed to fetch pending batches:', error);
      return [];
    }
  },
};

// ============ REACT QUERY HOOKS ============

/**
 * Hook to get all quality checks
 * Usage:
 * ```ts
 * const { data: qcChecks, isLoading } = useQualityChecks();
 * ```
 */
export const useQualityChecks = () => {
  return useQuery({
    queryKey: ['quality-checks'],
    queryFn: () => qcService.getAllQualityChecks(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
  });
};

/**
 * Hook to get a single quality check by ID
 */
export const useQualityCheck = (id: string) => {
  return useQuery({
    queryKey: ['quality-checks', id],
    queryFn: () => qcService.getQualityCheckById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

/**
 * Hook to create a quality check
 * Usage:
 * ```ts
 * const { mutate } = useCreateQualityCheck();
 * mutate({ batch_id: '123', status: 'APPROVED' });
 * ```
 */
export const useCreateQualityCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (qcData: Partial<QualityControl>) => qcService.createQualityCheck(qcData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-checks'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] }); // Batch status may change
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Hook to update quality check status
 */
export const useUpdateQualityCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: QualityUpdateInput }) => 
      qcService.updateQualityStatus(id, update),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quality-checks'] });
      queryClient.invalidateQueries({ queryKey: ['quality-checks', id] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

