
-- Add a highscore table to track the best lawn analyses
CREATE TABLE public.lawn_highscores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_name TEXT NOT NULL,
  lawn_score INTEGER NOT NULL CHECK (lawn_score >= 0 AND lawn_score <= 100),
  lawn_image_url TEXT,
  location TEXT,
  grass_type TEXT,
  lawn_size TEXT,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lawn_highscores ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to view highscores (public leaderboard)
CREATE POLICY "Anyone can view highscores" 
  ON public.lawn_highscores 
  FOR SELECT 
  TO public
  USING (true);

-- Policy to allow authenticated users to insert their own scores
CREATE POLICY "Users can insert their own scores" 
  ON public.lawn_highscores 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own scores
CREATE POLICY "Users can update their own scores" 
  ON public.lawn_highscores 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create an index for better performance on score queries
CREATE INDEX idx_lawn_highscores_score ON public.lawn_highscores (lawn_score DESC);
CREATE INDEX idx_lawn_highscores_date ON public.lawn_highscores (analysis_date DESC);

-- Function to update or insert a user's best score
CREATE OR REPLACE FUNCTION public.update_user_highscore(
  p_user_id UUID,
  p_user_name TEXT,
  p_lawn_score INTEGER,
  p_lawn_image_url TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_grass_type TEXT DEFAULT NULL,
  p_lawn_size TEXT DEFAULT NULL
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
    
    -- Insert the new best score
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
