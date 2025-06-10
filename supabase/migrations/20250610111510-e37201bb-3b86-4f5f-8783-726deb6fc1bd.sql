
-- Step 1: Check if the user exists in the profiles table
SELECT id, email, role, full_name, created_at 
FROM public.profiles 
WHERE email = 'Yannic.Desch@gmail.com';

-- Step 2: If the user exists but isn't admin, update their role
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'Yannic.Desch@gmail.com' AND role != 'admin';

-- Step 3: Check the result - this will show us the final state
SELECT id, email, role, full_name, is_active, created_at, updated_at
FROM public.profiles 
WHERE email = 'Yannic.Desch@gmail.com';
