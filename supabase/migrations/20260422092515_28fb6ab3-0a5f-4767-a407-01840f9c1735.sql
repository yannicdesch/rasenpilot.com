-- Remove any previous schedule with this name (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'site-health-monitor-2min') THEN
    PERFORM cron.unschedule('site-health-monitor-2min');
  END IF;
END $$;

-- Schedule the health monitor every 2 minutes
SELECT cron.schedule(
  'site-health-monitor-2min',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/site-health-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);