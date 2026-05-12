CREATE TABLE IF NOT EXISTS public.agent_weekly_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  total_proposed integer NOT NULL DEFAULT 0,
  total_approved integer NOT NULL DEFAULT 0,
  total_rejected integer NOT NULL DEFAULT 0,
  total_done integer NOT NULL DEFAULT 0,
  total_pending integer NOT NULL DEFAULT 0,
  avg_impact_score numeric(4,2),
  avg_impact_score_approved numeric(4,2),
  expected_met_count integer NOT NULL DEFAULT 0,
  expected_met_rate numeric(5,2),
  per_agent jsonb NOT NULL DEFAULT '[]'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_weekly_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view agent_weekly_stats"
  ON public.agent_weekly_stats FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert agent_weekly_stats"
  ON public.agent_weekly_stats FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Service role can update agent_weekly_stats"
  ON public.agent_weekly_stats FOR UPDATE
  USING ((auth.jwt() ->> 'role') = 'service_role');

CREATE INDEX IF NOT EXISTS idx_agent_weekly_stats_week ON public.agent_weekly_stats(week_start DESC);