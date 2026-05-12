-- 1. Add referral_code + count to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0;

-- 2. Code generator (8 chars, uppercase alphanumeric, no confusing chars)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 3. Backfill missing codes for existing users
DO $$
DECLARE
  r record;
  new_code text;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      new_code := public.generate_referral_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
    END LOOP;
    UPDATE public.profiles SET referral_code = new_code WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Trigger to auto-assign code on insert
CREATE OR REPLACE FUNCTION public.assign_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := public.generate_referral_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_assign_referral_code ON public.profiles;
CREATE TRIGGER profiles_assign_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_referral_code();

-- 5. Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_email text NOT NULL,
  referred_user_id uuid,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','rewarded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE UNIQUE INDEX idx_referrals_referrer_email ON public.referrals(referrer_user_id, lower(referred_email));

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can insert their own referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can update referrals"
ON public.referrals FOR UPDATE
TO public
USING ((auth.jwt() ->> 'role') = 'service_role');

-- 6. Public lookup function: code -> referrer_user_id (no PII exposed)
CREATE OR REPLACE FUNCTION public.lookup_referrer_by_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE referral_code = upper(_code) LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_referrer_by_code(text) TO anon, authenticated;