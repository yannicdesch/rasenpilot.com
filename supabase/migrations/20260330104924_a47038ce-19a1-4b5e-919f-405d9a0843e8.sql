
-- 1. Fix analysis_jobs: Remove null user_id from SELECT policy
DROP POLICY IF EXISTS "Users can view their own analysis jobs" ON public.analysis_jobs;
CREATE POLICY "Users can view their own analysis jobs" ON public.analysis_jobs
FOR SELECT TO public USING (auth.uid() = user_id);

-- Also fix INSERT policy
DROP POLICY IF EXISTS "Users can insert their own analysis jobs" ON public.analysis_jobs;
CREATE POLICY "Users can insert their own analysis jobs" ON public.analysis_jobs
FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- 2. Fix analysis_jobs: Restrict UPDATE to service_role only
DROP POLICY IF EXISTS "Service role can update any analysis job" ON public.analysis_jobs;
CREATE POLICY "Service role can update any analysis job" ON public.analysis_jobs
FOR UPDATE TO public USING ((auth.jwt() ->> 'role') = 'service_role');

-- 3. Fix lawn-images storage: Remove overly permissive public delete policy
DROP POLICY IF EXISTS "Allow public deletes from lawn-images" ON storage.objects;

-- 4. Fix lawn_highscores realtime email leak: Drop email column from the table
-- (email already exists in profiles table, no need to duplicate it in highscores)
ALTER TABLE public.lawn_highscores DROP COLUMN IF EXISTS email;
