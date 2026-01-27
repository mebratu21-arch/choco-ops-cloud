import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryRepository } from '../../data/repositories/InventoryRepositoryImpl';
import { InventoryParams } from '../../domain/repositories/IInventoryRepository';

export const useInventory = (params: InventoryParams) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['inventory', params],
        queryFn: () => inventoryRepository.getInventory(params),
        placeholderData: (previousData) => previousData,
    });

    const updateStockMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) => 
            inventoryRepository.updateStock(id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });

    return {
        items: query.data?.data || [],
        pagination: query.data?.pagination,
        isLoading: query.isLoading,
        error: query.error,
        updateStock: updateStockMutation.mutateAsync,
        isUpdating: updateStockMutation.isPending,
    };
};
