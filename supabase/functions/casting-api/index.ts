import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CastingEngine, ScoringUtils } from '../../../packages/core/src/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-api-key, x-idempotency-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ApiKeyData {
  id: string;
  tenant_id: string;
  key_hash: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
}

interface TenantContext {
  tenantId: string;
  orgId?: string;
  permissions: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected format: /v1/:tenant/...
    if (pathParts[0] !== 'v1') {
      return new Response(
        JSON.stringify({ error: 'API version required. Use /v1/' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tenant = pathParts[1];
    if (!tenant) {
      return new Response(
        JSON.stringify({ error: 'Tenant required in path: /v1/:tenant/' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate and validate tenant access
    const context = await authenticateRequest(req, supabase, tenant);
    if (!context) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set tenant context for RLS
    await supabase.rpc('set_config', {
      setting_name: 'app.current_tenant_id',
      setting_value: context.tenantId,
      is_local: true
    });

    // Route the request
    const apiPath = pathParts.slice(2).join('/');
    const response = await routeRequest(req, supabase, context, apiPath);
    
    return response;

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function authenticateRequest(
  req: Request, 
  supabase: any, 
  tenant: string
): Promise<TenantContext | null> {
  const apiKey = req.headers.get('x-api-key');
  
  if (!apiKey) {
    return null;
  }

  // Hash the API key (in production, use proper hashing)
  const keyHash = await hashApiKey(apiKey);

  // Validate API key and get tenant context
  const { data: apiKeyData, error } = await supabase
    .from('api_keys')
    .select('id, tenant_id, permissions, rate_limit, is_active')
    .eq('key_hash', keyHash)
    .eq('tenant_id', tenant)
    .eq('is_active', true)
    .single();

  if (error || !apiKeyData) {
    console.log('API key validation failed:', error);
    return null;
  }

  // Check rate limiting (simplified - in production use Redis)
  const rateLimitKey = `rate_limit:${apiKeyData.id}`;
  // TODO: Implement proper rate limiting

  return {
    tenantId: apiKeyData.tenant_id,
    permissions: apiKeyData.permissions || [],
  };
}

async function routeRequest(
  req: Request,
  supabase: any,
  context: TenantContext,
  path: string
): Promise<Response> {
  const method = req.method;
  const pathParts = path.split('/').filter(Boolean);
  
  // Castings endpoints
  if (pathParts[0] === 'castings') {
    return await handleCastingsRoute(req, supabase, context, pathParts.slice(1));
  }
  
  // Applications endpoints  
  if (pathParts[0] === 'applications') {
    return await handleApplicationsRoute(req, supabase, context, pathParts.slice(1));
  }
  
  // Scoring endpoints
  if (pathParts[0] === 'scoring') {
    return await handleScoringRoute(req, supabase, context, pathParts.slice(1));
  }
  
  // Webhooks endpoints
  if (pathParts[0] === 'webhooks') {
    return await handleWebhooksRoute(req, supabase, context, pathParts.slice(1));
  }

  return new Response(
    JSON.stringify({ error: 'Endpoint not found' }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCastingsRoute(
  req: Request,
  supabase: any,
  context: TenantContext,
  pathParts: string[]
): Promise<Response> {
  const method = req.method;

  // GET /v1/:tenant/castings - List castings
  if (method === 'GET' && pathParts.length === 0) {
    if (!context.permissions.includes('castings:read')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('castings')
      .select(`
        id, title, description, deadline, location, is_active, created_at,
        professional_profiles(company_name, contact_email),
        casting_roles(id, role_name, voice_type, quantity_needed)
      `)
      .eq('tenant_id', context.tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch castings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data, count: data?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // GET /v1/:tenant/castings/:id - Get specific casting
  if (method === 'GET' && pathParts.length === 1) {
    const castingId = pathParts[0];
    
    const { data, error } = await supabase
      .from('castings')
      .select(`
        id, title, description, deadline, location, requirements, 
        compensation_type, compensation_amount, is_active, created_at,
        professional_profiles(company_name, contact_email, bio),
        casting_roles(id, role_name, voice_type, description, quantity_needed, is_lead_role)
      `)
      .eq('id', castingId)
      .eq('tenant_id', context.tenantId)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Casting not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // POST /v1/:tenant/castings - Create casting
  if (method === 'POST' && pathParts.length === 0) {
    if (!context.permissions.includes('castings:write')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const idempotencyKey = req.headers.get('x-idempotency-key');
    
    if (idempotencyKey) {
      // Check if request was already processed
      const { data: existing } = await supabase
        .from('idempotency_keys')
        .select('response_data')
        .eq('key', idempotencyKey)
        .eq('tenant_id', context.tenantId)
        .single();
        
      if (existing) {
        return new Response(
          JSON.stringify(existing.response_data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create casting with roles
    const castingData = {
      ...body,
      tenant_id: context.tenantId,
      created_at: new Date().toISOString()
    };

    const { data: casting, error: castingError } = await supabase
      .from('castings')
      .insert(castingData)
      .select()
      .single();

    if (castingError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create casting' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store idempotency key
    if (idempotencyKey) {
      await supabase
        .from('idempotency_keys')
        .insert({
          key: idempotencyKey,
          tenant_id: context.tenantId,
          response_data: { data: casting }
        });
    }

    // Trigger webhook
    await triggerWebhook(supabase, context.tenantId, 'casting.created', {
      casting_id: casting.id,
      title: casting.title,
      created_at: casting.created_at
    });

    return new Response(
      JSON.stringify({ data: casting }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleApplicationsRoute(
  req: Request,
  supabase: any,
  context: TenantContext,
  pathParts: string[]
): Promise<Response> {
  const method = req.method;

  // POST /v1/:tenant/applications - Create application
  if (method === 'POST' && pathParts.length === 0) {
    if (!context.permissions.includes('applications:write')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const idempotencyKey = req.headers.get('x-idempotency-key');

    // Check idempotency
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from('idempotency_keys')
        .select('response_data')
        .eq('key', idempotencyKey)
        .eq('tenant_id', context.tenantId)
        .single();
        
      if (existing) {
        return new Response(
          JSON.stringify(existing.response_data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const applicationData = {
      ...body,
      tenant_id: context.tenantId,
      applied_at: new Date().toISOString()
    };

    const { data: application, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to create application' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store idempotency key
    if (idempotencyKey) {
      await supabase
        .from('idempotency_keys')
        .insert({
          key: idempotencyKey,
          tenant_id: context.tenantId,
          response_data: { data: application }
        });
    }

    // Trigger webhook
    await triggerWebhook(supabase, context.tenantId, 'application.received', {
      application_id: application.id,
      casting_id: application.casting_id,
      applied_at: application.applied_at
    });

    return new Response(
      JSON.stringify({ data: application }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleScoringRoute(
  req: Request,
  supabase: any,
  context: TenantContext,
  pathParts: string[]
): Promise<Response> {
  // POST /v1/:tenant/scoring/calculate - Calculate scores for casting
  if (req.method === 'POST' && pathParts[0] === 'calculate') {
    if (!context.permissions.includes('scoring:write')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { casting_id } = await req.json();

    // Fetch casting with applications
    const { data: casting, error: castingError } = await supabase
      .from('castings')
      .select(`
        id, title, location, deadline,
        casting_roles(id, role_name, voice_type, quantity_needed),
        applications(
          id, cover_letter, motivation,
          artist_profiles(
            id, user_id, stage_name, voice_type, experience_years, 
            location, repertoire
          )
        )
      `)
      .eq('id', casting_id)
      .eq('tenant_id', context.tenantId)
      .single();

    if (castingError || !casting) {
      return new Response(
        JSON.stringify({ error: 'Casting not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get scoring criteria for tenant
    const { data: criteria } = await supabase
      .from('casting_scoring_criteria')
      .select('*')
      .eq('casting_id', casting_id)
      .eq('tenant_id', context.tenantId);

    // Use default criteria if none configured
    const scoringCriteria = criteria?.length > 0 
      ? convertToScoringCriteria(criteria)
      : ScoringUtils.createDefaultCriteria();

    // Create casting context
    const castingContext = {
      tenantId: context.tenantId,
      casting: {
        id: casting.id,
        title: casting.title,
        roles: casting.casting_roles,
        deadline: new Date(casting.deadline),
        location: casting.location
      },
      scoringCriteria
    };

    // Initialize scoring engine
    const engine = new CastingEngine(castingContext);

    // Convert applications to applicants
    const applicants = casting.applications.map((app: any) => ({
      id: app.id,
      tenantId: context.tenantId,
      artistProfileId: app.artist_profiles.id,
      castingId: casting_id,
      profile: {
        id: app.artist_profiles.id,
        userId: app.artist_profiles.user_id,
        stageName: app.artist_profiles.stage_name,
        voiceType: app.artist_profiles.voice_type,
        experienceYears: app.artist_profiles.experience_years || 0,
        location: app.artist_profiles.location,
        repertoire: app.artist_profiles.repertoire || []
      },
      application: {
        id: app.id,
        coverLetter: app.cover_letter,
        motivation: app.motivation,
        appliedAt: new Date(app.applied_at)
      }
    }));

    // Score all applicants
    const results = engine.scoreApplicants(applicants);

    // Generate role assignments
    const assignments = engine.assignRoles(applicants, casting.casting_roles);

    return new Response(
      JSON.stringify({ 
        scoring_results: results,
        role_assignments: assignments,
        casting_context: castingContext
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleWebhooksRoute(
  req: Request,
  supabase: any,
  context: TenantContext,
  pathParts: string[]
): Promise<Response> {
  // GET /v1/:tenant/webhooks - List webhook endpoints
  if (req.method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('id, url, events, is_active, created_at')
      .eq('tenant_id', context.tenantId);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch webhooks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerWebhook(
  supabase: any,
  tenantId: string,
  event: string,
  data: any
): Promise<void> {
  try {
    // Get webhook endpoints for this tenant and event
    const { data: endpoints } = await supabase
      .from('webhook_endpoints')
      .select('url, secret')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .contains('events', [event]);

    if (!endpoints || endpoints.length === 0) {
      return;
    }

    // Send webhook to each endpoint
    for (const endpoint of endpoints) {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        tenant_id: tenantId
      };

      const signature = await signWebhookPayload(JSON.stringify(payload), endpoint.secret);

      fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        console.error('Webhook delivery failed:', error);
      });
    }
  } catch (error) {
    console.error('Webhook trigger failed:', error);
  }
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signWebhookPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  return 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function convertToScoringCriteria(dbCriteria: any[]): any {
  const criteria: any = {};
  
  for (const criterion of dbCriteria) {
    criteria[criterion.criteria_name] = {
      weight: parseFloat(criterion.weight),
      method: criterion.scoring_method || 'linear',
      minValue: criterion.min_value,
      maxValue: criterion.max_value,
      settings: criterion.settings || {}
    };
  }
  
  return ScoringUtils.normalizeCriteria(criteria);
}