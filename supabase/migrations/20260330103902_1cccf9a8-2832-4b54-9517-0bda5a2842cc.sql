
-- 1. Fix lawn_highscores: Create a public view without email, restrict direct table access
CREATE OR REPLACE VIEW public.lawn_highscores_public AS
SELECT id, user_id, user_name, lawn_score, lawn_image_url, location, grass_type, lawn_size, analysis_date, created_at
FROM public.lawn_highscores;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view highscores" ON public.lawn_highscores;

-- Replace with owner-only SELECT (users can still see their own scores)
CREATE POLICY "Users can view their own highscores" ON public.lawn_highscores
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Grant SELECT on the public view to anon and authenticated
GRANT SELECT ON public.lawn_highscores_public TO anon, authenticated;

-- 2. Fix subscribers: Tighten INSERT and UPDATE policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Only service role should insert/update subscriptions (via stripe-webhook edge function)
CREATE POLICY "Service role can insert subscriptions" ON public.subscribers
FOR INSERT TO public WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Service role can update subscriptions" ON public.subscribers
FOR UPDATE TO public USING ((auth.jwt() ->> 'role') = 'service_role');

-- 3. Fix reminders: Tighten the ALL policy to actually check service_role
DROP POLICY IF EXISTS "Service role can manage reminders" ON public.reminders;

CREATE POLICY "Service role can manage reminders" ON public.reminders
FOR ALL TO public USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- 4. Fix site_settings: Add RLS policies (admin-only write, public read for settings)
CREATE POLICY "Anyone can read site settings" ON public.site_settings
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert site settings" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings" ON public.site_settings
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fix pages: Add RLS policies (public read for published pages, admin write)
CREATE POLICY "Anyone can read pages" ON public.pages
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert pages" ON public.pages
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pages" ON public.pages
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pages" ON public.pages
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
