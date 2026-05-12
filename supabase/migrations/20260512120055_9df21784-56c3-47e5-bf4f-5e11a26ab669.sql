CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  user_id uuid,
  email text NOT NULL,
  percent_off integer NOT NULL DEFAULT 20,
  source text NOT NULL DEFAULT 'trial_reactivation',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_discount_codes_email ON public.discount_codes(email);
CREATE INDEX idx_discount_codes_user_id ON public.discount_codes(user_id);
CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all discount codes"
  ON public.discount_codes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own discount codes"
  ON public.discount_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert discount codes"
  ON public.discount_codes FOR INSERT TO public
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can update discount codes"
  ON public.discount_codes FOR UPDATE TO public
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Track sent reactivation emails to avoid duplicates
CREATE TABLE public.reactivation_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid,
  discount_code_id uuid REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

ALTER TABLE public.reactivation_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reactivation log"
  ON public.reactivation_email_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage reactivation log"
  ON public.reactivation_email_log FOR ALL TO public
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);