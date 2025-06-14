
-- Create admin profile for your existing auth user
-- First, let's check if there's an auth user without a profile
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID from auth.users table
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'yannic.desch@gmail.com';
    
    -- If user exists but no profile, create the admin profile
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
        VALUES (
            user_uuid,
            'yannic.desch@gmail.com',
            'Yannic Desch',
            'admin',
            true,
            now(),
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            is_active = true,
            updated_at = now();
            
        RAISE NOTICE 'Admin profile created/updated for user: %', user_uuid;
    ELSE
        RAISE NOTICE 'No auth user found with email: yannic.desch@gmail.com';
    END IF;
END $$;

-- Verify the profile was created
SELECT id, email, full_name, role, is_active 
FROM public.profiles 
WHERE email = 'yannic.desch@gmail.com';
