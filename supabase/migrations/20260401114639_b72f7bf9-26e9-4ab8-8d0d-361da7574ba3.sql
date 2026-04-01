
-- Remove lawn_highscores from Realtime publication (no IF EXISTS for ALTER PUBLICATION)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.lawn_highscores;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Table not in publication or already removed';
END;
$$;
