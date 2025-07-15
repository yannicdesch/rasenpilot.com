-- Add email column to lawn_highscores table
ALTER TABLE public.lawn_highscores 
ADD COLUMN email TEXT;

-- Update the function to include email parameter
CREATE OR REPLACE FUNCTION public.update_user_highscore(
  p_user_id UUID,
  p_user_name TEXT,
  p_lawn_score INTEGER,
  p_lawn_image_url TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_grass_type TEXT DEFAULT NULL,
  p_lawn_size TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_score INTEGER;
BEGIN
  -- Get the user's current best score
  SELECT lawn_score INTO existing_score
  FROM public.lawn_highscores
  WHERE user_id = p_user_id
  ORDER BY lawn_score DESC
  LIMIT 1;

  -- If no existing score or new score is better, insert/update
  IF existing_score IS NULL OR p_lawn_score > existing_score THEN
    -- Delete old scores for this user (keep only the best)
    DELETE FROM public.lawn_highscores WHERE user_id = p_user_id;
    
    -- Insert the new best score with email
    INSERT INTO public.lawn_highscores (
      user_id, user_name, lawn_score, lawn_image_url, 
      location, grass_type, lawn_size, email
    ) VALUES (
      p_user_id, p_user_name, p_lawn_score, p_lawn_image_url,
      p_location, p_grass_type, p_lawn_size, p_email
    );
  END IF;
END;
$$;