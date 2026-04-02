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

-- Tag 4 Trial Email (09:00 CEST = 07:00 UTC)
SELECT cron.schedule(
  'send-trial-day4-emails',
  '0 7 * * *',
  $$SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/send-trial-day4-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{}'::jsonb
  );$$
);

-- Admin Email Report (08:00 CEST = 06:00 UTC, Montag)
SELECT cron.schedule(
  'daily-email-reports',
  '0 6 * * 1',
  $$SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/schedule-daily-email-reports',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{}'::jsonb
  );$$
);

-- Blog-Generierung (09:00 CEST = 07:00 UTC)
SELECT cron.schedule(
  'daily-blog-generation',
  '0 7 * * *',
  $$INSERT INTO public.blog_generation_jobs (status) VALUES ('pending');
  SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/generate-automatic-blog-posts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
  );$$
);

-- Blog-Generierung Nachmittag (15:00 CEST = 13:00 UTC)
SELECT cron.schedule(
  'afternoon-blog-generation',
  '0 13 * * *',
  $$INSERT INTO public.blog_generation_jobs (status) VALUES ('pending');
  SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/generate-automatic-blog-posts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
  );$$
);

-- Score überholt Check (alle 30 Min)
SELECT cron.schedule(
  'check-score-overtaken',
  '*/30 * * * *',
  $$SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/notify-score-overtaken',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{}'::jsonb
  );$$
);

-- Tag 6 Urgency Email (10:00 CEST = 08:00 UTC)
SELECT cron.schedule(
  'trial-day6-email',
  '0 8 * * *',
  $$SELECT net.http_post(
    url := 'https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/send-trial-day4-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ"}'::jsonb,
    body := '{"day": 6}'::jsonb
  );$$
);