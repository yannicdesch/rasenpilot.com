import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// vi.hoisted ensures these are initialized before vi.mock factories run
const { mockUnsubscribe, mockInvoke, mockGetUser, mockOnAuthStateChange } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn();
  return {
    mockUnsubscribe,
    mockInvoke: vi.fn(),
    mockGetUser: vi.fn(),
    mockOnAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })),
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    functions: {
      invoke: mockInvoke,
    },
  },
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Import after mocks are set up
import { useSubscription } from '../useSubscription';

const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with loading true', () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      mockInvoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSubscription());
      expect(result.current.loading).toBe(true);
    });

    it('starts with subscribed false', () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      mockInvoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSubscription());
      expect(result.current.isSubscribed).toBe(false);
    });
  });

  describe('checkSubscription for unauthenticated user', () => {
    it('sets free tier when no user is logged in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.isPremium).toBe(false);
      expect(result.current.planTier).toBe('free');
    });
  });

  describe('checkSubscription for authenticated user', () => {
    it('sets premium when subscription API returns subscribed premium', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: true,
          subscription_tier: 'premium',
          subscription_end: '2025-12-31',
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isSubscribed).toBe(true);
      expect(result.current.isPremium).toBe(true);
      expect(result.current.isPro).toBe(false);
      expect(result.current.planTier).toBe('premium');
    });

    it('sets pro when subscription API returns subscribed pro', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: true,
          subscription_tier: 'pro',
          subscription_end: '2025-12-31',
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isPremium).toBe(true);
      expect(result.current.isPro).toBe(true);
      expect(result.current.planTier).toBe('pro');
    });

    it('sets free tier when subscription API returns not subscribed', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: false,
          subscription_tier: 'free',
          subscription_end: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isPremium).toBe(false);
      expect(result.current.planTier).toBe('free');
    });

    it('handles "monthly" tier as premium', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: { subscribed: true, subscription_tier: 'monthly', subscription_end: null },
        error: null,
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.planTier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
    });

    it('handles "yearly" tier as premium', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: { subscribed: true, subscription_tier: 'yearly', subscription_end: null },
        error: null,
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.planTier).toBe('premium');
    });
  });

  describe('error handling', () => {
    it('falls back to free tier when the subscription check throws', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.isPremium).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('falls back to free tier when the API returns an error object', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Edge function failed' },
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isPremium).toBe(false);
    });
  });

  describe('auth state change listener', () => {
    it('registers an auth state change listener on mount', () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      renderHook(() => useSubscription());
      expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from auth state changes on unmount', () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const { unmount } = renderHook(() => useSubscription());
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('trial subscription data', () => {
    it('exposes trial fields when subscription API includes them', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockInvoke.mockResolvedValue({
        data: {
          subscribed: true,
          subscription_tier: 'premium',
          subscription_end: '2025-12-31',
          is_trial: true,
          trial_start: '2025-01-01',
          trial_end: '2025-01-15',
        },
        error: null,
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isTrial).toBe(true);
      expect(result.current.trialEnd).toBe('2025-01-15');
      expect(result.current.trialStart).toBe('2025-01-01');
    });
  });
});
