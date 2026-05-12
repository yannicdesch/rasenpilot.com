ALTER TABLE public.optimization_queue
  ADD COLUMN IF NOT EXISTS allow_repeat boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS repeat_justification text;