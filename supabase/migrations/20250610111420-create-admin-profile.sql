
-- Create a profile for the existing admin user
-- First, let's safely insert the admin profile if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  '842ab30a-8c0d-41d7-8006-601ab9f8f2dc'::uuid as id,
  'Yannic.Desch@gmail.com' as email,
  'Yannic Desch' as full_name,
  'admin' as role,
  true as is_active,
  now() as created_at,
  now() as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'Yannic.Desch@gmail.com'
);

-- Verify the profile was created
SELECT id, email, role, full_name, is_active, created_at
FROM public.profiles 
WHERE email = 'Yannic.Desch@gmail.com';
