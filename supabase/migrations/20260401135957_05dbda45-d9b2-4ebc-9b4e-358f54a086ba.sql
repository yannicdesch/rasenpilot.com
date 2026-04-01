
-- Re-add clean lawn_profiles policies (no duplicates)
CREATE POLICY "Users can view own lawn profiles"
  ON public.lawn_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lawn profiles"
  ON public.lawn_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lawn profiles"
  ON public.lawn_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lawn profiles"
  ON public.lawn_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
