-- Enable real-time for lawn_highscores table
ALTER TABLE public.lawn_highscores REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lawn_highscores;