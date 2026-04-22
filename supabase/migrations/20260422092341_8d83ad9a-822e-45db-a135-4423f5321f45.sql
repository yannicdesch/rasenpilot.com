-- Enable extensions needed for scheduled HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Single-row state table for site health monitoring
CREATE TABLE IF NOT EXISTS public.site_health_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_status TEXT NOT NULL DEFAULT 'healthy',
  last_message TEXT,
  stuck_since TIMESTAMPTZ,
  last_alert_sent_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  consecutive_stuck_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT site_health_state_singleton CHECK (id = 1)
);

INSERT INTO public.site_health_state (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_health_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read site health state"
ON public.site_health_state
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
