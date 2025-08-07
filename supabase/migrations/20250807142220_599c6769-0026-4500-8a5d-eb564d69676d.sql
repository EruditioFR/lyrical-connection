-- Fix security warning by recreating function and trigger with proper search_path
DROP TRIGGER IF EXISTS update_arias_updated_at ON public.arias;
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

CREATE TRIGGER update_arias_updated_at
    BEFORE UPDATE ON public.arias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_arias();