CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  sequence_type TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  last_sent TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_email_sequences_user_type ON public.email_sequences(user_id, sequence_type) WHERE user_id IS NOT NULL;
CREATE INDEX idx_email_sequences_email_type ON public.email_sequences(email, sequence_type);
CREATE INDEX idx_email_sequences_active ON public.email_sequences(completed, last_sent) WHERE completed = false;

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all email sequences"
ON public.email_sequences FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert email sequences"
ON public.email_sequences FOR INSERT
TO public
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can update email sequences"
ON public.email_sequences FOR UPDATE
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE OR REPLACE FUNCTION public.set_email_sequences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW
EXECUTE FUNCTION public.set_email_sequences_updated_at();