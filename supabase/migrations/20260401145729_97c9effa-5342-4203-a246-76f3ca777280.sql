
CREATE TABLE public.orphaned_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id text,
  stripe_customer_id text,
  customer_email text,
  price_type text,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.orphaned_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage orphaned subscriptions"
ON public.orphaned_subscriptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
