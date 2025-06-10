
-- This will update the user to admin role once they have signed up
-- (Run this AFTER the user has created their account)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'Yannic.Desch@gmail.com';

-- If no rows were updated (meaning no profile exists yet), 
-- the user needs to sign up first
