import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import InventoryPage from '../pages/inventory/InventoryPage';
import { demoIngredients } from '../data/mockData';

// Mock the inventory service
vi.mock('../services/inventoryService', () => ({
  useIngredients: () => ({
    data: demoIngredients,
    isLoading: false,
    error: null,
  }),
  useLowStock: () => ({
    data: demoIngredients.filter(i => i.current_stock < i.minimum_stock),
    isLoading: false,
  }),
  useExpiringSoon: () => ({
    data: [],
    isLoading: false,
  }),
  useUpdateStock: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('InventoryPage', () => {
  it('renders inventory page with title', () => {
    renderWithProviders(<InventoryPage />);
    expect(screen.getByText('Inventory Management')).toBeInTheDocument();
  });

  it('displays all ingredients in the table', async () => {
    renderWithProviders(<InventoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Premium Cocoa Butter')).toBeInTheDocument();
      expect(screen.getByText('Dark Chocolate (70% Cocoa)')).toBeInTheDocument();
      expect(screen.getByText('Organic Cane Sugar')).toBeInTheDocument();
    });
  });

  it('shows low stock badge count', async () => {
    renderWithProviders(<InventoryPage />);
    
    await waitFor(() => {
      const lowStockButton = screen.getByText(/Low Stock/i);
      expect(lowStockButton).toBeInTheDocument();
    });
  });

  it('filters ingredients by search term', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InventoryPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    await user.type(searchInput, 'Cocoa');
    
    await waitFor(() => {
      expect(screen.getByText('Premium Cocoa Butter')).toBeInTheDocument();
      expect(screen.queryByText('Organic Cane Sugar')).not.toBeInTheDocument();
    });
  });

  it('displays stock status correctly', async () => {
    renderWithProviders(<InventoryPage />);
    
    await waitFor(() => {
      // Should show "In Stock" for items above minimum
      expect(screen.getAllByText('In Stock').length).toBeGreaterThan(0);
    });
  });
});
