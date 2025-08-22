-- Create a function to claim orphaned analyses when users sign up
CREATE OR REPLACE FUNCTION public.claim_orphaned_analysis(
  p_user_id UUID,
  p_email TEXT,
  p_analysis_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claimed_analyses INTEGER := 0;
  analysis_record RECORD;
  latest_analysis_id UUID;
BEGIN
  -- If specific analysis_id provided, claim that one
  IF p_analysis_id IS NOT NULL THEN
    UPDATE public.analysis_jobs 
    SET user_id = p_user_id, updated_at = now()
    WHERE id = p_analysis_id AND user_id IS NULL;
    
    GET DIAGNOSTICS claimed_analyses = ROW_COUNT;
    
    -- Also claim any related analyses entries (find the most recent orphaned one)
    SELECT id INTO latest_analysis_id
    FROM public.analyses 
    WHERE user_id IS NULL 
    AND created_at >= (
      SELECT created_at FROM public.analysis_jobs 
      WHERE id = p_analysis_id
    )
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF latest_analysis_id IS NOT NULL THEN
      UPDATE public.analyses 
      SET user_id = p_user_id
      WHERE id = latest_analysis_id;
    END IF;
  ELSE
    -- Find recent orphaned analyses that might belong to this email
    UPDATE public.analysis_jobs 
    SET user_id = p_user_id, updated_at = now()
    WHERE user_id IS NULL 
    AND created_at >= now() - INTERVAL '7 days'
    AND id IN (
      SELECT id FROM public.analysis_jobs 
      WHERE user_id IS NULL 
      ORDER BY created_at DESC 
      LIMIT 3
    );
    
    GET DIAGNOSTICS claimed_analyses = ROW_COUNT;
  END IF;

  -- Update user's highscore based on claimed analyses
  FOR analysis_record IN 
    SELECT COALESCE((result->>'score')::INTEGER, 0) as score
    FROM public.analysis_jobs 
    WHERE user_id = p_user_id 
    AND result IS NOT NULL
    ORDER BY (result->>'score')::INTEGER DESC 
    LIMIT 1
  LOOP
    UPDATE public.profiles 
    SET highscore = GREATEST(COALESCE(highscore, 0), analysis_record.score),
        updated_at = now()
    WHERE id = p_user_id;
  END LOOP;

  RETURN jsonb_build_object(
    'claimed_analyses', claimed_analyses,
    'success', true
  );
END;
$$;