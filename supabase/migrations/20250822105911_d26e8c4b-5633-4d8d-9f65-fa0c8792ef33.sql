-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS highscore integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS consent_marketing boolean DEFAULT true;

-- Create score_history table
CREATE TABLE IF NOT EXISTS public.score_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  source text NOT NULL DEFAULT 'analysis',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  send_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped')),
  kind text NOT NULL CHECK (kind IN ('D3', 'D7', 'D14', 'D30', 'D60')),
  message_key text NOT NULL,
  payload_url text NOT NULL,
  last_score integer NOT NULL CHECK (last_score >= 0 AND last_score <= 100),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create enhanced analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  summary_short text,
  density_note text,
  sunlight_note text,
  moisture_note text,
  soil_note text,
  step_1 text,
  step_2 text,
  step_3 text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for score_history
CREATE POLICY "Users can view their own score history" ON public.score_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own score history" ON public.score_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for reminders
CREATE POLICY "Users can view their own reminders" ON public.reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage reminders" ON public.reminders
  FOR ALL USING (true);

-- RLS policies for analyses
CREATE POLICY "Users can view their own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create reminders after analysis
CREATE OR REPLACE FUNCTION public.create_analysis_reminders(
  p_user_id uuid,
  p_score integer,
  p_analysis_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url text := 'https://www.rasenpilot.com/lawn-analysis?ref=reminder';
  reminder_data record;
BEGIN
  -- Insert 5 reminders with different timing
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

-- Function to handle completed analysis
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
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analysis_id uuid;
  current_highscore integer;
  is_new_highscore boolean := false;
  user_consent boolean;
BEGIN
  -- Insert new analysis
  INSERT INTO public.analyses (
    user_id, score, summary_short, density_note, sunlight_note,
    moisture_note, soil_note, step_1, step_2, step_3, image_url
  ) VALUES (
    p_user_id, p_score, p_summary_short, p_density_note, p_sunlight_note,
    p_moisture_note, p_soil_note, p_step_1, p_step_2, p_step_3, p_image_url
  ) RETURNING id INTO analysis_id;

  -- Insert score history
  INSERT INTO public.score_history (user_id, score, source)
  VALUES (p_user_id, p_score, 'analysis');

  -- Check and update highscore
  SELECT highscore, consent_marketing INTO current_highscore, user_consent
  FROM public.profiles WHERE id = p_user_id;

  IF p_score > current_highscore THEN
    UPDATE public.profiles 
    SET highscore = p_score, updated_at = now()
    WHERE id = p_user_id;
    is_new_highscore := true;
  END IF;

  -- Create reminders if user consented
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