
-- Fix 1: Restrict site_settings to admin-only read access
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Admins can read site settings"
ON site_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Restrict blog_generation_jobs to admin-only read access
DROP POLICY IF EXISTS "Blog generation jobs are viewable by everyone" ON blog_generation_jobs;
CREATE POLICY "Admins can view blog generation jobs"
ON blog_generation_jobs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
