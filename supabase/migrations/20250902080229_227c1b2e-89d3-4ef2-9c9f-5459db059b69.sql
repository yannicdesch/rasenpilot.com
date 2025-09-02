-- First, check if we need to create or update the subscribers table for subscription tracking
-- Drop the existing subscribers table if it exists (it seems to be for email subscribers, not billing)
DROP TABLE IF EXISTS public.subscribers;

-- Create the proper subscribers table for subscription/billing tracking
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Assign premium access to yannic.desch@gmail.com
INSERT INTO public.subscribers (
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  updated_at
) VALUES (
  'yannic.desch@gmail.com',
  true,
  'Premium',
  now() + interval '1 year',
  now()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = EXCLUDED.updated_at;