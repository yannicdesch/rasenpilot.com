-- Add timestamp column for when the actual result was measured
ALTER TABLE public.optimization_queue
  ADD COLUMN IF NOT EXISTS result_measured_at timestamp with time zone;

-- Backfill: if a result already exists, use approved_at or created_at as best-effort timestamp
UPDATE public.optimization_queue
SET result_measured_at = COALESCE(approved_at, created_at)
WHERE result_metric IS NOT NULL
  AND length(trim(result_metric)) > 0
  AND result_measured_at IS NULL;

-- Trigger function: auto-stamp result_measured_at and bump status to 'done'
CREATE OR REPLACE FUNCTION public.handle_optimization_result_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_has_result boolean := (OLD.result_metric IS NOT NULL AND length(trim(OLD.result_metric)) > 0);
  new_has_result boolean := (NEW.result_metric IS NOT NULL AND length(trim(NEW.result_metric)) > 0);
BEGIN
  -- Result newly filled (or changed) -> stamp timestamp + auto-promote to 'done'
  IF new_has_result AND (
    NOT old_has_result
    OR NEW.result_metric IS DISTINCT FROM OLD.result_metric
  ) THEN
    NEW.result_measured_at := now();
    IF NEW.status = 'approved' THEN
      NEW.status := 'done';
    END IF;
  END IF;

  -- Result cleared -> clear timestamp and revert 'done' back to 'approved'
  IF old_has_result AND NOT new_has_result THEN
    NEW.result_measured_at := NULL;
    IF NEW.status = 'done' THEN
      NEW.status := 'approved';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS optimization_queue_result_change ON public.optimization_queue;
CREATE TRIGGER optimization_queue_result_change
  BEFORE UPDATE ON public.optimization_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_optimization_result_change();