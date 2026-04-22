/**
 * Persists the user's post-auth intent (where to return + flags) across the
 * full registration round-trip — including email confirmation, which opens
 * a fresh browser tab/session and loses URL query params on the way back.
 *
 * Stored in localStorage so it survives page reloads and new tabs on the
 * same origin. Has a TTL to avoid stale redirects.
 */

const STORAGE_KEY = 'rasenpilot_auth_redirect_intent';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export interface AuthRedirectIntent {
  /** Path to navigate to after successful auth, e.g. "/analysis-result/abc" */
  redirectPath: string;
  /** Anonymous analysis job id to claim post-registration */
  jobId?: string;
  /** Plan param to forward (e.g. "premium") */
  plan?: string;
  /** Whether this flow originated from the analysis result page */
  fromAnalysis: boolean;
  /** Stored at (epoch ms) */
  storedAt: number;
}

export const saveAuthIntent = (intent: Omit<AuthRedirectIntent, 'storedAt'>) => {
  try {
    const payload: AuthRedirectIntent = { ...intent, storedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable — silently ignore
  }
};

export const getAuthIntent = (): AuthRedirectIntent | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthRedirectIntent;
    if (!parsed?.storedAt || Date.now() - parsed.storedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearAuthIntent = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Build the final post-confirmation path with `?registered=1` and `?plan=`
 * applied consistently. Pure function so it can be reused everywhere.
 */
export const buildPostAuthPath = (intent: {
  redirectPath: string;
  fromAnalysis: boolean;
  plan?: string;
}): string => {
  let path = intent.redirectPath || '/';
  if (intent.fromAnalysis && !/[?&]registered=1\b/.test(path)) {
    const sep = path.includes('?') ? '&' : '?';
    path = `${path}${sep}registered=1`;
  }
  if (intent.plan && !/[?&]plan=/.test(path)) {
    const sep = path.includes('?') ? '&' : '?';
    path = `${path}${sep}plan=${intent.plan}`;
  }
  return path;
};

/** Extract jobId from a path like /analysis-result/{jobId} */
export const extractJobIdFromPath = (path: string): string | undefined => {
  const match = path.match(/\/analysis-result\/([^/?#]+)/);
  return match?.[1];
};
