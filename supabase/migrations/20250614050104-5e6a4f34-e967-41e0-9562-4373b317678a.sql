
-- Check if your profile exists and what role it has
SELECT id, email, full_name, role, is_active, created_at 
FROM public.profiles 
WHERE email = 'Yannic.Desch@gmail.com';

-- If the profile exists but isn't admin, update it to admin
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'Yannic.Desch@gmail.com' AND role != 'admin';

-- Also ensure the profile is active
UPDATE public.profiles 
SET is_active = true, updated_at = now()
WHERE email = 'Yannic.Desch@gmail.com';

-- Verify the final state
SELECT id, email, full_name, role, is_active, created_at, updated_at
FROM public.profiles 
WHERE email = 'Yannic.Desch@gmail.com';
