import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesRepository } from '../../data/repositories/SalesRepositoryImpl';
import { SalesParams, SalePayload } from '../../domain/repositories/ISalesRepository';

export const useSales = (params: SalesParams) => {
    const queryClient = useQueryClient();

    const ordersQuery = useQuery({
        queryKey: ['online-orders', params],
        queryFn: () => salesRepository.getOnlineOrders(params),
    });

    const recordSaleMutation = useMutation({
        mutationFn: (payload: SalePayload) => salesRepository.recordEmployeeSale(payload),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
    });

    return {
        orders: ordersQuery.data?.data || [],
        pagination: ordersQuery.data?.pagination,
        isLoadingOrders: ordersQuery.isLoading,
        ordersError: ordersQuery.error,
        recordSale: recordSaleMutation.mutateAsync,
        isRecording: recordSaleMutation.isPending,
    };
};
