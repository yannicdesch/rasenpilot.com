CREATE TABLE public.session_recordings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session text NOT NULL,
  page_path text NOT NULL,
  interactions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  errors_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_agent text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_recordings_session ON public.session_recordings(user_session);
CREATE INDEX idx_session_recordings_path ON public.session_recordings(page_path);
CREATE INDEX idx_session_recordings_created ON public.session_recordings(created_at DESC);

GRANT INSERT ON public.session_recordings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.session_recordings TO authenticated;
GRANT ALL ON public.session_recordings TO service_role;

ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated visitors may write their session events (debugging signup funnel)
CREATE POLICY "Anyone can insert session recordings"
  ON public.session_recordings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read recordings (sensitive debugging data)
CREATE POLICY "Admins can read session recordings"
  ON public.session_recordings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update session recordings"
  ON public.session_recordings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_session_recordings_updated_at
  BEFORE UPDATE ON public.session_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communication_contact_updated_at();