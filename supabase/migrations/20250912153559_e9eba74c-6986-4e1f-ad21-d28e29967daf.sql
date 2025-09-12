-- Phase 1: Multi-tenancy foundation
-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organizations table (multi-org per tenant support)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant_users junction table for multi-tenant user access
CREATE TABLE public.tenant_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add tenant_id and org_id to existing tables
ALTER TABLE public.castings ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.castings ADD COLUMN org_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.applications ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

ALTER TABLE public.professional_events ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.professional_events ADD COLUMN org_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.artist_profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.professional_profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Create function to get current tenant context
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- This will be set by the application layer
  RETURN COALESCE(
    current_setting('app.current_tenant_id', true)::UUID,
    NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create function to check tenant access
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(p_tenant_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE tenant_id = p_tenant_id 
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenants
CREATE POLICY "Users can view tenants they have access to" 
ON public.tenants FOR SELECT 
USING (
  id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  )
);

-- RLS policies for organizations
CREATE POLICY "Users can view organizations in their tenants" 
ON public.organizations FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  )
);

-- RLS policies for tenant_users
CREATE POLICY "Users can view their own tenant memberships" 
ON public.tenant_users FOR SELECT 
USING (user_id = auth.uid());

-- Update existing RLS policies to include tenant isolation
-- Disable existing policies first
DROP POLICY IF EXISTS "Anyone can view active castings" ON public.castings;
DROP POLICY IF EXISTS "Professionals can create castings" ON public.castings;
DROP POLICY IF EXISTS "Professionals can update their castings" ON public.castings;
DROP POLICY IF EXISTS "Professionals can view their castings" ON public.castings;

-- Create new tenant-aware policies for castings
CREATE POLICY "Users can view castings in their tenants or public castings" 
ON public.castings FOR SELECT 
USING (
  (is_active = true AND (tenant_id IS NULL OR tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  )))
);

CREATE POLICY "Professionals can create castings in their tenants" 
ON public.castings FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professional_profiles 
    WHERE id = castings.professional_profile_id 
    AND user_id = auth.uid()
  )
  AND (tenant_id IS NULL OR tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Professionals can update their castings in their tenants" 
ON public.castings FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.professional_profiles 
    WHERE id = castings.professional_profile_id 
    AND user_id = auth.uid()
  )
  AND (tenant_id IS NULL OR tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  ))
);

-- Create casting scoring criteria table
CREATE TABLE public.casting_scoring_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id),
  casting_id UUID REFERENCES public.castings(id) ON DELETE CASCADE,
  criteria_name TEXT NOT NULL,
  weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  scoring_method TEXT NOT NULL DEFAULT 'linear', -- linear, exponential, threshold
  min_value DECIMAL,
  max_value DECIMAL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scoring criteria
ALTER TABLE public.casting_scoring_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scoring criteria for their tenant castings" 
ON public.casting_scoring_criteria FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  )
);

-- Create application scores table for the scoring engine
CREATE TABLE public.application_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.casting_scoring_criteria(id) ON DELETE CASCADE,
  raw_score DECIMAL(5,2),
  weighted_score DECIMAL(5,2),
  notes TEXT,
  scored_by UUID,
  scored_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on application scores
ALTER TABLE public.application_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores for applications in their tenants" 
ON public.application_scores FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.castings c ON a.casting_id = c.id
    WHERE a.id = application_scores.application_id
    AND c.tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid()
    )
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default tenant for existing data migration
INSERT INTO public.tenants (slug, name, settings) 
VALUES ('lyrisphere', 'Lyrisphere', '{"default": true}');

-- Create default organization
INSERT INTO public.organizations (tenant_id, name) 
SELECT id, 'Default Organization' FROM public.tenants WHERE slug = 'lyrisphere';

-- Migrate existing data to default tenant
UPDATE public.castings 
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'lyrisphere')
WHERE tenant_id IS NULL;

UPDATE public.applications 
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'lyrisphere')
WHERE tenant_id IS NULL;

UPDATE public.professional_events 
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'lyrisphere')
WHERE tenant_id IS NULL;

UPDATE public.artist_profiles 
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'lyrisphere')
WHERE tenant_id IS NULL;

UPDATE public.professional_profiles 
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'lyrisphere')
WHERE tenant_id IS NULL;