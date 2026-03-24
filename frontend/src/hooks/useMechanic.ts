import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mechanicService } from '../services/mechanicService';
import { MaintenanceLog, AlertPriority, AlertFilters, Machine } from '../types';

// Query Keys
export const mechanicKeys = {
  machines: {
    all: ['machines'] as const,
    detail: (id: string) => ['machines', id] as const,
    history: (id: string) => ['machines', id, 'history'] as const,
  },
  alerts: {
    all: ['sos'] as const,
    detail: (id: string) => ['sos', 'detail', id] as const,
    list: (filters: AlertFilters) => ['sos', 'list', filters || {}] as const,
  },
  maintenance: {
    all: ['maintenance'] as const,
    list: (filters: Record<string, string>) => ['maintenance', 'list', filters || {}] as const,
  }
};

export const useMechanic = () => {
  const queryClient = useQueryClient();

  // --- Machines ---

  const useMachines = () => {
    return useQuery({
      queryKey: mechanicKeys.machines.all,
      queryFn: () => mechanicService.getAllMachines(),
    });
  };

  const useMachine = (id: string) => {
    return useQuery({
      queryKey: mechanicKeys.machines.detail(id),
      queryFn: () => mechanicService.getMachineById(id),
      enabled: !!id,
    });
  };

  const useCreateMachine = () => {
    return useMutation({
      mutationFn: (data: Partial<Machine>) => mechanicService.createMachine(data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: mechanicKeys.machines.all });
      },
    });
  };

  // --- SOS Alerts ---

  const useSOSAlerts = (filters?: AlertFilters) => {
    return useQuery({
      queryKey: mechanicKeys.alerts.list(filters ?? {}),
      queryFn: () => mechanicService.getAllAlerts(filters),
      refetchInterval: 15000, // Frequent refresh for alerts
    });
  };

  const useCreateSOSAlert = () => {
    return useMutation({
      mutationFn: (data: { machineId: string; priority: AlertPriority; problemDescription: string }) => mechanicService.createAlert(data),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: mechanicKeys.alerts.all }),
          // Update dashboard stats
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        ]);
      },
    });
  };

  const useResolveAlert = () => {
    return useMutation({
      mutationFn: ({ id, notes }: { id: string; notes: string }) => mechanicService.resolveAlert(id, notes),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: mechanicKeys.alerts.all });
      },
    });
  };

  // --- Maintenance ---

  const useMaintenanceLogs = (filters?: Record<string, string>) => {
    return useQuery({
      queryKey: mechanicKeys.maintenance.list(filters ?? {}),
      queryFn: () => mechanicService.getAllMaintenanceLogs(filters),
    });
  };

  const useCreateMaintenanceLog = () => {
    return useMutation({
      mutationFn: (data: Partial<MaintenanceLog>) => mechanicService.createMaintenanceLog(data),
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: mechanicKeys.maintenance.all }),
          queryClient.invalidateQueries({ queryKey: mechanicKeys.machines.detail(data.machine_id) }),
          queryClient.invalidateQueries({ queryKey: mechanicKeys.machines.history(data.machine_id) })
        ]);
      },
    });
  };

  return {
    useMachines,
    useMachine,
    useCreateMachine,
    useSOSAlerts,
    useCreateSOSAlert,
    useResolveAlert,
    useMaintenanceLogs,
    useCreateMaintenanceLog,
  };
};
