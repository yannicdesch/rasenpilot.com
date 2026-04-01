
-- Fix RLS "always true" on page_views INSERT - keep it functional for tracking but restrict
-- page_views and events INSERT with true is intentional for anonymous tracking, 
-- but let's scope lawn_profiles duplicate policies cleanup

-- Clean up duplicate RLS policies on lawn_profiles
DROP POLICY IF EXISTS "lawn_profiles_insert_optimized" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_insert_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_select_optimized" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_select_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_update_optimized" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_update_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_delete_optimized" ON public.lawn_profiles;
DROP POLICY IF EXISTS "lawn_profiles_delete_policy" ON public.lawn_profiles;
DROP POLICY IF EXISTS "Users can create their own lawn profiles" ON public.lawn_profiles;
DROP POLICY IF EXISTS "Users can update their own lawn profiles" ON public.lawn_profiles;
DROP POLICY IF EXISTS "Users can view their own lawn profiles" ON public.lawn_profiles;
