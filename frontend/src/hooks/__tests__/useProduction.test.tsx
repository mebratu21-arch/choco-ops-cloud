import { renderHook, waitFor } from '@testing-library/react';
import { useProduction } from '../useProduction';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { productionService } from '../../services/productionService';

vi.mock('../../services/productionService', () => ({
  productionService: {
    getAllRecipes: vi.fn(),
    getAllBatches: vi.fn(),
    createBatch: vi.fn(),
    createRecipe: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProduction', () => {
  it('fetches recipes correctly', async () => {
    const mockRecipes = [{ id: '1', name: 'Dark Chocolate' }];
    (productionService.getAllRecipes as any).mockResolvedValue(mockRecipes);

    const { result } = renderHook(() => useProduction(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.useRecipes().isSuccess).toBe(true));
    expect(result.current.useRecipes().data).toEqual(mockRecipes);
  });
});
