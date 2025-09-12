-- Fix security warnings for functions created in Step 4 migration

-- Update the cleanup function with proper security settings
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM public.idempotency_keys 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the rate limit function with proper security settings  
CREATE OR REPLACE FUNCTION reset_rate_limit_windows()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_rate_limits 
  WHERE window_start + (window_size_seconds || ' seconds')::interval < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;