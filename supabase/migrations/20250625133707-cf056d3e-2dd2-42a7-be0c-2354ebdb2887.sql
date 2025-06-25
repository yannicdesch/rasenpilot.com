
-- Create RPC function to create analysis job
CREATE OR REPLACE FUNCTION public.create_analysis_job(
  p_user_id UUID,
  p_image_path TEXT,
  p_grass_type TEXT DEFAULT NULL,
  p_lawn_goal TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_id UUID;
BEGIN
  INSERT INTO public.analysis_jobs (
    user_id, image_path, grass_type, lawn_goal, metadata, status
  ) VALUES (
    p_user_id, p_image_path, p_grass_type, p_lawn_goal, p_metadata, 'pending'
  ) RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$;

-- Create RPC function to get analysis job
CREATE OR REPLACE FUNCTION public.get_analysis_job(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_data JSONB;
BEGIN
  SELECT to_jsonb(analysis_jobs.*) INTO job_data
  FROM public.analysis_jobs
  WHERE id = p_job_id
  AND (auth.uid() = user_id OR user_id IS NULL);
  
  RETURN job_data;
END;
$$;

-- Create RPC function to update analysis job
CREATE OR REPLACE FUNCTION public.update_analysis_job(
  p_job_id UUID,
  p_status TEXT DEFAULT NULL,
  p_result JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.analysis_jobs
  SET 
    status = COALESCE(p_status, status),
    result = COALESCE(p_result, result),
    error_message = COALESCE(p_error_message, error_message),
    updated_at = now(),
    completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN now() ELSE completed_at END
  WHERE id = p_job_id;
  
  RETURN FOUND;
END;
$$;
