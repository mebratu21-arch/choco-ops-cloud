import apiClient from '../lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MachineFix, MachineFixInput, MachineManual, ApiResponse } from '../types';

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
  async logFix(fixData: MachineFixInput): Promise<MachineFix> {
    const { data } = await apiClient.post<ApiResponse<MachineFix>>('/mechanics', fixData);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to log machine fix');
  },

  /**
   * Update machine fix
   * PATCH /api/mechanics/:id
   */
  async updateFix(id: string, updates: Partial<MachineFix>): Promise<MachineFix> {
    const { data } = await apiClient.patch<ApiResponse<MachineFix>>(`/mechanics/${id}`, updates);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to update machine fix');
  },

  /**
   * Get SOS alerts (high priority, unresolved fixes)
   */
  async getSOSAlerts(): Promise<MachineFix[]> {
    const allFixes = await this.getAllFixes();
    return allFixes.filter(fix => 
      fix.priority === 'URGENT' && fix.status !== 'FIXED'
    );
  },

  /**
   * Get machine manuals (mock - backend may not have this endpoint yet)
   */
  async getMachineManuals(): Promise<MachineManual[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<MachineManual[]>>('/mechanics/manuals');
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      // Return empty array if endpoint doesn't exist
      return [];
    }
  },
};

// ============ REACT QUERY HOOKS ============

/**
 * Hook to get all machine fixes
 * Usage:
 * ```ts
 * const { data: fixes, isLoading } = useMachineFixes();
 * ```
 */
export const useMachineFixes = () => {
  return useQuery({
    queryKey: ['machine-fixes'],
    queryFn: () => mechanicService.getAllFixes(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
  });
};

/**
 * Hook to get a single machine fix by ID
 */
export const useMachineFix = (id: string) => {
  return useQuery({
    queryKey: ['machine-fixes', id],
    queryFn: () => mechanicService.getFixById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

/**
 * Hook to get SOS alerts
 * These are high priority, unresolved machine issues
 */
export const useSOSAlerts = () => {
  return useQuery({
    queryKey: ['machine-fixes', 'sos-alerts'],
    queryFn: () => mechanicService.getSOSAlerts(),
    staleTime: 1000 * 30, // 30 seconds - critical alerts need faster refresh
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
};

/**
 * Hook to get machine manuals
 */
export const useMachineManuals = () => {
  return useQuery({
    queryKey: ['machine-manuals'],
    queryFn: () => mechanicService.getMachineManuals(),
    staleTime: 1000 * 60 * 10, // 10 minutes - manuals don't change often
  });
};

/**
 * Hook to log a machine fix
 * Usage:
 * ```ts
 * const { mutate } = useLogFix();
 * mutate({ machine_name: 'Mixer', description: 'Strange noise', priority: 'HIGH' });
 * ```
 */
export const useLogFix = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fixData: MachineFixInput) => mechanicService.logFix(fixData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-fixes'] });
      queryClient.invalidateQueries({ queryKey: ['machine-fixes', 'sos-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Hook to update a machine fix
 */
export const useUpdateFix = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MachineFix> }) => 
      mechanicService.updateFix(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['machine-fixes'] });
      queryClient.invalidateQueries({ queryKey: ['machine-fixes', id] });
      queryClient.invalidateQueries({ queryKey: ['machine-fixes', 'sos-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

