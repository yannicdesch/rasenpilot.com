
-- 1. Fix subscribers SELECT policy: remove email fallback, use only user_id
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT TO public
  USING (user_id = auth.uid());

-- 2. Fix storage: remove anon access from DELETE and UPDATE policies on lawn-images
DROP POLICY IF EXISTS "Allow users to delete their own lawn images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own lawn images" ON storage.objects;

-- 3. Remove the overly permissive public upload policy (no auth check at all)
DROP POLICY IF EXISTS "Allow public uploads to lawn-images" ON storage.objects;

-- 4. Fix the upload policy that includes anon: keep anon for product functionality but remove from delete/update
DROP POLICY IF EXISTS "Allow authenticated users to upload lawn images" ON storage.objects;

-- Recreate clean upload policy allowing both authenticated and anon (required for anonymous analysis flow)
CREATE POLICY "Allow authenticated users to upload lawn images" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'lawn-images' AND (auth.role() = 'authenticated' OR auth.role() = 'anon'));
