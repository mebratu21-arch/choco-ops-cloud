import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QCInspectionForm from '../QCInspectionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQC } from '../../../hooks/useQC';
import { useProduction } from '../../../hooks/useProduction';

// Mock hooks
vi.mock('../../../hooks/useQC', () => ({
  useQC: vi.fn(),
}));

vi.mock('../../../hooks/useProduction', () => ({
  useProduction: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('QCInspectionForm Button Functionality', () => {
  const mockMutate = vi.fn();
  const mockOnSuccess = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useQC).mockReturnValue({
      useQCStats: vi.fn(),
      useQCHistory: vi.fn(),
      useQCAnalysis: vi.fn(),
      useCreateQCCheck: () => ({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        error: null,
      }),
    } as any);

    vi.mocked(useProduction).mockReturnValue({
      useBatches: () => ({
        data: {
          batches: [
            { id: 'batch-1', batch_number: 'B100', recipe_name: 'Dark Choc', status: 'ready', target_quantity: 500 },
          ],
        },
        isLoading: false,
      }),
    } as any);
  });

  it('renders all 3-star rating buttons for visual, structural, and sensory', () => {
    render(<QCInspectionForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });
    
    const starButtons = screen.getAllByRole('button').filter(btn => 
       btn.querySelector('svg.text-cyan-500') ?? btn.querySelector('svg.text-cyan-100')
    );
    
    // 3 categories * 3 stars = 9 buttons
    expect(starButtons).toHaveLength(9);
  });

  it('updates visual rating when star button is clicked', async () => {
    render(<QCInspectionForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });
    
    // Find stars for visual integrity (first category)
    const visualStars = screen.getAllByRole('button').slice(0, 3);
    await user.click(visualStars[0]); // Click 1st star
    
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('selects quality verdict when a verdict button is clicked', async () => {
    render(<QCInspectionForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });
    
    const rejectedBtn = screen.getByText(/Rejected/i);
    await user.click(rejectedBtn);
    
    // Check if the button has the active styling (red)
    expect(rejectedBtn).toHaveClass('bg-red-50');
  });

  it('calls mutation with correct data when "Commit Audit to Registry" is clicked', async () => {
    render(<QCInspectionForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });
    
    // Select batch
    await user.selectOptions(screen.getByLabelText(/Production Batch Reference/i), 'batch-1');
    
    // Change a score
    const visualStars = screen.getAllByRole('button').slice(0, 3);
    await user.click(visualStars[2]); // 3/3
    
    // Submit
    const submitBtn = screen.getByText(/Commit Audit to Registry/i);
    await user.click(submitBtn);
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          batchId: 'batch-1',
          appearance_score: 3,
          result: 'approved',
        }),
        expect.any(Object)
    );
  });

  it('displays validation error if no batch is selected', async () => {
    render(<QCInspectionForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() });
    
    const submitBtn = screen.getByText(/Commit Audit to Registry/i);
    await user.click(submitBtn);
    
    // The validation error should appear
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Batch selection is required/i);
  });
});
