-- Unschedule duplicates by name (removes all with that name), then recreate
SELECT cron.unschedule('daily-email-reports');
SELECT cron.unschedule('weekly-weather-tips');