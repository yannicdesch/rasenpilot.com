-- Update handle_new_user function to link existing subscriptions when user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create or update profile
  INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    'user',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Link existing subscription to this user (important for users who subscribed before creating account)
  UPDATE public.subscribers 
  SET 
    user_id = NEW.id,
    updated_at = NOW()
  WHERE email = NEW.email 
    AND (user_id IS NULL OR user_id != NEW.id);
  
  RETURN NEW;
END;
$function$;