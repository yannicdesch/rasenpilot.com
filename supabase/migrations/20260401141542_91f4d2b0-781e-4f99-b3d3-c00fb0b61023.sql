
-- 1. Fix blog_posts admin policies to use has_role() instead of profiles.role
DROP POLICY IF EXISTS "Admin users can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON public.blog_posts;

CREATE POLICY "Admin users can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all blog posts"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Recreate lawn_highscores_public view without sensitive columns
DROP VIEW IF EXISTS public.lawn_highscores_public;
CREATE VIEW public.lawn_highscores_public AS
  SELECT 
    id,
    user_name,
    lawn_score,
    grass_type,
    lawn_size,
    lawn_image_url,
    analysis_date,
    created_at
  FROM public.lawn_highscores;

-- 3. Remove lawn_highscores from realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'lawn_highscores') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.lawn_highscores;
  END IF;
END $$;

-- 4. Restrict analytics SELECT to admins only
DROP POLICY IF EXISTS "Allow select access to page_views" ON public.page_views;
DROP POLICY IF EXISTS "Allow select access to events" ON public.events;

CREATE POLICY "Admins can read page_views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
