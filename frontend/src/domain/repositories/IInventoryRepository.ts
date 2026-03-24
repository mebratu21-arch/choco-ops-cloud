import { InventoryItem, Pagination } from '../models/InventoryItem';

export interface InventoryParams {
    page?: number;
    limit?: number;
    search?: string;
    low_stock?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

export interface InventoryResponse {
    data: InventoryItem[];
    pagination: Pagination;
}

export interface IInventoryRepository {
    getInventory(params: InventoryParams): Promise<InventoryResponse>;
    updateStock(id: string, quantity: number): Promise<void>;
}
