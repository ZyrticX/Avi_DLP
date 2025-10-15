-- ========================================
-- Cron Job למחיקה אוטומטית של קבצים
-- ========================================

-- Enable pg_cron extension (אם עוד לא הופעל)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup job to run every hour
-- This will call the cleanup-expired-files edge function
SELECT cron.schedule(
  'cleanup-expired-files-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://jdyekwizsviuyklsrsky.supabase.co/functions/v1/cleanup-expired-files',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeWVrd2l6c3ZpdXlrbHNyc2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTE3NDksImV4cCI6MjA3NDc4Nzc0OX0.MdcH0dYSv_nK0hzzjQQrpNHAL0aQbmNNCJPtuP7tkvQ'
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-files-hourly';