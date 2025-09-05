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

    const { profile_id, profile_type, real_email } = await req.json();

    console.log('Sending account invitation:', { profile_id, profile_type, real_email });

    // Générer un token unique pour l'invitation
    const invitation_token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 jours

    // Créer l'invitation dans la base de données
    const { error: invitationError } = await supabaseClient
      .from('account_invitations')
      .insert({
        profile_id,
        profile_type,
        real_email,
        invitation_token,
        expires_at,
      });

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw invitationError;
    }

    // Générer le lien d'invitation
    const baseUrl = Deno.env.get('SITE_URL') || 'https://lyrisphere.lovable.app';
    const invitationLink = `${baseUrl}/invitation/${invitation_token}`;

    console.log('Account invitation created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_token,
        invitation_link: invitationLink,
        real_email
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-account-invitation function:', error);
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