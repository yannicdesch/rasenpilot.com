
-- Optimize RLS policies for better performance

-- Drop existing potentially problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create more efficient RLS policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_lawn_profiles_user_id ON public.lawn_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.events(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON public.page_views(timestamp);

-- Optimize lawn_profiles RLS policies
DROP POLICY IF EXISTS "Users can view own lawn profile" ON public.lawn_profiles;
DROP POLICY IF EXISTS "Users can update own lawn profile" ON public.lawn_profiles;
DROP POLICY IF EXISTS "Users can insert own lawn profile" ON public.lawn_profiles;

-- Enable RLS on lawn_profiles if not already enabled
ALTER TABLE public.lawn_profiles ENABLE ROW LEVEL SECURITY;

-- Create efficient RLS policies for lawn_profiles
CREATE POLICY "lawn_profiles_select_policy" ON public.lawn_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lawn_profiles_insert_policy" ON public.lawn_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lawn_profiles_update_policy" ON public.lawn_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "lawn_profiles_delete_policy" ON public.lawn_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Analyze tables to update statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.lawn_profiles;
ANALYZE public.events;
ANALYZE public.page_views;
