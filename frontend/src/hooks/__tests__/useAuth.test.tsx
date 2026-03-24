import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authService } from '../../services/authService';

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  it('handles login success', async () => {
    (authService.login as any).mockResolvedValue({ user: { id: '1', name: 'Test' }, token: 'abc' });
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.login.mutateAsync({ email: 'test@test.com', password: 'password' });
    });

    expect(result.current.login.isSuccess).toBe(true);
  });
});
