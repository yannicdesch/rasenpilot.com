ALTER TABLE public.optimization_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view optimization queue"
ON public.optimization_queue FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update optimization queue"
ON public.optimization_queue FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert optimization queue"
ON public.optimization_queue FOR INSERT
TO public
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

ALTER TABLE public.optimization_queue
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;