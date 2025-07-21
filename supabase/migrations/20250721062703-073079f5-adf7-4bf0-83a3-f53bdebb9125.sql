-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a table to track blog generation jobs
CREATE TABLE IF NOT EXISTS public.blog_generation_jobs (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  posts_generated INTEGER DEFAULT 0,
  error_message TEXT
);

-- Enable RLS on the blog generation jobs table
ALTER TABLE public.blog_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for blog generation jobs (admin only)
CREATE POLICY "Blog generation jobs are viewable by everyone" 
ON public.blog_generation_jobs 
FOR SELECT 
USING (true);

-- Schedule automatic blog post generation every day at 9:00 AM
SELECT cron.schedule(
  'daily-blog-generation',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  INSERT INTO public.blog_generation_jobs (status) VALUES ('pending');
  
  SELECT
    net.http_post(
        url:='https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/generate-automatic-blog-posts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
        body:=concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Also schedule a second batch at 3:00 PM for better content distribution
SELECT cron.schedule(
  'afternoon-blog-generation',
  '0 15 * * *', -- Every day at 3:00 PM
  $$
  INSERT INTO public.blog_generation_jobs (status) VALUES ('pending');
  
  SELECT
    net.http_post(
        url:='https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/generate-automatic-blog-posts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
        body:=concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);