import api from '../infrastructure/httpClient';
import { ISalesRepository, SalesParams, SalesResponse, SalePayload } from '../../domain/repositories/ISalesRepository';

export const salesRepository: ISalesRepository = {
    getOnlineOrders: async (params: SalesParams): Promise<SalesResponse> => {
        const response = await api.get('/sales/online', { params });
        return response.data;
    },
    recordEmployeeSale: async (payload: SalePayload): Promise<void> => {
        await api.post('/sales/employee', payload);
    }
};
