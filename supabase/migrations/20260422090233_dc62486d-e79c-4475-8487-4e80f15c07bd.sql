-- Update claim_orphaned_analysis to also create an anonymized highscore entry
-- so confirmed users automatically appear on the neighborhood leaderboard.
CREATE OR REPLACE FUNCTION public.claim_orphaned_analysis(p_user_id uuid, p_email text, p_analysis_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  claimed_analyses INTEGER := 0;
  analysis_record RECORD;
  latest_analysis_id UUID;
  best_score INTEGER;
  best_image TEXT;
  user_first_name TEXT;
  anon_name TEXT;
  user_zip TEXT;
  user_grass TEXT;
  user_size TEXT;
  highscore_created BOOLEAN := false;
BEGIN
  -- Claim specific analysis or recent ones
  IF p_analysis_id IS NOT NULL THEN
    UPDATE public.analysis_jobs 
    SET user_id = p_user_id, updated_at = now()
    WHERE id = p_analysis_id AND user_id IS NULL;
    
    GET DIAGNOSTICS claimed_analyses = ROW_COUNT;
    
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

  -- Find the best score from claimed analyses
  SELECT 
    COALESCE((result->>'score')::INTEGER, 0) as score,
    result->>'image_url' as image_url
  INTO best_score, best_image
  FROM public.analysis_jobs 
  WHERE user_id = p_user_id 
  AND result IS NOT NULL
  ORDER BY (result->>'score')::INTEGER DESC 
  LIMIT 1;

  -- Update profile highscore
  IF best_score IS NOT NULL THEN
    UPDATE public.profiles 
    SET highscore = GREATEST(COALESCE(highscore, 0), best_score),
        updated_at = now()
    WHERE id = p_user_id;
  END IF;

  -- Create / update an anonymized leaderboard entry
  IF best_score IS NOT NULL AND best_score > 0 THEN
    SELECT first_name INTO user_first_name FROM public.profiles WHERE id = p_user_id;

    -- Build anonymized display name (e.g. "M***")
    IF user_first_name IS NOT NULL AND length(user_first_name) > 0 THEN
      anon_name := upper(substr(user_first_name, 1, 1)) || '***';
    ELSE
      anon_name := upper(substr(p_email, 1, 1)) || '***';
    END IF;

    -- Try to enrich with lawn profile data
    SELECT zip_code, grass_type, lawn_size 
    INTO user_zip, user_grass, user_size
    FROM public.lawn_profiles 
    WHERE user_id = p_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;

    PERFORM public.update_user_highscore(
      p_user_id,
      anon_name,
      best_score,
      best_image,
      NULL,
      user_grass,
      user_size,
      user_zip
    );
    highscore_created := true;
  END IF;

  RETURN jsonb_build_object(
    'claimed_analyses', claimed_analyses,
    'highscore_created', highscore_created,
    'best_score', best_score,
    'success', true
  );
END;
$function$;