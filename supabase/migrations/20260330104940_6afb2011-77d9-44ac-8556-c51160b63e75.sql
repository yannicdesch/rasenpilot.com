
-- Fix update_user_highscore functions to remove email parameter
CREATE OR REPLACE FUNCTION public.update_user_highscore(
  p_user_id uuid,
  p_user_name text,
  p_lawn_score integer,
  p_lawn_image_url text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_grass_type text DEFAULT NULL,
  p_lawn_size text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
      location, grass_type, lawn_size
    ) VALUES (
      p_user_id, p_user_name, p_lawn_score, p_lawn_image_url,
      p_location, p_grass_type, p_lawn_size
    );
  END IF;
END;
$$;

-- Drop the overloaded version with email parameter
DROP FUNCTION IF EXISTS public.update_user_highscore(uuid, text, integer, text, text, text, text, text);
