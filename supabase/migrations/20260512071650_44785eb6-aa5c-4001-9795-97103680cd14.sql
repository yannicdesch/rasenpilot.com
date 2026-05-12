CREATE TABLE public.agent_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL,
  report_type text NOT NULL,
  content text NOT NULL,
  metrics jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view agent reports"
ON public.agent_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert agent reports"
ON public.agent_reports
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agent reports"
ON public.agent_reports
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));