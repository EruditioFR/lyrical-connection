-- Fix security warning by setting search_path for the function
DROP FUNCTION IF EXISTS public.update_updated_at_arias();

CREATE OR REPLACE FUNCTION public.update_updated_at_arias()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;