CREATE OR REPLACE FUNCTION public.get_today_analysis_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM public.analyses
  WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Europe/Berlin')
$$;