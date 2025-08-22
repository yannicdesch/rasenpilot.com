-- Create RLS policies for subscribers table to allow public signups

-- Allow anyone to insert new subscribers (public signup form)
CREATE POLICY "Anyone can subscribe" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view subscriber records (for admin purposes)
CREATE POLICY "Allow read access to subscribers" 
ON public.subscribers 
FOR SELECT 
USING (true);

-- Allow updates to subscriber records (for managing preferences)
CREATE POLICY "Allow updates to subscribers" 
ON public.subscribers 
FOR UPDATE 
USING (true);