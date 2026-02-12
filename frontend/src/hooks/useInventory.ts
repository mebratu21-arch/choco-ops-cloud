import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { InventoryFilters, InventoryItem, StockUpdateData } from '../types';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  alerts: () => [...inventoryKeys.all, 'alerts'] as const,
  movements: (id: string) => [...inventoryKeys.detail(id), 'movements'] as const,
};

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Queries
  const useInventoryItems = (filters?: InventoryFilters) => {
    return useQuery({
      queryKey: inventoryKeys.list(filters ?? {}),
      queryFn: () => inventoryService.getAllItems(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const useInventoryItem = (id: string) => {
    return useQuery({
      queryKey: inventoryKeys.detail(id),
      queryFn: () => inventoryService.getItemById(id),
      enabled: !!id,
    });
  };

  const useSearchInventory = (query: string) => {
    return useQuery({
      queryKey: [...inventoryKeys.lists(), 'search', query],
      queryFn: () => inventoryService.searchItems(query),
      enabled: !!query,
      staleTime: 1000 * 60, // 1 minute
    });
  };

  const useLowStockAlerts = () => {
    return useQuery({
      queryKey: [...inventoryKeys.alerts(), 'low-stock'],
      queryFn: () => inventoryService.getLowStockAlerts(),
    });
  };

  const useExpiryAlerts = () => {
    return useQuery({
      queryKey: [...inventoryKeys.alerts(), 'expiry'],
      queryFn: () => inventoryService.getExpiryAlerts(),
    });
  };

  const useInventoryMovements = (itemId: string) => {
    return useQuery({
      queryKey: inventoryKeys.movements(itemId),
      queryFn: () => inventoryService.getMovementHistory(itemId),
      enabled: !!itemId,
    });
  };

  // Mutations
  const useCreateItem = () => {
    return useMutation({
      mutationFn: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => inventoryService.createItem(data),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.alerts() });
      },
    });
  };

  const useUpdateItem = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => inventoryService.updateItem(id, data),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(data.id) });
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      },
    });
  };

  const useDeleteItem = () => {
    return useMutation({
      mutationFn: (id: string) => inventoryService.deleteItem(id),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      },
    });
  };

  const useUpdateStock = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: StockUpdateData }) => inventoryService.updateStock(id, data),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(data.id) });
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.alerts() });
        // Also invalidate movements
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.movements(data.id) });
      },
    });
  };

  return {
    useInventoryItems,
    useInventoryItem,
    useSearchInventory,
    useLowStockAlerts,
    useExpiryAlerts,
    useInventoryMovements,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useUpdateStock,
  };
};
