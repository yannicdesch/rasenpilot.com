CREATE TABLE public.care_calendars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  analysis_job_id uuid REFERENCES public.analysis_jobs(id),
  calendar_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.care_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own care calendars"
  ON public.care_calendars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own care calendars"
  ON public.care_calendars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own care calendars"
  ON public.care_calendars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own care calendars"
  ON public.care_calendars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);