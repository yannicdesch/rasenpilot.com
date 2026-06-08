CREATE TABLE public.lawn_analysis_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL UNIQUE,
  user_id UUID,
  current_step INTEGER NOT NULL DEFAULT 1,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lawn_analysis_drafts TO anon, authenticated;
GRANT ALL ON public.lawn_analysis_drafts TO service_role;

ALTER TABLE public.lawn_analysis_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read drafts by job_id"
  ON public.lawn_analysis_drafts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert drafts"
  ON public.lawn_analysis_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update drafts"
  ON public.lawn_analysis_drafts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete drafts"
  ON public.lawn_analysis_drafts FOR DELETE
  USING (true);

CREATE INDEX idx_lawn_analysis_drafts_job_id ON public.lawn_analysis_drafts(job_id);
CREATE INDEX idx_lawn_analysis_drafts_user_id ON public.lawn_analysis_drafts(user_id);

CREATE TRIGGER trg_lawn_analysis_drafts_updated_at
  BEFORE UPDATE ON public.lawn_analysis_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_communication_contact_updated_at();