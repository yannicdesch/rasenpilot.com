
-- Clear Supabase warnings and optimize configuration (Fixed version)

-- 1. Fix the missing relation error for _unused_name
DROP TABLE IF EXISTS public._unused_name CASCADE;

-- 2. Ensure all required storage buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('lawn-images', 'lawn-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Create comprehensive storage policies to prevent access warnings
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar images" ON storage.objects;

DROP POLICY IF EXISTS "Lawn images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload lawn images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own lawn images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own lawn images" ON storage.objects;

-- Create storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatar images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for lawn-images bucket
CREATE POLICY "Lawn images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'lawn-images');

CREATE POLICY "Users can upload lawn images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'lawn-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own lawn images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'lawn-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own lawn images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'lawn-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Ensure all tables have proper RLS policies to prevent policy violations
ALTER TABLE public.lawn_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for lawn_profiles if they don't exist
DROP POLICY IF EXISTS "lawn_profiles_select_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_insert_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_update_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_delete_policy" ON public.lawn_profiles;

CREATE POLICY "lawn_profiles_select_policy" ON public.lawn_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lawn_profiles_insert_policy" ON public.lawn_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lawn_profiles_update_policy" ON public.lawn_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "lawn_profiles_delete_policy" ON public.lawn_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for reminder_logs
DROP POLICY IF EXISTS "reminder_logs_select_policy" ON public.reminder_logs;
DROP POLICY IF EXISTS "reminder_logs_insert_policy" ON public.reminder_logs;

CREATE POLICY "reminder_logs_select_policy" ON public.reminder_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reminder_logs_insert_policy" ON public.reminder_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create function to handle database maintenance and reduce connection overhead
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up old page views (keep last 90 days)
  DELETE FROM public.page_views 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Clean up old events (keep last 90 days)
  DELETE FROM public.events 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Clean up old reminder logs (keep last 30 days)
  DELETE FROM public.reminder_logs 
  WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 6. Create indexes to improve query performance (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_page_views_path_timestamp ON public.page_views(path, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_category_timestamp ON public.events(category, timestamp);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_task_date ON public.reminder_logs(user_id, task_date);

-- 7. Update table statistics to improve query planning
ANALYZE public.profiles;
ANALYZE public.lawn_profiles;
ANALYZE public.page_views;
ANALYZE public.events;
ANALYZE public.reminder_logs;
ANALYZE public.site_settings;
ANALYZE public.blog_posts;
ANALYZE public.pages;
ANALYZE public.subscribers;

-- 8. Grant necessary permissions to prevent access denied warnings
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, service_role;
