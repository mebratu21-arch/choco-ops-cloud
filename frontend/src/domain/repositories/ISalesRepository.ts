import { Order, Pagination } from '../models/InventoryItem';

export interface SalesParams {
    page?: number;
    limit?: number;
}

export interface SalesResponse {
    data: Order[];
    pagination?: Pagination;
}

export interface SalePayload {
    employeeId: string;
    items: {
        inventoryId: string;
        quantity: number;
    }[];
    discountPercentage: number;
}

export interface ISalesRepository {
    getOnlineOrders(params: SalesParams): Promise<SalesResponse>;
    recordEmployeeSale(payload: SalePayload): Promise<void>;
}
