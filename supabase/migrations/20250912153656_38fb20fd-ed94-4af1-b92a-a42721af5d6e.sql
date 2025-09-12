-- Fix security warnings by setting search_path on functions
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID 
LANGUAGE plpgsql 
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This will be set by the application layer
  RETURN COALESCE(
    current_setting('app.current_tenant_id', true)::UUID,
    NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_tenant_access(p_tenant_id UUID, p_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE tenant_id = p_tenant_id 
    AND user_id = p_user_id
  );
END;
$$;