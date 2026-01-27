import api from '../infrastructure/httpClient';
import { IInventoryRepository, InventoryParams, InventoryResponse } from '../../domain/repositories/IInventoryRepository';

export const inventoryRepository: IInventoryRepository = {
    getInventory: async (params: InventoryParams): Promise<InventoryResponse> => {
        const response = await api.get('/inventory', { params });
        return response.data;
    },
    updateStock: async (id: string, quantity: number): Promise<void> => {
        await api.patch(`/inventory/${id}/stock`, { current_stock: quantity });
    }
};
