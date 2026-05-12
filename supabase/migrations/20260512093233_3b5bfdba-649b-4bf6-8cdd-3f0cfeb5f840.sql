CREATE TABLE public.analysis_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid,
  user_id uuid,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit analysis feedback"
ON public.analysis_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own feedback"
ON public.analysis_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analysis feedback"
ON public.analysis_feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_analysis_feedback_analysis_id ON public.analysis_feedback(analysis_id);
CREATE INDEX idx_analysis_feedback_created_at ON public.analysis_feedback(created_at DESC);