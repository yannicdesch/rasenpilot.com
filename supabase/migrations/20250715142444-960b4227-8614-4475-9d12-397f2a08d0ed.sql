-- Update RLS policies for blog_posts to allow admin management

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;

-- Create new policies for blog posts
CREATE POLICY "Anyone can view published blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  TO public
  USING (status = 'published');

-- Allow admin users to manage blog posts
CREATE POLICY "Admin users can manage blog posts" 
  ON public.blog_posts 
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow authenticated users to view all blog posts (for admin interface)
CREATE POLICY "Authenticated users can view all blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );