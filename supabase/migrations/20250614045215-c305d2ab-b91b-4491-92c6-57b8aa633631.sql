
-- First, let's see what users exist (replace with your actual user email)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- Or if you want to create a specific admin user, first sign up normally, then run:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- To see all users and their current roles:
SELECT id, email, full_name, role, is_active, created_at 
FROM public.profiles 
ORDER BY created_at DESC;
