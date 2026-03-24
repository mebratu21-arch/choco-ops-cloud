import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qcService } from '../services/qcService';
import { QCCheck, QCResult, QCDefect } from '../types';

// Query Keys
export const qcKeys = {
  all: ['qc'] as const,
  lists: () => [...qcKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...qcKeys.lists(), filters] as const,
  detail: (id: string) => [...qcKeys.all, 'detail', id] as const,
  byBatch: (batchId: string) => [...qcKeys.all, 'batch', batchId] as const,
  stats: (range?: string) => [...qcKeys.all, 'stats', range] as const,
  analysis: (range?: string) => [...qcKeys.all, 'analysis', range] as const,
};

export const useQC = () => {
  const queryClient = useQueryClient();

  // --- Queries ---

  const useQCChecks = (filters?: { result?: QCResult; startDate?: string; endDate?: string; inspectorId?: string }) => {
    return useQuery({
      queryKey: qcKeys.list(filters ?? {}),
      queryFn: () => qcService.getAllQCChecks(filters),
    });
  };

  const useQCCheck = (id: string) => {
    return useQuery({
      queryKey: qcKeys.detail(id),
      queryFn: () => qcService.getQCCheckById(id),
      enabled: !!id,
    });
  };

  const useBatchQCChecks = (batchId: string) => {
    return useQuery({
      queryKey: qcKeys.byBatch(batchId),
      queryFn: () => qcService.getQCChecksByBatch(batchId),
      enabled: !!batchId,
    });
  };

  const useQCStats = (dateRange?: [string, string]) => {
    const rangeKey = dateRange ? `${dateRange[0]}_${dateRange[1]}` : 'all';
    return useQuery({
      queryKey: qcKeys.stats(rangeKey),
      queryFn: () => qcService.getQCStats(dateRange),
      staleTime: 1000 * 60 * 5, // 5 mins
    });
  };

  const useDefectAnalysis = (dateRange?: [string, string]) => {
    const rangeKey = dateRange ? `${dateRange[0]}_${dateRange[1]}` : 'all';
    return useQuery({
      queryKey: qcKeys.analysis(rangeKey),
      queryFn: () => qcService.getDefectAnalysis(dateRange),
      staleTime: 1000 * 60 * 10, // 10 mins
    });
  };

  // --- Mutations ---

  const useCreateQCCheck = () => {
    return useMutation({
      mutationFn: (data: Partial<QCCheck> & { batchId: string; result: QCResult; defects?: Partial<QCDefect>[] }) => {
        const { batchId, defects, ...rest } = data;
        return qcService.createQCCheck({ ...rest, batch_id: batchId, defects });
      },
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: qcKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: qcKeys.byBatch(data.batch_id) });
        void queryClient.invalidateQueries({ queryKey: qcKeys.stats() });
        void queryClient.invalidateQueries({ queryKey: qcKeys.analysis() });
        // Using batch ID to invalidate batch details as QC status might be part of it
        void queryClient.invalidateQueries({ queryKey: ['batches', 'detail', data.batch_id] });
      },
    });
  };

  return {
    useQCChecks,
    useQCCheck,
    useBatchQCChecks,
    useCreateQCCheck,
    useQCStats,
    useDefectAnalysis,
  };
};
