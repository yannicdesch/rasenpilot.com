-- Fix SUPA_function_search_path_mutable by adding search_path to all functions
-- This prevents search_path injection attacks

-- Fix increment_sms_count
CREATE OR REPLACE FUNCTION public.increment_sms_count(user_id_param uuid, phone_number_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.communication_contacts (user_id, phone_number, total_sms_count, last_sms_date)
  VALUES (user_id_param, phone_number_param, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_sms_count = communication_contacts.total_sms_count + 1,
    last_sms_date = now(),
    phone_number = COALESCE(communication_contacts.phone_number, phone_number_param);
END;
$$;

-- Fix increment_whatsapp_count
CREATE OR REPLACE FUNCTION public.increment_whatsapp_count(user_id_param uuid, phone_number_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.communication_contacts (user_id, phone_number, total_whatsapp_count, last_whatsapp_date)
  VALUES (user_id_param, phone_number_param, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_whatsapp_count = communication_contacts.total_whatsapp_count + 1,
    last_whatsapp_date = now(),
    phone_number = COALESCE(communication_contacts.phone_number, phone_number_param);
END;
$$;

-- Fix update_communication_contact_updated_at
CREATE OR REPLACE FUNCTION public.update_communication_contact_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix create_analysis_job
CREATE OR REPLACE FUNCTION public.create_analysis_job(
  p_user_id uuid,
  p_image_path text,
  p_grass_type text DEFAULT NULL,
  p_lawn_goal text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix get_analysis_job
CREATE OR REPLACE FUNCTION public.get_analysis_job(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix update_analysis_job
CREATE OR REPLACE FUNCTION public.update_analysis_job(
  p_job_id uuid,
  p_status text DEFAULT NULL,
  p_result jsonb DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix update_user_highscore (both overloaded versions)
CREATE OR REPLACE FUNCTION public.update_user_highscore(
  p_user_id uuid,
  p_user_name text,
  p_lawn_score integer,
  p_lawn_image_url text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_grass_type text DEFAULT NULL,
  p_lawn_size text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_score INTEGER;
BEGIN
  SELECT lawn_score INTO existing_score
  FROM public.lawn_highscores
  WHERE user_id = p_user_id
  ORDER BY lawn_score DESC
  LIMIT 1;

  IF existing_score IS NULL OR p_lawn_score > existing_score THEN
    DELETE FROM public.lawn_highscores WHERE user_id = p_user_id;
    
    INSERT INTO public.lawn_highscores (
      user_id, user_name, lawn_score, lawn_image_url, 
      location, grass_type, lawn_size, email
    ) VALUES (
      p_user_id, p_user_name, p_lawn_score, p_lawn_image_url,
      p_location, p_grass_type, p_lawn_size, p_email
    );
  END IF;
END;
$$;

-- Fix get_current_user_id
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Fix cleanup_old_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.page_views 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  DELETE FROM public.events 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  DELETE FROM public.reminder_logs 
  WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Fix create_analysis_reminders
CREATE OR REPLACE FUNCTION public.create_analysis_reminders(
  p_user_id uuid,
  p_score integer,
  p_analysis_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_url text := 'https://www.rasenpilot.com/lawn-analysis?ref=reminder';
  reminder_data record;
BEGIN
  FOR reminder_data IN 
    SELECT * FROM (VALUES
      ('D3', 'motivation_3d', 3),
      ('D7', 'tip_7d', 7),
      ('D14', 'progress_14d', 14),
      ('D30', 'season_30d', 30),
      ('D60', 'compare_region_60d', 60)
    ) AS t(kind, message_key, days_offset)
  LOOP
    INSERT INTO public.reminders (
      user_id, 
      send_at, 
      kind, 
      message_key, 
      payload_url,
      last_score
    ) VALUES (
      p_user_id,
      now() + (reminder_data.days_offset || ' days')::interval,
      reminder_data.kind,
      reminder_data.message_key,
      base_url || '&kind=' || reminder_data.kind || '&aid=' || p_analysis_id,
      p_score
    );
  END LOOP;
END;
$$;

-- Fix handle_analysis_completion
CREATE OR REPLACE FUNCTION public.handle_analysis_completion(
  p_user_id uuid,
  p_score integer,
  p_summary_short text,
  p_density_note text,
  p_sunlight_note text,
  p_moisture_note text,
  p_soil_note text,
  p_step_1 text,
  p_step_2 text,
  p_step_3 text,
  p_image_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  analysis_id uuid;
  current_highscore integer;
  is_new_highscore boolean := false;
  user_consent boolean;
BEGIN
  INSERT INTO public.analyses (
    user_id, score, summary_short, density_note, sunlight_note,
    moisture_note, soil_note, step_1, step_2, step_3, image_url
  ) VALUES (
    p_user_id, p_score, p_summary_short, p_density_note, p_sunlight_note,
    p_moisture_note, p_soil_note, p_step_1, p_step_2, p_step_3, p_image_url
  ) RETURNING id INTO analysis_id;

  INSERT INTO public.score_history (user_id, score, source)
  VALUES (p_user_id, p_score, 'analysis');

  SELECT highscore, consent_marketing INTO current_highscore, user_consent
  FROM public.profiles WHERE id = p_user_id;

  IF p_score > current_highscore THEN
    UPDATE public.profiles 
    SET highscore = p_score, updated_at = now()
    WHERE id = p_user_id;
    is_new_highscore := true;
  END IF;

  IF user_consent THEN
    PERFORM public.create_analysis_reminders(p_user_id, p_score, analysis_id);
  END IF;

  RETURN jsonb_build_object(
    'analysis_id', analysis_id,
    'is_new_highscore', is_new_highscore,
    'current_highscore', GREATEST(current_highscore, p_score)
  );
END;
$$;

-- Fix claim_orphaned_analysis
CREATE OR REPLACE FUNCTION public.claim_orphaned_analysis(
  p_user_id uuid,
  p_email text,
  p_analysis_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_analyses INTEGER := 0;
  analysis_record RECORD;
  latest_analysis_id UUID;
BEGIN
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