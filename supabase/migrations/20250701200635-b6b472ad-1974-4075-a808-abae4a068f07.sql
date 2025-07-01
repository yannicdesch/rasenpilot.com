
-- Ensure the lawn-images bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lawn-images', 'lawn-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create comprehensive storage policies for lawn-images bucket
DROP POLICY IF EXISTS "Allow public read access to lawn images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload lawn images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own lawn images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own lawn images" ON storage.objects;

-- Policy for public read access
CREATE POLICY "Allow public read access to lawn images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lawn-images');

-- Policy for authenticated uploads (including anonymous uploads for free users)
CREATE POLICY "Allow authenticated users to upload lawn images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lawn-images' AND
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Policy for users to update their own images
CREATE POLICY "Allow users to update their own lawn images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lawn-images' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'anon')
);

-- Policy for users to delete their own images
CREATE POLICY "Allow users to delete their own lawn images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lawn-images' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'anon')
);
