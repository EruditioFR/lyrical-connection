
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, profile_data, created_by, access_level } = await req.json();

    console.log('Creating free user:', { type, profile_data, created_by, access_level });

    // Générer un email temporaire unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const tempEmail = `temp-${type}-${timestamp}-${randomId}@lyrical-connection.temp`;
    const tempPassword = `TempPass-${randomId}-${timestamp}`;

    // Créer l'utilisateur temporaire avec les bonnes métadonnées
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        user_type: type, // S'assurer que le type est correct
        created_by_admin: true,
        is_temp_account: true,
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    console.log('User created with type:', type, 'User ID:', authData.user?.id);

    // Créer le profil correspondant en fonction du type
    if (type === 'artist') {
      console.log('Creating artist profile...');
      
      const isPremiumVisibility = access_level === 'premium';
      
      const { error: profileError } = await supabaseClient
        .from('artist_profiles')
        .insert({
          user_id: authData.user!.id,
          stage_name: profile_data.stage_name,
          bio: profile_data.bio || null,
          voice_type: profile_data.voice_type || null,
          contact_email: profile_data.contact_email,
          location: profile_data.location || null,
          phone: profile_data.phone || null,
          website: profile_data.website || null,
          nationality: profile_data.nationality || null,
          experience_years: profile_data.experience_years || null,
          created_by_admin: created_by,
          is_free_account: true,
          is_active: true,
          public_visibility_premium: isPremiumVisibility,
          premium_subscription_end: isPremiumVisibility ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null, // 1 an
        });

      if (profileError) {
        console.error('Error creating artist profile:', profileError);
        throw profileError;
      }
      
      console.log('Artist profile created successfully with access level:', access_level);
      
    } else if (type === 'professional') {
      console.log('Creating professional profile...');
      
      const isPremiumVisibility = access_level === 'premium';
      
      const { error: profileError } = await supabaseClient
        .from('professional_profiles')
        .insert({
          user_id: authData.user!.id,
          company_name: profile_data.company_name,
          professional_role: profile_data.professional_role,
          bio: profile_data.bio || null,
          contact_email: profile_data.contact_email,
          location: profile_data.location || null,
          phone: profile_data.phone || null,
          website: profile_data.website || null,
          team_description: profile_data.team_description || null,
          created_by_admin: created_by,
          is_free_account: true,
          is_active: true,
          public_visibility_premium: isPremiumVisibility,
          premium_subscription_end: isPremiumVisibility ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null, // 1 an
        });

      if (profileError) {
        console.error('Error creating professional profile:', profileError);
        throw profileError;
      }
      
      console.log('Professional profile created successfully with access level:', access_level);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authData.user!.id,
        temp_email: tempEmail,
        user_type: type, // Retourner le type pour vérification
        access_level: access_level || 'standard'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in create-free-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
