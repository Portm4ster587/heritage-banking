
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Remove any prior schedule with same name
DO $$
BEGIN
  PERFORM cron.unschedule('auto-complete-zelle');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'auto-complete-zelle',
  '*/30 * * * *',
  $$ SELECT public.auto_complete_pending_zelle(); $$
);
