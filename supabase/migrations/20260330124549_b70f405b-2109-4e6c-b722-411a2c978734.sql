-- Add zip_code column to lawn_highscores
ALTER TABLE public.lawn_highscores ADD COLUMN IF NOT EXISTS zip_code text;

-- Update existing entries: extract zip code from location field (format "PLZ 69190")
UPDATE public.lawn_highscores 
SET zip_code = regexp_replace(location, '^PLZ\s*', '')
WHERE location LIKE 'PLZ %' AND zip_code IS NULL;

-- Drop and recreate the public view to include zip_code
DROP VIEW IF EXISTS public.lawn_highscores_public;
CREATE VIEW public.lawn_highscores_public
WITH (security_invoker=on) AS
  SELECT id, user_id, user_name, lawn_score, lawn_image_url, 
         location, grass_type, lawn_size, analysis_date, created_at, zip_code
  FROM public.lawn_highscores;

-- Allow public read access to the view
GRANT SELECT ON public.lawn_highscores_public TO anon, authenticated;

-- Update the update_user_highscore function to accept zip_code
CREATE OR REPLACE FUNCTION public.update_user_highscore(
  p_user_id uuid, 
  p_user_name text, 
  p_lawn_score integer, 
  p_lawn_image_url text DEFAULT NULL, 
  p_location text DEFAULT NULL, 
  p_grass_type text DEFAULT NULL, 
  p_lawn_size text DEFAULT NULL,
  p_zip_code text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_score INTEGER;
BEGIN
  SELECT lawn_score INTO existing_score
  FROM public.lawn_highscores
  WHERE user_id = p_user_id
  ORDER BY lawn_score DESC
  LIMIT 1;

  IF existing_score IS NULL OR p_lawn_score > existing_score THEN
    DELETE FROM public.lawn_highscores WHERE user_id = p_user_id;
    INSERT INTO public.lawn_highscores (
      user_id, user_name, lawn_score, lawn_image_url,
      location, grass_type, lawn_size, zip_code
    ) VALUES (
      p_user_id, p_user_name, p_lawn_score, p_lawn_image_url,
      p_location, p_grass_type, p_lawn_size, p_zip_code
    );
  END IF;
END;
$$;