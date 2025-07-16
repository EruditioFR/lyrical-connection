
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

    const { type, profile_data, created_by } = await req.json();

    console.log('Creating free user:', { type, profile_data, created_by });

    // Générer un email temporaire unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const tempEmail = `temp-${type}-${timestamp}-${randomId}@lyrical-connection.temp`;
    const tempPassword = `TempPass-${randomId}-${timestamp}`;

    // Créer l'utilisateur temporaire
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        user_type: type,
        created_by_admin: true,
        is_temp_account: true,
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    console.log('User created:', authData.user?.id);

    // Créer ou mettre à jour le profil correspondant
    if (type === 'artist') {
      // Vérifier si un profil artiste existe déjà
      const { data: existingProfile } = await supabaseClient
        .from('artist_profiles')
        .select('id')
        .eq('user_id', authData.user!.id)
        .single();

      if (existingProfile) {
        // Mettre à jour le profil existant
        const { error: profileError } = await supabaseClient
          .from('artist_profiles')
          .update({
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
          })
          .eq('user_id', authData.user!.id);

        if (profileError) {
          console.error('Error updating artist profile:', profileError);
          throw profileError;
        }
      } else {
        // Créer un nouveau profil
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
          });

        if (profileError) {
          console.error('Error creating artist profile:', profileError);
          throw profileError;
        }
      }
    } else if (type === 'professional') {
      // Vérifier si un profil professionnel existe déjà
      const { data: existingProfile } = await supabaseClient
        .from('professional_profiles')
        .select('id')
        .eq('user_id', authData.user!.id)
        .single();

      if (existingProfile) {
        // Mettre à jour le profil existant
        const { error: profileError } = await supabaseClient
          .from('professional_profiles')
          .update({
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
          })
          .eq('user_id', authData.user!.id);

        if (profileError) {
          console.error('Error updating professional profile:', profileError);
          throw profileError;
        }
      } else {
        // Créer un nouveau profil
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
          });

        if (profileError) {
          console.error('Error creating professional profile:', profileError);
          throw profileError;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authData.user!.id,
        temp_email: tempEmail 
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
