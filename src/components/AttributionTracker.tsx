import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * AttributionTracker
 *
 * Invisible component mounted once at the app root. On first render of a
 * browser session it captures UTM parameters + document.referrer and writes
 * a single row to `public.session_attribution` keyed by a session id stored
 * in sessionStorage. Subsequent renders no-op so we keep first-touch
 * attribution and never overwrite it within the same session.
 *
 * This runs in parallel to the existing analytics flow (page_views, events,
 * sessionTracker) — it neither imports nor mutates those code paths.
 */

const SESSION_KEY = 'rp_session_id';
const ATTRIBUTION_FLAG = 'rp_attribution_recorded';

interface AttributionPayload {
  session_id: string;
  user_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_path: string;
}

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      (crypto?.randomUUID?.() as string | undefined) ??
      `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function normalizeReferrer(raw: string): string | null {
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    // Strip internal referrers — they are not real traffic sources
    if (host.endsWith('rasenpilot.com') || host.endsWith('lovable.app')) return null;
    return raw;
  } catch {
    return raw || null;
  }
}

const AttributionTracker = (): null => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(ATTRIBUTION_FLAG) === '1') return;

    const recordAttribution = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const session_id = getOrCreateSessionId();

        const {
          data: { user },
        } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

        const payload: AttributionPayload = {
          session_id,
          user_id: user?.id ?? null,
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          utm_term: params.get('utm_term'),
          utm_content: params.get('utm_content'),
          referrer: normalizeReferrer(document.referrer || ''),
          landing_path: window.location.pathname + window.location.search,
        };

        // Mark as recorded *before* the network call so racing renders don't double-insert.
        sessionStorage.setItem(ATTRIBUTION_FLAG, '1');

        const { error } = await supabase
          .from('session_attribution')
          .insert(payload);

        // Unique constraint on session_id ⇒ duplicate inserts are silently ignored
        if (error && !/(duplicate|unique)/i.test(error.message)) {
          console.warn('[AttributionTracker] insert failed', error.message);
          // Allow a later retry by clearing the flag for non-duplicate errors
          sessionStorage.removeItem(ATTRIBUTION_FLAG);
        }
      } catch (err) {
        console.warn('[AttributionTracker] unexpected error', err);
      }
    };

    void recordAttribution();
  }, []);

  return null;
};

export default AttributionTracker;
