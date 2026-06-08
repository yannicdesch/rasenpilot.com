CREATE TABLE public.session_attribution (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

CREATE INDEX idx_session_attribution_user ON public.session_attribution(user_id);
CREATE INDEX idx_session_attribution_source ON public.session_attribution(utm_source);
CREATE INDEX idx_session_attribution_campaign ON public.session_attribution(utm_campaign);
CREATE INDEX idx_session_attribution_created ON public.session_attribution(created_at DESC);

GRANT INSERT ON public.session_attribution TO anon;
GRANT SELECT, INSERT ON public.session_attribution TO authenticated;
GRANT ALL ON public.session_attribution TO service_role;

ALTER TABLE public.session_attribution ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + auth) may record their own first-touch attribution
CREATE POLICY "Anyone can insert session attribution"
  ON public.session_attribution
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can read their own attribution row
CREATE POLICY "Users can read their own attribution"
  ON public.session_attribution
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read everything for reporting
CREATE POLICY "Admins can read all attribution"
  ON public.session_attribution
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));