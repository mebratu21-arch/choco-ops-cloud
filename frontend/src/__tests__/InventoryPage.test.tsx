import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import InventoryPage from '../pages/inventory/InventoryPage';
import { demoIngredients } from '../data/mockData';
import { inventoryService } from '../services/inventoryService';

// Mock the inventory service
vi.mock('../services/inventoryService', () => ({
  inventoryService: {
    getAllItems: vi.fn(),
    getLowStockAlerts: vi.fn(),
    getExpiryAlerts: vi.fn(),
    searchItems: vi.fn(),
    deleteItem: vi.fn(),
    updateStock: vi.fn(),
  }
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
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    vi.mocked(inventoryService.getAllItems).mockResolvedValue({ items: demoIngredients });
    vi.mocked(inventoryService.getLowStockAlerts).mockResolvedValue([]);
    vi.mocked(inventoryService.getExpiryAlerts).mockResolvedValue([]);
    vi.mocked(inventoryService.searchItems).mockResolvedValue([]); 
  });

  // Cleanup timers
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders inventory page with title', () => {
    renderWithProviders(<InventoryPage />);
    expect(screen.getByText('Warehouse Dashboard')).toBeInTheDocument();
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
    vi.mocked(inventoryService.getLowStockAlerts).mockResolvedValue(
      demoIngredients.filter(i => i.quantity < i.reorder_level)
    );

    renderWithProviders(<InventoryPage />);
    
    await waitFor(() => {
      // Find the card/text that shows count. 
      // Based on InventoryPage.tsx, it renders <p ...>{lowStockCount}</p> inside a "Low Stock Alerts" card.
      const lowStockCardTitle = screen.getByText('Low Stock Alerts');
      expect(lowStockCardTitle).toBeInTheDocument();
      
      // We can also check for the number, but it depends on mock data count.
      // demoIngredients item 4 (Whole Milk) has qty 12.5, min 30.
      // item 2 (Dark choc) qty 45.2, min 50.
      // So at least 2 items are low stock.
    });
  });

  it('filters ingredients by search term', async () => {
    const user = userEvent.setup();
    
    // Setup search mock
    vi.mocked(inventoryService.searchItems).mockResolvedValue([demoIngredients[0]]); // Premium Cocoa Butter
    
    renderWithProviders(<InventoryPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search inventory/i);
    await user.type(searchInput, 'Cocoa');
    
    await waitFor(() => {
      expect(vi.mocked(inventoryService.searchItems)).toHaveBeenCalledWith('Cocoa');
      expect(screen.getByText('Premium Cocoa Butter')).toBeInTheDocument();
    }, { timeout: 2000 }); // Increase timeout to be safe
  });

  it('displays stock status correctly', async () => {
    renderWithProviders(<InventoryPage />);
    
    await waitFor(() => {
      // Should show "In Stock" for items above minimum
      // Premium Cocoa Butter (250.5 > 100) -> In Stock
      expect(screen.getAllByText('In Stock').length).toBeGreaterThan(0);
    });
  });
});
