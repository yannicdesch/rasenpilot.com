
-- Tighten analytics policies (admin read, authenticated insert with user_id validation)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins can view page views" ON public.page_views;
DROP POLICY IF EXISTS "Users can insert their own page views" ON public.page_views;
DROP POLICY IF EXISTS "Only admins can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;

-- Create restrictive analytics policies
CREATE POLICY "Only admins can view page views" ON public.page_views
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can view events" ON public.events
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add rate limiting function for analytics
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit(user_identifier text)
RETURNS boolean AS $$
DECLARE
  request_count integer;
BEGIN
  -- Count requests in the last minute
  SELECT COUNT(*) INTO request_count
  FROM public.events
  WHERE label = user_identifier
    AND timestamp > NOW() - INTERVAL '1 minute';
  
  -- Allow max 60 analytics events per minute per user
  RETURN request_count < 60;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.check_analytics_rate_limit(text) TO authenticated;
