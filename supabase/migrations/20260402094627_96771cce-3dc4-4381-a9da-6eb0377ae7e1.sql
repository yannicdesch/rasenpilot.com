-- Admin Email Report Montag (08:00 CEST = 06:00 UTC)
SELECT cron.schedule(
  'daily-email-reports',
  '0 6 * * 1',
  $$SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/schedule-daily-email-reports',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{}'::jsonb
  );$$
);

-- Wetter-Tipps Montag (07:00 CEST = 05:00 UTC)
SELECT cron.schedule(
  'weekly-weather-tips',
  '0 5 * * 1',
  $$SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/weekly-weather-tips',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{"scheduledRun": true}'::jsonb
  );$$
);