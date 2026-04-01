
-- Remove sensitive tables from realtime (no IF EXISTS in ALTER PUBLICATION)
DO $$
BEGIN
  -- Only drop if table is in the publication
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'subscribers') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.subscribers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'analyses') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.analyses;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'analysis_jobs') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.analysis_jobs;
  END IF;
END $$;
