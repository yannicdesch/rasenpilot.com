import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ---- Mocks (must come before imports of the modules under test) ----

const mockSupabaseSelect = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: mockSupabaseSelect,
        }),
      }),
    }),
  },
}));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseSubscription = vi.fn();
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => mockUseSubscription(),
}));

// ---- Subject under test ----
import { useFreeTierLimit } from '../useFreeTierLimit';

const ANONYMOUS_KEY = 'rasenpilot_anonymous_analysis_used';
const FREE_LIMIT = 1;

describe('useFreeTierLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('premium user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
      mockUseSubscription.mockReturnValue({ isPremium: true });
    });

    it('does not reach the limit', async () => {
      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasReachedLimit).toBe(false);
      expect(result.current.canAnalyze).toBe(true);
    });

    it('skips the database query entirely', async () => {
      renderHook(() => useFreeTierLimit());

      await waitFor(() => {});

      expect(mockSupabaseSelect).not.toHaveBeenCalled();
    });
  });

  describe('authenticated free user', () => {
    const user = { id: 'user-456' };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user });
      mockUseSubscription.mockReturnValue({ isPremium: false });
    });

    it('allows analysis when the user has 0 completed jobs', async () => {
      mockSupabaseSelect.mockResolvedValue({ count: 0, error: null });

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasReachedLimit).toBe(false);
      expect(result.current.canAnalyze).toBe(true);
      expect(result.current.remainingAnalyses).toBe(FREE_LIMIT);
    });

    it('blocks analysis when the user has reached the free limit', async () => {
      mockSupabaseSelect.mockResolvedValue({ count: FREE_LIMIT, error: null });

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasReachedLimit).toBe(true);
      expect(result.current.canAnalyze).toBe(false);
      expect(result.current.remainingAnalyses).toBe(0);
    });

    it('exposes the correct analyses used count', async () => {
      mockSupabaseSelect.mockResolvedValue({ count: 1, error: null });

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.analyzesUsed).toBe(1);
    });

    it('does not go below 0 remaining analyses', async () => {
      mockSupabaseSelect.mockResolvedValue({ count: 5, error: null });

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.remainingAnalyses).toBe(0);
    });

    it('exposes freeLimit as 1', async () => {
      mockSupabaseSelect.mockResolvedValue({ count: 0, error: null });

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.freeLimit).toBe(FREE_LIMIT);
    });

    it('handles a database error gracefully without crashing', async () => {
      mockSupabaseSelect.mockResolvedValue({ count: null, error: new Error('DB error') });

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should not throw and loading should eventually resolve
      expect(result.current.loading).toBe(false);
    });
  });

  describe('anonymous user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null });
      mockUseSubscription.mockReturnValue({ isPremium: false });
    });

    it('allows analysis when localStorage flag is not set', async () => {
      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasReachedLimit).toBe(false);
      expect(result.current.canAnalyze).toBe(true);
    });

    it('blocks analysis when localStorage flag is set', async () => {
      localStorage.setItem(ANONYMOUS_KEY, 'true');

      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasReachedLimit).toBe(true);
      expect(result.current.canAnalyze).toBe(false);
      expect(result.current.analyzesUsed).toBe(1);
    });

    it('does not query the database', async () => {
      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockSupabaseSelect).not.toHaveBeenCalled();
    });

    it('markAnonymousAnalysisUsed sets the localStorage flag and blocks further analyses', async () => {
      const { result } = renderHook(() => useFreeTierLimit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasReachedLimit).toBe(false);

      result.current.markAnonymousAnalysisUsed();

      await waitFor(() => expect(result.current.hasReachedLimit).toBe(true));

      expect(localStorage.getItem(ANONYMOUS_KEY)).toBe('true');
      expect(result.current.canAnalyze).toBe(false);
    });
  });
});
