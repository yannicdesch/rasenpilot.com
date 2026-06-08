/**
 * Session recording tracker for the signup/auth funnel.
 *
 * Captures form interactions, button clicks, validation errors and JS errors
 * on /auth (and related) pages and ships them to the `track-session` edge
 * function in batched flushes. Designed to help diagnose why direct visitors
 * are not converting into signups.
 */

import { supabase } from '@/integrations/supabase/client';

export type InteractionType =
  | 'click'
  | 'input'
  | 'focus'
  | 'blur'
  | 'submit'
  | 'validation_error'
  | 'navigation'
  | 'custom';

export interface InteractionEvent {
  type: InteractionType;
  target?: string;
  field?: string;
  value?: string;
  message?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface TrackedErrorEvent {
  type: 'js_error' | 'unhandled_rejection' | 'auth_error' | 'network_error';
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: number;
}

const SESSION_KEY = 'rp_session_id';
const FLUSH_INTERVAL_MS = 5000;
const TRACKED_PATH_PREFIXES = ['/auth', '/signup', '/login'];

let interactions: InteractionEvent[] = [];
let errors: TrackedErrorEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      (crypto?.randomUUID?.() as string | undefined) ??
      `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function isTrackedPath(path: string): boolean {
  return TRACKED_PATH_PREFIXES.some((p) => path.startsWith(p));
}

function describeTarget(el: EventTarget | null): string | undefined {
  if (!(el instanceof Element)) return undefined;
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const name = el.getAttribute('name');
  const type = el.getAttribute('type');
  const text =
    el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement
      ? el.innerText?.trim().slice(0, 40)
      : undefined;
  return [tag + id, name && `[name=${name}]`, type && `[type=${type}]`, text && `"${text}"`]
    .filter(Boolean)
    .join(' ');
}

async function flush(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (interactions.length === 0 && errors.length === 0) return;

  const path = window.location.pathname;
  if (!isTrackedPath(path)) {
    interactions = [];
    errors = [];
    return;
  }

  const payload = {
    user_session: getSessionId(),
    page_path: path,
    interactions: [...interactions],
    errors: [...errors],
    user_agent: navigator.userAgent,
  };

  interactions = [];
  errors = [];

  try {
    await supabase.functions.invoke('track-session', { body: payload });
  } catch (err) {
    // Re-queue silently on failure (capped); don't recurse via trackError to avoid loops
    console.warn('[sessionTracker] flush failed', err);
  }
}

export function trackInteraction(event: Omit<InteractionEvent, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  if (!isTrackedPath(window.location.pathname)) return;
  interactions.push({ ...event, timestamp: Date.now() });
  if (interactions.length >= 50) void flush();
}

export function trackError(event: Omit<TrackedErrorEvent, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  if (!isTrackedPath(window.location.pathname)) return;
  errors.push({ ...event, timestamp: Date.now() });
}

export function trackValidationError(field: string, message: string): void {
  trackInteraction({ type: 'validation_error', field, message });
}

export function trackClick(target: string, meta?: Record<string, unknown>): void {
  trackInteraction({ type: 'click', target, meta });
}

export function trackSubmit(formName: string, meta?: Record<string, unknown>): void {
  trackInteraction({ type: 'submit', target: formName, meta });
}

export function initSessionTracker(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Global JS errors
  window.addEventListener('error', (e) => {
    trackError({
      type: 'js_error',
      message: e.message,
      source: e.filename,
      line: e.lineno,
      column: e.colno,
      stack: e.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    trackError({
      type: 'unhandled_rejection',
      message: typeof reason === 'string' ? reason : reason?.message ?? 'Unhandled rejection',
      stack: reason?.stack,
    });
  });

  // Delegated capture of clicks and focus/blur on tracked pages
  document.addEventListener(
    'click',
    (e) => {
      if (!isTrackedPath(window.location.pathname)) return;
      const desc = describeTarget(e.target);
      if (desc) trackInteraction({ type: 'click', target: desc });
    },
    true,
  );

  document.addEventListener(
    'focusin',
    (e) => {
      if (!isTrackedPath(window.location.pathname)) return;
      const el = e.target as Element | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        trackInteraction({ type: 'focus', field: el.getAttribute('name') || el.id });
      }
    },
    true,
  );

  document.addEventListener(
    'focusout',
    (e) => {
      if (!isTrackedPath(window.location.pathname)) return;
      const el = e.target as HTMLInputElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        const isSensitive = el.type === 'password';
        trackInteraction({
          type: 'blur',
          field: el.getAttribute('name') || el.id,
          meta: { hasValue: !!el.value, length: el.value?.length ?? 0, sensitive: isSensitive },
        });
      }
    },
    true,
  );

  // Flush periodically and on page hide
  flushTimer = setInterval(() => void flush(), FLUSH_INTERVAL_MS);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
  window.addEventListener('pagehide', () => void flush());
}

export function stopSessionTracker(): void {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = null;
  initialized = false;
}
