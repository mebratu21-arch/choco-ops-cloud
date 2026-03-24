import { useMutation, useQueryClient } from '@tanstack/react-query';
import { managerService } from '../services/managerService';
import { Task } from '../types';

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Task>) => managerService.createTask(data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['tasks'] }),
                queryClient.invalidateQueries({ queryKey: ['manager', 'stats'] })
            ]);
        }
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & Partial<Task>) => managerService.updateTask(id, data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['tasks'] }),
                queryClient.invalidateQueries({ queryKey: ['manager', 'stats'] })
            ]);
        }
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => managerService.deleteTask(id),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['tasks'] }),
                queryClient.invalidateQueries({ queryKey: ['manager', 'stats'] })
            ]);
        }
    });
};

export const useUpdateTaskStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled' }) => managerService.updateTaskStatus(id, status),
         onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['tasks'] }),
                queryClient.invalidateQueries({ queryKey: ['manager', 'stats'] })
            ]);
        }
    });
};
