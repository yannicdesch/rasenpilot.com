CREATE TABLE public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  user_name text,
  feedback_text text not null,
  email_subject text,
  sequence_day int,
  sentiment text,
  topics text[],
  raw_email jsonb,
  created_at timestamptz default now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view user feedback"
ON public.user_feedback FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert user feedback"
ON public.user_feedback FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user feedback"
ON public.user_feedback FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user feedback"
ON public.user_feedback FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));