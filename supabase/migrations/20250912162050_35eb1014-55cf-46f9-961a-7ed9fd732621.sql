-- Step 4: Database Infrastructure for Multi-Tenant Casting System

-- API Keys table for tenant API access
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- e.g., 'sk-cast-'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Webhook endpoints for tenant integrations
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  events JSONB DEFAULT '[]'::jsonb, -- Array of event types to listen for
  secret TEXT, -- Webhook signing secret
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_delivery_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60
);

-- Webhook deliveries for tracking notifications
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  response_code INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  idempotency_key TEXT
);

-- Tenant users for multi-tenant access control
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Scoring criteria storage for tenants
CREATE TABLE IF NOT EXISTS public.tenant_scoring_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  criteria_name TEXT NOT NULL,
  weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
  scoring_method TEXT CHECK (scoring_method IN ('linear', 'exponential', 'threshold')) DEFAULT 'linear',
  min_value DECIMAL,
  max_value DECIMAL,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, criteria_name)
);

-- Applicant scores for casting evaluations  
CREATE TABLE IF NOT EXISTS public.application_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  criteria_name TEXT NOT NULL,
  raw_score DECIMAL(5,2) NOT NULL,
  weighted_score DECIMAL(5,2) NOT NULL,
  notes TEXT,
  scored_by UUID,
  scored_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(application_id, criteria_name)
);

-- Rate limiting for API usage
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  window_size_seconds INTEGER DEFAULT 3600, -- 1 hour
  max_requests INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(api_key_id, endpoint, window_start)
);

-- Idempotency keys for duplicate request prevention
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  request_method TEXT NOT NULL,
  request_path TEXT NOT NULL,
  response_body JSONB,
  response_status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON public.api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant_id ON public.webhook_endpoints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON public.webhook_endpoints(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint_id ON public.webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);

CREATE INDEX IF NOT EXISTS idx_scoring_criteria_tenant_id ON public.tenant_scoring_criteria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_application_scores_application_id ON public.application_scores(application_id);

CREATE INDEX IF NOT EXISTS idx_rate_limits_api_key_id ON public.api_rate_limits(api_key_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON public.idempotency_keys(expires_at);

-- Enable RLS on all tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_scoring_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for API Keys
CREATE POLICY "Users can manage their tenant API keys"
ON public.api_keys FOR ALL
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid() AND is_active = true
  ) OR user_id = auth.uid()
);

CREATE POLICY "API access for valid keys"
ON public.api_keys FOR SELECT
USING (true); -- Needed for API authentication

-- RLS Policies for Webhook Endpoints
CREATE POLICY "Users can manage their tenant webhooks"
ON public.webhook_endpoints FOR ALL
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for Webhook Deliveries
CREATE POLICY "Users can view their tenant webhook deliveries"
ON public.webhook_deliveries FOR SELECT
USING (
  endpoint_id IN (
    SELECT id FROM public.webhook_endpoints 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

CREATE POLICY "System can manage webhook deliveries"
ON public.webhook_deliveries FOR ALL
USING (true); -- Needed for webhook delivery system

-- RLS Policies for Tenant Users
CREATE POLICY "Users can view their tenant memberships"
ON public.tenant_users FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can manage members"
ON public.tenant_users FOR ALL
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- RLS Policies for Scoring Criteria
CREATE POLICY "Users can manage their tenant scoring criteria"
ON public.tenant_scoring_criteria FOR ALL
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for Application Scores
CREATE POLICY "Users can view scores for their applications"
ON public.application_scores FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.artist_profiles ap ON ap.id = a.artist_profile_id
    WHERE ap.user_id = auth.uid()
  )
  OR
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.castings c ON c.id = a.casting_id
    JOIN public.professional_profiles pp ON pp.id = c.professional_profile_id
    WHERE pp.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can manage scores for their castings"
ON public.application_scores FOR ALL
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.castings c ON c.id = a.casting_id
    JOIN public.professional_profiles pp ON pp.id = c.professional_profile_id
    WHERE pp.user_id = auth.uid()
  )
);

-- RLS Policies for Rate Limits (system managed)
CREATE POLICY "System manages rate limits"
ON public.api_rate_limits FOR ALL
USING (true);

-- RLS Policies for Idempotency Keys (system managed)
CREATE POLICY "System manages idempotency keys"
ON public.idempotency_keys FOR ALL
USING (true);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_endpoints_updated_at
    BEFORE UPDATE ON public.webhook_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_scoring_criteria_updated_at
    BEFORE UPDATE ON public.tenant_scoring_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM public.idempotency_keys 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limit windows
CREATE OR REPLACE FUNCTION reset_rate_limit_windows()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_rate_limits 
  WHERE window_start + (window_size_seconds || ' seconds')::interval < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;