// Discount calculation
export function calculateDiscount(subtotal: number, discountCode?: string): number {
  if (!discountCode) return 0;
 
  const discounts: Record<string, number> = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'SUMMER25': 0.25,
    'BULK30': 0.30,
  };
 
  const rate = discounts[discountCode.toUpperCase()] || 0;
  return subtotal * rate;
}

// Tax calculation (example: 8% tax)
export function calculateTax(amount: number, taxRate: number = 0.08): number {
  return amount * taxRate;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Generate batch number
export function generateBatchNumber(prefix: string = 'BATCH'): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

// Calculate yield percentage
export function calculateYield(planned: number, actual: number): number {
  if (planned === 0) return 0;
  return Math.round((actual / planned) * 100 * 100) / 100;
}

// Paginate results
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}
