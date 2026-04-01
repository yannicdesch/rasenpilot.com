
DROP VIEW IF EXISTS public.lawn_highscores_public;
CREATE VIEW public.lawn_highscores_public
  WITH (security_invoker = true)
AS
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
