
-- First, let's check if your profile exists and what role you have
SELECT id, email, role, full_name, is_active 
FROM public.profiles 
WHERE email = (
  SELECT email 
  FROM auth.users 
  WHERE id = auth.uid()
);

-- If no profile exists, create one with admin role for the current user
INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  auth.uid() as id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  'admin' as role,
  true as is_active,
  now() as created_at,
  now() as updated_at
FROM auth.users 
WHERE id = auth.uid()
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();

-- Verify the admin role was set
SELECT id, email, role, full_name, is_active 
FROM public.profiles 
WHERE id = auth.uid();
