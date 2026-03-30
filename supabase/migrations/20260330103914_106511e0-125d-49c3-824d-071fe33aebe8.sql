
-- Fix the security definer view issue
DROP VIEW IF EXISTS public.lawn_highscores_public;
CREATE VIEW public.lawn_highscores_public WITH (security_invoker = true) AS
SELECT id, user_id, user_name, lawn_score, lawn_image_url, location, grass_type, lawn_size, analysis_date, created_at
FROM public.lawn_highscores;

GRANT SELECT ON public.lawn_highscores_public TO anon, authenticated;
