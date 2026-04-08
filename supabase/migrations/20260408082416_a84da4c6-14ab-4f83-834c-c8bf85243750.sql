
-- Prevent users from changing their own role in the profiles table
CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If the role is being changed and the caller is not an admin, revert
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS prevent_role_self_update ON public.profiles;

CREATE TRIGGER prevent_role_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_update();
