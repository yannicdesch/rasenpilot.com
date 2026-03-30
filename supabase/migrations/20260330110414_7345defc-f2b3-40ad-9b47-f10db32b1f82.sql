SELECT cron.schedule(
  'send-trial-day4-emails',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url:='https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/send-trial-day4-email',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);