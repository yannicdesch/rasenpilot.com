-- 1) Extend profiles with payment status
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS payment_issue_since timestamptz;

-- 2) Retry schedule table
CREATE TABLE public.payment_retry_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  email text NOT NULL,
  stripe_customer_id text,
  stripe_invoice_id text NOT NULL,
  attempt_number integer NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | sent | resolved | cancelled
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stripe_invoice_id, attempt_number)
);

CREATE INDEX idx_payment_retry_due
  ON public.payment_retry_schedule(scheduled_at)
  WHERE status = 'pending';
CREATE INDEX idx_payment_retry_invoice
  ON public.payment_retry_schedule(stripe_invoice_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_retry_schedule TO authenticated;
GRANT ALL ON public.payment_retry_schedule TO service_role;

ALTER TABLE public.payment_retry_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own retry rows"
  ON public.payment_retry_schedule
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all retry rows"
  ON public.payment_retry_schedule
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage retry rows"
  ON public.payment_retry_schedule
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payment_retry_schedule_updated_at
  BEFORE UPDATE ON public.payment_retry_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communication_contact_updated_at();