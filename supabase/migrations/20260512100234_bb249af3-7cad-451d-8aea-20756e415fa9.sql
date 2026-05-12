CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('weekly-agent-performance');
EXCEPTION WHEN others THEN NULL;
END $$;

SELECT cron.schedule(
  'weekly-agent-performance',
  '15 6 * * 1',
  $$
  select net.http_post(
    url:='https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/weekly-agent-performance',
    headers:='{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body:=jsonb_build_object('weeks', 12)
  ) as request_id;
  $$
);