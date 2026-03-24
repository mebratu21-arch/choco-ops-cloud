import { useMutation, useQueryClient } from '@tanstack/react-query';
import { managerService } from '../services/managerService';
import { Announcement } from '../types';

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Announcement>) => managerService.createAnnouncement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};

export const useUpdateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & Partial<Announcement>) => managerService.updateAnnouncement(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => managerService.deleteAnnouncement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};

export const useToggleAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => managerService.updateAnnouncement(id, { is_active: isActive }),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};
