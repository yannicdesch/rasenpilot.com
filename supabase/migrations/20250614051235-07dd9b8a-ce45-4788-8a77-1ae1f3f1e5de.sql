
-- Add email preferences to user profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"reminders": true, "frequency": "daily", "time": "08:00"}'::jsonb;

-- Create a table to track sent reminders (to avoid duplicates)
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  task_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT true,
  UNIQUE(user_id, task_date, task_type)
);

-- Enable RLS on reminder_logs
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- Policy for reminder_logs (users can only see their own)
CREATE POLICY "Users can view their own reminder logs" ON public.reminder_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily reminder job to run at 8 AM every day
SELECT cron.schedule(
  'daily-care-reminders',
  '0 8 * * *', -- 8 AM every day
  $$
  SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/send-care-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{"scheduledRun": true}'::jsonb
  );
  $$
);
