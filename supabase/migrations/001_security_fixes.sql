
-- Create security definer function to check admin roles (avoiding infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  -- Get user role from profiles table
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user'; -- Default to user role on any error
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- Enable RLS on all admin tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for site_settings (admin only)
CREATE POLICY "Only admins can view site settings" ON public.site_settings
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update site settings" ON public.site_settings
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete site settings" ON public.site_settings
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for blog_posts (admin only)
CREATE POLICY "Only admins can view all blog posts" ON public.blog_posts
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can create blog posts" ON public.blog_posts
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update blog posts" ON public.blog_posts
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete blog posts" ON public.blog_posts
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for pages (admin only)
CREATE POLICY "Only admins can view pages" ON public.pages
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can create pages" ON public.pages
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update pages" ON public.pages
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete pages" ON public.pages
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for subscribers (admin only)
CREATE POLICY "Only admins can view subscribers" ON public.subscribers
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can create subscribers" ON public.subscribers
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update subscribers" ON public.subscribers
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete subscribers" ON public.subscribers
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Tighten analytics policies (admin read, authenticated insert with user_id validation)
CREATE POLICY "Only admins can view page views" ON public.page_views
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can insert their own page views" ON public.page_views
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can view events" ON public.events
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure lawn_profiles has proper RLS (users can only see their own)
DROP POLICY IF EXISTS "Users can view own lawn profiles" ON public.lawn_profiles;
CREATE POLICY "Users can view own lawn profiles" ON public.lawn_profiles
  FOR SELECT USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');

CREATE POLICY "Users can insert own lawn profiles" ON public.lawn_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lawn profiles" ON public.lawn_profiles
  FOR UPDATE USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');

CREATE POLICY "Users can delete own lawn profiles" ON public.lawn_profiles
  FOR DELETE USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');

-- Ensure profiles table has proper RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.get_current_user_role() = 'admin');

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.get_current_user_role() = 'admin');
