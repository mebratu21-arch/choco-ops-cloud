import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mechanicService } from '../services/mechanicService';
import { MaintenanceLog, AlertPriority, AlertStatus, AlertFilters } from '../types';
import { useAuth } from './useAuth';

// Query Keys
export const maintenanceKeys = {
  machines: {
    all: ['machines'] as const,
    detail: (id: string | number) => ['machines', id] as const,
    history: (id: string | number) => ['machines', id, 'history'] as const,
    sos: (id: string | number) => ['machines', id, 'sos'] as const,
  },
  alerts: {
    all: ['sos'] as const,
    list: (filters: AlertFilters) => ['sos', 'list', filters || {}] as const,
    detail: (id: string) => ['sos', 'detail', id] as const,
  },
  maintenance: {
    all: ['maintenance'] as const,
    list: (filters: Record<string, string>) => ['maintenance', 'list', filters || {}] as const,
  }
};

// --- Machines ---

export const useMachines = () => {
  return useQuery({
    queryKey: maintenanceKeys.machines.all,
    queryFn: async () => {
        const machines = await mechanicService.getAllMachines();
        return { machines };
    },
  });
};

export const useMachine = (id: number | string) => {
  return useQuery({
    queryKey: maintenanceKeys.machines.detail(id),
    queryFn: async () => {
        const machine = await mechanicService.getMachineById(id.toString());
        return { machine };
    },
    enabled: !!id,
  });
};

export const useMachineMaintenanceHistory = (id: number | string) => {
    return useQuery({
        queryKey: maintenanceKeys.machines.history(id),
        queryFn: async () => {
            const logs = await mechanicService.getMachineMaintenanceHistory(id.toString());
            return { logs };
        },
        enabled: !!id
    });
};

export const useMachineSOSHistory = (id: number | string) => {
    return useQuery({
        queryKey: maintenanceKeys.machines.sos(id),
        queryFn: async () => {
            const alerts = await mechanicService.getAllAlerts({ machineId: id.toString() });
            return { alerts };
        },
        enabled: !!id
    });
}

// --- SOS Alerts ---

export const useSOSAlerts = (filters?: AlertFilters) => {
  return useQuery({
    queryKey: maintenanceKeys.alerts.list(filters ?? {}),
    queryFn: async () => {
        const alerts = await mechanicService.getAllAlerts(filters);
        return { alerts };
    },
     refetchInterval: 15000, 
  });
};

export const useCreateSOSAlert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { machineId: string; priority: AlertPriority; problemDescription: string }) => mechanicService.createAlert(data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: maintenanceKeys.alerts.all }),
                queryClient.invalidateQueries({ queryKey: maintenanceKeys.machines.all })
            ]);
        }
    });
}

export const useAssignAlert = () => {
    const queryClient = useQueryClient();
    const { useCurrentUser } = useAuth();
    const { data: user } = useCurrentUser();

    return useMutation({
        mutationFn: ({ alertId }: { alertId: string }) => {
            if (!user?.id) throw new Error("User not authenticated");
            return mechanicService.assignAlert(alertId, user.id);
        },
        onSuccess: async () => {
             await queryClient.invalidateQueries({ queryKey: maintenanceKeys.alerts.all });
        }
    })
}

export const useUpdateAlertStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ alertId, status }: { alertId: string; status: AlertStatus }) => mechanicService.updateAlert(alertId, { status }),
        onSuccess: async () => {
             await queryClient.invalidateQueries({ queryKey: maintenanceKeys.alerts.all });
        }
    });
}

export const useResolveAlert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ alertId, resolutionNotes }: { alertId: string, resolutionNotes: string, partsUsed?: string, timeSpent?: number }) =>
            mechanicService.resolveAlert(alertId, resolutionNotes), 
        onSuccess: async () => {
             await Promise.all([
                 queryClient.invalidateQueries({ queryKey: maintenanceKeys.alerts.all }),
                 queryClient.invalidateQueries({ queryKey: maintenanceKeys.machines.all })
             ]);
        }
    });
}

// --- Maintenance Logs ---

export const useMaintenanceLogs = (filters?: Record<string, string>) => {
    return useQuery({
        queryKey: maintenanceKeys.maintenance.list(filters ?? {}),
        queryFn: async () => {
            const logs = await mechanicService.getAllMaintenanceLogs(filters);
            return { logs };
        }
    });
};

export const useCreateMaintenanceLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<MaintenanceLog>) => mechanicService.createMaintenanceLog(data),
        onSuccess: async (data) => {
             await queryClient.invalidateQueries({ queryKey: maintenanceKeys.maintenance.all });
             if (data.machine_id) {
                  await queryClient.invalidateQueries({ queryKey: maintenanceKeys.machines.detail(data.machine_id) });
             }
        }
    });
}
