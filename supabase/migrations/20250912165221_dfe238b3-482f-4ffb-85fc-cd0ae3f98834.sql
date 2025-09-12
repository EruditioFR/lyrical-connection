-- Fix infinite recursion in tenant_users policies

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Tenant admins can manage members" ON tenant_users;

-- Create a simpler, non-recursive policy for tenant admins
-- This assumes we have a function to check tenant admin status without recursion
CREATE OR REPLACE FUNCTION public.is_tenant_admin(target_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is owner/admin of the target tenant
  -- Using a direct query without policy evaluation
  RETURN EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE user_id = auth.uid() 
    AND tenant_id = target_tenant_id 
    AND role IN ('owner', 'admin')
  );
END;
$$;

-- Recreate the policy using the helper function
CREATE POLICY "Tenant admins can manage members" 
ON tenant_users 
FOR ALL 
USING (is_tenant_admin(tenant_id));