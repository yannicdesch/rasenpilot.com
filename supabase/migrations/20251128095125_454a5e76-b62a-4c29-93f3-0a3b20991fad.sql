-- Add trial tracking columns to subscribers table
ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS trial_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false;

-- Add index for faster trial queries
CREATE INDEX IF NOT EXISTS idx_subscribers_trial_end ON public.subscribers(trial_end) WHERE is_trial = true;

-- Add comment for documentation
COMMENT ON COLUMN public.subscribers.trial_start IS 'When the trial period started';
COMMENT ON COLUMN public.subscribers.trial_end IS 'When the trial period ends';
COMMENT ON COLUMN public.subscribers.is_trial IS 'Whether the user is currently in a trial period';