
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
  existing_sub RECORD;
  trial_created BOOLEAN := false;
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

  -- Update highscore from claimed analyses
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

  -- Auto-activate 7-day trial if analyses were claimed and no active subscription exists
  IF claimed_analyses > 0 THEN
    SELECT id, subscribed, is_trial INTO existing_sub
    FROM public.subscribers
    WHERE user_id = p_user_id OR email = p_email
    LIMIT 1;

    IF existing_sub IS NULL THEN
      -- No subscriber record: create new trial
      INSERT INTO public.subscribers (
        email, user_id, subscribed, subscription_tier, 
        is_trial, trial_start, trial_end
      ) VALUES (
        p_email, p_user_id, true, 'monthly',
        true, now(), now() + INTERVAL '7 days'
      );
      trial_created := true;
    ELSIF existing_sub.subscribed = false AND existing_sub.is_trial IS NOT TRUE THEN
      -- Inactive subscriber without trial: activate trial
      UPDATE public.subscribers
      SET subscribed = true,
          subscription_tier = 'monthly',
          is_trial = true,
          trial_start = now(),
          trial_end = now() + INTERVAL '7 days',
          user_id = p_user_id,
          updated_at = now()
      WHERE id = existing_sub.id;
      trial_created := true;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'claimed_analyses', claimed_analyses,
    'trial_created', trial_created,
    'success', true
  );
END;
$function$;
