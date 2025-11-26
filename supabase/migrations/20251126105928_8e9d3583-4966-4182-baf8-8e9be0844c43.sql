-- Create table to store Stripe product and price mappings
CREATE TABLE IF NOT EXISTS public.stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL UNIQUE,
  product_name text NOT NULL,
  price_type text NOT NULL, -- 'monthly' or 'yearly'
  stripe_product_id text UNIQUE,
  stripe_price_id text UNIQUE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  interval text NOT NULL, -- 'month' or 'year'
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Anyone can view active stripe products"
  ON public.stripe_products
  FOR SELECT
  USING (active = true);

-- Allow service role to manage products
CREATE POLICY "Service role can manage stripe products"
  ON public.stripe_products
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster lookups
CREATE INDEX idx_stripe_products_price_type ON public.stripe_products(price_type);
CREATE INDEX idx_stripe_products_active ON public.stripe_products(active);